'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import { jsonToZod } from '../../../lib/tools/json-to-zod';

export default function JsonToZodPage() {
  const [input, setInput]         = useState('');
  const [output, setOutput]       = useState('');
  const [error, setError]         = useState('');
  const [strict, setStrict]       = useState(false);
  const [optional, setOptional]   = useState(false);
  const [infer, setInfer]         = useState(true);

  function run() {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      setOutput(jsonToZod(input, { strict, makeOptional: optional, inferSpecialTypes: infer }));
      setError('');
    } catch (e) { setError((e as Error).message); setOutput(''); }
  }

  const inputSlot = (
    <textarea
      value={input}
      onChange={e => { setInput(e.target.value); setError(''); }}
      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run(); }}
      placeholder={'{\n  "id": "550e8400-e29b-41d4-a716",\n  "email": "user@example.com",\n  "age": 25\n}'}
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
            <p className="text-xs font-semibold text-red-400">Invalid JSON — {error}</p>
          </div>
        </div>
      ) : output ? (
        <pre className="p-4 text-sm font-mono text-emerald-300/80 leading-relaxed whitespace-pre-wrap">{output}</pre>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-700 text-sm font-mono">
          zod schema appears here
        </div>
      )}
    </div>
  );

  const toolbar = (
    <>
      <Toggle label="Strict mode"      value={strict}   onChange={() => setStrict(s => !s)} />
      <Toggle label="All optional"     value={optional} onChange={() => setOptional(o => !o)} />
      <Toggle label="Infer types"      value={infer}    onChange={() => setInfer(i => !i)} />
    </>
  );

  return (
    <ToolShell
      title="JSON to Zod Schema"
      description="Convert JSON to TypeScript Zod validation schemas. Press ⌘↵ to run."
      inputLabel="JSON Input"
      outputLabel="Zod Schema"
      inputSlot={inputSlot}
      outputSlot={outputSlot}
      outputText={output}
      fileName="schema.ts"
      onClear={() => { setInput(''); setOutput(''); setError(''); }}
      onRun={run}
      runLabel="Convert ↵"
      toolbar={toolbar}
    />
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