// ══════════════════════════════════════════════════
// curl-converter/page.tsx
// ══════════════════════════════════════════════════
'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import { convertCurl } from '../../../lib/tools/curl-parser';

type Format = 'fetch' | 'axios' | 'xhr';

export default function CurlConverterPage() {
  const [input, setInput]       = useState('');
  const [output, setOutput]     = useState('');
  const [error, setError]       = useState('');
  const [format, setFormat]     = useState<Format>('fetch');
  const [typescript, setTs]     = useState(true);
  const [errors, setErrors]     = useState(true);

  function run() {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      setOutput(convertCurl(input, { format, typescript, includeErrorHandling: errors }));
      setError('');
    } catch (e) { setError((e as Error).message); setOutput(''); }
  }

  const inputSlot = (
    <textarea value={input} onChange={e => { setInput(e.target.value); setError(''); }}
      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run(); }}
      placeholder={"curl -X POST https://api.example.com/users \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"name\": \"John\"}'"}
      spellCheck={false}
      className="w-full h-full min-h-[500px] bg-transparent text-gray-300 text-sm font-mono p-4 resize-none outline-none placeholder-gray-700 leading-relaxed" />
  );

  const outputSlot = (
    <div className="w-full h-full min-h-[500px]">
      {error ? <div className="p-4"><div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-xs text-red-400 font-mono">{error}</div></div>
        : output ? <pre className="p-4 text-sm font-mono text-emerald-300/80 leading-relaxed whitespace-pre-wrap">{output}</pre>
        : <div className="flex items-center justify-center h-full text-gray-700 text-sm font-mono">converted code appears here</div>}
    </div>
  );

  const toolbar = (
    <>
      {(['fetch','axios','xhr'] as Format[]).map(f => (
        <button key={f} onClick={() => setFormat(f)}
          className={`h-7 px-3 text-xs rounded-md font-mono border transition-all
            ${format === f ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-500 border-gray-700 hover:text-gray-300'}`}>
          {f === 'xhr' ? 'XHR' : f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
      <div className="w-px h-5 bg-gray-800" />
      <Toggle label="TypeScript"      value={typescript} onChange={() => setTs(t => !t)} />
      <Toggle label="Error handling"  value={errors}     onChange={() => setErrors(e => !e)} />
    </>
  );

  return (
    <ToolShell title="Curl to Fetch / Axios" description="Convert curl commands to modern JS/TS code. Press ⌘↵ to run."
      inputLabel="Curl Command" outputLabel="Generated Code"
      inputSlot={inputSlot} outputSlot={outputSlot} outputText={output}
      fileName={`request.${typescript ? 'ts' : 'js'}`}
      onClear={() => { setInput(''); setOutput(''); setError(''); }}
      onRun={run} runLabel="Convert ↵" toolbar={toolbar} />
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" onClick={onChange}>
      <div className={`w-7 h-4 rounded-full transition-colors relative ${value ? 'bg-indigo-600' : 'bg-gray-700'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${value ? 'left-3.5' : 'left-0.5'}`} />
      </div>
      <span className="text-[10px] text-gray-500 font-mono">{label}</span>
    </label>
  );
}