import { useState, useEffect } from 'react';
import { BookOpen, Clock, FileText, Plus, X, Sparkles } from 'lucide-react';
import { Modal } from '@/ui/Modal';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Input, Textarea } from '@/ui/Input';
import { getAllBooks } from '@/modules/library/services/books';
import { logReadingSession, saveHighlight } from '@/lib/storage';
import type { Book } from '@/types';
import './LogReadingModal.css';

interface LogReadingModalProps {
    isOpen: boolean;
    onClose: () => void;
    preselectedBookId?: string;
    onSuccess?: () => void;
}

export function LogReadingModal({ isOpen, onClose, preselectedBookId, onSuccess }: LogReadingModalProps) {
    const [books, setBooks] = useState<Book[]>([]);
    const [selectedBookId, setSelectedBookId] = useState(preselectedBookId || '');
    const [duration, setDuration] = useState('30');
    const [pagesRead, setPagesRead] = useState('10');
    const [notes, setNotes] = useState('');
    const [highlights, setHighlights] = useState<{ text: string; page: string; color: 'yellow' | 'green' | 'blue' | 'purple' }[]>([]);
    const [newHighlight, setNewHighlight] = useState({ text: '', page: '', color: 'yellow' as const });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setBooks(getAllBooks());
    }, []);

    useEffect(() => {
        if (preselectedBookId) setSelectedBookId(preselectedBookId);
    }, [preselectedBookId]);

    const handleAddHighlight = () => {
        if (!newHighlight.text.trim()) return;
        setHighlights([...highlights, { ...newHighlight }]);
        setNewHighlight({ text: '', page: '', color: 'yellow' });
    };

    const handleSubmit = async () => {
        if (!selectedBookId) return;

        setIsSubmitting(true);
        try {
            // Log session
            logReadingSession({
                userId: 'user-1', // Placeholder
                bookId: selectedBookId,
                startTime: new Date(Date.now() - parseInt(duration) * 60000).toISOString(),
                endTime: new Date().toISOString(),
                durationMinutes: parseInt(duration),
                pagesRead: parseInt(pagesRead),
                notes: notes
            });

            // Save highlights
            highlights.forEach(h => {
                saveHighlight({
                    bookId: selectedBookId,
                    text: h.text,
                    page: parseInt(h.page) || 0,
                    color: h.color,
                    note: '',
                });
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to log reading:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Reading Session" size="lg">
            <div className="space-y-6">
                {/* Book Selection */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Book</label>
                    <select
                        className="w-full bg-surface-elevated border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        value={selectedBookId}
                        onChange={(e) => setSelectedBookId(e.target.value)}
                    >
                        <option value="">Select a book...</option>
                        {books.map(book => (
                            <option key={book.id} value={book.id}>{book.title}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Duration (minutes)"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        icon={<Clock size={16} />}
                    />
                    <Input
                        label="Pages Read"
                        type="number"
                        value={pagesRead}
                        onChange={(e) => setPagesRead(e.target.value)}
                        icon={<BookOpen size={16} />}
                    />
                </div>

                <Textarea
                    label="Session Notes"
                    placeholder="What did you learn today?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                />

                {/* Highlights Section */}
                <div className="border-t border-white/10 pt-6">
                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        <Sparkles size={16} className="text-primary" />
                        Add Highlights
                    </h3>

                    <div className="bg-surface-elevated rounded-lg p-4 space-y-4">
                        <Textarea
                            placeholder="Type quote here..."
                            value={newHighlight.text}
                            onChange={(e) => setNewHighlight({ ...newHighlight, text: e.target.value })}
                            rows={2}
                        />
                        <div className="flex gap-4">
                            <Input
                                placeholder="Page #"
                                value={newHighlight.page}
                                onChange={(e) => setNewHighlight({ ...newHighlight, page: e.target.value })}
                                className="w-24"
                            />
                            <div className="flex items-center gap-2 flex-1">
                                {['yellow', 'green', 'blue', 'purple'].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewHighlight({ ...newHighlight, color: color as any })}
                                        className={`w-6 h-6 rounded-full transition-transform ${newHighlight.color === color ? 'scale-125 ring-2 ring-white/50' : ''
                                            }`}
                                        style={{ backgroundColor: `var(--color-${color}-400, ${color})` }}
                                        type="button"
                                    />
                                ))}
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleAddHighlight}
                                disabled={!newHighlight.text}
                                icon={<Plus size={16} />}
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    {/* Highlights List */}
                    {highlights.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {highlights.map((h, i) => (
                                <div key={i} className="flex gap-3 text-sm p-3 bg-white/5 rounded-lg border-l-2" style={{ borderColor: h.color }}>
                                    <p className="flex-1 text-text-secondary">"{h.text}"</p>
                                    <span className="text-text-muted">p. {h.page}</span>
                                    <button
                                        onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))}
                                        className="text-text-muted hover:text-red-400"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!selectedBookId}
                    >
                        Save Session
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
