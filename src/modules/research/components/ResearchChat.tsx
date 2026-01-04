import { useState, useRef, useEffect } from 'react';
import { Search, Send, Sparkles, StopCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { SourceCard } from './SourceCard';
import type { ResearchMessage, ResearchSource } from '@/types';
import { generateId } from '@/lib/storage';

export function ResearchChat() {
    const [messages, setMessages] = useState<ResearchMessage[]>([]);
    const [input, setInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [currentStep, setCurrentStep] = useState<string>(''); // 'searching', 'reading', 'synthesizing'
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentStep]);

    const handleSearch = async () => {
        if (!input.trim() || isSearching) return;

        const userMsg: ResearchMessage = {
            id: generateId(),
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsSearching(true);
        setCurrentStep('searching');

        // Simulate Research Process (since we don't have real API yet)
        try {
            // Step 1: Searching
            await new Promise(resolve => setTimeout(resolve, 1500));
            setCurrentStep('reading');

            // Step 2: Reading sources
            await new Promise(resolve => setTimeout(resolve, 1500));
            setCurrentStep('synthesizing');

            // Step 3: Synthesizing
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockSources: ResearchSource[] = [
                {
                    id: '1',
                    title: 'The Psychology of Money',
                    author: 'Morgan Housel',
                    type: 'book',
                    relevanceScore: 95,
                    snippet: 'Doing well with money has a little to do with how smart you are and a lot to do with how you behave.',
                    year: '2020'
                },
                {
                    id: '2',
                    title: 'Behavioral Finance Overview',
                    type: 'web',
                    url: 'https://investopedia.com/behavioral-finance',
                    relevanceScore: 88,
                    snippet: 'Behavioral finance suggests that investors are not always rational, have limits to their self-control, and are influenced by their own biases.'
                }
            ] as any; // Cast for simplified mock

            const assistantMsg: ResearchMessage = {
                id: generateId(),
                role: 'assistant',
                content: `Based on your request about "${userMsg.content}", here is what I found.\n\nFinancial success is often more about behavior than intelligence. Morgan Housel's *The Psychology of Money* argues that our relationship with money is emotional and driven by psychological biases rather than pure math. Key concepts include providing yourself with a "margin of safety" and understanding the power of compounding over long periods.\n\nFurthermore, behavioral finance teaches us that we are prone to cognitive errors like confirmation bias and loss aversion, which can derail even the best investment strategies.`,
                timestamp: new Date().toISOString(),
                sources: mockSources,
                relatedQueries: ['What is the difference between being rich and being wealthy?', 'How does compounding work?']
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
            setCurrentStep('');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-8 pr-4 pb-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                            <Sparkles size={32} className="text-white/40" />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white">Research Assistant</h3>
                            <p className="text-text-secondary mt-2 max-w-md">
                                Ask complex questions. I'll search for answers, cite sources, and synthesize knowledge for you.
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                                }`}>
                                {msg.role === 'user' ? <ArrowRight size={16} /> : <Sparkles size={16} />}
                            </div>

                            <div className={`flex flex-col gap-4 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <Card
                                    variant={msg.role === 'user' ? 'default' : 'glass'}
                                    className={`${msg.role === 'user' ? 'bg-primary/10 border-primary/20' : ''}`}
                                    padding="md"
                                >
                                    <div className="prose prose-invert prose-sm max-w-none leading-relaxed whitespace-pre-line">
                                        {msg.content}
                                    </div>
                                </Card>

                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                                        {msg.sources.map((source, idx) => (
                                            <SourceCard key={source.id} source={source} index={idx} />
                                        ))}
                                    </div>
                                )}

                                {msg.relatedQueries && (
                                    <div className="flex flex-wrap gap-2 pl-2">
                                        {msg.relatedQueries.map(q => (
                                            <button
                                                key={q}
                                                onClick={() => setInput(q)}
                                                className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-text-secondary hover:text-white"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {/* Loading State */}
                {isSearching && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center animate-pulse">
                            <Sparkles size={16} />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-text-muted">
                            <div className="flex gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${['searching', 'reading', 'synthesizing'].includes(currentStep) ? 'bg-accent animate-bounce' : 'bg-white/10'}`} style={{ animationDelay: '0ms' }} />
                                <span className={`w-2 h-2 rounded-full ${['reading', 'synthesizing'].includes(currentStep) ? 'bg-accent animate-bounce' : 'bg-white/10'}`} style={{ animationDelay: '150ms' }} />
                                <span className={`w-2 h-2 rounded-full ${['synthesizing'].includes(currentStep) ? 'bg-accent animate-bounce' : 'bg-white/10'}`} style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="capitalize">{currentStep}...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative mt-4">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search size={20} className="text-text-muted" />
                </div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Research a topic (e.g., 'Explain quantum computing')"
                    className="w-full pl-12 pr-14 py-4 bg-surface-elevated border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all shadow-lg"
                    disabled={isSearching}
                />
                <div className="absolute inset-y-2 right-2">
                    <Button
                        size="sm"
                        variant={input.trim() ? 'primary' : 'ghost'}
                        onClick={handleSearch}
                        disabled={!input.trim() || isSearching}
                        className={!input.trim() ? 'opacity-50' : ''}
                        icon={isSearching ? <StopCircle size={18} /> : <Send size={18} />}
                    >
                        {isSearching ? '' : ''}
                    </Button>
                </div>
            </div>
        </div>
    );
}
