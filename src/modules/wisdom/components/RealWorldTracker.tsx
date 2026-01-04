'use client';

import React, { useState } from 'react';
import { Rocket, CheckCircle2, Clock, Calendar, AlertCircle, TrendingUp, ArrowRight, MessageCircle } from 'lucide-react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { updateActionItem, updateExperiment } from '@/lib/storage';
import type { StoredActionItem, StoredExperiment } from '@/types';

interface RealWorldTrackerProps {
    experiments: StoredExperiment[];
    actions: StoredActionItem[];
}

export function RealWorldTracker({ experiments, actions }: RealWorldTrackerProps) {
    const handleCompleteAction = (id: string) => {
        updateActionItem(id, { status: 'completed' });
        window.location.reload(); // Simple refresh to update state for now
    };

    const handleUpdateExperiment = (id: string, status: 'completed' | 'failed') => {
        updateExperiment(id, { status });
        window.location.reload();
    };

    return (
        <div className="space-y-10">
            {/* Active Experiments Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                        <Rocket className="text-primary" size={24} />
                        Active Experiments
                    </h2>
                    <span className="text-xs font-medium text-text-muted bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        {experiments.length} Running
                    </span>
                </div>

                {experiments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {experiments.map((exp) => (
                            <Card key={exp.id} variant="glass" padding="none" className="overflow-hidden border-primary/10 flex flex-col">
                                <div className="p-6 space-y-4 flex-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">7-Day Challenge</span>
                                            <h3 className="text-xl font-bold text-white leading-tight">{exp.title}</h3>
                                        </div>
                                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                                            <TrendingUp size={18} className="text-primary" />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 italic text-sm text-text-secondary">
                                        "{exp.hypothesis}"
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <h4 className="text-xs font-bold text-white px-1 flex items-center gap-2">
                                            <Calendar size={14} className="text-text-muted" />
                                            Daily Protocol
                                        </h4>
                                        <ul className="space-y-2">
                                            {exp.steps.slice(0, 3).map((step: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-text-secondary">
                                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs text-text-muted">
                                        <Clock size={14} />
                                        Started {new Date(exp.startDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => handleUpdateExperiment(exp.id, 'failed')}>
                                            Stop
                                        </Button>
                                        <Button size="sm" onClick={() => handleUpdateExperiment(exp.id, 'completed')}>
                                            Complete
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 px-6 border border-dashed border-white/10 rounded-3xl flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
                            <Rocket size={20} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-white">No active experiments</h3>
                            <p className="text-sm text-text-muted max-w-xs">Use the Context Bridge to translate a book principle into a 7-day challenge.</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Action Items Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                        <CheckCircle2 className="text-success" size={24} />
                        Immediate Actions
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {actions.length > 0 ? (
                        actions.map((action) => (
                            <Card key={action.id} variant="surface" padding="none" className="group hover:border-primary/30 transition-all overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    <div className="p-6 flex-1 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <button
                                                onClick={() => handleCompleteAction(action.id)}
                                                className="mt-1 w-6 h-6 rounded-full border-2 border-white/10 flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all flex-shrink-0"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-primary opacity-0 hover:opacity-100 transition-opacity" />
                                            </button>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{action.action}</h3>
                                                <p className="text-sm text-text-secondary leading-relaxed">{action.why}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 items-center pl-10 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> {action.when}</span>
                                            <span className="flex items-center gap-1.5"><ArrowRight size={14} /> {action.bookTitle}</span>
                                        </div>
                                    </div>

                                    {action.specificExample && (
                                        <div className="md:w-64 bg-white/[0.02] p-6 border-l border-white/5 flex flex-col justify-center">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase mb-2">
                                                <MessageCircle size={12} />
                                                Specific Example
                                            </div>
                                            <p className="text-xs text-text-muted leading-relaxed italic">
                                                "{action.specificExample}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p className="text-text-muted italic px-2">No immediate actions tracked. Ready for your next translation.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
