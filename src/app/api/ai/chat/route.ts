import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import UserBook from '@/modules/library/models/UserBook';

// Lazy initialization to prevent build errors
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openai) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openai;
}

// Validation schema
const chatRequestSchema = z.object({
    messages: z.array(z.object({
        id: z.string(),
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
        timestamp: z.string(),
    })),
    context: z.enum(['onboarding', 'coaching', 'recommendation', 'wisdom']).default('coaching'),
});

// System prompts for different contexts
const SYSTEM_PROMPTS = {
    onboarding: `ROLE
You are Bindery.ai's Profiling Agent.

OBJECTIVE
Extract enough signal to model:
- Current state
- Desired future state
- Constraints
- Cognitive tendencies

METHOD
- One question at a time
- Each question must reduce uncertainty
- Adapt follow-ups dynamically

YOU ARE IDENTIFYING
- Dominant bottleneck
- Motivation driver
- Learning tolerance
- Time realism
- Prior failure patterns

STOPPING CONDITION
When you can articulate:
1. What they are trying to change
2. Why prior attempts stalled
3. What books will actually help

THEN
Summarize in 5–7 bullets and confirm.`,

    coaching: `ROLE
You are Bindery.ai's Reading Coach and Feedback Loop.

OBJECTIVE
Ensure reading converts into behavior and momentum.

YOU MUST
- Reference prior context
- Detect avoidance or stagnation
- Suggest correction when effort ≠ outcome

AVOID
- Cheerleading
- Passive reassurance

SUCCESS
User gains clearer action or clearer diagnosis of failure.`,

    recommendation: `ROLE
You explain Bindery.ai's book decisions.

OBJECTIVE
Help the user understand:
- Why these books
- Why this order
- What will change after each book

RULE
Explain decisions. Do not generate new ones.`,

    wisdom: `ROLE
You are Bindery.ai's Execution Translator.

OBJECTIVE
Convert book concepts into behavior the user can execute today.

OPERATING PRINCIPLES
- Insight without action is failure
- Reduce scope until action is unavoidable

PRODUCE
1. Concept explained in user's context
2. One action (≤30 min, no new tools, observable output)
3. Example in their domain
4. 7-day experiment with success/failure signals
5. 3 reflection questions

TONE
Clinical. Direct. Execution-focused.`,
};

const tools = [
    {
        type: 'function',
        function: {
            name: 'add_book_to_library',
            description: 'Add a book to the user\'s library. Use this when the user explicitly asks to add a book or when you recommend a book and they accept.',
            parameters: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'The exact title of the book' },
                    author: { type: 'string', description: 'The author of the book' },
                    pageCount: { type: 'number', description: 'Estimated page count (default to 300 if unknown)' },
                    description: { type: 'string', description: 'Short summary of the book' }
                },
                required: ['title', 'author']
            }
        }
    }
];

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }

        const body = await req.json();
        const { messages, context } = chatRequestSchema.parse(body);

        // First call to OpenAI
        const response = await getOpenAIClient().chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPTS[context] },
                ...messages.map((m) => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                })),
            ],
            tools: tools as any,
            tool_choice: 'auto',
            temperature: 0.7,
        });

        const choice = response.choices[0];
        const message = choice.message;

        // Check if the model wants to call a tool
        if (message.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];

            if (toolCall.type === 'function' && toolCall.function.name === 'add_book_to_library') {
                const args = JSON.parse(toolCall.function.arguments);

                await dbConnect();

                // Check if book already exists for user
                const existingBook = await UserBook.findOne({
                    userId: session.user.id,
                    title: { $regex: new RegExp(`^${args.title}$`, 'i') }
                });

                let resultMsg = "";
                if (existingBook) {
                    resultMsg = `Book "${args.title}" is already in the library.`;
                } else {
                    await UserBook.create({
                        userId: session.user.id,
                        title: args.title,
                        author: args.author,
                        pageCount: args.pageCount || 300,
                        difficulty: 'intermediate',
                        categories: ['Uncategorized'],
                        description: args.description || 'Added via AI Coach',
                        publishedYear: new Date().getFullYear(),
                    });
                    resultMsg = `Successfully added "${args.title}" by ${args.author} to the library.`;
                }

                // Call OpenAI again with the tool result to get the final natural language response
                const secondResponse = await getOpenAIClient().chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPTS[context] },
                        ...messages.map((m) => ({
                            role: m.role as 'user' | 'assistant',
                            content: m.content,
                        })),
                        message, // The assistant message with tool_calls
                        {
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: resultMsg
                        }
                    ],
                    stream: true,
                    temperature: 0.7,
                });

                // Stream the second response
                const encoder = new TextEncoder();
                const readable = new ReadableStream({
                    async start(controller) {
                        try {
                            for await (const chunk of secondResponse) {
                                const content = chunk.choices[0]?.delta?.content;
                                if (content) {
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                                }
                            }
                            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                            controller.close();
                        } catch (error) {
                            controller.error(error);
                        }
                    },
                });

                return new Response(readable, {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
                    },
                });
            }
        }

        // If no tool call, assume streaming response for normal chat
        // We need to re-create the stream since the first call wasn't streaming (to allow tool check)
        // Optimization: In a production app, we might want to handle this differently to avoid double-latency for normal chats
        const stream = await getOpenAIClient().chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPTS[context] },
                ...messages.map((m) => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                })),
            ],
            stream: true,
            temperature: 0.7,
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                        }
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('Chat API error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request format', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}
