'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getWorkflowBySlug, executeWorkflow } from '../../../lib/api';
import type { WorkflowData, WorkflowNode, ExecutionResult } from '../../../lib/types';
import ToolForm from '../../../components/tool/ToolForm';
import ResultDisplay from '../../../components/tool/ResultDisplay';

/** Extract ordered field names from the first input node in the workflow. */
function extractInputFields(nodes: WorkflowNode[]): string[] {
  const inputNode = nodes.find((n) => n.type === 'input');
  return inputNode?.fields ?? [];
}

type PageState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; workflow: WorkflowData; fields: string[] }
  | { phase: 'result'; workflow: WorkflowData; fields: string[]; result: ExecutionResult };

export default function ToolPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [state, setState] = useState<PageState>({ phase: 'loading' });
  const [isExecuting, setIsExecuting] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setState({ phase: 'loading' });
    getWorkflowBySlug(slug)
      .then((workflow) => {
        const fields = extractInputFields(workflow.nodes);
        setState({ phase: 'ready', workflow, fields });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setState({ phase: 'error', message });
      });
  }, [slug]);

  const handleSubmit = useCallback(
    async (values: Record<string, string>) => {
      if (state.phase !== 'ready' && state.phase !== 'result') return;
      const workflow = state.workflow;

      setIsExecuting(true);
      setExecError(null);

      try {
        const result = await executeWorkflow(workflow.id, values);
        setState({ phase: 'result', workflow, fields: extractInputFields(workflow.nodes), result });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Execution failed';
        setExecError(message);
      } finally {
        setIsExecuting(false);
      }
    },
    [state],
  );

  const handleReset = () => {
    if (state.phase !== 'result') return;
    setState({ phase: 'ready', workflow: state.workflow, fields: state.fields });
    setExecError(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (state.phase === 'loading') {
    return <FullscreenMessage><LoadingSpinner /></FullscreenMessage>;
  }

  if (state.phase === 'error') {
    return (
      <FullscreenMessage>
        <div className="text-center space-y-3">
          <p className="text-4xl">⚠️</p>
          <p className="text-white font-semibold">Workflow not found</p>
          <p className="text-gray-400 text-sm">{state.message}</p>
          <Link href="/" className="inline-block mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            ← Back to home
          </Link>
        </div>
      </FullscreenMessage>
    );
  }

  const { workflow, fields } = state;
  const result = state.phase === 'result' ? state.result : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-white font-semibold truncate">{workflow.name}</span>
            <span className="hidden sm:inline text-xs text-gray-500 font-mono">/{workflow.slug}</span>
          </div>
          {workflow.isPublic ? (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-900/40
              px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Public
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gray-800
              px-2.5 py-0.5 text-xs font-medium text-gray-400 ring-1 ring-gray-700">
              Private
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-4 py-10 space-y-8">
        {/* Card */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl shadow-black/40">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-white">{workflow.name}</h1>
            {fields.length > 0 && (
              <p className="mt-1 text-sm text-gray-400">
                Fill in the fields below and click <strong className="text-gray-200">Run Workflow</strong>.
              </p>
            )}
          </div>

          <ToolForm
            key={state.phase}
            fields={fields}
            onSubmit={handleSubmit}
            isLoading={isExecuting}
          />

          {/* Execution error */}
          {execError && (
            <div className="mt-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3">
              <p className="text-sm text-red-400">{execError}</p>
            </div>
          )}

          {/* Result */}
          {result && <ResultDisplay result={result} />}

          {/* Run again link */}
          {result && (
            <button
              onClick={handleReset}
              className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              ← Run again with different inputs
            </button>
          )}
        </section>

        {/* Powered-by footer */}
        <p className="text-center text-xs text-gray-600">
          Powered by{' '}
          <Link href="/" className="text-gray-500 hover:text-gray-400 transition-colors">
            FlowForge
          </Link>
        </p>
      </main>
    </div>
  );
}

function FullscreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      {children}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        className="h-8 w-8 animate-spin text-indigo-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-gray-400">Loading workflow…</p>
    </div>
  );
}
