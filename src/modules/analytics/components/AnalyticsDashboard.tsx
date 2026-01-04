'use client';

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { TrendingUp, Book, Clock, Flame } from 'lucide-react';
import { Card } from '@/ui/Card';
import { getReadingSessions, calculateStreak } from '@/lib/storage';
import { getAllBooks } from '@/modules/library/services/books';
import type { StoredReadingSession } from '@/lib/storage';
import type { Book as BookType } from '@/types';

export function AnalyticsDashboard() {
    const [sessions, setSessions] = useState<StoredReadingSession[]>([]);
    const [books, setBooks] = useState<BookType[]>([]);
    const [streak, setStreak] = useState({ current: 0, longest: 0 });

    useEffect(() => {
        const loadData = async () => {
            setSessions(getReadingSessions());
            setBooks(await getAllBooks());
            setStreak(calculateStreak());
        };
        loadData();
    }, []);

    // 1. Process Data for Daily Activity (Last 7 Days)
    const getDailyActivity = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const daySessions = sessions.filter(s => s.startTime.startsWith(date));
            const pages = daySessions.reduce((acc, s) => acc + s.pagesRead, 0);
            return {
                name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                pages
            };
        });
    };

    // 2. Process Data for Book Status
    // Assume books have a status field or we infer it. 
    // Since BookType doesn't have status, we'll Mock checks for now or just show 'Library Composition'
    const getLibraryStats = () => {
        // Mock distribution based on Difficulty for now, as 'status' is in ReadingProgress not Book
        // In real app, we'd join with ReadingProgress
        return [
            { name: 'Completed', value: books.length > 0 ? 3 : 0, color: '#10b981' }, // Mock
            { name: 'Reading', value: books.length > 0 ? 1 : 0, color: '#3b82f6' },   // Mock
            { name: 'To Read', value: Math.max(0, books.length - 4), color: '#64748b' },
        ];
    };

    const dailyData = getDailyActivity();
    const pieData = getLibraryStats();

    const totalPages = sessions.reduce((acc, s) => acc + s.pagesRead, 0);
    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return (
        <div className="p-6 space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">Reading Analytics</h1>
                <p className="text-text-secondary">Track your reading habits and performance over time.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
                        <Book size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-text-muted uppercase font-bold">Total Pages</p>
                        <p className="text-2xl font-bold text-white">{totalPages}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-purple-500">
                    <div className="p-3 bg-purple-500/10 rounded-full text-purple-400">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-text-muted uppercase font-bold">Hours Read</p>
                        <p className="text-2xl font-bold text-white">{totalHours}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
                    <div className="p-3 bg-amber-500/10 rounded-full text-amber-400">
                        <Flame size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-text-muted uppercase font-bold">Current Streak</p>
                        <p className="text-2xl font-bold text-white">{streak.current} Days</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
                    <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-text-muted uppercase font-bold">Longest Streak</p>
                        <p className="text-2xl font-bold text-white">{streak.longest} Days</p>
                    </div>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Activity Chart */}
                <Card className="col-span-1 lg:col-span-2 p-6 flex flex-col h-[400px]">
                    <h3 className="text-lg font-bold text-white mb-6">Weekly Activity (Pages)</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    cursor={{ fill: '#ffffff05' }}
                                />
                                <Bar dataKey="pages" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Library Pie Chart */}
                <Card className="col-span-1 p-6 flex flex-col h-[400px]">
                    <h3 className="text-lg font-bold text-white mb-6">Library Status (Mock)</h3>
                    <div className="flex-1 w-full min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-xs text-text-secondary">
                            {pieData.map(entry => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span>{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
