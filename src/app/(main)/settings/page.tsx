'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Moon, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { getSettings, saveSettings, clearAllData } from '@/lib/storage';
import type { AppSettings } from '@/lib/storage';

export default function SettingsPage() {
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        setSettings(getSettings());
    }, []);

    const updateSetting = (key: keyof AppSettings, value: any) => {
        if (!settings) return;
        const updated = saveSettings({ [key]: value });
        setSettings(updated);
    };

    const handleClearData = () => {
        if (confirm('Are you sure? This will permanently delete all your reading progress, action items, and profile analysis.')) {
            clearAllData();
            window.location.href = '/';
        }
    };

    if (!settings) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-10 pb-20">
            <header className="space-y-2">
                <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-4">
                    <SettingsIcon className="text-primary" size={32} />
                    Settings
                </h1>
                <p className="text-text-secondary">Configure your immersive reading environment.</p>
            </header>

            <div className="space-y-8">
                {/* Reading Goals */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted px-2 flex items-center gap-2">
                        <Calendar size={14} />
                        Reading Intentions
                    </h2>
                    <Card variant="glass" padding="xl" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-semibold">Weekly Goal</h3>
                                <p className="text-sm text-text-muted">Target reading time across all books.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={settings.weeklyGoalMinutes}
                                    onChange={e => updateSetting('weeklyGoalMinutes', parseInt(e.target.value))}
                                    className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-right focus:border-primary/40 outline-none"
                                />
                                <span className="text-sm text-text-muted">min</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-semibold">Daily Reminder</h3>
                                <p className="text-sm text-text-muted">A subtle nudge to keep your streak alive.</p>
                            </div>
                            <input
                                type="time"
                                value={settings.dailyReminder}
                                onChange={e => updateSetting('dailyReminder', e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary/40"
                            />
                        </div>
                    </Card>
                </section>

                {/* Appearance & Notifications */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted px-2 flex items-center gap-2">
                        <Moon size={14} />
                        Environment
                    </h2>
                    <Card variant="glass" padding="xl" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Bell size={18} />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Smart Notifications</h3>
                                    <p className="text-sm text-text-muted">Receive AI-curated reflection prompts.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => updateSetting('notifications', !settings.notifications)}
                                className={`w-12 h-6 rounded-full transition-all relative ${settings.notifications ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.notifications ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    </Card>
                </section>

                {/* Data & Privacy */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted px-2 flex items-center gap-2 text-red-400">
                        <Trash2 size={14} />
                        Danger Zone
                    </h2>
                    <Card variant="surface" padding="xl" className="border-red-500/10 bg-red-500/5 space-y-4">
                        <div>
                            <h3 className="text-white font-semibold">Clear All Data</h3>
                            <p className="text-sm text-text-muted">This resets the application to its initial state. This action is irreversible.</p>
                        </div>
                        <Button variant="ghost" onClick={handleClearData} className="text-red-400 hover:bg-red-500/10 hover:text-red-400 border-red-500/20">
                            Perform Full Reset
                        </Button>
                    </Card>
                </section>
            </div>
        </div>
    );
}
