import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button component', () => {
    describe('rendering', () => {
        it('should render children correctly', () => {
            render(<Button>Click me</Button>);
            expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
        });

        it('should render with icon', () => {
            const TestIcon = () => <span data-testid="test-icon">★</span>;
            render(<Button icon={<TestIcon />}>With Icon</Button>);
            expect(screen.getByTestId('test-icon')).toBeInTheDocument();
            expect(screen.getByText('With Icon')).toBeInTheDocument();
        });
    });

    describe('variants', () => {
        it('should apply primary variant class by default', () => {
            render(<Button>Primary</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('btn-primary');
        });

        it('should apply secondary variant class', () => {
            render(<Button variant="secondary">Secondary</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('btn-secondary');
        });

        it('should apply ghost variant class', () => {
            render(<Button variant="ghost">Ghost</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('btn-ghost');
        });

        it('should apply danger variant class', () => {
            render(<Button variant="danger">Danger</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('btn-danger');
        });
    });

    describe('sizes', () => {
        it('should apply medium size by default', () => {
            render(<Button>Medium</Button>);
            expect(screen.getByRole('button').className).toContain('btn-md');
        });

        it('should apply small size', () => {
            render(<Button size="sm">Small</Button>);
            expect(screen.getByRole('button').className).toContain('btn-sm');
        });

        it('should apply large size', () => {
            render(<Button size="lg">Large</Button>);
            expect(screen.getByRole('button').className).toContain('btn-lg');
        });
    });

    describe('loading state', () => {
        it('should show spinner when loading', () => {
            render(<Button loading>Loading</Button>);
            const button = screen.getByRole('button');
            expect(button.querySelector('.btn-spinner')).toBeInTheDocument();
        });

        it('should hide children when loading', () => {
            render(<Button loading>Hidden Text</Button>);
            expect(screen.queryByText('Hidden Text')).not.toBeInTheDocument();
        });

        it('should be disabled when loading', () => {
            render(<Button loading>Submit</Button>);
            expect(screen.getByRole('button')).toBeDisabled();
        });
    });

    describe('disabled state', () => {
        it('should be disabled when disabled prop is true', () => {
            render(<Button disabled>Disabled</Button>);
            expect(screen.getByRole('button')).toBeDisabled();
        });
    });

    describe('fullWidth', () => {
        it('should apply full width class', () => {
            render(<Button fullWidth>Full Width</Button>);
            expect(screen.getByRole('button').className).toContain('btn-full');
        });
    });

    describe('interactions', () => {
        it('should call onClick when clicked', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click</Button>);
            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).toHaveBeenCalledOnce();
        });

        it('should not call onClick when disabled', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick} disabled>Click</Button>);
            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).not.toHaveBeenCalled();
        });

        it('should not call onClick when loading', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick} loading>Click</Button>);
            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('custom className', () => {
        it('should merge custom className with default classes', () => {
            render(<Button className="custom-class">Custom</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('custom-class');
            expect(button.className).toContain('btn');
        });
    });
});
