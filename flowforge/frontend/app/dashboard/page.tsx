'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { getWorkflows } from '@/lib/api';

type WorkflowSummary = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export default function DashboardPage() {
  const { user, loading, backendOffline } = useAuth();
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [error, setError] = useState('');
  const [loadingWorkflows, setLoadingWorkflows] = useState(true);

  // Redirect unauthenticated users to login (backend offline: stay, not expired)
  useEffect(() => {
    if (!loading && !user && !backendOffline) {
      router.replace('/login?next=/dashboard');
    }
  }, [loading, user, backendOffline, router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setLoadingWorkflows(true);
    getWorkflows()
      .then((items) => setWorkflows(items))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load workflows'))
      .finally(() => setLoadingWorkflows(false));
  }, [user]);

  if (loading) {
    return <div className="px-6 py-12 text-sm text-gray-400">Loading dashboard…</div>;
  }

  if (backendOffline) {
    return (
      <div className="px-6 py-16 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl">⚡</div>
        <p className="text-base font-semibold text-white">Backend server is offline</p>
        <p className="text-sm text-gray-400 max-w-sm">
          The API server is not running on port 3000.{' '}
          <span className="font-mono text-indigo-400">npm run start:dev</span> in the{' '}
          <span className="font-mono text-indigo-400">backend/</span> directory.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-gray-500 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <div className="px-6 py-12 text-sm text-gray-400">Redirecting…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-10 space-y-8">
      <section className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold text-white">
          Welcome back{user.name ? `, ${user.name}` : ''}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-300">
          Your account is ready for saved workflows, usage-based monetization, analytics, and future
          retention features. This dashboard is the foundation for billing and user growth features.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/workflows"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Start building workflows
          </Link>
          <Link
            href="/tool"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:border-white/20 hover:text-white"
          >
            Use tools instantly
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Plan" value={user.plan} helper="Usage-based monetization ready" />
        <StatCard label="AI credits" value={String(user.aiCredits)} helper="Free tier balance" />
        <StatCard label="Saved workflows" value={String(workflows.length)} helper="Owned by your account" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-gray-900 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Recent workflows</h2>
            <p className="mt-1 text-sm text-gray-400">Your workflow list is now tied to your account instead of anonymous data.</p>
          </div>
          <Link
            href="/workflows"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Open workflows →
          </Link>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {loadingWorkflows ? (
          <div className="mt-6 text-sm text-gray-500">Loading your workflows…</div>
        ) : workflows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">
            <p className="text-white font-semibold">No workflows yet</p>
            <p className="mt-2 text-sm text-gray-500">Create your first authenticated workflow and it will live here.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {workflows.slice(0, 5).map((workflow) => (
              <Link
                key={workflow.id}
                href={`/workflows/${workflow.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-gray-950 px-4 py-3 transition hover:border-white/10 hover:bg-gray-900/70"
              >
                <div>
                  <p className="font-semibold text-white">{workflow.name}</p>
                  <p className="mt-1 text-xs font-mono text-gray-500">/{workflow.slug}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(workflow.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gray-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{helper}</p>
    </div>
  );
}
