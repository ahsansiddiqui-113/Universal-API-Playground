'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';

type IndentSize = 2 | 4 | 'tab';

function formatJSON(raw: string, indent: IndentSize, sortKeys: boolean, minify: boolean): string {
  const parsed = JSON.parse(raw);
  const sorted = sortKeys ? deepSortKeys(parsed) : parsed;
  if (minify) return JSON.stringify(sorted);
  return JSON.stringify(sorted, null, indent === 'tab' ? '\t' : indent);
}

function deepSortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(deepSortKeys);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as object).sort().reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = deepSortKeys((obj as Record<string, unknown>)[key]);
      return acc;
    }, {});
  }
  return obj;
}

function getStats(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    let keys = 0; let maxDepth = 0;
    function walk(v: unknown, d: number) {
      if (d > maxDepth) maxDepth = d;
      if (Array.isArray(v)) v.forEach(i => walk(i, d + 1));
      else if (v !== null && typeof v === 'object')
        Object.entries(v as object).forEach(([, val]) => { keys++; walk(val, d + 1); });
    }
    walk(parsed, 0);
    const bytes = new TextEncoder().encode(raw).length;
    return { keys, depth: maxDepth, size: bytes < 1024 ? `${bytes}B` : `${(bytes / 1024).toFixed(1)}KB` };
  } catch { return null; }
}

export default function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState<IndentSize>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [minify, setMinify] = useState(false);

  const stats = input.trim() ? getStats(input) : null;

  const run = useCallback(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      setOutput(formatJSON(input, indent, sortKeys, minify));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input, indent, sortKeys, minify]);

  const toggle = (setter: (v: (p: boolean) => boolean) => void) => {
    setter(p => !p);
    setTimeout(run, 0);
  };

  const inputSlot = (
    <textarea
      value={input}
      onChange={e => { setInput(e.target.value); setError(''); }}
      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run(); }}
      placeholder={'{\n  "paste": "your JSON here"\n}'}
      spellCheck={false}
      className="w-full h-full min-h-[500px] bg-transparent text-gray-300 text-sm
                 font-mono p-4 resize-none outline-none placeholder-gray-700 leading-relaxed"
    />
  );

  const outputSlot = (
    <div className="w-full h-full min-h-[500px]">
      {error ? (
        <div className="p-4">
          <div className="flex items-start gap-3 bg-red-950/50 border border-red-800 rounded-xl p-4">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 5v3M8 11h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-red-400 mb-1">Invalid JSON</p>
              <p className="text-xs text-red-400/70 font-mono">{error}</p>
            </div>
          </div>
        </div>
      ) : output ? (
        <pre className="p-4 text-sm font-mono text-emerald-300/80 leading-relaxed whitespace-pre-wrap break-all">
          {output}
        </pre>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-700 text-sm font-mono">
          output appears here
        </div>
      )}
    </div>
  );

  const toolbar = (
    <>
      <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Indent</span>
      {([2, 4, 'tab'] as IndentSize[]).map(v => (
        <button
          key={String(v)}
          onClick={() => { setIndent(v); setTimeout(run, 0); }}
          className={`h-7 px-2.5 text-xs rounded-md font-mono transition-all border
            ${indent === v
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'text-gray-500 border-gray-700 hover:text-gray-300 hover:border-gray-600'}`}
        >
          {v === 'tab' ? 'Tab' : `${v}`}
        </button>
      ))}

      <div className="w-px h-5 bg-gray-800" />

      <Toggle label="Sort keys" value={sortKeys} onChange={() => toggle(setSortKeys)} />
      <Toggle label="Minify" value={minify} onChange={() => toggle(setMinify)} />

      <div className="flex-1" />

      {stats && (
        <div className="flex items-center gap-3 text-[10px] font-mono text-gray-600">
          <span>{stats.keys} keys</span>
          <span>depth {stats.depth}</span>
          <span>{stats.size}</span>
        </div>
      )}
    </>
  );

  return (
    <ToolShell
      title="JSON Formatter"
      description="Format, minify, and sort JSON. Press ⌘↵ to run."
      inputLabel="Raw JSON"
      outputLabel="Formatted Output"
      inputSlot={inputSlot}
      outputSlot={outputSlot}
      outputText={output}
      fileName="output.json"
      onClear={() => { setInput(''); setOutput(''); setError(''); }}
      onRun={run}
      runLabel="Format ↵"
      toolbar={toolbar}
    />
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" onClick={onChange}>
      <div className={`w-7 h-4 rounded-full transition-colors relative
        ${value ? 'bg-indigo-600' : 'bg-gray-700'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all
          ${value ? 'left-3.5' : 'left-0.5'}`} />
      </div>
      <span className="text-[10px] text-gray-500 font-mono">{label}</span>
    </label>
  );
}