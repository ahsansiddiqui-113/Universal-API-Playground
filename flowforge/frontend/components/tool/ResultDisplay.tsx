'use client';

import { useState } from 'react';
import type { ExecutionResult } from '../../lib/types';

interface ResultDisplayProps {
  result: ExecutionResult;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);

  const isSuccess = result.status === 'completed';
  const outputString = formatOutput(result.output);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied — silently fail
    }
  };

  return (
    <div className="mt-6 space-y-3">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span
          className={[
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
            isSuccess
              ? 'bg-emerald-900/50 text-emerald-400 ring-1 ring-emerald-700'
              : 'bg-red-900/50 text-red-400 ring-1 ring-red-700',
          ].join(' ')}
        >
          <span
            className={[
              'h-1.5 w-1.5 rounded-full',
              isSuccess ? 'bg-emerald-400' : 'bg-red-400',
            ].join(' ')}
          />
          {isSuccess ? 'Success' : 'Failed'}
        </span>
        <span className="text-xs text-gray-500">ID: {result.executionId.slice(0, 8)}…</span>
      </div>

      {/* Output box */}
      <div className="relative rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Result</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-gray-400
              hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Copy result"
          >
            {copied ? (
              <>
                <CheckIcon />
                Copied
              </>
            ) : (
              <>
                <CopyIcon />
                Copy
              </>
            )}
          </button>
        </div>

        <div className="p-4 overflow-x-auto">
          {isObjectOutput(result.output) ? (
            <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words">
              {outputString}
            </pre>
          ) : (
            <p className="text-sm text-gray-100 break-words">{outputString}</p>
          )}
        </div>
      </div>

      {/* Execution logs (collapsible) */}
      {result.logs && (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <button
            onClick={() => setLogsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-xs
              text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 transition-colors"
          >
            <span className="font-medium uppercase tracking-wider">Execution Logs</span>
            <ChevronIcon open={logsOpen} />
          </button>
          {logsOpen && (
            <pre className="px-4 pb-4 text-xs text-gray-500 font-mono whitespace-pre-wrap break-words leading-5 bg-gray-950">
              {result.logs}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function formatOutput(output: unknown): string {
  if (output === null || output === undefined) return '(no output)';
  if (typeof output === 'string') {
    try {
      return JSON.stringify(JSON.parse(output), null, 2);
    } catch {
      return output;
    }
  }
  if (typeof output === 'object') {
    return JSON.stringify(output, null, 2);
  }
  return String(output);
}

function isObjectOutput(output: unknown): boolean {
  if (output === null || output === undefined) return false;
  if (typeof output === 'object') return true;
  if (typeof output === 'string') {
    try {
      const parsed = JSON.parse(output);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  }
  return false;
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
