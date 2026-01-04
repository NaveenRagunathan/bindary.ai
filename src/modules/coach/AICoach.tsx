'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Sparkles, User, Bot } from 'lucide-react';
import { Button } from '@/ui/Button';
import { streamChat } from '@/lib/api';
import { getReadingProgress, generateId } from '@/lib/storage';
import type { ChatMessage, UserProfile, ReadingProgress } from '@/types';
import './AICoach.css';

interface AICoachProps {
    profile: UserProfile | null;
}

export function AICoach({ profile }: AICoachProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I'm your AI Reading Coach. I'm here to help you get the most out of your reading journey, hold you accountable, or just chat about the books you're reading. How can I support you today?",
            timestamp: new Date().toISOString(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const progress = getReadingProgress();
        if (progress) setReadingProgress(progress);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: inputValue,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Create context-aware system message
            let systemContext = '';
            if (profile) {
                systemContext += `\nUser goals: ${profile.goals.map((g) => g.description).join(', ')}.`;
            }
            if (readingProgress.length > 0) {
                const currentBooks = readingProgress.filter((p) => p.status === 'reading');
                if (currentBooks.length > 0) {
                    systemContext += `\nCurrently reading: ${currentBooks.map((b) => b.bookId).join(', ')}.`;
                }
            }

            const conversationHistory = [...messages, userMessage];
            // Add context to the last message for the API call (invisible to user in UI)

            const stream = streamChat(conversationHistory, 'coaching');

            let aiResponse = '';
            const aiMessageId = generateId();
            const messageTimestamp = new Date().toISOString();

            // Add placeholder for streaming message
            setMessages((prev) => [
                ...prev,
                {
                    id: aiMessageId,
                    role: 'assistant',
                    content: '',
                    timestamp: messageTimestamp,
                },
            ]);

            for await (const chunk of stream) {
                aiResponse += chunk;
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === aiMessageId
                            ? { ...msg, content: aiResponse }
                            : msg
                    )
                );
            }
        } catch (error) {
            console.error('Error in chat:', error);
            setMessages((prev) => [
                ...prev,
                {
                    id: generateId(),
                    error: true,
                    role: 'assistant',
                    content: "I'm having trouble connecting to the AI service. Please check your internet connection and ensure your OpenAI API Key is correctly set in the .env file.",
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="coach-container">
            <div className="coach-header">
                <div className="coach-icon-wrapper">
                    <MessageSquare size={24} className="coach-icon-main" />
                    <Sparkles size={12} className="coach-icon-sparkle" />
                </div>
                <div>
                    <h1>AI Coach</h1>
                    <p>Your personal accountability partner and reading guide</p>
                </div>
            </div>

            <div className="chat-window">
                <div className="messages-list">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message-wrapper ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
                        >
                            <div className="message-avatar">
                                {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className="message-bubble">
                                {message.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message-wrapper ai-message">
                            <div className="message-avatar">
                                <Bot size={16} />
                            </div>
                            <div className="message-bubble typing-bubble">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="input-area">
                    <div className="input-wrapper">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about a book, share your progress, or get motivation..."
                            rows={1}
                        />
                        <Button
                            className="send-button"
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isTyping}
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                    <p className="input-hint">Press Enter to send, Shift + Enter for new line</p>
                </div>
            </div>

            <div className="coach-sidebar">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                    <Button variant="secondary" size="sm" onClick={() => setInputValue("I'm feeling stuck on my current book. Can you help me?")}>
                        😓 Feeling stuck
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setInputValue("I finished a chapter! Want to hear my takeaways?")}>
                        🎉 Share progress
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setInputValue("What should I focus on reading this week?")}>
                        📅 Weekly focus
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setInputValue("Explain a complex concept from my book")}>
                        🧠 Explain concept
                    </Button>
                </div>
            </div>
        </div>
    );
}
