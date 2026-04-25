'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

// Simple YAML parser (handles basic cases)
function parseYAML(yaml: string): any {
  const lines = yaml.split('\n');
  const result: any = {};

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
    if (match) {
      const key = match[2].trim();
      const value = match[3].trim();
      result[key] = value === 'true' ? true : value === 'false' ? false : value === 'null' ? null : value;
    }
  }

  return result;
}

// Simple YAML stringify
function stringifyYAML(obj: any): string {
  if (typeof obj !== 'object' || obj === null) return String(obj);
  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      lines.push(`${key}:`);
      for (const [k, v] of Object.entries(value as any)) {
        lines.push(`  ${k}: ${v}`);
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  return lines.join('\n');
}

export default function YamlJsonConverterPage() {
  const [input, setInput] = useState('name: John Doe\nage: 30\nemail: john@example.com');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'yaml-to-json' | 'json-to-yaml'>('yaml-to-json');
  const [error, setError] = useState('');

  const run = useCallback(() => {
    try {
      if (mode === 'yaml-to-json') {
        const obj = parseYAML(input);
        setOutput(JSON.stringify(obj, null, 2));
      } else {
        const obj = JSON.parse(input);
        setOutput(stringifyYAML(obj));
      }
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input, mode]);

  const tool = getToolMetadata('yaml-json-converter');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'YAML ↔ JSON Converter' }]} />

        <ToolShell
          title="YAML to JSON Converter"
          description="Convert between YAML and JSON formats instantly."
          badge="NEW"
          inputLabel={mode === 'yaml-to-json' ? 'YAML Input' : 'JSON Input'}
          outputLabel={mode === 'yaml-to-json' ? 'JSON Output' : 'YAML Output'}
          inputSlot={
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste YAML or JSON..."
              className="w-full h-64 bg-transparent text-gray-300 text-sm font-mono p-4 outline-none resize-none"
            />
          }
          outputSlot={
            error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            ) : (
              <pre className="text-sm font-mono text-gray-300 break-words whitespace-pre-wrap">{output}</pre>
            )
          }
          outputText={output}
          fileName={mode === 'yaml-to-json' ? 'output.json' : 'output.yaml'}
          onClear={() => {
            setInput('');
            setOutput('');
            setError('');
          }}
          onRun={run}
          runLabel="Convert ↵"
          toolbar={
            <div className="flex gap-2">
              <button
                onClick={() => setMode('yaml-to-json')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  mode === 'yaml-to-json'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                YAML → JSON
              </button>
              <button
                onClick={() => setMode('json-to-yaml')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  mode === 'json-to-yaml'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                JSON → YAML
              </button>
            </div>
          }
        />
      </div>
    </>
  );
}
