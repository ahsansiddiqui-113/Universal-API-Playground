'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

function formatSQL(sql: string, indent = 0): string {
  const keywords = /\b(SELECT|FROM|WHERE|AND|OR|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|ORDER|BY|HAVING|LIMIT|OFFSET|INSERT|UPDATE|DELETE|CREATE|TABLE|ALTER|DROP)\b/gi;

  let formatted = sql.replace(keywords, (match) => '\n' + match.toUpperCase());
  formatted = formatted.replace(/,/g, ',\n  ');
  formatted = formatted.replace(/\(\s*/g, '(\n  ');
  formatted = formatted.replace(/\s*\)/g, '\n)');

  return formatted.split('\n').map(line => line.trim()).filter(Boolean).join('\n');
}

export default function SQLFormatterPage() {
  const [input, setInput] = useState('SELECT id, name, email FROM users WHERE status=\'active\' AND created_at > \'2024-01-01\' ORDER BY created_at DESC LIMIT 10;');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'format' | 'minify'>('format');

  const run = useCallback(() => {
    try {
      if (mode === 'format') {
        setOutput(formatSQL(input));
      } else {
        setOutput(input.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ').trim());
      }
    } catch (e) {
      setOutput('Error: ' + (e as Error).message);
    }
  }, [input, mode]);

  const tool = getToolMetadata('sql-formatter');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'SQL Formatter' }]} />

        <ToolShell
          title="SQL Formatter"
          description="Format and minify SQL queries with proper indentation."
          badge="NEW"
          inputLabel="SQL Query"
          outputLabel="Formatted Output"
          inputSlot={
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste SQL query..."
              className="w-full h-64 bg-transparent text-gray-300 text-sm font-mono p-4 outline-none resize-none"
            />
          }
          outputSlot={
            <pre className="text-sm font-mono text-gray-300 break-words whitespace-pre-wrap">{output}</pre>
          }
          outputText={output}
          fileName="query.sql"
          onClear={() => {
            setInput('');
            setOutput('');
          }}
          onRun={run}
          runLabel="Format ↵"
          toolbar={
            <div className="flex gap-2">
              <button
                onClick={() => setMode('format')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  mode === 'format'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                Format
              </button>
              <button
                onClick={() => setMode('minify')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  mode === 'minify'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                Minify
              </button>
            </div>
          }
        />
      </div>
    </>
  );
}
