'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Rocket, History, BookOpen } from 'lucide-react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { ContextBridge, RealWorldTracker } from '@/modules/wisdom/components';
import { getActionItems, getActiveExperiments, getUserProfile } from '@/lib/storage';
import type { UserProfile, StoredActionItem, StoredExperiment } from '@/types';

export default function WisdomPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [activeExperiments, setActiveExperiments] = useState<StoredExperiment[]>([]);
    const [pendingActions, setPendingActions] = useState<StoredActionItem[]>([]);
    const [activeTab, setActiveTab] = useState<'bridge' | 'experiments' | 'history'>('bridge');

    useEffect(() => {
        const loadData = () => {
            setProfile(getUserProfile());
            setActiveExperiments(getActiveExperiments());
            setPendingActions(getActionItems().filter(a => a.status === 'pending'));
        };
        loadData();
    }, []);

    return (
        <div className="space-y-10 pb-20 max-w-5xl mx-auto">
            <header className="space-y-2">
                <h1 className="text-4xl font-display font-bold text-white tracking-tight">
                    Practical <span className="text-primary">Wisdom</span> Translator
                </h1>
                <p className="text-text-secondary text-lg max-w-2xl">
                    Bridge the gap between inspiration and action. Transform the principles you read into exact steps for your life.
                </p>
            </header>

            <nav className="flex items-center gap-1 border-b border-white/5 pb-px">
                <button
                    onClick={() => setActiveTab('bridge')}
                    className={`px-6 py-4 text-sm font-medium transition-all relative ${activeTab === 'bridge' ? 'text-primary' : 'text-text-muted hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Brain size={18} />
                        Context Bridge
                    </div>
                    {activeTab === 'bridge' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('experiments')}
                    className={`px-6 py-4 text-sm font-medium transition-all relative ${activeTab === 'experiments' ? 'text-primary' : 'text-text-muted hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Rocket size={18} />
                        Active Experiments
                        {activeExperiments.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px]">
                                {activeExperiments.length}
                            </span>
                        )}
                    </div>
                    {activeTab === 'experiments' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-4 text-sm font-medium transition-all relative ${activeTab === 'history' ? 'text-primary' : 'text-text-muted hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <History size={18} />
                        Wisdom Log
                    </div>
                    {activeTab === 'history' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
                    )}
                </button>
            </nav>

            <div className="pt-4">
                {activeTab === 'bridge' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8">
                            <ContextBridge profile={profile} onTranslated={() => setActiveTab('experiments')} />
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <Card variant="glass" padding="lg" className="space-y-4">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <Sparkles size={18} className="text-primary" />
                                    The Killer Feature
                                </h3>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    Our Context Bridge uses **GPT-4o** to analyze your current SaaS project, habits, and obstacles, creating a 7-day experiment just for you.
                                </p>
                            </Card>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-white px-2">Pending Actions</h3>
                                {pendingActions.length > 0 ? (
                                    pendingActions.slice(0, 3).map(action => (
                                        <Card key={action.id} variant="surface" padding="sm" className="border-l-2 border-l-primary/40">
                                            <p className="text-sm text-white font-medium line-clamp-2">{action.action}</p>
                                            <p className="text-[11px] text-text-muted mt-2 uppercase tracking-wider">{action.bookTitle}</p>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-sm text-text-muted px-2 italic">No pending actions. Use the bridge to generate some.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'experiments' && (
                    <RealWorldTracker experiments={activeExperiments} actions={pendingActions} />
                )}

                {activeTab === 'history' && (
                    <Card variant="glass" padding="xl" className="text-center py-20 flex flex-col items-center">
                        <BookOpen size={48} className="text-white/10 mb-4" />
                        <h3 className="text-xl font-bold text-white">Your Wisdom Log</h3>
                        <p className="text-text-secondary mt-2 max-w-xs">
                            A history of all translated concepts and their outcomes will appear here.
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
}
