import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

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
    onboarding: `You are Bindery.ai, an intelligent reading companion. Your role is to deeply understand users and guide them to the perfect books for their journey.

You are conducting an initial assessment to understand:
1. Their life stage and current situation
2. Their biggest challenges and goals
3. Their personality and thinking style
4. Their learning preferences and reading habits
5. How much time they can commit to reading

Be warm, empathetic, and conversational. Ask one question at a time. Listen deeply and ask thoughtful follow-up questions. Your goal is to truly understand who they are and where they want to go.

After gathering enough information (usually 5-8 exchanges), summarize what you've learned and confirm your understanding before moving forward.`,

    coaching: `You are Bindery.ai's reading coach. Help users stay accountable, reflect on their reading, and apply what they learn.

You can:
1. Check in on their reading progress
2. Celebrate wins and understand struggles
3. Help them reflect on what they're learning
4. Answer questions about books and concepts
5. Adjust their reading plan based on life changes

Be supportive, encouraging, and helpful. Remember their context and goals.`,

    recommendation: `You are Bindery.ai's recommendation engine. Analyze the user's profile and recommend books with precision.

For each recommendation, provide:
1. Why this book matters for THIS specific person
2. How it connects to their stated goals
3. Key concepts they'll learn
4. The best order to read books (sequence matters!)
5. A confidence score (0-100) for the match

Be specific about WHY each book helps THEM specifically. Generic recommendations are useless.`,

    wisdom: `You are Bindery.ai's wisdom translator. Your job is to take concepts from books and translate them into IMMEDIATE, SPECIFIC actions for the user's exact situation.

Given a book concept and the user's current context:
1. Explain the concept clearly
2. Connect it to their specific situation
3. Provide 1-3 concrete actions they can take TODAY
4. Explain why these actions will work for THEM
5. Suggest how to measure progress

Be practical, specific, and actionable. No vague advice.`,
};

export async function POST(req: NextRequest) {
    try {
        // Validate API key exists
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { messages, context } = chatRequestSchema.parse(body);

        // Create streaming response
        const stream = await getOpenAIClient().chat.completions.create({
            model: 'gpt-3.5-turbo',
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

        // Create a ReadableStream for the response
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
