import type { UserProfile, ReadingProgress, BookRecommendation, Conversation } from '@/types';

const STORAGE_KEYS = {
    USER_PROFILE: 'bindery_user_profile',
    READING_PROGRESS: 'bindery_reading_progress',
    RECOMMENDATIONS: 'bindery_recommendations',
    CONVERSATIONS: 'bindery_conversations',
    SETTINGS: 'bindery_settings',
};

// User Profile
export function saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
}

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

// Utility: Clear all data (for development/testing)
export function clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
    });
}

// Export storage keys for debugging
export { STORAGE_KEYS };
