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

// Validation schemas
const bookSchema = z.object({
    id: z.string(),
    title: z.string(),
    author: z.string(),
    categories: z.array(z.string()),
    keyTopics: z.array(z.string()),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    targetAudience: z.array(z.string()).optional(),
});

const userProfileSchema = z.object({
    name: z.string(),
    lifestage: z.string(),
    goals: z.array(z.object({
        category: z.string(),
        description: z.string(),
        priority: z.number(),
    })),
    challenges: z.array(z.string()),
    personality: z.object({
        openness: z.number(),
        conscientiousness: z.number(),
        extraversion: z.number(),
        agreeableness: z.number(),
        neuroticism: z.number(),
        analyticalThinking: z.number(),
        creativity: z.number(),
        ambition: z.number(),
    }),
    learningStyle: z.string(),
});

const requestSchema = z.object({
    profile: userProfileSchema,
    books: z.array(bookSchema),
});

const SYSTEM_PROMPT = `You are Bindery.ai's recommendation engine. Analyze the user's profile and recommend books with precision.

For each recommendation, provide:
1. Why this book matters for THIS specific person
2. How it connects to their stated goals
3. Key concepts they'll learn
4. The best order to read books (sequence matters!)
5. A confidence score (0-100) for the match

Be specific about WHY each book helps THEM specifically. Generic recommendations are useless.`;

export async function POST(req: NextRequest) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { profile, books } = requestSchema.parse(body);

        const booksSummary = books.map((b) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            categories: b.categories,
            keyTopics: b.keyTopics,
            difficulty: b.difficulty,
            targetAudience: b.targetAudience,
        }));

        const response = await getOpenAIClient().chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `User Profile:
${JSON.stringify(profile, null, 2)}

Available Books:
${JSON.stringify(booksSummary, null, 2)}

Select and rank the top 5 books for this user. Return a JSON array with:
[
  {
    "bookId": string,
    "relevanceScore": 0-100,
    "rationale": string (2-3 sentences explaining why THIS user needs THIS book),
    "sequenceOrder": number (1 = read first),
    "matchingGoals": [string] (which of their goals this addresses)
  }
]`,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        const recommendations = result.recommendations || result;

        return NextResponse.json({
            recommendations: Array.isArray(recommendations) ? recommendations : [],
        });
    } catch (error) {
        console.error('Recommendations API error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request format', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to generate recommendations' },
            { status: 500 }
        );
    }
}
