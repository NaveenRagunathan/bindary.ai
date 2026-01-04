'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Book,
    Target,
    MessageSquare,
    ExternalLink,
    Database,
    Sparkles,
    Settings,
    BookOpen,
    Menu,
    X
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { label: 'Library', href: '/library', icon: Book },
    { label: 'Action Items', href: '/actions', icon: Target },
    { label: 'Coach', href: '/coach', icon: MessageSquare },
    { label: 'Research', href: '/research', icon: ExternalLink },
    { label: 'Knowledge Vault', href: '/vault', icon: Database },
    { label: 'Analytics', href: '/analytics', icon: LayoutGrid },
    { label: 'Wisdom', href: '/wisdom', icon: Sparkles },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Responsive Detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 bg-surface/95 backdrop-blur-xl border-b border-white/5 lg:hidden">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-surface border border-white/5">
                        <BookOpen size={20} className="text-primary" />
                    </div>
                    <span className="text-lg font-display font-bold tracking-tight text-white">
                        Bindery.ai
                    </span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-surface/95 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 lg:translate-x-0
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    w-72 lg:w-64 pt-16 lg:pt-0
                `}
            >
                {/* Logo Area (Desktop Only) */}
                <div className="px-6 py-8 border-b border-white/5 hidden lg:block">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="p-2 rounded-lg bg-surface border border-white/5 group-hover:border-primary/50 transition-colors">
                            <BookOpen size={24} className="text-primary" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
                            Bindery.ai
                        </span>
                    </Link>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${isActive
                                    ? 'text-primary bg-primary/5'
                                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                                )}
                                <item.icon
                                    size={18}
                                    className={`transition-all duration-300 ${isActive
                                        ? 'text-primary'
                                        : 'text-text-muted group-hover:text-white group-hover:scale-110'
                                        }`}
                                />
                                <span className="tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Settings */}
                <div className="p-4 border-t border-white/5">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-all group">
                        <Settings
                            size={18}
                            className="group-hover:rotate-90 transition-transform duration-500"
                        />
                        <span>Settings</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
