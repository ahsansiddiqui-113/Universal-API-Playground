'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import { anonymize } from '../../../lib/tools/log-anonymizer';

type Strategy = 'placeholder' | 'hash' | 'redact';

export default function LogAnonymizerPage() {
  const [input, setInput]       = useState('');
  const [output, setOutput]     = useState('');
  const [counts, setCounts]     = useState<Record<string,number>>({});
  const [strategy, setStrategy] = useState<Strategy>('placeholder');
  const [opts, setOpts] = useState({
    emails: true, ipv4: true, ipv6: true, uuids: true,
    creditCards: true, phones: true, jwts: true,
  });

  function run() {
    if (!input.trim()) { setOutput(''); setCounts({}); return; }
    const { result, counts: c } = anonymize(input, { ...opts, strategy });
    setOutput(result);
    setCounts(c);
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const inputSlot = (
    <textarea value={input} onChange={e => setInput(e.target.value)}
      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run(); }}
      placeholder={"2024-01-15 09:23:11 INFO  User john@example.com (192.168.1.100) logged in\n2024-01-15 09:23:15 DEBUG UUID: 550e8400-e29b-41d4-a716-446655440000\n2024-01-15 09:23:22 INFO  Payment from card 4532015112830366"}
      spellCheck={false}
      className="w-full h-full min-h-[500px] bg-transparent text-gray-300 text-sm font-mono p-4 resize-none outline-none placeholder-gray-700 leading-relaxed" />
  );

  const outputSlot = (
    <div className="flex flex-col h-full">
      {total > 0 && (
        <div className="px-4 pt-4 flex flex-wrap gap-2">
          {Object.entries(counts).filter(([,v])=>v>0).map(([k,v])=>(
            <span key={k} className="text-[10px] font-mono px-2 py-1 rounded-md bg-amber-950/40 border border-amber-800/40 text-amber-400">
              {v} {k}
            </span>
          ))}
          <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-gray-800 text-gray-400">{total} total redacted</span>
        </div>
      )}
      {output
        ? <pre className="flex-1 p-4 text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap overflow-auto">{output}</pre>
        : <div className="flex-1 flex items-center justify-center text-gray-700 text-sm font-mono">anonymized log appears here</div>}
    </div>
  );

  const toolbar = (
    <>
      {(['placeholder','hash','redact'] as Strategy[]).map(s => (
        <button key={s} onClick={() => setStrategy(s)}
          className={`h-7 px-3 text-xs rounded-md font-mono border transition-all
            ${strategy === s ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-500 border-gray-700 hover:text-gray-300'}`}>
          {s}
        </button>
      ))}
      <div className="w-px h-5 bg-gray-800" />
      {(Object.keys(opts) as (keyof typeof opts)[]).map(k => (
        <Toggle key={k} label={k} value={opts[k]}
          onChange={() => setOpts(o => ({ ...o, [k]: !o[k] }))} />
      ))}
    </>
  );

  return (
    <ToolShell title="Log File Anonymizer" description="Replace sensitive data in logs with safe placeholders. Press ⌘↵ to run."
      inputLabel="Raw Log" outputLabel="Anonymized Output"
      inputSlot={inputSlot} outputSlot={outputSlot} outputText={output}
      fileName="anonymized.log"
      onClear={() => { setInput(''); setOutput(''); setCounts({}); }}
      onRun={run} runLabel="Anonymize ↵" toolbar={toolbar} />
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