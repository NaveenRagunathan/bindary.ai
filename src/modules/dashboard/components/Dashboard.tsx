import { useEffect, useState } from 'react';
import { BookOpen, Clock, Target, Flame, ChevronRight, Sparkles, Plus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { BookCard } from '@/modules/library';
import { LogReadingModal } from '@/modules/library/components/LogReadingModal';
import { WisdomTranslator } from '@/modules/wisdom';
import { StatCard } from './StatCard';
import type { UserProfile, BookRecommendation, UserStats, Book } from '@/types';
import { getRecommendations, getReadingProgress, calculateStreak } from '@/lib/storage';
import { getAllBooks } from '@/modules/library/services/books';
import { generateRecommendations } from '@/lib/api';
import { saveRecommendations } from '@/lib/storage';

interface DashboardProps {
    profile: UserProfile;
}

export function Dashboard({ profile }: DashboardProps) {
    const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<UserStats>({
        booksCompleted: 0,
        currentlyReading: 0,
        totalPagesRead: 0,
        totalHoursRead: 0,
        currentStreak: 0,
        longestStreak: 0,
        actionItemsCompleted: 0,
        highlightsCreated: 0,
    });
    const [selectedBookForWisdom, setSelectedBookForWisdom] = useState<Book | null>(null);
    const [isLogReadingOpen, setIsLogReadingOpen] = useState(false);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = async () => {
        setIsLoading(true);

        // Load existing recommendations or generate new ones
        let recs = getRecommendations();

        if (recs.length === 0) {
            try {
                const books = await getAllBooks();
                recs = await generateRecommendations(profile, books);
                saveRecommendations(recs);
            } catch (error) {
                console.error('Error generating recommendations:', error);
            }
        }

        setRecommendations(recs);

        // Calculate stats from progress
        const progress = getReadingProgress();
        const completed = progress.filter((p) => p.status === 'completed');
        const reading = progress.filter((p) => p.status === 'reading');

        const streakData = calculateStreak();

        setStats({
            booksCompleted: completed.length,
            currentlyReading: reading.length,
            totalPagesRead: progress.reduce((sum, p) => sum + p.currentPage, 0),
            totalHoursRead: Math.round(progress.reduce((sum, p) => sum + p.totalMinutesRead, 0) / 60),
            currentStreak: streakData.current,
            longestStreak: streakData.longest,
            actionItemsCompleted: 0,
            highlightsCreated: progress.reduce((sum, p) => sum + p.highlights.length, 0),
        });

        setIsLoading(false);
    };

    const refreshRecommendations = async () => {
        setIsLoading(true);
        try {
            const books = await getAllBooks();
            const recs = await generateRecommendations(profile, books);
            saveRecommendations(recs);
            setRecommendations(recs);
        } catch (error) {
            console.error('Error refreshing recommendations:', error);
        }
        setIsLoading(false);
    };

    const [greeting, setGreeting] = useState('Good morning');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    return (
        <div className="space-y-10 pb-20">
            {/* Header section with Greeting and Actions */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-display font-bold tracking-tight text-white">
                        {greeting}, <span className="text-primary">{profile.name}</span>
                    </h1>
                    <p className="text-text-secondary">
                        Ready to continue your journey? You have <span className="text-white font-medium">{recommendations.length} new insights</span> waiting.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={refreshRecommendations}
                        loading={isLoading}
                        variant="secondary"
                        icon={<Sparkles size={18} />}
                        className="glass"
                    >
                        Refresh
                    </Button>
                    <Button
                        onClick={() => setIsLogReadingOpen(true)}
                        icon={<Plus size={18} />}
                        className="shadow-glow"
                    >
                        Log Reading
                    </Button>
                </div>
            </header>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats Bento Items */}
                <StatCard
                    label="Books Completed"
                    value={stats.booksCompleted}
                    icon={BookOpen}
                    color="primary"
                    trend="2"
                    trendUp={true}
                    delay={100}
                />
                <StatCard
                    label="Reading Time"
                    value={`${stats.totalHoursRead}h`}
                    icon={Clock}
                    color="accent"
                    delay={200}
                />
                <StatCard
                    label="Day Streak"
                    value={stats.currentStreak}
                    icon={Flame}
                    color="warning"
                    delay={300}
                />
                <StatCard
                    label="Actions Taken"
                    value={stats.actionItemsCompleted}
                    icon={Target}
                    color="success"
                    delay={400}
                />

                {/* Main Feature Area (2/3 size on large screens) */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-display font-semibold text-white">Your Reading Path</h2>
                        <Link href="/library" className="text-primary hover:text-primary-light text-sm font-medium flex items-center gap-1 transition-colors">
                            View Full Library <ChevronRight size={16} />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="glass rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-text-muted">Analyzing your profile...</p>
                        </div>
                    ) : recommendations.length > 0 ? (
                        <div className="grid gap-6">
                            {recommendations.slice(0, 3).map((rec, index) => (
                                <BookCard
                                    key={rec.book.id}
                                    book={rec.book}
                                    recommendation={rec}
                                    index={index + 1}
                                    onTranslateWisdom={(book) => setSelectedBookForWisdom(book)}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card variant="glass" padding="lg" className="flex flex-col items-center justify-center text-center py-16 space-y-4 rounded-3xl">
                            <div className="p-4 bg-white/5 rounded-full">
                                <Sparkles size={32} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">No recommendations yet</h3>
                                <p className="text-text-secondary mt-2 max-w-md">Click "Refresh Picks" to generate personalized book recommendations based on your profile.</p>
                            </div>
                            <Button onClick={refreshRecommendations} icon={<Sparkles size={18} />}>
                                Generate Recommendations
                            </Button>
                        </Card>
                    )}
                </div>

                {/* Side Bento Column (1/3 size) */}
                <aside className="lg:col-span-1 space-y-6">
                    {/* Weekly Goal Bento */}
                    <Card variant="glass" padding="lg" className="space-y-6 rounded-3xl border-primary/10">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">Weekly Goal</h3>
                            <span className="text-xs font-medium text-text-muted px-2 py-1 bg-white/5 rounded-full">2d left</span>
                        </div>

                        <div className="relative pt-2">
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-3xl font-bold text-white">{stats.totalHoursRead}<span className="text-lg text-text-muted font-normal">/5h</span></span>
                                <span className="text-sm font-medium text-emerald-400">On Track</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                                    style={{ width: `${Math.min(100, (stats.totalHoursRead / 5) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Focus Area Bento */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-white px-2">Current Focus</h3>
                        {profile.goals.slice(0, 3).map((goal, idx) => (
                            <div
                                key={idx}
                                className="group p-5 rounded-2xl bg-surface/40 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all cursor-default"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold tracking-wider text-primary uppercase">{goal.category}</span>
                                        <p className="text-sm text-text-secondary group-hover:text-white transition-colors line-clamp-2">{goal.description}</p>
                                    </div>
                                    <ArrowUpRight size={16} className="text-white/20 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            {selectedBookForWisdom && (
                <WisdomTranslator
                    book={selectedBookForWisdom}
                    isOpen={!!selectedBookForWisdom}
                    onClose={() => setSelectedBookForWisdom(null)}
                    profile={profile}
                />
            )}

            <LogReadingModal
                isOpen={isLogReadingOpen}
                onClose={() => setIsLogReadingOpen(false)}
                onSuccess={loadData}
            />
        </div>
    );
}
