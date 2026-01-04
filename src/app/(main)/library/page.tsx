'use client';

import { Card } from '@/ui/Card';
import { BookOpen, Search } from 'lucide-react';

export default function LibraryPage() {
    return (
        <div className="p-10 space-y-8 animate-fade-in">
            <header>
                <h1 className="text-3xl font-display font-bold text-white mb-2">My Library</h1>
                <p className="text-text-secondary">Your collection of wisdom, highlights, and reading progress.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder Content */}
                <Card variant="glass" className="h-64 flex flex-col items-center justify-center text-center p-6 border-dashed border-2 border-white/10 bg-transparent hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="p-4 bg-white/5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <BookOpen size={32} className="text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-semibold text-white">Add Manually</h3>
                    <p className="text-sm text-text-muted mt-1">Import a book to start tracking</p>
                </Card>
            </div>
        </div>
    );
}
