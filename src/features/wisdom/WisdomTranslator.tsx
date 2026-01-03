import { useState } from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { translateWisdom } from '@/features/coach/services/openai';
import { getUserProfile } from '@/lib/storage';
import type { Book } from '@/types';
import './WisdomTranslator.css';

interface WisdomTranslatorProps {
    book: Book;
    isOpen: boolean;
    onClose: () => void;
}

interface ActionPlan {
    explanation: string;
    actions: { action: string; why: string; when: string }[];
    measureSuccess: string;
}

export function WisdomTranslator({ book, isOpen, onClose }: WisdomTranslatorProps) {
    const [concept, setConcept] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [plan, setPlan] = useState<ActionPlan | null>(null);

    const handleTranslate = async () => {
        if (!concept.trim()) return;

        setIsLoading(true);
        try {
            const profile = getUserProfile();

            const userContext = {
                currentGoal: profile?.goals[0]?.description || 'Self improvement',
                currentProject: profile?.goals.find(g => g.category === 'career' || g.category === 'business')?.description,
                recentChallenge: profile?.challenges[0],
            };

            const result = await translateWisdom(concept, book.title, userContext);
            setPlan(result);
        } catch (error) {
            console.error('Error translating wisdom:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setConcept('');
        setPlan(null);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Practical Wisdom Translator" size="lg">
            <div className="wisdom-container">
                {!plan ? (
                    <div className="input-phase">
                        <div className="book-context">
                            <span className="book-badge">Book: {book.title}</span>
                            <p className="instruction">
                                What concept or idea from this book do you want to apply to your life?
                            </p>
                        </div>

                        <textarea
                            className="concept-input"
                            placeholder="E.g., 'The idea of habit stacking' or 'The 2-minute rule'..."
                            value={concept}
                            onChange={(e) => setConcept(e.target.value)}
                            rows={4}
                        />

                        <div className="modal-actions">
                            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                            <Button
                                onClick={handleTranslate}
                                disabled={!concept.trim() || isLoading}
                                loading={isLoading}
                                icon={<Lightbulb size={18} />}
                            >
                                Generate Action Plan
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="result-phase">
                        <div className="plan-header">
                            <div className="icon-box">
                                <Lightbulb size={24} />
                            </div>
                            <div>
                                <h3>{concept}</h3>
                                <p>Translated for your context</p>
                            </div>
                        </div>

                        <div className="explanation-box">
                            <p>{plan.explanation}</p>
                        </div>

                        <div className="actions-list">
                            <h4>Immediate Actions</h4>
                            {plan.actions.map((item, idx) => (
                                <div key={idx} className="action-card">
                                    <div className="action-header">
                                        <CheckCircle2 size={20} className="action-check" />
                                        <span className="action-title">{item.action}</span>
                                    </div>
                                    <div className="action-details">
                                        <div className="detail-item">
                                            <span className="label">Why:</span> {item.why}
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">When:</span> {item.when}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="success-metric">
                            <h4>Measurement</h4>
                            <p>{plan.measureSuccess}</p>
                        </div>

                        <div className="modal-actions">
                            <Button variant="secondary" onClick={reset}>Translate Another</Button>
                            <Button onClick={handleClose}>Save to Action Items</Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
