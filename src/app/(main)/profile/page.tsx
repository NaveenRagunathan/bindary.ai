'use client';

import React, { useState, useEffect } from 'react';
import { User, Target, Brain, Award, Edit3, Save, X } from 'lucide-react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { getUserProfile, saveUserProfile } from '@/lib/storage';
import type { UserProfile, PersonalityTraits } from '@/types';

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');

    useEffect(() => {
        setProfile(getUserProfile());
    }, []);

    useEffect(() => {
        if (profile) setEditedName(profile.name);
    }, [profile]);

    const handleSave = () => {
        if (!profile) return;
        const updated = { ...profile, name: editedName };
        saveUserProfile(updated);
        setProfile(updated);
        setIsEditing(false);
    };

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                    <User size={48} className="text-white/20" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-white">Profile Not Found</h1>
                    <p className="text-text-secondary max-w-md">It looks like you haven't set up your profile yet. Visit the dashboard to get started.</p>
                </div>
                <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <header className="flex items-end justify-between gap-6 px-2">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary/20 to-primary/40 border-2 border-primary/30 flex items-center justify-center shadow-glow">
                        <User size={48} className="text-white" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <input
                                    value={editedName}
                                    onChange={e => setEditedName(e.target.value)}
                                    className="bg-white/5 border border-primary/30 rounded-lg px-3 py-1 text-2xl font-bold text-white outline-none"
                                />
                            ) : (
                                <h1 className="text-4xl font-display font-bold text-white tracking-tight">{profile.name}</h1>
                            )}
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className="p-2 text-text-muted hover:text-primary transition-colors"
                            >
                                {isEditing ? <Save size={20} /> : <Edit3 size={20} />}
                            </button>
                            {isEditing && (
                                <button onClick={() => setIsEditing(false)} className="p-2 text-text-muted hover:text-red-400">
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                        <p className="text-text-secondary font-medium uppercase tracking-[0.2em] text-xs">
                            {profile.lifestage} • {profile.learningStyle} Learner
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Personality Traits */}
                <Card variant="glass" padding="xl" className="md:col-span-8 space-y-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Brain className="text-primary" size={20} />
                        Personality Insights
                    </h2>
                    <div className="space-y-6">
                        {Object.entries(profile.personality).map(([trait, value]) => {
                            if (typeof value !== 'number') return null;
                            return (
                                <div key={trait} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="capitalize text-text-secondary">{trait.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="text-white font-bold">{value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all duration-1000"
                                            style={{ width: `${value}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>

                {/* Goals & Challenges */}
                <div className="md:col-span-4 space-y-8">
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted px-2 flex items-center gap-2">
                            <Target size={14} />
                            Active Goals
                        </h3>
                        <div className="space-y-3">
                            {profile.goals.map((goal, idx) => (
                                <Card key={idx} variant="surface" padding="sm" className="border-l-2 border-l-primary group">
                                    <p className="text-sm text-white font-medium">{goal.description}</p>
                                    <span className="text-[10px] text-text-muted uppercase mt-1 block">{goal.category}</span>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted px-2 flex items-center gap-2">
                            < Award size={14} />
                            Key Challenges
                        </h3>
                        <div className="flex flex-wrap gap-2 px-2">
                            {profile.challenges.map((challenge, idx) => (
                                <span key={idx} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-text-secondary">
                                    {challenge}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
