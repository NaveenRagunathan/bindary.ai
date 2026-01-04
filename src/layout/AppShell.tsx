import React from 'react';
import { Sidebar } from './Sidebar';
import './AppShell.css';

interface AppShellProps {
    children: React.ReactNode;
    showSidebar?: boolean;
}

export function AppShell({ children, showSidebar = true }: AppShellProps) {
    return (
        <div className={`app-shell ${showSidebar ? 'with-sidebar' : ''}`}>
            {showSidebar && <Sidebar />}
            <main className="app-main">
                <div className="app-content">{children}</div>
            </main>
        </div>
    );
}
