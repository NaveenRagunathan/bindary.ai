'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, BarChart3, BookOpen, Play, Plus, Sparkles } from 'lucide-react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { WisdomTranslator } from '@/modules/wisdom';
import type { Book, ReadingProgress, UserProfile } from '@/types';
import { getAllBooks } from '@/modules/library/services/books';
import { getBookProgress, saveReadingProgress, getUserProfile } from '@/lib/storage';
import { getUserProfileFromDB } from '@/app/actions';

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookId = params.id as string;

    const [book, setBook] = useState<Book | null>(null);
    const [progress, setProgress] = useState<ReadingProgress | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showWisdomTranslator, setShowWisdomTranslator] = useState(false);

    useEffect(() => {
        loadBookData();
    }, [bookId]);

    const loadBookData = async () => {
        setIsLoading(true);
        try {
            // Load book
            const books = await getAllBooks();
            const foundBook = books.find(b => b.id === bookId);
            setBook(foundBook || null);

            // Load progress
            const bookProgress = getBookProgress(bookId);
            setProgress(bookProgress);

            // Load profile
            let userProfile = getUserProfile();
            if (!userProfile) {
                userProfile = await getUserProfileFromDB();
            }
            setProfile(userProfile);
        } catch (error) {
            console.error('Error loading book data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartReading = () => {
        if (!book) return;

        const newProgress: ReadingProgress = {
            bookId: book.id,
            userId: 'current-user', // TODO: Get from auth
            status: 'reading',
            startedAt: new Date().toISOString(),
            currentPage: 0,
            totalPages: book.pageCount,
            percentComplete: 0,
            totalMinutesRead: 0,
            sessionsCount: 0,
            highlights: [],
            notes: [],
            actionItems: [],
            experiments: [],
            reflections: [],
        };

        saveReadingProgress(newProgress);
        setProgress(newProgress);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!book) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                    <BookOpen size={48} className="text-white/20" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-white">Book Not Found</h1>
                    <p className="text-text-secondary max-w-md">The book you're looking for doesn't exist.</p>
                </div>
                <Button onClick={() => router.push('/library')}>Back to Library</Button>
            </div>
        );
    }

    const progressPercent = progress ? progress.percentComplete : 0;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            {/* Book Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Book Cover */}
                <div className="md:col-span-1">
                    <Card variant="glass" padding="md" className="aspect-[2/3] relative overflow-hidden">
                        {book.coverUrl ? (
                            <img
                                src={book.coverUrl}
                                alt={book.title}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg">
                                <span className="text-6xl">📚</span>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Book Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-3">
                        <h1 className="text-4xl font-display font-bold text-white tracking-tight">
                            {book.title}
                        </h1>
                        <p className="text-xl text-text-secondary">by {book.author}</p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                            <Clock size={18} />
                            <span>{book.estimatedHours}h read</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                            <BookOpen size={18} />
                            <span>{book.pageCount} pages</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                            <BarChart3 size={18} />
                            <span className="capitalize">{book.difficulty}</span>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2">
                        {book.categories.map((cat) => (
                            <span
                                key={cat}
                                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-text-secondary"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    {progress && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Reading Progress</span>
                                <span className="text-white font-bold">{progressPercent}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all duration-1000"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {progress ? (
                            <Button
                                icon={<Play size={18} />}
                                className="shadow-glow"
                            >
                                Continue Reading
                            </Button>
                        ) : (
                            <Button
                                onClick={handleStartReading}
                                icon={<Plus size={18} />}
                                className="shadow-glow"
                            >
                                Start Reading
                            </Button>
                        )}
                        <Button
                            onClick={() => setShowWisdomTranslator(true)}
                            variant="secondary"
                            icon={<Sparkles size={18} />}
                            className="glass"
                        >
                            Translate Wisdom
                        </Button>
                    </div>
                </div>
            </div>

            {/* Description */}
            <Card variant="glass" padding="lg" className="space-y-4">
                <h2 className="text-xl font-bold text-white">About This Book</h2>
                <p className="text-text-secondary leading-relaxed">{book.description}</p>
            </Card>

            {/* Key Topics */}
            {book.keyTopics && book.keyTopics.length > 0 && (
                <Card variant="glass" padding="lg" className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Key Topics</h2>
                    <div className="flex flex-wrap gap-2">
                        {book.keyTopics.map((topic, idx) => (
                            <span
                                key={idx}
                                className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm text-white"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </Card>
            )}

            {/* Target Audience */}
            {book.targetAudience && book.targetAudience.length > 0 && (
                <Card variant="glass" padding="lg" className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Perfect For</h2>
                    <ul className="space-y-2">
                        {book.targetAudience.map((audience, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-text-secondary">
                                <span className="text-primary mt-1">•</span>
                                <span>{audience}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {/* Wisdom Translator Modal */}
            {showWisdomTranslator && profile && (
                <WisdomTranslator
                    book={book}
                    isOpen={showWisdomTranslator}
                    onClose={() => setShowWisdomTranslator(false)}
                    profile={profile}
                />
            )}
        </div>
    );
}
