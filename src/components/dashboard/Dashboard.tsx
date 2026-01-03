import { useEffect, useState } from 'react';
import { BookOpen, Clock, Target, Flame, ChevronRight, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProgressCircle, ProgressBar } from '../ui/Progress';
import { Button } from '../ui/Button';
import { BookCard } from '../books/BookCard';
import type { UserProfile, BookRecommendation, UserStats } from '../../types';
import { getRecommendations, getReadingProgress } from '../../services/storage';
import { getAllBooks } from '../../services/books';
import { generateRecommendations } from '../../services/openai';
import { saveRecommendations } from '../../services/storage';
import './Dashboard.css';

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
                const books = getAllBooks();
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

        setStats({
            booksCompleted: completed.length,
            currentlyReading: reading.length,
            totalPagesRead: progress.reduce((sum, p) => sum + p.currentPage, 0),
            totalHoursRead: Math.round(progress.reduce((sum, p) => sum + p.totalMinutesRead, 0) / 60),
            currentStreak: 0,
            longestStreak: 0,
            actionItemsCompleted: 0,
            highlightsCreated: progress.reduce((sum, p) => sum + p.highlights.length, 0),
        });

        setIsLoading(false);
    };

    const refreshRecommendations = async () => {
        setIsLoading(true);
        try {
            const books = getAllBooks();
            const recs = await generateRecommendations(profile, books);
            saveRecommendations(recs);
            setRecommendations(recs);
        } catch (error) {
            console.error('Error refreshing recommendations:', error);
        }
        setIsLoading(false);
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">
                        {greeting()}, {profile.name || 'Reader'}! 👋
                    </h1>
                    <p className="dashboard-subtitle">
                        Ready to continue your reading journey?
                    </p>
                </div>
                <Button onClick={refreshRecommendations} loading={isLoading} icon={<Sparkles size={18} />}>
                    Refresh Picks
                </Button>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <Card variant="glass" className="stat-card">
                    <div className="stat-icon stat-icon-books">
                        <BookOpen size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.booksCompleted}</span>
                        <span className="stat-label">Books Completed</span>
                    </div>
                </Card>

                <Card variant="glass" className="stat-card">
                    <div className="stat-icon stat-icon-time">
                        <Clock size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalHoursRead}h</span>
                        <span className="stat-label">Reading Time</span>
                    </div>
                </Card>

                <Card variant="glass" className="stat-card">
                    <div className="stat-icon stat-icon-streak">
                        <Flame size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.currentStreak}</span>
                        <span className="stat-label">Day Streak</span>
                    </div>
                </Card>

                <Card variant="glass" className="stat-card">
                    <div className="stat-icon stat-icon-goals">
                        <Target size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.actionItemsCompleted}</span>
                        <span className="stat-label">Actions Taken</span>
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <div className="dashboard-grid">
                {/* Recommendations Section */}
                <section className="dashboard-section recommendations-section">
                    <div className="section-header">
                        <h2>Your Reading Path</h2>
                        <p>Books selected specifically for your goals</p>
                    </div>

                    {isLoading ? (
                        <div className="loading-state">
                            <div className="loading-spinner" />
                            <p>Analyzing your profile and finding perfect books...</p>
                        </div>
                    ) : recommendations.length > 0 ? (
                        <div className="books-list">
                            {recommendations.slice(0, 3).map((rec, index) => (
                                <BookCard
                                    key={rec.book.id}
                                    book={rec.book}
                                    recommendation={rec}
                                    index={index + 1}
                                />
                            ))}
                            {recommendations.length > 3 && (
                                <Button variant="ghost" className="view-all-btn">
                                    View All {recommendations.length} Recommendations
                                    <ChevronRight size={18} />
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Card variant="glass" padding="lg" className="empty-state">
                            <Sparkles size={48} className="empty-icon" />
                            <h3>No recommendations yet</h3>
                            <p>Click "Refresh Picks" to generate personalized book recommendations based on your profile.</p>
                            <Button onClick={refreshRecommendations} icon={<Sparkles size={18} />}>
                                Generate Recommendations
                            </Button>
                        </Card>
                    )}
                </section>

                {/* Weekly Progress */}
                <aside className="dashboard-aside">
                    <Card variant="glass" padding="lg" className="progress-card">
                        <h3>Weekly Goal</h3>
                        <div className="progress-visual">
                            <ProgressCircle
                                value={Math.round((stats.totalHoursRead / 5) * 100)}
                                size={120}
                                strokeWidth={8}
                                variant="default"
                            />
                        </div>
                        <p className="progress-text">
                            {stats.totalHoursRead} / 5 hours this week
                        </p>
                        <ProgressBar
                            value={stats.totalHoursRead}
                            max={5}
                            variant="default"
                            size="sm"
                        />
                    </Card>

                    <Card variant="glass" padding="lg" className="goals-card">
                        <h3>Your Goals</h3>
                        <ul className="goals-list">
                            {profile.goals.slice(0, 3).map((goal) => (
                                <li key={goal.id} className="goal-item">
                                    <span className="goal-category">{goal.category}</span>
                                    <span className="goal-desc">{goal.description}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
