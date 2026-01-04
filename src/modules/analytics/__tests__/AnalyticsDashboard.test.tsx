import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

// Mock Recharts ResponsiveContainer to render children directly
vi.mock('recharts', async (importOriginal) => {
    const original = await importOriginal<any>();
    return {
        ...original,
        ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>
    };
});

// Mock Storage
vi.mock('@/lib/storage', () => ({
    getReadingSessions: () => [
        { startTime: new Date().toISOString(), pagesRead: 10, durationMinutes: 30 }
    ],
    calculateStreak: () => ({ current: 5, longest: 10 })
}));

// Mock Books
vi.mock('@/modules/library/services/books', () => ({
    getAllBooks: async () => []
}));

describe('AnalyticsDashboard', () => {
    it('renders dashboard title', async () => {
        render(<AnalyticsDashboard />);
        expect(screen.getByText('Reading Analytics')).toBeInTheDocument();
    });

    it('displays stats correctly', async () => {
        render(<AnalyticsDashboard />);
        // Wait for effect
        expect(await screen.findByText('10')).toBeInTheDocument(); // Total Pages
        expect(await screen.findByText('0.5')).toBeInTheDocument(); // 30 mins = 0.5 hours
        expect(await screen.findByText('5 Days')).toBeInTheDocument(); // Current Streak
    });
});
