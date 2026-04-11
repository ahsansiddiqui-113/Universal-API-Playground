'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { useAuth } from '@/components/providers/AuthProvider';
import { signup, loginWithGoogle } from '@/lib/auth';
import { trackEvent } from '@/lib/analytics';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthenticatedUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nextPath = searchParams.get('next') || '/dashboard';

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user } = await signup({ name, email, password });
      setAuthenticatedUser(user);
      trackEvent('user_signup', { method: 'password' });
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup(credential: string) {
    setError('');
    try {
      const { user } = await loginWithGoogle(credential, name);
      setAuthenticatedUser(user);
      trackEvent('user_signup', { method: 'google' });
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google signup failed');
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-8 shadow-2xl shadow-black/30">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-400">Start free</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Create your FlowForge account</h1>
          <p className="mt-2 text-sm text-gray-400">
            Save workflows, unlock your dashboard, and track your AI usage from day one.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-gray-800 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-gray-800 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-gray-800 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
              placeholder="Use at least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-gray-600">
          <div className="h-px flex-1 bg-white/10" />
          <span>or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <GoogleLoginButton onCredential={handleGoogleSignup} />

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
