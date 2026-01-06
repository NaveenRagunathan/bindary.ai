/**
 * Client-side API service for AI features
 * All OpenAI calls are now proxied through secure server-side API routes
 */

import type { UserProfile, BookRecommendation, Book, ChatMessage } from '@/types';

const API_BASE = '/api/ai';

/**
 * Stream chat responses from the AI
 */
export async function* streamChat(
    messages: ChatMessage[],
    context: 'onboarding' | 'coaching' | 'recommendation' | 'wisdom' = 'coaching'
): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to connect' }));
        throw new Error(error.error || 'Chat request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') return;
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.content) yield parsed.content;
                } catch {
                    // Skip malformed JSON
                }
            }
        }
    }
}

/**
 * Non-streaming chat (for simple responses)
 */
export async function chat(
    messages: ChatMessage[],
    context: 'onboarding' | 'coaching' | 'recommendation' | 'wisdom' = 'coaching'
): Promise<string> {
    let fullResponse = '';
    for await (const chunk of streamChat(messages, context)) {
        fullResponse += chunk;
    }
    return fullResponse;
}

export async function generateRecommendations(
    profile: UserProfile
): Promise<BookRecommendation[]> {
    const response = await fetch(`${API_BASE}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to connect' }));
        throw new Error(error.error || 'Recommendations request failed');
    }

    const data = await response.json();
    const recommendations = data.recommendations || [];

    // Map AI results to BookRecommendation objects
    // Note: We create new book objects here since they are AI-generated
    return recommendations.map((rec: any) => {
        // Construct a full Book object from the partial AI data
        const book: Book = {
            id: rec.id || rec.bookId || `generated-${Math.random().toString(36).substr(2, 9)}`,
            title: rec.title,
            author: rec.author,
            description: rec.description || rec.rationale,
            pageCount: rec.pageCount || 250, // Estimate if missing
            categories: rec.categories || [],
            difficulty: rec.difficulty || 'intermediate',
            keyTopics: rec.keyTopics || [],
            targetAudience: rec.targetAudience || [],
            prerequisites: [],
            publishedYear: new Date().getFullYear(), // Default if missing
            estimatedHours: rec.estimatedHours || 5,
        };

        return {
            book,
            relevanceScore: rec.relevanceScore,
            rationale: rec.rationale,
            sequenceOrder: rec.sequenceOrder,
            matchingGoals: rec.matchingGoals,
        };
    }).filter((rec: BookRecommendation) => rec.book && rec.book.title);
}

/**
 * Translate book wisdom to practical action
 */
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
    const response = await fetch(`${API_BASE}/wisdom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, bookTitle, userContext }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to connect' }));
        throw new Error(error.error || 'Wisdom request failed');
    }

    return response.json();
}

/**
 * Analyze personality from conversation
 */
export async function analyzePersonality(
    messages: ChatMessage[]
): Promise<Partial<UserProfile>> {
    const response = await fetch(`${API_BASE}/personality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to connect' }));
        throw new Error(error.error || 'Personality analysis failed');
    }

    return response.json();
}
