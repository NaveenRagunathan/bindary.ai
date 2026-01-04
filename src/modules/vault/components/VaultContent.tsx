'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Quote, Sparkles } from 'lucide-react';
import { Button } from '@/ui/Button';
import { HighlightCard } from './HighlightCard';
import { getHighlights, updateHighlight } from '@/lib/storage';
import { getAllBooks } from '@/modules/library/services/books';
import type { StoredHighlight } from '@/lib/storage';
import type { Book } from '@/types';

type ColorFilter = 'all' | 'yellow' | 'green' | 'blue' | 'purple';

export function VaultContent() {
    const [highlights, setHighlights] = useState<StoredHighlight[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedColor, setSelectedColor] = useState<ColorFilter>('all');
    const [selectedBookId, setSelectedBookId] = useState<string>('all');

    const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

    useEffect(() => {
        // Load data
        const loadData = async () => {
            const allHighlights = getHighlights();
            // Sort by newest first
            allHighlights.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setHighlights(allHighlights);

            const allBooks = await getAllBooks();
            setBooks(allBooks);
        };
        loadData();
    }, []);

    const handleUpdateHighlight = (id: string, updates: Partial<StoredHighlight>) => {
        const updated = updateHighlight(id, updates);
        if (updated) {
            setHighlights(prev => prev.map(h => h.id === id ? updated : h));
        }
    };

    const filteredHighlights = highlights.filter(h => {
        const matchesSearch = h.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (h.note && h.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (h.tags && h.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))); // Search tags too

        const matchesColor = selectedColor === 'all' || h.color === selectedColor;
        const matchesBook = selectedBookId === 'all' || h.bookId === selectedBookId;

        return matchesSearch && matchesColor && matchesBook;
    });

    const getBookTitle = (id: string) => books.find(b => b.id === id)?.title || 'Unknown Book';

    return (
        <div className="h-full flex flex-col md:flex-row overflow-hidden animate-fade-in">
            {/* Sidebar Filters */}
            <div className="w-full md:w-64 flex-shrink-0 border-r border-white/10 bg-surface-elevated/50 p-6 space-y-8 overflow-y-auto">
                <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Filter size={14} /> Filters
                    </h3>

                    {/* View Toggle */}
                    <div className="bg-white/5 p-1 rounded-lg flex mb-6">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'timeline' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
                        >
                            Timeline
                        </button>
                    </div>

                    {/* Color Filter */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-white mb-2">Type / Color</p>
                        <button
                            onClick={() => setSelectedColor('all')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${selectedColor === 'all' ? 'bg-white/10 text-white' : 'text-text-secondary hover:bg-white/5'}`}
                        >
                            <div className="w-4 h-4 rounded-full border border-white/20" />
                            All Highlights
                        </button>
                        {[
                            { id: 'yellow', label: 'Quotes', color: 'bg-amber-400' },
                            { id: 'green', label: 'Action Items', color: 'bg-emerald-400' },
                            { id: 'blue', label: 'Concepts', color: 'bg-blue-400' },
                            { id: 'purple', label: 'Reflections', color: 'bg-purple-400' },
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedColor(type.id as ColorFilter)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${selectedColor === type.id ? 'bg-white/10 text-white' : 'text-text-secondary hover:bg-white/5'}`}
                            >
                                <div className={`w-4 h-4 rounded-full ${type.color}`} />
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Book Filter */}
                <div>
                    <p className="text-sm font-medium text-white mb-2">Books</p>
                    <select
                        value={selectedBookId}
                        onChange={(e) => setSelectedBookId(e.target.value)}
                        className="w-full bg-surface-elevated border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                    >
                        <option value="all">All Books</option>
                        {books.map(b => (
                            <option key={b.id} value={b.id}>{b.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header / Search */}
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                            <Sparkles className="text-accent" size={24} />
                            Knowledge Vault
                        </h1>
                        <p className="text-text-secondary text-sm mt-1">
                            {highlights.length} captured insights across {books.length} books
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search your knowledge base..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50"
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredHighlights.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                            <Quote size={48} className="text-text-muted" />
                            <p className="text-lg">No highlights found matching your filters.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredHighlights.map(highlight => (
                                <HighlightCard
                                    key={highlight.id}
                                    highlight={highlight}
                                    bookTitle={getBookTitle(highlight.bookId)}
                                    onUpdate={handleUpdateHighlight}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-8 pl-4 border-l border-white/10 relative">
                            {filteredHighlights.map((highlight, index) => (
                                <div key={highlight.id} className="relative pl-8">
                                    <div className="absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full bg-accent border-[3px] border-background" />
                                    <div className="mb-2 text-xs text-text-muted font-mono">
                                        {new Date(highlight.createdAt).toLocaleDateString(undefined, { idx: index, year: 'numeric', month: 'short', day: 'numeric' } as any)}
                                    </div>
                                    <HighlightCard
                                        highlight={highlight}
                                        bookTitle={getBookTitle(highlight.bookId)}
                                        onUpdate={handleUpdateHighlight}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
