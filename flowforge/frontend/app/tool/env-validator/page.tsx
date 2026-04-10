'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool/ToolShell';

interface DiffResult {
  missing: string[];
  extra: string[];
  duplicates: string[];
  valid: string[];
}

function parseEnvKeys(text: string): string[] {
  return text.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('=')[0].trim())
    .filter(Boolean);
}

function diffEnv(envText: string, templateText: string): DiffResult {
  const envKeys      = parseEnvKeys(envText);
  const templateKeys = parseEnvKeys(templateText);
  const envSet       = new Set(envKeys);
  const templateSet  = new Set(templateKeys);
  const seen         = new Set<string>();
  const duplicates: string[] = [];

  envKeys.forEach(k => { if (seen.has(k)) duplicates.push(k); else seen.add(k); });

  return {
    missing:    templateKeys.filter(k => !envSet.has(k)),
    extra:      envKeys.filter(k => !templateSet.has(k)),
    duplicates,
    valid:      envKeys.filter(k => templateSet.has(k) && !duplicates.includes(k)),
  };
}

export default function EnvValidatorPage() {
  const [envText, setEnvText]      = useState('');
  const [templateText, setTemplate] = useState('');
  const [result, setResult]        = useState<DiffResult | null>(null);

  function run() {
    if (!envText.trim() && !templateText.trim()) return;
    setResult(diffEnv(envText, templateText));
  }

  const score = result
    ? Math.round((result.valid.length / Math.max(parseEnvKeys(templateText).length, 1)) * 100)
    : null;

  const inputSlot = (
    <div className="grid grid-cols-2 divide-x divide-gray-800 h-full">
      <div className="flex flex-col">
        <div className="px-4 py-2 border-b border-gray-800">
          <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">.env file</span>
        </div>
        <textarea
          value={envText}
          onChange={e => setEnvText(e.target.value)}
          placeholder={"DATABASE_URL=postgres://...\nAPI_KEY=abc123\nPORT=3000"}
          spellCheck={false}
          className="flex-1 bg-transparent text-gray-300 text-sm font-mono p-4 resize-none outline-none placeholder-gray-700 leading-relaxed"
        />
      </div>
      <div className="flex flex-col">
        <div className="px-4 py-2 border-b border-gray-800">
          <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">.env.example template</span>
        </div>
        <textarea
          value={templateText}
          onChange={e => setTemplate(e.target.value)}
          placeholder={"DATABASE_URL=\nAPI_KEY=\nPORT=\nJWT_SECRET="}
          spellCheck={false}
          className="flex-1 bg-transparent text-gray-300 text-sm font-mono p-4 resize-none outline-none placeholder-gray-700 leading-relaxed"
        />
      </div>
    </div>
  );

  const outputSlot = (
    <div className="p-4 space-y-4 min-h-[400px]">
      {result ? (
        <>
          {score !== null && (
            <div className="flex items-center gap-3 mb-4">
              <div className={`text-2xl font-bold ${score === 100 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                {score}%
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {score === 100 ? 'All keys present' : score >= 70 ? 'Almost complete' : 'Missing keys'}
                </p>
                <p className="text-xs text-gray-500">{result.valid.length} of {parseEnvKeys(templateText).length} required keys found</p>
              </div>
            </div>
          )}
          <ResultSection title="Missing" items={result.missing} color="red" icon="✕" />
          <ResultSection title="Extra (not in template)" items={result.extra} color="amber" icon="?" />
          <ResultSection title="Duplicates" items={result.duplicates} color="orange" icon="!" />
          <ResultSection title="Valid" items={result.valid} color="emerald" icon="✓" />
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-700 text-sm font-mono">
          validation results appear here
        </div>
      )}
    </div>
  );

  return (
    <ToolShell
      title="Environment File Validator"
      description="Paste your .env and .env.example to find missing or extra keys."
      inputLabel="Files"
      outputLabel="Results"
      inputSlot={inputSlot}
      outputSlot={outputSlot}
      onClear={() => { setEnvText(''); setTemplate(''); setResult(null); }}
      onRun={run}
      runLabel="Validate ↵"
    />
  );
}

function ResultSection({ title, items, color, icon }: { title: string; items: string[]; color: string; icon: string }) {
  if (!items.length) return null;
  const colors: Record<string, string> = {
    red:     'bg-red-950/40 border-red-800/60 text-red-400',
    amber:   'bg-amber-950/40 border-amber-800/60 text-amber-400',
    orange:  'bg-orange-950/40 border-orange-800/60 text-orange-400',
    emerald: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400',
  };
  return (
    <div>
      <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">{title} ({items.length})</p>
      <div className="space-y-1">
        {items.map(k => (
          <div key={k} className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-mono ${colors[color]}`}>
            <span className="opacity-60">{icon}</span>{k}
          </div>
        ))}
      </div>
    </div>
  );
}