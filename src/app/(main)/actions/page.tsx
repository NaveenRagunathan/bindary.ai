'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, BookOpen, Trash2, Filter } from 'lucide-react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { getActionItems, updateActionItem, deleteActionItem, type StoredActionItem } from '@/lib/storage';

type FilterStatus = 'all' | 'pending' | 'in-progress' | 'completed';

export default function ActionItemsPage() {
    const [items, setItems] = useState<StoredActionItem[]>([]);
    const [filter, setFilter] = useState<FilterStatus>('all');

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = () => {
        setItems(getActionItems());
    };

    const handleStatusChange = (id: string, newStatus: StoredActionItem['status']) => {
        updateActionItem(id, { status: newStatus });
        loadItems();
    };

    const handleDelete = (id: string) => {
        deleteActionItem(id);
        loadItems();
    };

    const filteredItems = items.filter((item) => {
        if (filter === 'all') return true;
        return item.status === filter;
    });

    const groupedByBook = filteredItems.reduce((acc, item) => {
        if (!acc[item.bookTitle]) {
            acc[item.bookTitle] = [];
        }
        acc[item.bookTitle].push(item);
        return acc;
    }, {} as Record<string, StoredActionItem[]>);

    const statusCounts = {
        pending: items.filter((i) => i.status === 'pending').length,
        'in-progress': items.filter((i) => i.status === 'in-progress').length,
        completed: items.filter((i) => i.status === 'completed').length,
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Action Items</h1>
                    <p className="text-text-secondary">Practical wisdom from your reading, ready to apply</p>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card variant="glass" padding="md" className="text-center">
                        <div className="text-2xl font-bold text-primary">{statusCounts.pending}</div>
                        <div className="text-sm text-text-muted">Pending</div>
                    </Card>
                    <Card variant="glass" padding="md" className="text-center">
                        <div className="text-2xl font-bold text-accent">{statusCounts['in-progress']}</div>
                        <div className="text-sm text-text-muted">In Progress</div>
                    </Card>
                    <Card variant="glass" padding="md" className="text-center">
                        <div className="text-2xl font-bold text-green-400">{statusCounts.completed}</div>
                        <div className="text-sm text-text-muted">Completed</div>
                    </Card>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-text-muted" />
                    <div className="flex gap-2">
                        {(['all', 'pending', 'in-progress', 'completed'] as FilterStatus[]).map((status) => (
                            <Button
                                key={status}
                                variant={filter === status ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter(status)}
                            >
                                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Action Items by Book */}
                {Object.keys(groupedByBook).length === 0 ? (
                    <Card variant="glass" padding="lg" className="text-center">
                        <div className="py-8">
                            <BookOpen size={48} className="mx-auto text-text-muted mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No action items yet</h3>
                            <p className="text-text-secondary max-w-md mx-auto">
                                When you use the Wisdom Translator on a book, your action items will appear here for tracking.
                            </p>
                        </div>
                    </Card>
                ) : (
                    Object.entries(groupedByBook).map(([bookTitle, bookItems]) => (
                        <Card key={bookTitle} variant="glass" padding="md">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                                <BookOpen size={18} className="text-primary" />
                                <h2 className="font-semibold text-white">{bookTitle}</h2>
                                <span className="text-xs text-text-muted bg-white/5 px-2 py-1 rounded-full ml-auto">
                                    {bookItems.length} items
                                </span>
                            </div>
                            <div className="space-y-3">
                                {bookItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-lg border transition-all ${item.status === 'completed'
                                                ? 'bg-green-500/5 border-green-500/20'
                                                : item.status === 'in-progress'
                                                    ? 'bg-accent/5 border-accent/20'
                                                    : 'bg-surface-elevated border-white/5'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={() =>
                                                    handleStatusChange(
                                                        item.id,
                                                        item.status === 'completed'
                                                            ? 'pending'
                                                            : item.status === 'in-progress'
                                                                ? 'completed'
                                                                : 'in-progress'
                                                    )
                                                }
                                                className="mt-1 flex-shrink-0"
                                            >
                                                {item.status === 'completed' ? (
                                                    <CheckCircle2 size={20} className="text-green-400" />
                                                ) : item.status === 'in-progress' ? (
                                                    <Clock size={20} className="text-accent" />
                                                ) : (
                                                    <Circle size={20} className="text-text-muted" />
                                                )}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <div
                                                    className={`font-medium ${item.status === 'completed'
                                                            ? 'text-text-muted line-through'
                                                            : 'text-white'
                                                        }`}
                                                >
                                                    {item.action}
                                                </div>
                                                <div className="mt-1 text-sm text-text-muted">
                                                    <span className="text-primary">Concept:</span> {item.concept}
                                                </div>
                                                <div className="mt-1 text-sm text-text-muted">
                                                    <span className="text-accent">When:</span> {item.when}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1 text-text-muted hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
