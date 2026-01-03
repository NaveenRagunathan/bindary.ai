import { Clock, BarChart3, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Book, BookRecommendation } from '@/types';
import './BookCard.css';

interface BookCardProps {
    book: Book;
    recommendation?: BookRecommendation;
    index?: number;
    onSelect?: (book: Book) => void;
    onTranslateWisdom?: (book: Book) => void;
}

export function BookCard({ book, recommendation, index, onSelect, onTranslateWisdom }: BookCardProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'difficulty-beginner';
            case 'intermediate':
                return 'difficulty-intermediate';
            case 'advanced':
                return 'difficulty-advanced';
            default:
                return '';
        }
    };

    return (
        <Card variant="glass" padding="none" hover className="book-card" onClick={() => onSelect?.(book)}>
            <div className="book-card-content">
                {index && (
                    <div className="book-sequence">
                        <span className="sequence-number">{index}</span>
                    </div>
                )}

                <div className="book-cover">
                    {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} />
                    ) : (
                        <div className="book-cover-placeholder">
                            📚
                        </div>
                    )}
                </div>

                <div className="book-info">
                    <div className="book-header">
                        <h3 className="book-title">{book.title}</h3>
                        <span className="book-author">by {book.author}</span>
                    </div>

                    <div className="book-meta">
                        <span className={`book-difficulty ${getDifficultyColor(book.difficulty)}`}>
                            {book.difficulty}
                        </span>
                        <span className="book-time">
                            <Clock size={14} />
                            {book.estimatedHours}h read
                        </span>
                        <span className="book-pages">
                            {book.pageCount} pages
                        </span>
                    </div>

                    {recommendation && (
                        <div className="book-rationale">
                            <p>{recommendation.rationale}</p>
                            {recommendation.matchingGoals && (
                                <div className="matching-goals">
                                    {recommendation.matchingGoals.slice(0, 2).map((goal, i) => (
                                        <span key={i} className="goal-tag">{goal}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="book-categories">
                        {book.categories.slice(0, 3).map((cat) => (
                            <span key={cat} className="category-tag">{cat}</span>
                        ))}
                    </div>
                </div>

                {recommendation && (
                    <div className="book-score">
                        <div className="score-circle">
                            <BarChart3 size={16} />
                            <span>{recommendation.relevanceScore}%</span>
                        </div>
                        <span className="score-label">Match</span>
                    </div>
                )}

                {onTranslateWisdom && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="book-action-wisdom"
                        onClick={(e) => {
                            e.stopPropagation();
                            onTranslateWisdom(book);
                        }}
                        icon={<BarChart3 size={16} />}
                    >
                        Translate
                    </Button>
                )}

                <Button variant="ghost" size="sm" className="book-action">
                    <ChevronRight size={20} />
                </Button>
            </div>
        </Card>
    );
}
