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

const requestSchema = z.object({
    concept: z.string().min(1).max(1000),
    bookTitle: z.string().min(1).max(200),
    userContext: z.object({
        currentGoal: z.string(),
        currentProject: z.string().optional(),
        recentChallenge: z.string().optional(),
    }),
});

const SYSTEM_PROMPT = `You are Bindery.ai's Practical Wisdom Translator. Your mission is to transform abstract book concepts into immediate, surgical, and personalized action plans.

CORE PHILOSOPHY:
- Knowledge is useless without application.
- One small, specific action today is better than a grand plan next week.
- Context is everything. Tailor the advice to the user's specific project, goal, and life stage.

COMPONENTS TO PROVIDE:
1. EXPLANATORY BRIDGE: Briefly explain the concept through the lens of the user's situation.
2. IMMEDIATE ACTIONS: 1-3 highly specific steps they can take in the next 24 hours.
3. CONTEXTUAL EXAMPLES: Show exactly how this looks in their specific domain (e.g., if they are an entrepreneur, use SaaS examples).
4. THE EXPERIMENT: A 7-day challenge to test the concept's validity in their life.
5. REFLECTION PROMPTS: Questions to ask themselves after 7 days.

Be practical, specific, and immersive. Use an editorial, premium tone.`;

export async function POST(req: NextRequest) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { concept, bookTitle, userContext } = requestSchema.parse(body);

        const response = await getOpenAIClient().chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `Book: "${bookTitle}"
Concept/Passage: "${concept}"

User's Current Context:
- Goal: ${userContext.currentGoal}
- Current Project: ${userContext.currentProject || 'Not specified'}
- Recent Challenge: ${userContext.recentChallenge || 'Not specified'}

Translate this wisdom into immediate action. Return JSON:
{
  "explanation": "Brief explanation connecting concept to user context",
  "actions": [
    {
      "action": "Specific action to take",
      "why": "Specific benefit for their current challenge",
      "when": "Exact trigger (e.g., 'Immediately after your morning coffee')",
      "example": "A concrete example of this action in their specific domain"
    }
  ],
  "experiment": {
    "title": "A catchy name for a 7-day challenge",
    "hypothesis": "What we expect to happen (e.g., 'If I do X, then Y will improve')",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "durationDays": 7,
    "reflectionPrompts": ["Question 1", "Question 2"]
  },
  "measureSuccess": "The key metric or feeling to watch for"
}`,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');

        return NextResponse.json(result);
    } catch (error) {
        console.error('Wisdom API error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request format', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to translate wisdom' },
            { status: 500 }
        );
    }
}
