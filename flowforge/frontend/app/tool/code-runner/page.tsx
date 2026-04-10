
'use client';

import { useState, useRef } from 'react';
import ToolShell from  '@/components/tool/ToolShell';

type Lang = 'javascript' | 'python';

const EXAMPLES: Record<Lang, string> = {
  javascript: `// JavaScript ES2024
const nums = [1, 2, 3, 4, 5];
const result = nums
  .filter(n => n % 2 === 0)
  .map(n => n * n);
console.log('Squares of evens:', result);
console.log('Sum:', result.reduce((a, b) => a + b, 0));`,
  python: `# Python 3
nums = [1, 2, 3, 4, 5]
squares = [n**2 for n in nums if n % 2 == 0]
print('Squares of evens:', squares)
print('Sum:', sum(squares))`,
};

export default function CodeRunnerPage() {
  const [lang, setLang]     = useState<Lang>('javascript');
  const [code, setCode]     = useState(EXAMPLES.javascript);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  function runJS(src: string): Promise<string> {
    return new Promise((resolve) => {
      const lines: string[] = [];
      const blob = new Blob([`
        const _log = (...a) => postMessage({ type: 'log', data: a.map(String).join(' ') });
        const console = { log: _log, error: _log, warn: _log, info: _log };
        try { ${src} } catch(e) { postMessage({ type: 'error', data: e.message }); }
        postMessage({ type: 'done' });
      `], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const w = new Worker(url);
      const timer = setTimeout(() => { w.terminate(); resolve(lines.join('\n') + '\n[timeout: 10s exceeded]'); }, 10000);
      w.onmessage = e => {
        if (e.data.type === 'log' || e.data.type === 'error') lines.push(e.data.data);
        if (e.data.type === 'done') { clearTimeout(timer); w.terminate(); URL.revokeObjectURL(url); resolve(lines.join('\n') || '(no output)'); }
      };
    });
  }

  async function run() {
    if (!code.trim()) return;
    setRunning(true);
    setOutput('');
    try {
      if (lang === 'javascript') {
        const result = await runJS(code);
        setOutput(result);
      } else {
        // Python via Pyodide — load dynamically
        setOutput('Loading Python runtime (Pyodide)...');
        const { loadPyodide } = await import('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs' as any);
        const py = await loadPyodide();
        py.setStdout({ batched: (s: string) => setOutput(o => o + s) });
        py.setStderr({ batched: (s: string) => setOutput(o => o + s) });
        setOutput('');
        await py.runPythonAsync(code);
      }
    } catch (e) {
      setOutput(`Error: ${(e as Error).message}`);
    } finally {
      setRunning(false);
    }
  }

  const inputSlot = (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-800">
        {(['javascript','python'] as Lang[]).map(l => (
          <button key={l} onClick={() => { setLang(l); setCode(EXAMPLES[l]); setOutput(''); }}
            className={`px-4 py-2 text-xs font-mono transition-colors
              ${lang === l ? 'text-white border-b border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {l === 'javascript' ? 'JavaScript' : 'Python'}
          </button>
        ))}
      </div>
      <textarea value={code} onChange={e => setCode(e.target.value)}
        spellCheck={false}
        className="flex-1 bg-transparent text-gray-300 text-sm font-mono p-4 resize-none outline-none leading-relaxed min-h-[400px]" />
    </div>
  );

  const outputSlot = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">stdout</span>
        {output && <button onClick={() => setOutput('')} className="text-[10px] text-gray-600 hover:text-gray-400 font-mono">clear</button>}
      </div>
      {output
        ? <pre className="flex-1 p-4 text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap overflow-auto">{output}</pre>
        : <div className="flex-1 flex items-center justify-center text-gray-700 text-sm font-mono">output appears here</div>}
    </div>
  );

  return (
    <ToolShell title="Online Code Runner" description="Run JavaScript or Python in your browser. No server. No data sent."
      inputLabel="Code" outputLabel="Output"
      inputSlot={inputSlot} outputSlot={outputSlot} outputText={output}
      onClear={() => { setCode(EXAMPLES[lang]); setOutput(''); }}
      onRun={run} runLabel={running ? 'Running…' : '▶ Run'} running={running} />
  );
}