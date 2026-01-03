'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Search, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ResearchPage() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleSearch = () => {
        if (!query.trim()) return;
        setIsSearching(true);
        setResult(null);

        // Mock search delay
        setTimeout(() => {
            setIsSearching(false);
            setResult(`Based on your library, here is a synthesis for "${query}":\n\nYour books suggest that deep work requires a state of distraction-free concentration. Cal Newport's "Deep Work" recommends scheduling specific blocks of time, while "Atomic Habits" suggests stacking this habit onto an existing morning routine. Consider starting with 30-minute intervals.`);
        }, 1500);
    };

    const suggestedQueries = [
        "How do I build a habit of deep work?",
        "What are the key principles of stoicism?",
        "Explain the concept of antifragility",
        "How to improve my sleep quality?"
    ];

    return (
        <div className="p-8 md:p-12 space-y-12 animate-fade-in max-w-5xl mx-auto">
            {!result ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10">
                    <div className="space-y-4 max-w-2xl">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent/20 to-accent/5 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-accent/20">
                            <Sparkles size={40} className="text-accent" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                            Research Assistant
                        </h1>
                        <p className="text-xl text-text-secondary leading-relaxed">
                            Deep dive into topics using your library as a curated knowledge base.
                        </p>
                    </div>

                    <div className="w-full max-w-3xl space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                <Search size={24} className="text-text-muted group-focus-within:text-accent transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Ask a complex question..."
                                className="w-full pl-16 pr-32 py-6 bg-background/60 backdrop-blur-xl border border-white/10 rounded-2xl text-xl text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 shadow-2xl transition-all"
                            />
                            <div className="absolute inset-y-3 right-3">
                                <Button
                                    size="lg"
                                    variant="primary"
                                    onClick={handleSearch}
                                    loading={isSearching}
                                    className="h-full px-8 rounded-xl font-medium"
                                >
                                    Research
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            <span className="text-sm text-text-muted py-1.5">Try asking:</span>
                            {suggestedQueries.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => { setQuery(q); handleSearch(); }} // In a real app, maybe just setQuery
                                    className="text-sm px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-text-secondary hover:text-white transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-6 border-b border-white/10">
                        <div>
                            <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
                                <Search size={14} />
                                <span>Researching:</span>
                            </div>
                            <h2 className="text-2xl font-display font-bold text-white">"{query}"</h2>
                        </div>
                        <Button variant="secondary" onClick={() => { setQuery(''); setResult(null); }}>
                            New Search
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card variant="glass" padding="lg" className="border-accent/20">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-accent/10 rounded-lg">
                                        <Sparkles size={20} className="text-accent" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Synthesis</h3>
                                </div>
                                <div className="prose prose-invert max-w-none prose-p:leading-loose prose-p:text-text-secondary">
                                    <p className="text-lg whitespace-pre-line">
                                        {result}
                                    </p>
                                </div>
                            </Card>

                            <Card variant="default" padding="lg">
                                <h3 className="text-lg font-bold text-white mb-4">Key Takeaways</h3>
                                <ul className="space-y-3">
                                    {[
                                        "Focus on distraction-free intervals.",
                                        "Schedule deep work blocks in advance.",
                                        "Ritualize your startup routine."
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-3 text-text-secondary">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-mono text-text-muted">{i + 1}</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </div>

                        {/* Sidebar / Sources */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Sources Used</h3>
                            <div className="space-y-4">
                                {[
                                    { title: "Deep Work", author: "Cal Newport", color: "bg-blue-500" },
                                    { title: "Atomic Habits", author: "James Clear", color: "bg-amber-500" },
                                    { title: "The Shallows", author: "Nicholas Carr", color: "bg-emerald-500" }
                                ].map((book, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                        <div className={`w-12 h-16 ${book.color}/20 rounded-md flex items-center justify-center border border-white/10`}>
                                            <BookOpen size={20} className="text-white/60 group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-white group-hover:text-accent transition-colors line-clamp-1">{book.title}</h4>
                                            <p className="text-sm text-text-muted">{book.author}</p>
                                            <div className="mt-2 text-xs bg-white/10 inline-block px-2 py-0.5 rounded text-text-secondary">
                                                High Relevance
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
