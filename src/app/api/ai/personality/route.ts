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

const messageSchema = z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.string(),
});

const requestSchema = z.object({
    messages: z.array(messageSchema),
});

export async function POST(req: NextRequest) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { messages } = requestSchema.parse(body);

        const conversationText = messages
            .filter((m) => m.role === 'user')
            .map((m) => m.content)
            .join('\n');

        const response = await getOpenAIClient().chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `Analyze the following conversation responses and extract a personality profile. Return a JSON object with these fields:
        
{
  "personality": {
    "openness": 0-100,
    "conscientiousness": 0-100,
    "extraversion": 0-100,
    "agreeableness": 0-100,
    "neuroticism": 0-100,
    "analyticalThinking": 0-100,
    "creativity": 0-100,
    "ambition": 0-100
  },
  "learningStyle": "visual" | "auditory" | "reading-writing" | "kinesthetic" | "multimodal",
  "lifestage": "student" | "early-career" | "mid-career" | "entrepreneur" | "career-transition" | "parent" | "retiree" | "other",
  "goals": [{ "category": string, "description": string, "priority": 1-5 }],
  "challenges": [string],
  "timeAvailable": { "hoursPerWeek": number, "consistency": "high" | "medium" | "low" }
}

Be accurate based on the actual content provided.`,
                },
                {
                    role: 'user',
                    content: conversationText,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');

        return NextResponse.json(result);
    } catch (error) {
        console.error('Personality API error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request format', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to analyze personality' },
            { status: 500 }
        );
    }
}
