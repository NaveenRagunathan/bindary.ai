'use client';

import { useState } from 'react';
import { Dashboard } from '@/features/dashboard/components';
import { OnboardingFlow } from '@/features/onboarding';
import { UserProfile } from '@/types';
import { saveUserProfile } from '@/app/actions';

interface DashboardLogicProps {
    initialProfile?: UserProfile | null;
    userName: string;
}

export default function DashboardLogic({ initialProfile, userName }: DashboardLogicProps) {
    const [profile, setProfile] = useState<UserProfile | null>(initialProfile || null);

    const handleOnboardingComplete = async (newProfile: UserProfile) => {
        setProfile(newProfile);
        await saveUserProfile(newProfile);
    };

    if (!profile) {
        // Technically this renders INSIDE the sidebar layout if used in (main)/dashboard
        // which might look weird. But acceptable for immediate fix.
        return <OnboardingFlow onComplete={handleOnboardingComplete} />;
    }

    return <Dashboard profile={profile} />;
}
