import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout';
import { OnboardingFlow } from './components/onboarding';
import { Dashboard } from './components/dashboard';
import { getUserProfile } from './services/storage';
import type { UserProfile } from './types';
import './index.css';

function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing profile
    const savedProfile = getUserProfile();
    if (savedProfile && savedProfile.onboardingComplete) {
      setProfile(savedProfile);
    }
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <span className="loading-logo">📚</span>
          <h1>Bindery<span className="accent">.ai</span></h1>
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  // Show onboarding if no profile
  if (!profile) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Main app with routing
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard profile={profile} />} />
          <Route path="/books" element={<PlaceholderPage title="My Books" />} />
          <Route path="/recommendations" element={<PlaceholderPage title="Recommendations" />} />
          <Route path="/goals" element={<PlaceholderPage title="My Goals" />} />
          <Route path="/library" element={<PlaceholderPage title="Library" />} />
          <Route path="/coach" element={<PlaceholderPage title="AI Coach" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

// Placeholder for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>This section is coming soon! 🚧</p>
    </div>
  );
}

export default App;
