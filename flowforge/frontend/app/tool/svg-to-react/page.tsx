// ══════════════════════════════════════════════════
// svg-to-react/page.tsx
// ══════════════════════════════════════════════════
'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import { svgToReact } from '../../../lib/tools/svg-to-react';

export default function SvgToReactPage() {
  const [input, setInput]         = useState('');
  const [output, setOutput]       = useState('');
  const [error, setError]         = useState('');
  const [name, setName]           = useState('SvgIcon');
  const [typescript, setTs]       = useState(true);
  const [memo, setMemo]           = useState(false);
  const [responsive, setResponsive] = useState(true);

  function run() {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      setOutput(svgToReact(input, { typescript, componentName: name || 'SvgIcon', memoize: memo, makeResponsive: responsive }));
      setError('');
    } catch (e) { setError((e as Error).message); setOutput(''); }
  }

  const inputSlot = (
    <textarea value={input} onChange={e => { setInput(e.target.value); setError(''); }}
      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run(); }}
      placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <path d="M12 2L2 7l10 5 10-5-10-5z"/>\n</svg>'}
      spellCheck={false}
      className="w-full h-full min-h-[500px] bg-transparent text-gray-300 text-sm font-mono p-4 resize-none outline-none placeholder-gray-700 leading-relaxed" />
  );

  const outputSlot = (
    <div className="w-full h-full min-h-[500px]">
      {error ? <div className="p-4"><div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-xs text-red-400 font-mono">{error}</div></div>
        : output ? <pre className="p-4 text-sm font-mono text-emerald-300/80 leading-relaxed whitespace-pre-wrap">{output}</pre>
        : <div className="flex items-center justify-center h-full text-gray-700 text-sm font-mono">react component appears here</div>}
    </div>
  );

  const toolbar = (
    <>
      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="ComponentName"
        className="h-7 px-2.5 text-xs font-mono bg-gray-800 border border-gray-700 rounded-md text-gray-300 outline-none focus:border-indigo-500 w-36" />
      <div className="w-px h-5 bg-gray-800" />
      <Toggle label="TypeScript" value={typescript} onChange={() => setTs(t => !t)} />
      <Toggle label="React.memo" value={memo}       onChange={() => setMemo(m => !m)} />
      <Toggle label="Responsive" value={responsive} onChange={() => setResponsive(r => !r)} />
    </>
  );

  return (
    <ToolShell title="SVG to React Converter" description="Convert SVG markup to a React TypeScript component. Press ⌘↵ to run."
      inputLabel="SVG Input" outputLabel="React Component"
      inputSlot={inputSlot} outputSlot={outputSlot} outputText={output} fileName={`${name || 'SvgIcon'}.tsx`}
      onClear={() => { setInput(''); setOutput(''); setError(''); }} onRun={run} runLabel="Convert ↵" toolbar={toolbar} />
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