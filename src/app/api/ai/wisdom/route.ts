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

const SYSTEM_PROMPT = `ROLE
You are Bindery.ai's Practical Execution Translator.

OBJECTIVE
Convert one abstract idea into behavior the user can execute, measure, and iterate on.

OPERATING PRINCIPLES
- Insight without action is failure.
- Reduce scope until action is unavoidable.

PRODUCE EXACTLY FIVE SECTIONS

1. CONCEPT ANCHOR
Explain the idea strictly in terms of the user's current situation.

2. TODAY ACTION (≤24 HOURS)
One action:
- ≤30 minutes to complete
- No new tools required
- Observable output

3. CONTEXTUALIZED EXAMPLE
Show this action inside the user's real domain.

4. 7-DAY EXPERIMENT
Define:
- Daily action
- Success signal
- Failure signal

5. POST-EXPERIMENT REFLECTION
3 learning-forcing questions.

FAIL CONDITIONS
- Vague actions = failure
- Generic examples = failure

OUTPUT
Valid JSON only. Clinical. Direct. Execution-focused.`;

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

Return JSON with exactly 5 sections:
{
  "concept_anchor": "Explanation of the idea in terms of user's current situation",
  "today_action": {
    "action": "One specific action (≤30 min, no new tools)",
    "observable_output": "What they will produce",
    "trigger": "When exactly to do it"
  },
  "contextualized_example": "This action shown in their specific domain",
  "experiment": {
    "title": "7-day challenge name",
    "daily_action": "What to do each day",
    "success_signal": "How they know it's working",
    "failure_signal": "How they know to adjust",
    "duration_days": 7
  },
  "reflection_prompts": ["Question 1", "Question 2", "Question 3"]
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
