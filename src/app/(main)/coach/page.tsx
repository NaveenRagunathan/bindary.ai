'use client';

import { AICoach } from '@/features/coach';

export default function CoachPage() {
    return (
        <div className="p-8 h-[calc(100vh-2rem)]">
            {/* 
                The AICoach component currently has its own layout/height management.
                We might need to adjust it to fit the new MainLayout.
                For now, wrapping it in a container.
             */}
            <AICoach />
        </div>
    );
}
