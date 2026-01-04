import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: 'primary' | 'accent' | 'success' | 'warning';
    delay?: number;
}

export function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    trendUp,
    color = 'primary',
    delay = 0
}: StatCardProps) {
    const colorStyles = {
        primary: 'text-primary bg-primary/10 border-primary/20',
        accent: 'text-accent bg-accent/10 border-accent/20',
        success: 'text-success bg-success/10 border-success/20',
        warning: 'text-warning bg-warning/10 border-warning/20',
    };

    return (
        <div
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface/40 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-surface/60 hover:shadow-xl hover:border-white/10"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-text-muted">{label}</p>
                    <h3 className="mt-2 text-3xl font-display font-bold tracking-tight text-white">{value}</h3>
                </div>
                <div className={`rounded-xl p-3 ${colorStyles[color]} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon size={20} />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-xs">
                    <span className={`font-medium ${trendUp ? 'text-success' : 'text-red-500'}`}>
                        {trendUp ? '+' : ''}{trend}
                    </span>
                    <span className="ml-2 text-text-secondary">from last week</span>
                </div>
            )}

            {/* Background Glow Effect */}
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-[50px] transition-opacity duration-300 group-hover:opacity-100 opacity-0 ${color === 'primary' ? 'bg-primary/20' :
                    color === 'accent' ? 'bg-accent/20' :
                        color === 'success' ? 'bg-success/20' : 'bg-warning/20'
                }`} />
        </div>
    );
}
