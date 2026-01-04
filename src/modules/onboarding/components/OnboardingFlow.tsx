import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/ui/Button';
import type { ChatMessage, UserProfile } from '@/types';
import { streamChat, analyzePersonality } from '@/lib/api';
import { saveUserProfile, generateId } from '@/lib/storage';
import { DEFAULT_PERSONALITY_TRAITS, DEFAULT_GOAL_DESCRIPTION, DEFAULT_CHALLENGE } from '../constants';
import './OnboardingFlow.css';

interface OnboardingFlowProps {
    onComplete: (profile: UserProfile) => void;
}

const INITIAL_MESSAGE: ChatMessage = {
    id: 'initial',
    role: 'assistant',
    content: `Welcome to Bindery.ai! 📚✨

I'm your intelligent reading companion, and I'm excited to help you discover the books that will truly transform your life.

Unlike other apps that give you generic recommendations, I take the time to deeply understand who you are, where you're going, and what challenges you're facing. Then I'll craft a personalized reading roadmap just for you.

Ready to begin? **Tell me about yourself—what's the biggest challenge or goal you're working on right now?**`,
    timestamp: new Date().toISOString(),
};

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentResponse, setCurrentResponse] = useState('');
    const [step, setStep] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentResponse]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setCurrentResponse('');

        try {
            // Get AI response with streaming
            let fullResponse = '';
            const allMessages = [...messages, userMessage];

            for await (const chunk of streamChat(allMessages, 'onboarding')) {
                fullResponse += chunk;
                setCurrentResponse(fullResponse);
            }

            const assistantMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setCurrentResponse('');
            setStep((prev) => prev + 1);

            // After sufficient conversation, analyze and create profile
            if (step >= 4) {
                // Check if AI has gathered enough info
                const hasEnoughInfo = fullResponse.toLowerCase().includes('understand') ||
                    fullResponse.toLowerCase().includes('based on what you') ||
                    step >= 6;

                if (hasEnoughInfo) {
                    await createProfile([...allMessages, assistantMessage]);
                }
            }
        } catch (error) {
            console.error('Error in chat:', error);
            const errorMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: "I apologize, but I'm having trouble processing that. Could you please try again? If the issue persists, make sure your API key is configured correctly.",
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const createProfile = async (allMessages: ChatMessage[]) => {
        try {
            const profileData = await analyzePersonality(allMessages);

            const profile: UserProfile = {
                id: generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                name: 'User', // Could extract from conversation
                lifestage: profileData.lifestage || 'other',
                personality: profileData.personality || DEFAULT_PERSONALITY_TRAITS,
                learningStyle: profileData.learningStyle || 'reading-writing',
                goals: (profileData.goals || []).map((g: { category: string; description: string; priority: number }) => ({
                    id: generateId(),
                    category: g.category as 'career' | 'business' | 'personal-growth' | 'relationships' | 'health' | 'finance' | 'creativity' | 'spirituality' | 'education',
                    description: g.description,
                    priority: g.priority,
                    timeframe: '6 months',
                    createdAt: new Date().toISOString(),
                })),
                challenges: profileData.challenges || [],
                timeAvailable: profileData.timeAvailable || {
                    hoursPerWeek: 5,
                    preferredTimes: ['evening'],
                    consistency: 'medium',
                },
                readingExperience: {
                    level: 'intermediate',
                    booksReadLastYear: 5,
                    preferredFormats: ['ebook'],
                    readingSpeed: 'average',
                },
                onboardingComplete: true,
                currentStep: 0,
            };

            saveUserProfile(profile);
            onComplete(profile);
        } catch (error) {
            console.error('Error creating profile:', error);
        }
    };

    const handleSkip = async () => {
        // Create default profile for users who want to skip
        const profile: UserProfile = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: 'User',
            lifestage: 'other',
            personality: DEFAULT_PERSONALITY_TRAITS,
            learningStyle: 'reading-writing',
            goals: [{
                id: generateId(),
                category: 'personal-growth',
                description: DEFAULT_GOAL_DESCRIPTION,
                timeframe: '6 months',
                priority: 3,
                createdAt: new Date().toISOString(),
            }],
            challenges: [DEFAULT_CHALLENGE],
            timeAvailable: {
                hoursPerWeek: 5,
                preferredTimes: ['evening'],
                consistency: 'medium',
            },
            readingExperience: {
                level: 'intermediate',
                booksReadLastYear: 5,
                preferredFormats: ['ebook'],
                readingSpeed: 'average',
            },
            onboardingComplete: true,
            currentStep: 0,
        };

        saveUserProfile(profile);
        onComplete(profile);
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-header">
                <div className="onboarding-logo">
                    <span className="logo-icon">📚</span>
                    <span className="logo-text">Bindery<span className="logo-accent">.ai</span></span>
                </div>
                <div className="onboarding-progress">
                    <div className="progress-dots">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={`progress-dot ${i <= step ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                    <button className="skip-btn" onClick={handleSkip}>
                        Skip for now
                    </button>
                </div>
            </div>

            <div className="chat-container">
                <div className="chat-messages">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="message-avatar">
                                    <Sparkles size={18} />
                                </div>
                            )}
                            <div className="message-content">
                                {message.content.split('\n').map((line, i) => (
                                    <p key={i}>{line || <br />}</p>
                                ))}
                            </div>
                        </div>
                    ))}

                    {currentResponse && (
                        <div className="message message-assistant">
                            <div className="message-avatar">
                                <Sparkles size={18} />
                            </div>
                            <div className="message-content">
                                {currentResponse.split('\n').map((line, i) => (
                                    <p key={i}>{line || <br />}</p>
                                ))}
                                <span className="typing-cursor">|</span>
                            </div>
                        </div>
                    )}

                    {isLoading && !currentResponse && (
                        <div className="message message-assistant">
                            <div className="message-avatar">
                                <Sparkles size={18} />
                            </div>
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-form" onSubmit={handleSubmit}>
                    <div className="chat-input-container">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your response..."
                            disabled={isLoading}
                            className="chat-input"
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            loading={isLoading}
                            icon={<Send size={18} />}
                        >
                            Send
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
