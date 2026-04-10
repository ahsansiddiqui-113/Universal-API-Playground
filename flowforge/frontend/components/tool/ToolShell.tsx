'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import CopyButton from './CopyButton';

interface ToolShellProps {
  title: string;
  description: string;
  badge?: string;
  inputLabel?: string;
  outputLabel?: string;
  inputSlot: ReactNode;
  outputSlot: ReactNode;
  outputText?: string;
  fileName?: string;
  onClear?: () => void;
  onRun?: () => void;
  runLabel?: string;
  running?: boolean;
  toolbar?: ReactNode;
  footerSlot?: ReactNode;
  singlePanel?: boolean;
}

export default function ToolShell({
  title,
  description,
  badge,
  inputLabel = 'Input',
  outputLabel = 'Output',
  inputSlot,
  outputSlot,
  outputText,
  fileName = 'output.txt',
  onClear,
  onRun,
  runLabel = 'Convert',
  running = false,
  toolbar,
  footerSlot,
  singlePanel = false,
}: ToolShellProps) {

  function handleDownload() {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 h-14 flex items-center justify-between gap-4">

          {/* Left: back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/tool"
              className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
              title="Back to tools"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {badge && (
                  <span className="text-[9px] font-semibold tracking-widest uppercase
                                   bg-indigo-500/10 border border-indigo-500/20 text-indigo-400
                                   px-2 py-0.5 rounded-full flex-shrink-0">
                    {badge}
                  </span>
                )}
                <span className="font-semibold text-white text-sm truncate">{title}</span>
              </div>
              <p className="text-xs text-gray-500 truncate hidden sm:block">{description}</p>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onClear && (
              <button
                onClick={onClear}
                className="h-8 px-3 text-xs font-medium rounded-lg border border-gray-700
                           text-gray-400 hover:text-white hover:border-gray-600 transition-all"
              >
                Clear
              </button>
            )}
            {outputText && (
              <button
                onClick={handleDownload}
                className="h-8 px-3 text-xs font-medium rounded-lg border border-gray-700
                           text-gray-400 hover:text-white hover:border-gray-600 transition-all"
              >
                Download
              </button>
            )}
            {outputText && <CopyButton text={outputText} />}
            {onRun && (
              <button
                onClick={onRun}
                disabled={running}
                className="h-8 px-4 text-xs font-semibold rounded-lg
                           bg-indigo-600 hover:bg-indigo-500 text-white
                           disabled:opacity-40 disabled:cursor-not-allowed
                           active:scale-[0.97] transition-all shadow-lg shadow-indigo-500/20"
              >
                {running ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                              stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Running…
                  </span>
                ) : runLabel}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Options toolbar ─────────────────────────────────────── */}
      {toolbar && (
        <div className="border-b border-gray-800 bg-gray-900/40 px-4 py-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            {toolbar}
          </div>
        </div>
      )}

      {/* ── Panels ─────────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden">
        <div className={`flex-1 grid ${singlePanel ? 'grid-cols-1' : 'grid-cols-2'} divide-x divide-gray-800 overflow-hidden`}>

          {/* Input */}
          <div className="flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-800 bg-gray-900/30">
              <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                {inputLabel}
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              {inputSlot}
            </div>
          </div>

          {/* Output */}
          {!singlePanel && (
            <div className="flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-800 bg-gray-900/30 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                  {outputLabel}
                </span>
                {outputText && <CopyButton text={outputText} size="sm" />}
              </div>
              <div className="flex-1 overflow-auto">
                {outputSlot}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer options ──────────────────────────────────────── */}
      {footerSlot && (
        <footer className="border-t border-gray-800 bg-gray-900/40 px-4 py-2.5">
          <div className="flex items-center gap-4 flex-wrap">
            {footerSlot}
          </div>
        </footer>
      )}
    </div>
  );
}