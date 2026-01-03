'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    BookOpen,
    Target,
    Sparkles,
    Library,
    Settings,
    MessageSquare,
    Search,
    Book
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/library', icon: BookOpen, label: 'My Library' },
    { to: '/coach', icon: MessageSquare, label: 'AI Coach' },
    { to: '/research', icon: Search, label: 'Research' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 fixed inset-y-0 left-0 z-50 flex flex-col bg-surface/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300">
            {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-black font-bold shadow-lg shadow-primary/20">
                        <Book size={18} />
                    </div>
                    <span className="text-xl font-display font-bold tracking-tight text-white">
                        Bindery<span className="text-primary">.ai</span>
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.to);
                    return (
                        <Link
                            key={item.to}
                            href={item.to}
                            className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon
                                size={20}
                                className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-white'
                                    }`}
                            />
                            <span>{item.label}</span>

                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User/Footer */}
            <div className="p-4 border-t border-white/5">
                <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}
