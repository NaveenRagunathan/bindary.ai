/**
 * Data Transfer Objects (DTOs) for API contracts
 * 
 * These types are SAFE to share between services because they contain:
 * - No business logic
 * - No side effects
 * - Only data structure definitions
 * 
 * Domain entities (UserProfile, ReadingProgress, etc.) should NOT be here.
 * They belong to the service that owns them.
 */

// ============================================
// Chat API DTOs
// ============================================

export interface ChatMessageDTO {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export interface ChatRequestDTO {
    messages: ChatMessageDTO[];
    context: 'onboarding' | 'coaching' | 'recommendation' | 'wisdom';
}

export interface ChatStreamChunkDTO {
    content: string;
}

// ============================================
// Wisdom Translation API DTOs
// ============================================

export interface WisdomRequestDTO {
    concept: string;
    bookTitle: string;
    userContext: {
        currentGoal: string;
        currentProject?: string;
        recentChallenge?: string;
    };
}

export interface WisdomActionDTO {
    action: string;
    why: string;
    when: string;
}

export interface WisdomResponseDTO {
    explanation: string;
    actions: WisdomActionDTO[];
    measureSuccess: string;
}

// ============================================
// Recommendations API DTOs
// ============================================

export interface BookInputDTO {
    id: string;
    title: string;
    author: string;
    categories: string[];
    keyTopics: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    targetAudience?: string[];
}

export interface RecommendationOutputDTO {
    bookId: string;
    relevanceScore: number;
    rationale: string;
    sequenceOrder: number;
    matchingGoals: string[];
}

export interface RecommendationsResponseDTO {
    recommendations: RecommendationOutputDTO[];
}

// ============================================
// Personality Analysis API DTOs
// ============================================

export interface PersonalityTraitsDTO {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    analyticalThinking: number;
    creativity: number;
    ambition: number;
}

export interface PersonalityResponseDTO {
    personality: PersonalityTraitsDTO;
    learningStyle: 'visual' | 'auditory' | 'reading-writing' | 'kinesthetic' | 'multimodal';
    lifestage: string;
    goals: { category: string; description: string; priority: number }[];
    challenges: string[];
    timeAvailable: { hoursPerWeek: number; consistency: 'high' | 'medium' | 'low' };
}
