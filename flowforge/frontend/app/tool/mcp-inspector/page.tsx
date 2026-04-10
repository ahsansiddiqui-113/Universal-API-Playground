'use client';
 
import { useState } from 'react';
import ToolShell from '@/components/tool/ToolShell';
 
interface McpResult {
  valid: boolean; tool_count: number; issues: string[];
  checks: Record<string, { pass: boolean; notes: string }>;
  blueprint: string; recommendations: string[];
}
 
export default function McpInspectorPage() {
  const [input, setInput]   = useState('');
  const [result, setResult] = useState<McpResult | null>(null);
  const [error, setError]   = useState('');
  const [running, setRunning] = useState(false);
 
  async function run() {
    if (!input.trim()) return;
    setRunning(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools/mcp-inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snippet: input }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? 'Inspection failed');
      setResult(await res.json());
    } catch (e) { setError((e as Error).message); }
    finally { setRunning(false); }
  }
 
  const inputSlot = (
    <textarea value={input} onChange={e => setInput(e.target.value)}
      placeholder={'{\n  "jsonrpc": "2.0",\n  "method": "tools/list",\n  "params": {},\n  "id": 1\n}'}
      spellCheck={false}
      className="w-full h-full min-h-[500px] bg-transparent text-gray-300 text-sm font-mono p-4 resize-none outline-none placeholder-gray-700 leading-relaxed" />
  );
 
  const outputSlot = (
    <div className="p-4 space-y-5 min-h-[400px]">
      {error && <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-xs text-red-400">{error}</div>}
      {result && (
        <>
          <div className="flex items-center gap-3">
            <div className={`text-sm font-semibold px-3 py-1 rounded-full border ${result.valid ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' : 'bg-red-950/40 border-red-800/60 text-red-400'}`}>
              {result.valid ? '✓ Valid' : '✕ Invalid'}
            </div>
            <span className="text-xs text-gray-500">{result.tool_count} tools detected</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(result.checks).map(([k, v]) => (
              <div key={k} className={`rounded-xl p-3 border ${v.pass ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-red-950/20 border-red-800/30'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={v.pass ? 'text-emerald-400' : 'text-red-400'}>{v.pass ? '✓' : '✕'}</span>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{k.replace(/_/g,' ')}</p>
                </div>
                <p className="text-xs text-gray-400">{v.notes}</p>
              </div>
            ))}
          </div>
          {result.blueprint && (
            <div>
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">Blueprint</p>
              <pre className="text-xs font-mono text-emerald-300/70 bg-gray-800/40 rounded-xl p-3 whitespace-pre-wrap">{result.blueprint}</pre>
            </div>
          )}
          {result.recommendations.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3">Recommendations</p>
              {result.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-300 mb-2">
                  <span className="text-indigo-400 flex-shrink-0 mt-0.5">→</span>{r}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {!result && !error && !running && (
        <div className="flex items-center justify-center h-full text-gray-700 text-sm font-mono">inspection results appear here</div>
      )}
      {running && (
        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <svg className="w-4 h-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Inspecting with AI…
        </div>
      )}
    </div>
  );
 
  return (
    <ToolShell title="MCP Live Inspector" description="Validate MCP server snippets for tool discovery and schema coverage."
      inputLabel="MCP Snippet" outputLabel="Diagnostics"
      inputSlot={inputSlot} outputSlot={outputSlot}
      onClear={() => { setInput(''); setResult(null); setError(''); }}
      onRun={run} runLabel="Inspect ↵" running={running} />
  );
}