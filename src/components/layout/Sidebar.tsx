import { NavLink } from 'react-router-dom';
import {
    Home,
    BookOpen,
    Target,
    Sparkles,
    Library,
    Settings,
    MessageSquare,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/books', icon: BookOpen, label: 'My Books' },
    { to: '/recommendations', icon: Sparkles, label: 'For You' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/library', icon: Library, label: 'Library' },
    { to: '/coach', icon: MessageSquare, label: 'AI Coach' },
];

export function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="logo-icon">📚</span>
                    <span className="logo-text">Bindery<span className="logo-accent">.ai</span></span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'nav-item-active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/settings" className="nav-item">
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </div>
        </aside>
    );
}
