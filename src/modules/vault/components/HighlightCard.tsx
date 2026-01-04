import { useState } from 'react';
import { Quote, Book as BookIcon, Tag as TagIcon, Plus, X } from 'lucide-react';
import { Card } from '@/ui/Card';
import type { StoredHighlight } from '@/lib/storage';

interface HighlightCardProps {
    highlight: StoredHighlight;
    bookTitle?: string;
    showBookTitle?: boolean;
    onUpdate?: (id: string, updates: Partial<StoredHighlight>) => void;
}

export function HighlightCard({ highlight, bookTitle, showBookTitle = true, onUpdate }: HighlightCardProps) {
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTag, setNewTag] = useState('');

    const handleAddTag = () => {
        if (!newTag.trim() || !onUpdate) return;
        const currentTags = highlight.tags || [];
        if (!currentTags.includes(newTag.trim())) {
            onUpdate(highlight.id, { tags: [...currentTags, newTag.trim()] });
        }
        setNewTag('');
        setIsAddingTag(false);
    };

    const handleRemoveTag = (tagToRemove: string) => {
        if (!onUpdate) return;
        const currentTags = highlight.tags || [];
        onUpdate(highlight.id, { tags: currentTags.filter(t => t !== tagToRemove) });
    };

    const getColorClasses = () => {
        switch (highlight.color) {
            case 'green': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100';
            case 'blue': return 'bg-blue-500/10 border-blue-500/20 text-blue-100';
            case 'purple': return 'bg-purple-500/10 border-purple-500/20 text-purple-100';
            case 'yellow': default: return 'bg-amber-500/10 border-amber-500/20 text-amber-100';
        }
    };

    const getIconColor = () => {
        switch (highlight.color) {
            case 'green': return 'text-emerald-400';
            case 'blue': return 'text-blue-400';
            case 'purple': return 'text-purple-400';
            case 'yellow': default: return 'text-amber-400';
        }
    };

    return (
        <Card variant="default" className={`h-full flex flex-col transition-all hover:scale-[1.02] ${getColorClasses()} group`}>
            <div className="flex-1 space-y-4">
                <div className="flex items-start gap-3">
                    <Quote size={20} className={`flex-shrink-0 mt-1 ${getIconColor()}`} />
                    <p className="font-serif text-lg leading-relaxed opacity-90">
                        "{highlight.text}"
                    </p>
                </div>

                {highlight.note && (
                    <div className="pl-8 text-sm text-text-secondary italic border-l-2 border-white/10 py-1">
                        {highlight.note}
                    </div>
                )}

                {/* Tags Area */}
                <div className="pl-8 flex flex-wrap gap-2 items-center min-h-[24px]">
                    {highlight.tags?.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80 group/tag">
                            {tag}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }}
                                className="opacity-0 group-hover/tag:opacity-100 hover:text-white transition-opacity"
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}

                    {onUpdate && (
                        isAddingTag ? (
                            <div className="flex items-center gap-1 bg-surface-elevated rounded-full px-2 py-0.5 border border-white/10" onClick={e => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={e => setNewTag(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                    onBlur={() => setIsAddingTag(false)}
                                    autoFocus
                                    className="w-20 bg-transparent text-xs text-white focus:outline-none"
                                    placeholder="New tag..."
                                />
                            </div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsAddingTag(true); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-text-muted hover:text-white px-2 py-0.5 rounded-full hover:bg-white/10"
                            >
                                <Plus size={10} /> Tag
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-2">
                    {showBookTitle && bookTitle && (
                        <>
                            <BookIcon size={12} />
                            <span className="font-medium truncate max-w-[150px]">{bookTitle}</span>
                            <span>•</span>
                        </>
                    )}
                    <span>Page {highlight.page}</span>
                </div>
                <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${highlight.color === 'yellow' ? 'bg-amber-400' : highlight.color === 'green' ? 'bg-emerald-400' : highlight.color === 'blue' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                </div>
            </div>
        </Card>
    );
}
