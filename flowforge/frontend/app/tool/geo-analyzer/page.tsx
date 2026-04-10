// ══════════════════════════════════════════════════
// geo-analyzer/page.tsx
// ══════════════════════════════════════════════════
'use client';
 
import { useState } from 'react';
import ToolShell from '@/components/tool/ToolShell';
 
interface GeoResult {
  score: number; grade: string; summary: string;
  checks: Record<string, { score: number; notes: string }>;
  recommendations: string[];
}
 
export default function GeoAnalyzerPage() {
  const [input, setInput]   = useState('');
  const [url, setUrl]       = useState('');
  const [result, setResult] = useState<GeoResult | null>(null);
  const [error, setError]   = useState('');
  const [running, setRunning] = useState(false);
 
  async function run() {
    if (!input.trim()) return;
    setRunning(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools/geo-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input, url: url || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? 'Analysis failed');
      setResult(await res.json());
    } catch (e) { setError((e as Error).message); }
    finally { setRunning(false); }
  }
 
  const scoreColor = (s: number) => s >= 75 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400';
  const gradeColor = (g: string) => ({ A:'text-emerald-400', B:'text-blue-400', C:'text-amber-400', D:'text-orange-400', F:'text-red-400' }[g] ?? 'text-gray-400');
 
  const inputSlot = (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yoursite.com/page (optional)"
          className="w-full h-9 px-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm font-mono outline-none focus:border-indigo-500 mb-3" />
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)}
        placeholder="Paste your page content, article, or documentation here to score it for AI citation readiness..."
        spellCheck={false}
        className="flex-1 bg-transparent text-gray-300 text-sm p-4 resize-none outline-none placeholder-gray-600 leading-relaxed min-h-[400px]" />
    </div>
  );
 
  const outputSlot = (
    <div className="p-4 space-y-5 min-h-[400px]">
      {error && <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-xs text-red-400">{error}</div>}
      {result && (
        <>
          <div className="flex items-center gap-4">
            <div className={`text-5xl font-black ${scoreColor(result.score)}`}>{result.score}</div>
            <div>
              <div className={`text-2xl font-bold ${gradeColor(result.grade)}`}>{result.grade}</div>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">{result.summary}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(result.checks).map(([k, v]) => (
              <div key={k} className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/40">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{k.replace(/_/g,' ')}</p>
                  <span className={`text-sm font-bold ${scoreColor(v.score * 4)}`}>{v.score}/25</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{v.notes}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3">Recommendations</p>
            <div className="space-y-2">
              {result.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="text-indigo-400 mt-0.5 flex-shrink-0">→</span>{r}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {!result && !error && !running && (
        <div className="flex items-center justify-center h-full text-gray-700 text-sm font-mono">analysis results appear here</div>
      )}
      {running && (
        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <svg className="w-4 h-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Analyzing with AI…
        </div>
      )}
    </div>
  );
 
  return (
    <ToolShell title="GEO Citation Analyzer" description="Score your content for AI citation readiness and extractability."
      inputLabel="Content" outputLabel="Analysis"
      inputSlot={inputSlot} outputSlot={outputSlot}
      onClear={() => { setInput(''); setUrl(''); setResult(null); setError(''); }}
      onRun={run} runLabel="Analyze ↵" running={running} />
  );
}