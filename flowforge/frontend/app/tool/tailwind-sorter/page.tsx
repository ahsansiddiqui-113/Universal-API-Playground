'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import { sortTailwindClasses, extractClasses, TAILWIND_ORDER } from '../../../lib/tools/tailwind-order';

function processInput(raw: string, removeDupes: boolean): { sorted: string; stats: Record<string, number> } {
  const classes = extractClasses(raw);
  const unique = removeDupes ? [...new Set(classes)] : classes;
  const sorted = sortTailwindClasses(unique);

  const categories: Record<string, number> = {
    Layout: 0, Spacing: 0, Sizing: 0, Typography: 0,
    Background: 0, Border: 0, Effects: 0, Transition: 0, Other: 0,
  };

  const categoryMap: [string, string[]][] = [
    ['Layout',     ['flex','grid','block','hidden','absolute','relative','fixed','sticky','overflow','z-','col-','row-','gap-','justify-','items-','self-','place-','float-','clear-','object-','order-']],
    ['Spacing',    ['p-','px-','py-','pt-','pr-','pb-','pl-','m-','mx-','my-','mt-','mr-','mb-','ml-','space-']],
    ['Sizing',     ['w-','h-','min-w','max-w','min-h','max-h']],
    ['Typography', ['text-','font-','tracking-','leading-','uppercase','lowercase','capitalize','truncate','underline','italic','antialiased','whitespace-','break-']],
    ['Background', ['bg-','from-','via-','to-','bg-clip-','bg-gradient-']],
    ['Border',     ['border','rounded','ring','divide','outline']],
    ['Effects',    ['shadow','opacity','blur','brightness','contrast','grayscale','backdrop-','mix-blend']],
    ['Transition', ['transition','duration','ease','delay','animate','scale','rotate','translate','skew']],
  ];

  sorted.forEach(cls => {
    const base = cls.replace(/^[a-z-]+:/, '');
    let matched = false;
    for (const [cat, prefixes] of categoryMap) {
      if (prefixes.some(p => base.startsWith(p) || base === p.replace('-', ''))) {
        categories[cat]++;
        matched = true;
        break;
      }
    }
    if (!matched) categories['Other']++;
  });

  return { sorted: sorted.join(' '), stats: categories };
}

export default function TailwindSorterPage() {
  const [input, setInput]           = useState('');
  const [output, setOutput]         = useState('');
  const [removeDupes, setRemoveDupes] = useState(true);
  const [stats, setStats]           = useState<Record<string, number>>({});

  function run() {
    if (!input.trim()) { setOutput(''); setStats({}); return; }
    const { sorted, stats: s } = processInput(input, removeDupes);
    setOutput(sorted);
    setStats(s);
  }

  const inputCount = extractClasses(input).length;
  const outputCount = extractClasses(output).length;

  const inputSlot = (
    <textarea
      value={input}
      onChange={e => { setInput(e.target.value); }}
      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run(); }}
      placeholder="flex bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 font-semibold items-center gap-2 justify-center"
      spellCheck={false}
      className="w-full h-full min-h-[500px] bg-transparent text-gray-300 text-sm
                 font-mono p-4 resize-none outline-none placeholder-gray-700 leading-relaxed"
    />
  );

  const outputSlot = (
    <div className="w-full h-full min-h-[500px]">
      {output ? (
        <div className="p-4 space-y-4">
          <pre className="text-sm font-mono text-emerald-300/80 leading-relaxed whitespace-pre-wrap break-all">{output}</pre>
          {Object.keys(stats).length > 0 && (
            <div className="border-t border-gray-800 pt-4">
              <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mb-3">Category breakdown</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(stats).filter(([,v]) => v > 0).map(([k, v]) => (
                  <div key={k} className="bg-gray-800/50 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-gray-500 font-mono">{k}</p>
                    <p className="text-sm font-semibold text-white">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-700 text-sm font-mono">
          sorted classes appear here
        </div>
      )}
    </div>
  );

  const toolbar = (
    <>
      <Toggle label="Remove duplicates" value={removeDupes} onChange={() => setRemoveDupes(d => !d)} />
      <div className="flex-1" />
      {inputCount > 0 && (
        <div className="flex items-center gap-3 text-[10px] font-mono text-gray-600">
          <span>{inputCount} in</span>
          {output && <span>→ {outputCount} out</span>}
          {removeDupes && inputCount > outputCount && (
            <span className="text-amber-500/70">{inputCount - outputCount} dupes removed</span>
          )}
        </div>
      )}
    </>
  );

  return (
    <ToolShell
      title="Tailwind CSS Class Sorter"
      description="Sort classes by official recommended order. Press ⌘↵ to run."
      inputLabel="Unsorted Classes"
      outputLabel="Sorted Output"
      inputSlot={inputSlot}
      outputSlot={outputSlot}
      outputText={output}
      fileName="sorted-classes.txt"
      onClear={() => { setInput(''); setOutput(''); setStats({}); }}
      onRun={run}
      runLabel="Sort ↵"
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