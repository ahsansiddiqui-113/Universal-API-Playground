'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { importFromFigma, createWorkflow } from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ParsedNode {
  id: string;
  type: 'input' | 'api' | 'transform' | 'output';
  label?: string;
  endpoint?: string;
  method?: string;
  fields?: string[];
  transformMethod?: string;
  format?: string;
}

interface ParseResult {
  name: string;
  frameCount: number;
  nodes: ParsedNode[];
  edges: unknown[];
}

// ── Node type style map ───────────────────────────────────────────────────────
const TYPE_STYLE: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  input:     { icon: '↘', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30'    },
  api:       { icon: '⚡', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  transform: { icon: '⚙', color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30'  },
  output:    { icon: '↗', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30'   },
};

// ── Sub-detail line for a node ────────────────────────────────────────────────
function NodeDetail({ node }: { node: ParsedNode }) {
  if (node.type === 'api' && node.endpoint) {
    return (
      <span className="font-mono text-[10px] text-gray-500 truncate block">
        {node.method} {node.endpoint}
      </span>
    );
  }
  if (node.type === 'input' && node.fields && node.fields.length > 0) {
    return <span className="text-[10px] text-gray-500">Fields: {node.fields.join(', ')}</span>;
  }
  if (node.type === 'transform' && node.transformMethod) {
    return <span className="text-[10px] text-gray-500">Method: {node.transformMethod}</span>;
  }
  if (node.type === 'output' && node.format) {
    return <span className="text-[10px] text-gray-500">Format: {node.format}</span>;
  }
  return null;
}

// ── Step 1: Credentials form ──────────────────────────────────────────────────
function StepCredentials({
  onNext,
}: {
  onNext: (result: ParseResult) => void;
}) {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await importFromFigma(figmaUrl.trim(), token.trim());
      onNext(result as ParseResult);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="text-center pb-1">
        <div className="text-4xl mb-3">🎨</div>
        <h2 className="text-xl font-bold text-white">Import from Figma</h2>
        <p className="text-gray-400 text-sm mt-1 leading-relaxed">
          Each top-level frame on your Figma file's first page becomes a workflow node.
        </p>
      </div>

      {/* Figma URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Figma File URL
        </label>
        <input
          type="url"
          value={figmaUrl}
          onChange={e => setFigmaUrl(e.target.value)}
          placeholder="https://www.figma.com/design/abc123/My-Workflow"
          required
          className="bg-gray-800 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
        />
      </div>

      {/* Access token */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Personal Access Token
        </label>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="figd_…"
          required
          className="bg-gray-800 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
        />
        <p className="text-[11px] text-gray-600 leading-relaxed">
          Generate one at{' '}
          <a
            href="https://www.figma.com/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            figma.com/settings
          </a>{' '}
          → Security → Personal access tokens. Your token is never stored.
        </p>
      </div>

      {/* Figma naming guide */}
      <div className="bg-gray-800/50 rounded-xl border border-white/5 p-4 text-[11px] text-gray-400 leading-relaxed">
        <p className="font-semibold text-gray-300 mb-2">💡 Frame naming guide</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-blue-400">Input / Start / Form</span>  <span>→ Input node</span>
          <span className="text-emerald-400">GET /users, API Call</span><span>→ API node</span>
          <span className="text-purple-400">Transform / Filter</span>   <span>→ Transform node</span>
          <span className="text-amber-400">Output / Result / End</span> <span>→ Output node</span>
        </div>
        <p className="mt-2 text-gray-600">Frames without matching names are inferred by position.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <span className="text-red-400 shrink-0 mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !figmaUrl.trim() || !token.trim()}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Fetching Figma file…
          </>
        ) : (
          'Parse Figma File →'
        )}
      </button>
    </form>
  );
}

// ── Step 2: Preview parsed nodes ──────────────────────────────────────────────
function StepPreview({
  result,
  onNext,
  onBack,
}: {
  result: ParseResult;
  onNext: (name: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(result.name);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center pb-1">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {result.frameCount} frame{result.frameCount !== 1 ? 's' : ''} parsed
        </div>
        <h2 className="text-xl font-bold text-white">Review your workflow</h2>
        <p className="text-gray-400 text-sm mt-1">These nodes will be created in the editor.</p>
      </div>

      {/* Node preview pipeline */}
      <div className="bg-gray-950 rounded-xl border border-white/5 p-4 overflow-x-auto">
        <div className="flex items-start gap-2 min-w-max">
          {result.nodes.map((node, i) => {
            const s = TYPE_STYLE[node.type] ?? TYPE_STYLE.api;
            return (
              <div key={node.id} className="flex items-start gap-2">
                <div className={`rounded-xl border p-3 flex flex-col gap-1.5 min-w-[100px] max-w-[140px] ${s.bg} ${s.border}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-base leading-none ${s.color}`}>{s.icon}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${s.color}`}>
                      {node.type}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white truncate leading-tight">{node.label}</p>
                  <NodeDetail node={node} />
                </div>
                {i < result.nodes.length - 1 && (
                  <div className="flex items-center pt-5 text-gray-600 text-sm">→</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Workflow Name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="bg-gray-800 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white px-4 py-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
        >
          ← Back
        </button>
        <button
          onClick={() => onNext(name.trim() || result.name)}
          disabled={!name.trim()}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          Import as Workflow →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Importing / done ──────────────────────────────────────────────────
function StepImporting({ done, workflowId, onClose }: { done: boolean; workflowId: string; onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      {done ? (
        <>
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <span className="text-4xl">✅</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Workflow imported!</h2>
            <p className="text-gray-400 text-sm mt-1">Your Figma frames are now workflow nodes in the editor.</p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-[260px]">
            <button
              onClick={() => { onClose(); router.push(`/workflows/${workflowId}`); }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Open Editor →
            </button>
            <button onClick={onClose} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Back to Workflows
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <span className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin block" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Creating workflow…</h2>
            <p className="text-gray-400 text-sm mt-1">Saving your nodes to the editor.</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
interface FigmaImportModalProps {
  onClose: () => void;
  onImported: () => void;
}

export default function FigmaImportModal({ onClose, onImported }: FigmaImportModalProps) {
  const [step, setStep] = useState<'credentials' | 'preview' | 'importing'>('credentials');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [workflowId, setWorkflowId] = useState('');
  const [importDone, setImportDone] = useState(false);
  const [importError, setImportError] = useState('');

  async function handleImport(workflowName: string) {
    if (!parseResult) return;
    setStep('importing');
    setImportError('');
    try {
      const slug =
        workflowName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') +
        '-' + Date.now();
      const wf = await createWorkflow({
        name: workflowName,
        userId: 'anonymous',
        nodes: parseResult.nodes,
        edges: parseResult.edges,
        slug,
      });
      setWorkflowId(wf.id);
      setImportDone(true);
      onImported();
    } catch (err: any) {
      setImportError(err.message ?? 'Failed to create workflow');
      setStep('preview');
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gray-900/90 backdrop-blur-sm rounded-t-2xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <span>🎨</span>
            <span>Import from Figma</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/5 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Step progress */}
        {step !== 'importing' && (
          <div className="flex items-center gap-2 px-6 pt-4 pb-0">
            {(['credentials', 'preview'] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors
                    ${step === s
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : s === 'credentials' && step === 'preview'
                      ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                      : 'bg-white/5 border-white/10 text-gray-600'}`}
                >
                  {i + 1}
                </div>
                <span className={`text-xs ${step === s ? 'text-gray-300' : 'text-gray-600'}`}>
                  {s === 'credentials' ? 'Connect' : 'Preview'}
                </span>
                {i < 1 && <span className="text-gray-700 text-xs mx-1">→</span>}
              </div>
            ))}
          </div>
        )}

        <div className="px-6 py-5">
          {importError && (
            <div className="mb-4 flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <span className="text-red-400 shrink-0">⚠</span>
              <span>{importError}</span>
            </div>
          )}

          {step === 'credentials' && (
            <StepCredentials
              onNext={result => { setParseResult(result); setStep('preview'); }}
            />
          )}
          {step === 'preview' && parseResult && (
            <StepPreview
              result={parseResult}
              onNext={handleImport}
              onBack={() => setStep('credentials')}
            />
          )}
          {step === 'importing' && (
            <StepImporting done={importDone} workflowId={workflowId} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
