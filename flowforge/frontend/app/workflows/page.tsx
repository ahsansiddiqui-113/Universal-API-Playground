'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWorkflows, createWorkflow, deleteWorkflow } from '../../lib/api';
import { trackEvent } from '@/lib/analytics';
import FigmaImportModal from '../../components/figma-import/FigmaImportModal';
import { createApiTestStarterWorkflow } from '../../lib/workflow-starter';

interface Workflow {
  id: string;
  name: string;
  slug: string;
  isPublic: boolean;
  createdAt: string;
  nodes?: unknown[];
  edges?: unknown[];
}

function NodeCountBadge({ count, label, color }: { count: number; label: string; color: string }) {
  if (count === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${color}`}>
      {count} {label}{count !== 1 ? 's' : ''}
    </span>
  );
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showFigmaImport, setShowFigmaImport] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getWorkflows();
      setWorkflows(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const slug = newName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
      const starterWorkflow = createApiTestStarterWorkflow();
      await createWorkflow({
        name: newName.trim(),
        nodes: starterWorkflow.nodes,
        edges: starterWorkflow.edges,
        slug,
      });
      trackEvent('workflow_created', { source: 'workflows_page' });
      setNewName('');
      setShowForm(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create workflow');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this workflow? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteWorkflow(id);
      setWorkflows(wfs => wfs.filter(w => w.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete workflow');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-10">

      {/* Header row */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          <p className="text-sm text-gray-500 mt-1">
            Build and run API pipelines visually.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFigmaImport(true)}
            className="shrink-0 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-white/10 hover:border-white/20"
            title="Import workflow from Figma file"
          >
            🎨 Import from Figma
          </button>
          <button
            onClick={() => { setShowForm(v => !v); setError(''); }}
            className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/10"
          >
            <span className="text-base leading-none">+</span> New Workflow
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-6 bg-gray-900 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">New Workflow</h2>
          <p className="text-xs text-gray-500 mb-4">
            New workflows start with an example <span className="text-gray-300">Input -&gt; API -&gt; Transform -&gt; Output</span> flow so you can test an API right away.
          </p>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Fetch GitHub User"
              className="flex-1 bg-gray-800 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setNewName(''); }}
              className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-start gap-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <span className="text-red-400 mt-0.5">⚠</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">✕</button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-gray-900 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : workflows.length === 0 ? (
        /* Empty state */
        <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
          <div className="text-5xl mb-4">⚡</div>
          <h3 className="text-white font-semibold mb-1">No workflows yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create your first workflow to start chaining API calls.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            + Create Workflow
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {workflows.map(wf => {
            const nodeCount = wf.nodes?.length ?? 0;
            const edgeCount = wf.edges?.length ?? 0;
            return (
              <li
                key={wf.id}
                className="group relative bg-gray-900 hover:bg-gray-800/80 border border-white/5 hover:border-white/10 rounded-xl px-5 py-4 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/workflows/${wf.id}`}
                      className="text-white font-semibold hover:text-indigo-400 transition-colors block truncate"
                    >
                      {wf.name}
                    </Link>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-500 font-mono">/{wf.slug}</span>
                      <span className="text-gray-700">·</span>
                      <span className="text-xs text-gray-500">{new Date(wf.createdAt).toLocaleDateString()}</span>
                      {nodeCount > 0 && (
                        <>
                          <span className="text-gray-700">·</span>
                          <NodeCountBadge count={nodeCount} label="node" color="text-indigo-400 border-indigo-500/20 bg-indigo-500/5" />
                          {edgeCount > 0 && <NodeCountBadge count={edgeCount} label="connection" color="text-purple-400 border-purple-500/20 bg-purple-500/5" />}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/workflows/${wf.id}`}
                      className="text-xs bg-gray-800 hover:bg-gray-700 group-hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 transition-all"
                    >
                      Open Editor
                    </Link>
                    <button
                      onClick={() => handleDelete(wf.id)}
                      disabled={deleting === wf.id}
                      className="text-xs text-gray-600 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50"
                      title="Delete workflow"
                    >
                      {deleting === wf.id ? '…' : '🗑'}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showFigmaImport && (
        <FigmaImportModal
          onClose={() => setShowFigmaImport(false)}
          onImported={() => { setShowFigmaImport(false); load(); }}
        />
      )}
    </div>
  );
}
