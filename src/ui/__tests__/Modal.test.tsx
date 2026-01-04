import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal component', () => {
    describe('rendering', () => {
        it('should not render when isOpen is false', () => {
            render(
                <Modal isOpen={false} onClose={vi.fn()}>
                    Content
                </Modal>
            );
            expect(screen.queryByText('Content')).not.toBeInTheDocument();
        });

        it('should render when isOpen is true', () => {
            render(
                <Modal isOpen={true} onClose={vi.fn()}>
                    Modal Content
                </Modal>
            );
            expect(screen.getByText('Modal Content')).toBeInTheDocument();
        });

        it('should render title when provided', () => {
            render(
                <Modal isOpen={true} onClose={vi.fn()} title="Test Title">
                    Content
                </Modal>
            );
            expect(screen.getByText('Test Title')).toBeInTheDocument();
        });

        it('should render close button by default', () => {
            render(
                <Modal isOpen={true} onClose={vi.fn()}>
                    Content
                </Modal>
            );
            expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
        });

        it('should hide close button when showCloseButton is false', () => {
            render(
                <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false}>
                    Content
                </Modal>
            );
            expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
        });
    });

    describe('sizes', () => {
        it('should apply medium size by default', () => {
            render(
                <Modal isOpen={true} onClose={vi.fn()}>
                    Content
                </Modal>
            );
            const modal = screen.getByText('Content').parentElement;
            expect(modal?.className).toContain('modal-md');
        });

        it('should apply small size', () => {
            render(
                <Modal isOpen={true} onClose={vi.fn()} size="sm">
                    Content
                </Modal>
            );
            const modal = screen.getByText('Content').parentElement;
            expect(modal?.className).toContain('modal-sm');
        });

        it('should apply large size', () => {
            render(
                <Modal isOpen={true} onClose={vi.fn()} size="lg">
                    Content
                </Modal>
            );
            const modal = screen.getByText('Content').parentElement;
            expect(modal?.className).toContain('modal-lg');
        });
    });

    describe('interactions', () => {
        it('should call onClose when close button is clicked', () => {
            const onClose = vi.fn();
            render(
                <Modal isOpen={true} onClose={onClose}>
                    Content
                </Modal>
            );
            fireEvent.click(screen.getByRole('button', { name: /close/i }));
            expect(onClose).toHaveBeenCalledOnce();
        });

        it('should call onClose when backdrop is clicked', () => {
            const onClose = vi.fn();
            render(
                <Modal isOpen={true} onClose={onClose}>
                    Content
                </Modal>
            );
            // The overlay is the parent element with modal-overlay class
            const overlay = screen.getByText('Content').closest('.modal-overlay');
            if (overlay) {
                fireEvent.click(overlay);
            }
            expect(onClose).toHaveBeenCalledOnce();
        });

        it('should not call onClose when modal content is clicked', () => {
            const onClose = vi.fn();
            render(
                <Modal isOpen={true} onClose={onClose}>
                    Content
                </Modal>
            );
            fireEvent.click(screen.getByText('Content'));
            expect(onClose).not.toHaveBeenCalled();
        });

        it('should call onClose when Escape key is pressed', () => {
            const onClose = vi.fn();
            render(
                <Modal isOpen={true} onClose={onClose}>
                    Content
                </Modal>
            );
            fireEvent.keyDown(document, { key: 'Escape' });
            expect(onClose).toHaveBeenCalledOnce();
        });
    });

    describe('body scroll lock', () => {
        it('should set body overflow to hidden when open', () => {
            render(
                <Modal isOpen={true} onClose={vi.fn()}>
                    Content
                </Modal>
            );
            expect(document.body.style.overflow).toBe('hidden');
        });

        it('should restore body overflow when closed', () => {
            const { rerender } = render(
                <Modal isOpen={true} onClose={vi.fn()}>
                    Content
                </Modal>
            );
            rerender(
                <Modal isOpen={false} onClose={vi.fn()}>
                    Content
                </Modal>
            );
            expect(document.body.style.overflow).toBe('');
        });
    });
});
