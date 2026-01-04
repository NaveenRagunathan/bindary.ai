import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Book as BookIcon } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Book } from '@/types';

interface AddBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AddBookModal({ isOpen, onClose, onSuccess }: AddBookModalProps) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [pageCount, setPageCount] = useState('');
    const [difficulty, setDifficulty] = useState<Book['difficulty']>('intermediate');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !author || !pageCount) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    author,
                    pageCount: parseInt(pageCount, 10),
                    difficulty,
                }),
            });

            if (!response.ok) throw new Error('Failed to create book');

            // Reset form
            setTitle('');
            setAuthor('');
            setPageCount('');

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to add book:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-md bg-surface-elevated border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-display font-bold text-white">Add Book Manually</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <Input
                        label="Book Title"
                        placeholder="e.g. Atomic Habits"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        icon={<BookIcon size={16} />}
                    />

                    <Input
                        label="Author"
                        placeholder="e.g. James Clear"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Pages"
                            type="number"
                            placeholder="300"
                            value={pageCount}
                            onChange={(e) => setPageCount(e.target.value)}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Difficulty
                            </label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value as Book['difficulty'])}
                                className="w-full h-[42px] bg-surface-elevated border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title || !author || !pageCount || isSubmitting}
                            loading={isSubmitting}
                        >
                            Add Book
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
