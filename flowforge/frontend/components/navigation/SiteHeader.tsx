'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { trackEvent } from '@/lib/analytics';
import TourButton from '@/components/onboarding/TourButton';
import { ThemeToggle } from './ThemeToggle';

export default function SiteHeader() {
  const router = useRouter();
  const { user, loading, logout, backendOffline } = useAuth();

  async function handleLogout() {
    await logout();
    trackEvent('user_logout');
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {backendOffline && (
        <div className="bg-red-900/80 border-b border-red-800 px-4 py-1.5 text-center text-xs text-red-200">
          ⚠️ Backend server is offline — run{' '}
          <span className="font-mono bg-red-950/60 px-1 rounded">npm run start:dev</span>{' '}
          in <span className="font-mono">backend/</span>
        </div>
      )}
    <header className="shrink-0 border-b border-white/5 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-xl">⚡</span>
          <span className="text-base font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            FlowForge
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/workflows"
            className="text-sm text-gray-400 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-md transition-all"
          >
            Workflows
          </Link>
          <Link
            href="/tool"
            className="text-sm text-gray-400 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5"
          >
            <span>🛠</span> Tools
          </Link>
          <Link
            href="/figma-to-code"
            className="text-sm text-gray-400 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5"
          >
            <span>🎨</span> Figma → Code
          </Link>
          <TourButton />
          <ThemeToggle />
          {loading ? (
            <span className="text-xs text-gray-500 px-3">Loading…</span>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-gray-300 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-md transition-all"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-md transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-300 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-md transition-all"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
    </>
  );
}
