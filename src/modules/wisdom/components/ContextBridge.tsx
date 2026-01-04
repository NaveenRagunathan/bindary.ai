'use client';

import React, { useState } from 'react';
import { Brain, Sparkles, AlertCircle, Book, ArrowRight } from 'lucide-react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { translateWisdom } from '@/lib/api';
import { generateId, saveActionItem, saveExperiment } from '@/lib/storage';
import type { UserProfile, Book as BookType } from '@/types';

interface ContextBridgeProps {
    profile: UserProfile | null;
    onTranslated: () => void;
}

export function ContextBridge({ profile, onTranslated }: ContextBridgeProps) {
    const [concept, setConcept] = useState('');
    const [bookTitle, setBookTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTranslate = async () => {
        if (!concept.trim() || !bookTitle.trim()) {
            setError('Please provide both the book title and the concept.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const userContext = {
                currentGoal: profile?.goals[0]?.description || 'General professional growth',
                currentProject: profile?.goals.find(g => g.category === 'business')?.description || 'Building a digital product',
                recentChallenge: profile?.challenges[0] || 'Maintaining consistency',
            };

            const result = await translateWisdom(concept, bookTitle, userContext) as any;

            // Save actions
            if (result.actions) {
                result.actions.forEach((a: any) => {
                    saveActionItem({
                        id: generateId(),
                        bookId: 'custom',
                        bookTitle: bookTitle,
                        concept: concept,
                        action: a.action,
                        why: a.why,
                        when: a.when,
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        specificExample: a.example
                    });
                });
            }

            // Save experiment
            if (result.experiment) {
                saveExperiment({
                    id: generateId(),
                    bookId: 'custom',
                    bookTitle: bookTitle,
                    title: result.experiment.title,
                    hypothesis: result.experiment.hypothesis,
                    steps: result.experiment.steps,
                    durationDays: result.experiment.durationDays,
                    startDate: new Date().toISOString(),
                    status: 'active',
                    reflectionPrompts: result.experiment.reflectionPrompts,
                    createdAt: new Date().toISOString()
                });
            }

            onTranslated();
        } catch (err) {
            console.error(err);
            setError('The translation failed. Please try again with a simpler concept.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card variant="glass" padding="xl" className="space-y-8 min-h-[500px] flex flex-col">
            <div className="flex items-center gap-4 text-primary">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Brain size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Universal Context Bridge</h2>
                    <p className="text-sm text-text-muted">Direct injection of book principles into your current project workflow.</p>
                </div>
            </div>

            <div className="space-y-6 flex-1">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted px-1">Source Material</label>
                    <div className="relative">
                        <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Book Title (e.g., Atomic Habits)"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-primary/40 focus:bg-white/[0.08] transition-all outline-none"
                            value={bookTitle}
                            onChange={(e) => setBookTitle(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted px-1">The Principle / Concept</label>
                    <textarea
                        placeholder="What concept or passage do you want to translate? (e.g., 'The idea of habit stacking' or 'The inverted pyramid strategy')"
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-white focus:border-primary/40 focus:bg-white/[0.08] transition-all outline-none resize-none min-h-[160px]"
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                    />
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}
            </div>

            <div className="pt-4">
                <Button
                    fullWidth
                    size="lg"
                    onClick={handleTranslate}
                    loading={isLoading}
                    disabled={!concept.trim() || !bookTitle.trim()}
                    className="h-16 rounded-2xl group shadow-glow"
                    icon={<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                >
                    {isLoading ? 'Translating Wisdom...' : 'Bridge to Action'}
                </Button>
            </div>
        </Card>
    );
}
