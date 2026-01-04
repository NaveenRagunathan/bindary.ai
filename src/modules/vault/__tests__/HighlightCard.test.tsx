import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { HighlightCard } from '../components/HighlightCard';
import type { StoredHighlight } from '@/lib/storage';

describe('HighlightCard', () => {
    const mockHighlight: StoredHighlight = {
        id: '1',
        bookId: 'b1',
        text: 'This is a test highlight',
        page: 42,
        color: 'yellow',
        createdAt: new Date().toISOString()
    };

    it('renders highlight text', () => {
        render(<HighlightCard highlight={mockHighlight} />);
        expect(screen.getByText(/"This is a test highlight"/)).toBeInTheDocument();
    });

    it('renders page number', () => {
        render(<HighlightCard highlight={mockHighlight} />);
        expect(screen.getByText(/Page 42/)).toBeInTheDocument();
    });

    it('renders book title if provided', () => {
        render(<HighlightCard highlight={mockHighlight} bookTitle="Deep Work" />);
        expect(screen.getByText(/Deep Work/)).toBeInTheDocument();
    });

    it('renders tags if present', () => {
        const highlightWithTags = { ...mockHighlight, tags: ['important', 'quote'] };
        render(<HighlightCard highlight={highlightWithTags} />);
        expect(screen.getByText('important')).toBeInTheDocument();
        expect(screen.getByText('quote')).toBeInTheDocument();
    });

    it('allows adding a tag', async () => {
        const user = userEvent.setup();
        const onUpdate = vi.fn();
        render(<HighlightCard highlight={mockHighlight} onUpdate={onUpdate} />);

        // Click Add Tag button
        const addBtn = screen.getByText(/Tag/i);
        await user.click(addBtn);

        // Type new tag
        const input = screen.getByPlaceholderText('New tag...');
        await user.type(input, 'newtag{enter}');

        expect(onUpdate).toHaveBeenCalledWith('1', { tags: ['newtag'] });
    });
});

