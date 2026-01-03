'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { AuthInput, SubmitButton } from '@/features/auth/components/AuthComponents';

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            if (mode === 'signup') {
                // 1. Register
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                setSuccess('Account created! Signing you in...');

                // 2. Auto Sign In after successful registration
                const result = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                });

                if (result?.error) {
                    throw new Error('Login failed after registration');
                } else {
                    router.push(callbackUrl);
                }
            } else {
                // Sign In Mode
                const result = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                });

                if (result?.error) {
                    setError('Invalid credentials. Please check your email and password.');
                } else {
                    router.push(callbackUrl);
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-3xl font-display font-bold tracking-tight">
                    {mode === 'signin' ? 'Welcome back' : 'Create Account'}
                </h1>
                <p className="text-text-secondary">
                    {mode === 'signin'
                        ? 'Enter your details to access your library'
                        : 'Join thousands of readers on their journey'}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-surface-elevated rounded-xl border border-white/5">
                <button
                    onClick={() => { setMode('signin'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${mode === 'signin'
                        ? 'bg-primary text-black shadow-lg'
                        : 'text-text-muted hover:text-white'
                        }`}
                >
                    <LogIn size={16} /> Sign In
                </button>
                <button
                    onClick={() => { setMode('signup'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${mode === 'signup'
                        ? 'bg-primary text-black shadow-lg'
                        : 'text-text-muted hover:text-white'
                        }`}
                >
                    <UserPlus size={16} /> Sign Up
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-center gap-2 animate-slide-up">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-sm flex items-center gap-2 animate-slide-up">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {success}
                    </div>
                )}

                <div className="space-y-5">
                    <AuthInput
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hello@example.com"
                        required
                        icon={<Mail className="w-5 h-5" />}
                    />

                    <AuthInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        icon={<Lock className="w-5 h-5" />}
                    />
                </div>

                <SubmitButton isLoading={isLoading} className="mt-2">
                    {mode === 'signin' ? (
                        <>Sign In <ArrowRight className="w-5 h-5" /></>
                    ) : (
                        <>Create Account <UserPlus className="w-5 h-5" /></>
                    )}
                </SubmitButton>
            </form>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}
