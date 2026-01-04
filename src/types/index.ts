/**
 * Domain Types
 * 
 * These types are OWNED by specific modules:
 * - UserProfile, ReadingProgress → User/Profile service
 * - Book, BookRecommendation → Library/Recommendation service
 * - ChatMessage, Conversation → AI service
 * 
 * For API contracts (DTOs), see ./dto/index.ts
 */

// Re-export DTOs for convenience
export * from './dto';

// ============================================
// User Profile Types (Owner: User Service)
// ============================================
export interface UserProfile {
    id: string;
    createdAt: string;
    updatedAt: string;

    // Personal Info
    name: string;
    lifestage: LifeStage;

    // Personality Analysis
    personality: PersonalityTraits;
    learningStyle: LearningStyle;

    // Goals
    goals: UserGoal[];
    challenges: string[];

    // Context
    timeAvailable: TimeAvailability;
    readingExperience: ReadingExperience;

    // Onboarding State
    onboardingComplete: boolean;
    currentStep: number;
}

export type LifeStage =
    | 'student'
    | 'early-career'
    | 'mid-career'
    | 'entrepreneur'
    | 'career-transition'
    | 'parent'
    | 'retiree'
    | 'other';

export interface PersonalityTraits {
    openness: number;        // 0-100
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;

    // Additional traits
    analyticalThinking: number;
    creativity: number;
    ambition: number;
}

export type LearningStyle =
    | 'visual'
    | 'auditory'
    | 'reading-writing'
    | 'kinesthetic'
    | 'multimodal';

export interface UserGoal {
    id: string;
    category: GoalCategory;
    description: string;
    timeframe: string;
    priority: number; // 1-5
    createdAt: string;
}

export type GoalCategory =
    | 'career'
    | 'business'
    | 'personal-growth'
    | 'relationships'
    | 'health'
    | 'finance'
    | 'creativity'
    | 'spirituality'
    | 'education';

export interface TimeAvailability {
    hoursPerWeek: number;
    preferredTimes: PreferredTime[];
    consistency: 'high' | 'medium' | 'low';
}

export type PreferredTime = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ReadingExperience {
    level: 'beginner' | 'intermediate' | 'advanced';
    booksReadLastYear: number;
    preferredFormats: ('physical' | 'ebook' | 'audiobook')[];
    readingSpeed: 'slow' | 'average' | 'fast';
}

// Book Types
export interface Book {
    id: string;
    title: string;
    author: string;
    description: string;
    coverUrl?: string;

    // Metadata
    categories: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    pageCount: number;
    estimatedHours: number;
    publishedYear: number;

    // For Recommendations
    keyTopics: string[];
    targetAudience: string[];
    prerequisites: string[];

    // Embeddings (for vector search)
    embedding?: number[];
}

export interface BookRecommendation {
    book: Book;
    relevanceScore: number;
    rationale: string;
    sequenceOrder: number;
    matchingGoals: string[];
}

// Reading Progress Types
export interface ReadingProgress {
    bookId: string;
    userId: string;

    status: 'not-started' | 'reading' | 'paused' | 'completed';
    startedAt?: string;
    completedAt?: string;

    // Progress Tracking
    currentPage: number;
    totalPages: number;
    percentComplete: number;

    // Time Tracking
    totalMinutesRead: number;
    sessionsCount: number;

    // Highlights & Notes
    highlights: Highlight[];
    notes: Note[];

    // Wisdom Application
    actionItems: ActionItem[];
    experiments: Experiment[];
    reflections: Reflection[];
}

export interface Highlight {
    id: string;
    text: string;
    page: number;
    chapter?: string;
    createdAt: string;
    tags: string[];
}

export interface Note {
    id: string;
    content: string;
    highlightId?: string;
    page?: number;
    createdAt: string;
}

export interface ActionItem {
    id: string;
    concept: string;
    action: string;
    context: string;
    why: string;
    when: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate?: string;
    completedAt?: string;
    specificExample?: string;
}

export interface Experiment {
    id: string;
    title: string;
    hypothesis: string;
    steps: string[];
    durationDays: number;
    startDate: string;
    status: 'active' | 'completed' | 'failed';
    results?: string;
    reflectionPrompts: string[];
}

export interface Reflection {
    id: string;
    prompt: string;
    response: string;
    bookId: string;
    createdAt: string;
}

// Storage specific types
export interface StoredActionItem {
    id: string;
    bookId: string;
    bookTitle: string;
    concept: string;
    action: string;
    why: string;
    when: string;
    status: 'pending' | 'in-progress' | 'completed';
    createdAt: string;
    completedAt?: string;
    specificExample?: string;
}

export interface StoredExperiment {
    id: string;
    bookId: string;
    bookTitle: string;
    title: string;
    hypothesis: string;
    steps: string[];
    durationDays: number;
    startDate: string;
    status: 'active' | 'completed' | 'failed';
    results?: string;
    reflectionPrompts: string[];
    createdAt: string;
}

// Chat/Conversation Types
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: {
        stage?: string;
        intent?: string;
    };
}

export interface Conversation {
    id: string;
    userId: string;
    type: 'onboarding' | 'coaching' | 'research' | 'reflection';
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

// Dashboard Types
export interface UserStats {
    booksCompleted: number;
    currentlyReading: number;
    totalPagesRead: number;
    totalHoursRead: number;
    currentStreak: number;
    longestStreak: number;
    actionItemsCompleted: number;
    highlightsCreated: number;
}

export interface ReadingPlan {
    id: string;
    userId: string;
    weekStart: string;
    weekEnd: string;
    dailyGoals: DailyGoal[];
    weeklyBookTarget?: string;
}

export interface DailyGoal {
    date: string;
    targetMinutes: number;
    actualMinutes: number;
    targetPages: number;
    actualPages: number;
    completed: boolean;
}

// ============================================
// Research Assistant Types
// ============================================

export interface ResearchSource {
    id: string;
    title: string;
    url?: string;
    author?: string;
    publisher?: string;
    snippet: string;
    relevanceScore: number;
    type: 'web' | 'book' | 'academic';
    publishedDate?: string;
}

export interface ResearchMessage extends ChatMessage {
    sources?: ResearchSource[];
    isSynthesizing?: boolean;
    relatedQueries?: string[];
}

