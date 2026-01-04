'use client';

import React from 'react';
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
    User
} from 'lucide-react';
import './NavDock.css';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { label: 'Library', href: '/library', icon: Book },
    { label: 'Coach', href: '/coach', icon: MessageSquare },
    { label: 'Research', href: '/research', icon: ExternalLink },
    { label: 'Wisdom', href: '/wisdom', icon: Sparkles },
    { label: 'Vault', href: '/vault', icon: Database },
];

export function NavDock() {
    const pathname = usePathname();

    return (
        <div className="nav-dock-container">
            <nav className="nav-dock">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-dock-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span className="nav-dock-tooltip">{item.label}</span>
                        </Link>
                    );
                })}

                <div className="w-px h-6 bg-white/10 mx-2 hidden md:block" />

                <Link href="/settings" className="nav-dock-item group">
                    <Settings
                        size={20}
                        className={`group-hover:rotate-90 transition-transform duration-500 ${pathname === '/settings' ? 'text-primary' : ''}`}
                    />
                    <span className="nav-dock-tooltip">Settings</span>
                </Link>

                <Link href="/profile" className="nav-dock-item">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${pathname === '/profile'
                            ? 'bg-primary border-primary shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                            : 'bg-gradient-to-tr from-primary/20 to-primary/40 border-primary/30 group-hover:border-primary/60'
                        }`}>
                        <User size={16} className={pathname === '/profile' ? 'text-black' : 'text-white'} />
                    </div>
                    <span className="nav-dock-tooltip">Profile</span>
                </Link>
            </nav>
        </div>
    );
}
