import type { UserProfile, ReadingProgress, BookRecommendation, Conversation, Highlight } from '@/types';

const STORAGE_KEYS = {
    USER_PROFILE: 'bindery_user_profile',
    READING_PROGRESS: 'bindery_reading_progress',
    RECOMMENDATIONS: 'bindery_recommendations',
    CONVERSATIONS: 'bindery_conversations',
    SETTINGS: 'bindery_settings',
    ACTION_ITEMS: 'bindery_action_items',
    READING_SESSIONS: 'bindery_reading_sessions',
    HIGHLIGHTS: 'bindery_highlights',
    EXPERIMENTS: 'bindery_experiments',
};

// ============================================
// User Profile - DEPRECATED
// Use server action getUserProfileFromDB() instead.
// These functions will be removed in future versions.
// ============================================

/**
 * @deprecated Use server action getUserProfileFromDB() from '@/app/actions' instead.
 * localStorage should not be used for user profile data.
 */
export function saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
}

/**
 * @deprecated Use server action getUserProfileFromDB() from '@/app/actions' instead.
 * localStorage should not be used for user profile data.
 */
export function getUserProfile(): UserProfile | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
}

export function updateUserProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = getUserProfile();
    if (!current) return null;

    const updated = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
    };
    saveUserProfile(updated);
    return updated;
}

export function deleteUserProfile(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
}

// Reading Progress
export function getReadingProgress(): ReadingProgress[] {
    const data = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
    return data ? JSON.parse(data) : [];
}

export function getBookProgress(bookId: string): ReadingProgress | null {
    const all = getReadingProgress();
    return all.find((p) => p.bookId === bookId) || null;
}

export function saveReadingProgress(progress: ReadingProgress): void {
    const all = getReadingProgress();
    const index = all.findIndex((p) => p.bookId === progress.bookId);

    if (index >= 0) {
        all[index] = progress;
    } else {
        all.push(progress);
    }

    localStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(all));
}

export function updateBookProgress(
    bookId: string,
    updates: Partial<ReadingProgress>
): ReadingProgress | null {
    const current = getBookProgress(bookId);
    if (!current) return null;

    const updated = { ...current, ...updates };
    saveReadingProgress(updated);
    return updated;
}

// Recommendations
export function getRecommendations(): BookRecommendation[] {
    const data = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
    return data ? JSON.parse(data) : [];
}

export function saveRecommendations(recommendations: BookRecommendation[]): void {
    localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(recommendations));
}

// Conversations
export function getConversations(): Conversation[] {
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
}

export function getConversation(id: string): Conversation | null {
    const all = getConversations();
    return all.find((c) => c.id === id) || null;
}

export function saveConversation(conversation: Conversation): void {
    const all = getConversations();
    const index = all.findIndex((c) => c.id === conversation.id);

    if (index >= 0) {
        all[index] = conversation;
    } else {
        all.push(conversation);
    }

    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(all));
}

// Settings
export interface AppSettings {
    theme: 'dark' | 'light';
    notifications: boolean;
    dailyReminder: string; // Time in HH:MM format
    weeklyGoalMinutes: number;
}

const DEFAULT_SETTINGS: AppSettings = {
    theme: 'dark',
    notifications: true,
    dailyReminder: '09:00',
    weeklyGoalMinutes: 300, // 5 hours
};

export function getSettings(): AppSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
}

// Utility: Generate unique ID
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================
// Action Items (from Wisdom Translator)
// ============================================

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

export function getActionItems(): StoredActionItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACTION_ITEMS);
    return data ? JSON.parse(data) : [];
}

export function saveActionItem(item: StoredActionItem): void {
    const all = getActionItems();
    all.push(item);
    localStorage.setItem(STORAGE_KEYS.ACTION_ITEMS, JSON.stringify(all));
}

export function saveActionItems(items: StoredActionItem[]): void {
    const existing = getActionItems();
    localStorage.setItem(STORAGE_KEYS.ACTION_ITEMS, JSON.stringify([...existing, ...items]));
}

export function updateActionItem(id: string, updates: Partial<StoredActionItem>): StoredActionItem | null {
    const all = getActionItems();
    const index = all.findIndex((item) => item.id === id);
    if (index < 0) return null;

    const updated = { ...all[index], ...updates };
    if (updates.status === 'completed' && !updated.completedAt) {
        updated.completedAt = new Date().toISOString();
    }
    all[index] = updated;
    localStorage.setItem(STORAGE_KEYS.ACTION_ITEMS, JSON.stringify(all));
    return updated;
}

export function deleteActionItem(id: string): void {
    const all = getActionItems();
    const filtered = all.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.ACTION_ITEMS, JSON.stringify(filtered));
}

