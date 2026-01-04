import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, CardFooter } from '../Card';

describe('Card component', () => {
    describe('rendering', () => {
        it('should render children correctly', () => {
            render(<Card>Card Content</Card>);
            expect(screen.getByText('Card Content')).toBeInTheDocument();
        });
    });

    describe('variants', () => {
        it('should apply default variant by default', () => {
            render(<Card>Content</Card>);
            const card = screen.getByText('Content');
            expect(card.className).toContain('card-default');
        });

        it('should apply glass variant', () => {
            render(<Card variant="glass">Content</Card>);
            const card = screen.getByText('Content');
            expect(card.className).toContain('card-glass');
        });

        it('should apply elevated variant', () => {
            render(<Card variant="elevated">Content</Card>);
            const card = screen.getByText('Content');
            expect(card.className).toContain('card-elevated');
        });
    });

    describe('padding', () => {
        it('should apply medium padding by default', () => {
            render(<Card>Content</Card>);
            const card = screen.getByText('Content');
            expect(card.className).toContain('card-padding-md');
        });

        it('should apply none padding', () => {
            render(<Card padding="none">Content</Card>);
            const card = screen.getByText('Content');
            expect(card.className).toContain('card-padding-none');
        });

        it('should apply large padding', () => {
            render(<Card padding="lg">Content</Card>);
            const card = screen.getByText('Content');
            expect(card.className).toContain('card-padding-lg');
        });
    });

    describe('hover effect', () => {
        it('should not apply hover class by default', () => {
            render(<Card>Content</Card>);
            const card = screen.getByText('Content');
            expect(card.className).not.toContain('card-hover');
        });

        it('should apply hover class when hover is true', () => {
            render(<Card hover>Content</Card>);
            const card = screen.getByText('Content');
            expect(card.className).toContain('card-hover');
        });
    });

    describe('clickable state', () => {
        it('should add button role when onClick is provided', () => {
            render(<Card onClick={vi.fn()}>Clickable</Card>);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should add tabIndex when onClick is provided', () => {
            render(<Card onClick={vi.fn()}>Clickable</Card>);
            expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '0');
        });

        it('should not have button role without onClick', () => {
            render(<Card>Not Clickable</Card>);
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });
    });

    describe('custom className', () => {
        it('should merge custom className', () => {
            render(<Card className="custom-class">Content</Card>);
            const card = screen.getByText('Content');
            expect(card.className).toContain('custom-class');
            expect(card.className).toContain('card');
        });
    });
});

describe('CardHeader component', () => {
    it('should render children', () => {
        render(<CardHeader>Header Content</CardHeader>);
        expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('should apply card-header class', () => {
        render(<CardHeader>Header</CardHeader>);
        expect(screen.getByText('Header').className).toContain('card-header');
    });

    it('should merge custom className', () => {
        render(<CardHeader className="custom">Header</CardHeader>);
        const header = screen.getByText('Header');
        expect(header.className).toContain('custom');
        expect(header.className).toContain('card-header');
    });
});

describe('CardContent component', () => {
    it('should render children', () => {
        render(<CardContent>Body Content</CardContent>);
        expect(screen.getByText('Body Content')).toBeInTheDocument();
    });

    it('should apply card-content class', () => {
        render(<CardContent>Content</CardContent>);
        expect(screen.getByText('Content').className).toContain('card-content');
    });
});

describe('CardFooter component', () => {
    it('should render children', () => {
        render(<CardFooter>Footer Content</CardFooter>);
        expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('should apply card-footer class', () => {
        render(<CardFooter>Footer</CardFooter>);
        expect(screen.getByText('Footer').className).toContain('card-footer');
    });
});
