import { BookOpen } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex bg-[#0a0a0f] text-white overflow-hidden relative font-sans">
            {/* Background Effects (Global for Auth) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            {/* Left Side - Visual & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12 bg-surface/30 backdrop-blur-md border-r border-white/5">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-[0_0_30px_-5px_rgba(245,166,35,0.5)]">
                        <BookOpen className="w-6 h-6 text-black" />
                    </div>
                    <span className="text-2xl font-display font-bold tracking-tight text-white">Bindery.ai</span>
                </div>

                <div className="space-y-8 max-w-lg mb-12">
                    <h2 className="text-5xl font-display font-bold leading-[1.1]">
                        Your personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-accent">AI reading companion</span>
                    </h2>
                    <p className="text-lg text-text-secondary leading-relaxed font-light">
                        Unlock the wisdom of books with AI. Get personalized coaching, summaries, and deep insights tailored just for your growth journey.
                    </p>

                    <div className="flex items-center gap-6 pt-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#0a0a0f] bg-surface-elevated flex items-center justify-center text-xs text-white/50 overflow-hidden relative shadow-lg`}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-white">1,000+ Readers</span>
                            <span className="text-xs text-text-muted">Transforming their reading habits</span>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-text-muted">
                    © 2024 Bindery.ai. All rights reserved.
                </div>
            </div>

            {/* Right Side - Content Area */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}
