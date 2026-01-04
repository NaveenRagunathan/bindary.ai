import { ExternalLink, Book, GraduationCap, Globe } from 'lucide-react';
import { Card } from '@/ui/Card';
import type { ResearchSource } from '@/types';

interface SourceCardProps {
    source: ResearchSource;
    index: number;
    onClick?: () => void;
}

export function SourceCard({ source, index, onClick }: SourceCardProps) {
    const getIcon = () => {
        switch (source.type) {
            case 'book': return <Book size={16} />;
            case 'academic': return <GraduationCap size={16} />;
            default: return <Globe size={16} />;
        }
    };

    const getColor = () => {
        switch (source.type) {
            case 'book': return 'bg-amber-500/20 text-amber-300';
            case 'academic': return 'bg-blue-500/20 text-blue-300';
            default: return 'bg-emerald-500/20 text-emerald-300';
        }
    };

    return (
        <Card
            variant="glass"
            padding="sm"
            className="group hover:bg-white/10 transition-colors cursor-pointer border-white/5 hover:border-white/10"
            onClick={onClick}
        >
            <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getColor()}`}>
                    {getIcon()}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm text-white truncate group-hover:text-primary transition-colors">
                            {source.title}
                        </h4>
                        <span className="text-xs font-mono text-text-muted bg-white/5 px-1.5 py-0.5 rounded flex-shrink-0">
                            [{index + 1}]
                        </span>
                    </div>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                        {source.author || source.publisher || new URL(source.url || '').hostname}
                    </p>
                    <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                        {source.snippet}
                    </p>
                </div>
                {source.url && (
                    <ExternalLink size={12} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                )}
            </div>
        </Card>
    );
}
