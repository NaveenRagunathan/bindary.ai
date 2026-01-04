'use client';

import { ResearchChat } from '@/modules/research/components/ResearchChat';

export default function ResearchPage() {
    return (
        <div className="h-full p-4 md:p-8 animate-fade-in">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                    Research Assistant
                </h1>
                <p className="text-text-secondary text-sm">
                    Deep dive into topics with AI-powered synthesis and citations.
                </p>
            </div>

            <ResearchChat />
        </div>
    );
}
