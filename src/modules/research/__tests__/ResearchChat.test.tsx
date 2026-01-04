import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ResearchChat } from '../components/ResearchChat';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ResearchChat', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('renders empty state initially', () => {
        render(<ResearchChat />);
        expect(screen.getByText('Research Assistant')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Research a topic/i)).toBeInTheDocument();
    });
});
