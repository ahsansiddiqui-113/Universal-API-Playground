'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
  const [text, setText] = useState('test@example.com\ninvalid.email\nanother@test.org');
  const [flags, setFlags] = useState('g');
  const [error, setError] = useState('');
  const [matches, setMatches] = useState<Array<{match: string; index: number; groups: string[]}>>([]);

  const run = useCallback(() => {
    try {
      const regex = new RegExp(pattern, flags);
      const matchArray = [];
      let match;

      // For global flag
      if (flags.includes('g')) {
        while ((match = regex.exec(text)) !== null) {
          matchArray.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      } else {
        match = regex.exec(text);
        if (match) {
          matchArray.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      setMatches(matchArray);
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setMatches([]);
    }
  }, [pattern, text, flags]);

  const tool = getToolMetadata('regex-tester');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'Regex Tester' }]} />

        <ToolShell
          title="Regular Expression Tester"
          description="Test regex patterns against sample text with live matching and capture groups."
          badge="NEW"
          inputLabel="Pattern & Text"
          outputLabel="Matches"
          inputSlot={
            <div className="space-y-4 p-4 bg-gray-950 h-64 overflow-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Pattern
                </label>
                <input
                  type="text"
                  value={pattern}
                  onChange={e => setPattern(e.target.value)}
                  placeholder="/pattern/"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm font-mono text-gray-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Flags
                </label>
                <div className="flex gap-2">
                  {['g', 'i', 'm', 's'].map(flag => (
                    <label key={flag} className="flex items-center gap-2 text-sm text-gray-400">
                      <input
                        type="checkbox"
                        checked={flags.includes(flag)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFlags(flags + flag);
                          } else {
                            setFlags(flags.replace(flag, ''));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      {flag === 'g' && 'Global'}
                      {flag === 'i' && 'Case-insensitive'}
                      {flag === 'm' && 'Multiline'}
                      {flag === 's' && 'Dotall'}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Test Text
                </label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Enter text to test..."
                  className="w-full h-32 px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm font-mono text-gray-300 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          }
          outputSlot={
            error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-auto">
                {matches.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-sm">No matches found</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 mb-3">Found {matches.length} match(es)</p>
                    {matches.map((m, i) => (
                      <div key={i} className="p-3 bg-gray-900 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Match #{i + 1}</p>
                        <code className="text-sm font-mono text-indigo-300">{m.match}</code>
                        {m.groups.length > 0 && (
                          <div className="mt-2 text-xs">
                            {m.groups.map((g, gi) => (
                              <p key={gi} className="text-gray-400">
                                Group {gi + 1}: <span className="text-emerald-400">{g}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )
          }
          singlePanel
          onClear={() => {
            setPattern('');
            setText('');
            setMatches([]);
            setError('');
          }}
          onRun={run}
          runLabel="Test ↵"
        />
      </div>
    </>
  );
}