export function getActionItemsByBook(bookId: string): StoredActionItem[] {
    return getActionItems().filter((item) => item.bookId === bookId);
}

export function getPendingActionItems(): StoredActionItem[] {
    return getActionItems().filter((item) => item.status === 'pending');
}

// ============================================
// Experiments (from Wisdom Translator)
// ============================================

export function getExperiments(): StoredExperiment[] {
    const data = localStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
    return data ? JSON.parse(data) : [];
}

export function saveExperiment(experiment: StoredExperiment): void {
    const all = getExperiments();
    all.push(experiment);
    localStorage.setItem(STORAGE_KEYS.EXPERIMENTS, JSON.stringify(all));
}

export function updateExperiment(id: string, updates: Partial<StoredExperiment>): StoredExperiment | null {
    const all = getExperiments();
    const index = all.findIndex((e) => e.id === id);
    if (index < 0) return null;

    const updated = { ...all[index], ...updates };
    all[index] = updated;
    localStorage.setItem(STORAGE_KEYS.EXPERIMENTS, JSON.stringify(all));
    return updated;
}

export function getActiveExperiments(): StoredExperiment[] {
    return getExperiments().filter((e) => e.status === 'active');
}

// ============================================
// Reading Sessions & Streaks
// ============================================

export interface StoredReadingSession {
    id: string;
    userId: string; // future-proofing
    bookId: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    pagesRead: number;
    notes?: string;
}

export function getReadingSessions(): StoredReadingSession[] {
    const data = localStorage.getItem(STORAGE_KEYS.READING_SESSIONS);
    return data ? JSON.parse(data) : [];
}

export function logReadingSession(session: Omit<StoredReadingSession, 'id'>): StoredReadingSession {
    const all = getReadingSessions();
    const newSession = {
        ...session,
        id: generateId(),
    };
    all.push(newSession);
    localStorage.setItem(STORAGE_KEYS.READING_SESSIONS, JSON.stringify(all));
    return newSession;
}

export function calculateStreak(): { current: number; longest: number; lastReadDate: string | null } {
    const sessions = getReadingSessions();
    if (sessions.length === 0) {
        return { current: 0, longest: 0, lastReadDate: null };
    }

    // Sort by date descending
    const sortedSessions = [...sessions].sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    const dates = sortedSessions.map(s => new Date(s.startTime).toDateString());
    const uniqueDates = Array.from(new Set(dates)); // Distinct days read

    if (uniqueDates.length === 0) return { current: 0, longest: 0, lastReadDate: null };

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    const lastReadDate = uniqueDates[0];
    let currentStreak = 0;

    // Check if streak is active (read today or yesterday)
    if (lastReadDate === today || lastReadDate === yesterday) {
        currentStreak = 1;
        // Count backwards
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const date1 = new Date(uniqueDates[i]);
            const date2 = new Date(uniqueDates[i + 1]);
            const diffTime = Math.abs(date1.getTime() - date2.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    // Longest streak calculation
    let longestStreak = 0;
    let tempStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const date1 = new Date(uniqueDates[i]);
        const date2 = new Date(uniqueDates[i + 1]);
        const diffTime = Math.abs(date1.getTime() - date2.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak, lastReadDate };
}

// ============================================
// Highlights & Notes
// ============================================

export interface StoredHighlight {
    id: string;
    bookId: string;
    text: string;
    page: number;
    color: 'yellow' | 'green' | 'blue' | 'purple';
    note?: string;
    tags?: string[];
    createdAt: string;
}

export function getHighlights(bookId?: string): StoredHighlight[] {
    const data = localStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
    const all: StoredHighlight[] = data ? JSON.parse(data) : [];

    if (bookId) {
        return all.filter(h => h.bookId === bookId);
    }
    return all;
}

export function saveHighlight(highlight: Omit<StoredHighlight, 'id' | 'createdAt'>): StoredHighlight {
    const all = getHighlights();
    const newHighlight: StoredHighlight = {
        ...highlight,
        id: generateId(),
        tags: highlight.tags || [],
        createdAt: new Date().toISOString(),
    };
    all.push(newHighlight);
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(all));
    return newHighlight;
}

export function updateHighlight(id: string, updates: Partial<StoredHighlight>): StoredHighlight | null {
    const all = getHighlights();
    const index = all.findIndex(h => h.id === id);
    if (index < 0) return null;

    const updated = { ...all[index], ...updates };
    all[index] = updated;
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(all));
    return updated;
}

export function deleteHighlight(id: string): void {
    const all = getHighlights();
    const filtered = all.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(filtered));
}

// Utility: Clear all data (for development/testing)
export function clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
    });
}

// Export storage keys for debugging
export { STORAGE_KEYS };
