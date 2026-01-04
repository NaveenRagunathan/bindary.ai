import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    generateId,
    getSettings,
    saveSettings,
    getReadingProgress,
    saveReadingProgress,
    getRecommendations,
    saveRecommendations,
    clearAllData,
    STORAGE_KEYS,
} from '../storage';
import type { AppSettings } from '../storage';
import type { ReadingProgress, BookRecommendation, Book } from '@/types';

// Default settings for comparison
const DEFAULT_SETTINGS: AppSettings = {
    theme: 'dark',
    notifications: true,
    dailyReminder: '09:00',
    weeklyGoalMinutes: 300,
};

describe('storage utilities', () => {
    describe('generateId', () => {
        it('should generate unique IDs', () => {
            const id1 = generateId();
            const id2 = generateId();
            expect(id1).not.toBe(id2);
        });

        it('should match expected format (timestamp-randomstring)', () => {
            const id = generateId();
            expect(id).toMatch(/^\d+-[a-z0-9]+$/);
        });

        it('should use current timestamp', () => {
            const before = Date.now();
            const id = generateId();
            const after = Date.now();
            const timestamp = parseInt(id.split('-')[0], 10);
            expect(timestamp).toBeGreaterThanOrEqual(before);
            expect(timestamp).toBeLessThanOrEqual(after);
        });
    });

    describe('getSettings', () => {
        it('should return default settings when localStorage is empty', () => {
            vi.mocked(localStorage.getItem).mockReturnValue(null);
            const settings = getSettings();
            expect(settings).toEqual(DEFAULT_SETTINGS);
        });

        it('should merge stored settings with defaults', () => {
            vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify({ theme: 'light' }));
            const settings = getSettings();
            expect(settings.theme).toBe('light');
            expect(settings.notifications).toBe(true); // default value
            expect(settings.dailyReminder).toBe('09:00'); // default value
        });

        it('should handle malformed JSON gracefully', () => {
            vi.mocked(localStorage.getItem).mockReturnValue('not valid json');
            expect(() => getSettings()).toThrow();
        });
    });

    describe('saveSettings', () => {
        it('should save settings to localStorage', () => {
            vi.mocked(localStorage.getItem).mockReturnValue(null);
            saveSettings({ theme: 'light' });
            expect(localStorage.setItem).toHaveBeenCalledWith(
                STORAGE_KEYS.SETTINGS,
                expect.stringContaining('"theme":"light"')
            );
        });

        it('should merge with existing settings', () => {
            vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify({ theme: 'light' }));
            const result = saveSettings({ notifications: false });
            expect(result.theme).toBe('light');
            expect(result.notifications).toBe(false);
        });
    });

    describe('getReadingProgress', () => {
        it('should return empty array when no progress exists', () => {
            vi.mocked(localStorage.getItem).mockReturnValue(null);
            const progress = getReadingProgress();
            expect(progress).toEqual([]);
        });

        it('should return parsed progress array', () => {
            const mockProgress: ReadingProgress[] = [
                {
                    bookId: 'book-1',
                    userId: 'user-1',
                    status: 'reading',
                    currentPage: 50,
                    totalPages: 200,
                    percentComplete: 25,
                    totalMinutesRead: 60,
                    sessionsCount: 3,
                    highlights: [],
                    notes: [],
                    actionItems: [],
                    reflections: [],
                },
            ];
            vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockProgress));
            const progress = getReadingProgress();
            expect(progress).toHaveLength(1);
            expect(progress[0].bookId).toBe('book-1');
        });
    });

    describe('saveReadingProgress', () => {
        it('should add new progress entry', () => {
            vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([]));
            const newProgress: ReadingProgress = {
                bookId: 'book-new',
                userId: 'user-1',
                status: 'reading',
                currentPage: 10,
                totalPages: 100,
                percentComplete: 10,
                totalMinutesRead: 15,
                sessionsCount: 1,
                highlights: [],
                notes: [],
                actionItems: [],
                reflections: [],
            };
            saveReadingProgress(newProgress);
            expect(localStorage.setItem).toHaveBeenCalled();
        });

        it('should update existing progress entry', () => {
            const existingProgress: ReadingProgress[] = [
                {
                    bookId: 'book-1',
                    userId: 'user-1',
                    status: 'reading',
                    currentPage: 50,
                    totalPages: 200,
                    percentComplete: 25,
                    totalMinutesRead: 60,
                    sessionsCount: 3,
                    highlights: [],
                    notes: [],
                    actionItems: [],
                    reflections: [],
                },
            ];
            vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(existingProgress));

            const updatedProgress: ReadingProgress = {
                ...existingProgress[0],
                currentPage: 100,
                percentComplete: 50,
            };
            saveReadingProgress(updatedProgress);
            expect(localStorage.setItem).toHaveBeenCalled();
        });
    });

    describe('recommendations', () => {
        it('should get empty array when no recommendations exist', () => {
            vi.mocked(localStorage.getItem).mockReturnValue(null);
            expect(getRecommendations()).toEqual([]);
        });

        it('should save and retrieve recommendations', () => {
            const mockBook: Book = {
                id: 'book-1',
                title: 'Test Book',
                author: 'Test Author',
                description: 'A test book',
                categories: ['test'],
                difficulty: 'beginner',
                pageCount: 200,
                estimatedHours: 5,
                publishedYear: 2024,
                keyTopics: ['testing'],
                targetAudience: ['developers'],
                prerequisites: [],
            };
            const mockRecs: BookRecommendation[] = [
                {
                    book: mockBook,
                    relevanceScore: 95,
                    rationale: 'Great for testing',
                    sequenceOrder: 1,
                    matchingGoals: ['learn testing'],
                },
            ];
            saveRecommendations(mockRecs);
            expect(localStorage.setItem).toHaveBeenCalledWith(
                STORAGE_KEYS.RECOMMENDATIONS,
                expect.any(String)
            );
        });
    });

    describe('clearAllData', () => {
        it('should remove all storage keys', () => {
            clearAllData();
            const expectedKeys = Object.values(STORAGE_KEYS);
            expect(localStorage.removeItem).toHaveBeenCalledTimes(expectedKeys.length);
        });
    });
});
