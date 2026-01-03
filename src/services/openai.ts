import OpenAI from 'openai';
import type { UserProfile, BookRecommendation, Book, ChatMessage } from '../types';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // Note: In production, use a backend
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

    coaching: `You are Bindery.ai's reading coach. Help users stay accountable, reflect on their reading, and apply what they learn.

You can:
1. Check in on their reading progress
2. Celebrate wins and understand struggles
3. Help them reflect on what they're learning
4. Answer questions about books and concepts
5. Adjust their reading plan based on life changes

Be supportive, encouraging, and helpful. Remember their context and goals.`,
};

// Personality analysis from conversation
export async function analyzePersonality(
    messages: ChatMessage[]
): Promise<Partial<UserProfile>> {
    const conversationText = messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .join('\n');

    const response = await openai.chat.completions.create({
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

    try {
        return JSON.parse(response.choices[0].message.content || '{}');
    } catch {
        console.error('Failed to parse personality analysis');
        return {};
    }
}

// Generate book recommendations
export async function generateRecommendations(
    profile: UserProfile,
    books: Book[]
): Promise<BookRecommendation[]> {
    const booksSummary = books.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        categories: b.categories,
        keyTopics: b.keyTopics,
        difficulty: b.difficulty,
        targetAudience: b.targetAudience,
    }));

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: SYSTEM_PROMPTS.recommendation,
            },
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

    try {
        const result = JSON.parse(response.choices[0].message.content || '{}');
        const recommendations = result.recommendations || result;

        return (Array.isArray(recommendations) ? recommendations : []).map(
            (rec: { bookId: string; relevanceScore: number; rationale: string; sequenceOrder: number; matchingGoals: string[] }) => ({
                book: books.find((b) => b.id === rec.bookId)!,
                relevanceScore: rec.relevanceScore,
                rationale: rec.rationale,
                sequenceOrder: rec.sequenceOrder,
                matchingGoals: rec.matchingGoals,
            })
        ).filter((rec: BookRecommendation) => rec.book);
    } catch {
        console.error('Failed to parse recommendations');
        return [];
    }
}

// Translate book wisdom to practical action
export async function translateWisdom(
    concept: string,
    bookTitle: string,
    userContext: {
        currentGoal: string;
        currentProject?: string;
        recentChallenge?: string;
    }
): Promise<{
    explanation: string;
    actions: { action: string; why: string; when: string }[];
    measureSuccess: string;
}> {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: SYSTEM_PROMPTS.wisdom,
            },
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
  "explanation": "Clear 2-3 sentence explanation of the concept",
  "actions": [
    {
      "action": "Specific action to take",
      "why": "Why this works for them",
      "when": "When/how often to do this"
    }
  ],
  "measureSuccess": "How they'll know it's working"
}`,
            },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
    });

    try {
        return JSON.parse(response.choices[0].message.content || '{}');
    } catch {
        return {
            explanation: '',
            actions: [],
            measureSuccess: '',
        };
    }
}

// Streaming chat for onboarding and coaching
export async function* streamChat(
    messages: ChatMessage[],
    context: keyof typeof SYSTEM_PROMPTS = 'onboarding'
): AsyncGenerator<string, void, unknown> {
    const stream = await openai.chat.completions.create({
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

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
            yield content;
        }
    }
}

// Non-streaming chat (for simple responses)
export async function chat(
    messages: ChatMessage[],
    context: keyof typeof SYSTEM_PROMPTS = 'coaching'
): Promise<string> {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: SYSTEM_PROMPTS[context] },
            ...messages.map((m) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            })),
        ],
        temperature: 0.7,
    });

    return response.choices[0].message.content || '';
}

export { openai };
