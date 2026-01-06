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
});

const SYSTEM_PROMPT = `ROLE: Bindery.ai Book Decision Engine — select books that create maximum transformation in user's life trajectory.

CORE PRINCIPLES:
1. SIGNAL>NOISE: Popular≠relevant. Exclude any book without concrete evidence of fit for THIS user.
2. SEQUENTIAL: Book N builds foundation for N+1. Book 1=immediately actionable, no prerequisites.
3. TIME-TO-VALUE: Prioritize books delivering insights in first 3 chapters.
4. GAP-FIRST: Every book fills a SPECIFIC diagnosed gap (knowledge/skill/mindset/system/confidence).
5. ANTI-POPULARITY: If recommended only because "everyone reads it," reject. Find the targeted alternative.
6. PRACTICAL: Books must contain frameworks/mental models, not just inspiration.
7. LEARNING-MATCH: Adapt to user's style (conceptual vs action-oriented vs narrative).

SELECTION PROCESS:
1. Model user's transformation target (from X₁ → X₂ state)
2. Diagnose root bottleneck blocking progress
3. Map each book to a specific gap
4. Sequence with prerequisites
5. Validate: substitution test, timing test, completion likelihood

QUALITY GATES:
- ZERO generic justifications
- Each book has user-specific reasoning
- No two books fill same gap
- Smooth difficulty progression
- Include "hidden gems" (not just bestsellers)

FAILURE CONDITIONS:
- Generic reasoning that could apply to anyone
- Books recommended because they're famous
- Vague goal alignment
- Prerequisites user doesn't have

OUTPUT: Valid JSON only. No prose. This is a LIFE ROADMAP.`;

export async function POST(req: NextRequest) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { profile } = requestSchema.parse(body);

        const response = await getOpenAIClient().chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `User Profile:
${JSON.stringify(profile, null, 2)}

Generate 5 books as a "recommendations" array:
{
  "recommendations": [
    {
      "title": "string",
      "author": "string",
      "id": "kebab-case-slug",
      "sequence_order": 1-5,
      "gap_analysis": {
        "current_state": "specific",
        "target_state": "specific",
        "gap_type": "knowledge|skill|mindset|system|confidence"
      },
      "why_this_user_now": "2-3 specific sentences",
      "goal_alignment": "how this advances their stated goal",
      "practical_application": {
        "immediate_action": "after chapter 1",
        "week_1_experiment": "testable action"
      },
      "prerequisites": ["book-ids"] or [],
      "key_frameworks": ["2-3 mental models"],
      "time_investment": { "reading_hours": int, "total_weeks": int },
      "alternative_justification": "why THIS over obvious alternative",
      "confidence_score": 0-100
    }
  ]
}`,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 3000,
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        const recommendations = result.recommendations || result;

        // Ensure we handle the "recommendations" key from GPT output or direct array
        // GPT often wraps arrays in a key like "books" or "recommendations" when asked for JSON object
        const recList = Array.isArray(recommendations)
            ? recommendations
            : (result.books || []);

        return NextResponse.json({
            recommendations: recList,
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
