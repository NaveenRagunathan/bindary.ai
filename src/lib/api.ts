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

/**
 * Generate book recommendations based on user profile
 */
export async function generateRecommendations(
    profile: UserProfile,
    books: Book[]
): Promise<BookRecommendation[]> {
    const response = await fetch(`${API_BASE}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, books }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to connect' }));
        throw new Error(error.error || 'Recommendations request failed');
    }

    const data = await response.json();
    const recommendations = data.recommendations || [];

    // Map bookIds back to full book objects
    return recommendations.map((rec: {
        bookId: string;
        relevanceScore: number;
        rationale: string;
        sequenceOrder: number;
        matchingGoals: string[];
    }) => ({
        book: books.find((b) => b.id === rec.bookId)!,
        relevanceScore: rec.relevanceScore,
        rationale: rec.rationale,
        sequenceOrder: rec.sequenceOrder,
        matchingGoals: rec.matchingGoals,
    })).filter((rec: BookRecommendation) => rec.book);
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
