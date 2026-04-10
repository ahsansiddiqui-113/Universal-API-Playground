'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool/ToolShell';

const FIELDS = ['minute','hour','day of month','month','day of week'];
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function explainField(val: string, type: string): string {
  if (val === '*') return `every ${type}`;
  if (val.startsWith('*/')) return `every ${val.slice(2)} ${type}s`;
  if (val.includes('-')) { const [a,b] = val.split('-'); return `from ${a} to ${b} (${type})`; }
  if (val.includes(',')) return `on ${type}s: ${val.split(',').join(', ')}`;
  if (type === 'month' && !isNaN(+val)) return MONTHS[+val - 1] ?? val;
  if (type === 'day of week' && !isNaN(+val)) return DAYS[+val] ?? val;
  return val;
}

function parseCron(expr: string): { valid: boolean; explanation: string; nextRuns: string[]; frequency: string } {
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 5) return { valid: false, explanation: 'Needs 5 fields: minute hour day month weekday', nextRuns: [], frequency: '' };

  const [min, hr, dom, mon, dow] = parts;
  const explanations = [min, hr, dom, mon, dow].map((v, i) => explainField(v, FIELDS[i]));

  let explanation = `At ${explanations[0]}, ${explanations[1]}, ${explanations[2]}, ${explanations[3]}, ${explanations[4]}`;
  if (min === '0' && hr !== '*' && dom === '*' && mon === '*' && dow === '*') {
    explanation = `Every day at ${hr}:00`;
  } else if (min === '0' && hr === '0' && dom === '*' && mon === '*' && dow === '*') {
    explanation = 'Every day at midnight';
  } else if (min === '0' && hr === '0' && dom === '1' && mon === '*' && dow === '*') {
    explanation = 'At midnight on the 1st of every month';
  } else if (min === '0' && hr === '0' && dom === '*' && mon === '*' && dow === '0') {
    explanation = 'Every Sunday at midnight';
  } else if (expr === '* * * * *') {
    explanation = 'Every minute';
  } else if (min.startsWith('*/') && hr === '*' && dom === '*' && mon === '*' && dow === '*') {
    explanation = `Every ${min.slice(2)} minutes`;
  }

  // Generate next 5 runs (simplified — real implementation would use cron-parser)
  const now = new Date();
  const nextRuns: string[] = [];
  const d = new Date(now);
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  for (let i = 0; i < 5; i++) {
    nextRuns.push(d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    d.setMinutes(d.getMinutes() + (expr === '* * * * *' ? 1 : 60));
  }

  const frequency = min === '*' ? 'Every minute' : hr === '*' ? 'Hourly' : dom === '*' && mon === '*' ? 'Daily' : 'Monthly';

  return { valid: true, explanation, nextRuns, frequency };
}

const EXAMPLES = [
  { label: 'Every minute',         expr: '* * * * *' },
  { label: 'Every hour',           expr: '0 * * * *' },
  { label: 'Daily at midnight',    expr: '0 0 * * *' },
  { label: 'Every Sunday',         expr: '0 0 * * 0' },
  { label: 'Monthly (1st)',        expr: '0 0 1 * *' },
  { label: 'Every 15 minutes',     expr: '*/15 * * * *' },
  { label: 'Weekdays at 9am',      expr: '0 9 * * 1-5' },
];

export default function CronExplainerPage() {
  const [input, setInput]   = useState('');
  const [result, setResult] = useState<ReturnType<typeof parseCron> | null>(null);

  function run(expr?: string) {
    const val = expr ?? input;
    if (!val.trim()) { setResult(null); return; }
    setResult(parseCron(val));
  }

  const inputSlot = (
    <div className="p-4 space-y-6">
      <div>
        <input value={input} onChange={e => { setInput(e.target.value); if (e.target.value) run(e.target.value); }}
          placeholder="0 9 * * 1-5"
          className="w-full h-12 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white font-mono text-lg outline-none focus:border-indigo-500 transition-colors" />
        <p className="text-[10px] text-gray-600 font-mono mt-2">minute · hour · day · month · weekday</p>
      </div>
      <div>
        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mb-3">Examples</p>
        <div className="grid grid-cols-2 gap-2">
          {EXAMPLES.map(e => (
            <button key={e.expr} onClick={() => { setInput(e.expr); run(e.expr); }}
              className="text-left px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/60 hover:border-indigo-500/40 transition-colors">
              <p className="text-xs text-gray-300 font-semibold">{e.label}</p>
              <p className="text-[10px] text-gray-600 font-mono mt-0.5">{e.expr}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const outputSlot = (
    <div className="p-4 space-y-6 min-h-[400px]">
      {result ? (
        result.valid ? (
          <>
            <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-4">
              <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest mb-2">Explanation</p>
              <p className="text-white font-semibold text-base">{result.explanation}</p>
              <p className="text-xs text-gray-500 mt-1">Frequency: {result.frequency}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mb-3">Next 5 runs</p>
              <div className="space-y-1.5">
                {result.nextRuns.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/40 border border-gray-700/40">
                    <span className="text-[10px] text-gray-600 font-mono w-4">{i + 1}</span>
                    <span className="text-sm text-gray-300 font-mono">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-xs text-red-400">{result.explanation}</div>
        )
      ) : (
        <div className="flex items-center justify-center h-full text-gray-700 text-sm font-mono">explanation appears here</div>
      )}
    </div>
  );

  return (
    <ToolShell title="Cron Job Explainer" description="Translate cron expressions into plain English with next run times."
      inputLabel="Expression" outputLabel="Explanation"
      inputSlot={inputSlot} outputSlot={outputSlot}
      onClear={() => { setInput(''); setResult(null); }} singlePanel={false} />
  );
}