'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

function csvToJson(csv: string): string {
  const lines = csv.trim().split('\n');
  if (lines.length === 0) return '[]';

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const values = lines[i].split(',').map(v => v.trim());

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] || '';
    }

    data.push(obj);
  }

  return JSON.stringify(data, null, 2);
}

function jsonToCsv(json: string): string {
  const data = JSON.parse(json);
  if (!Array.isArray(data)) throw new Error('JSON must be an array');

  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csv = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(h => String(row[h] || ''));
    csv.push(values.join(','));
  }

  return csv.join('\n');
}

export default function CsvJsonConverterPage() {
  const [input, setInput] = useState('name,age,email\nJohn,30,john@example.com\nJane,25,jane@example.com');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json');
  const [error, setError] = useState('');

  const run = useCallback(() => {
    try {
      if (mode === 'csv-to-json') {
        setOutput(csvToJson(input));
      } else {
        setOutput(jsonToCsv(input));
      }
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input, mode]);

  const tool = getToolMetadata('csv-json-converter');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'CSV ↔ JSON Converter' }]} />

        <ToolShell
          title="CSV to JSON Converter"
          description="Convert CSV data to JSON format and vice versa."
          badge="NEW"
          inputLabel={mode === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}
          outputLabel={mode === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}
          inputSlot={
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste CSV or JSON..."
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
          fileName={mode === 'csv-to-json' ? 'output.json' : 'output.csv'}
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
                onClick={() => setMode('csv-to-json')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  mode === 'csv-to-json'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                CSV → JSON
              </button>
              <button
                onClick={() => setMode('json-to-csv')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  mode === 'json-to-csv'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                JSON → CSV
              </button>
            </div>
          }
        />
      </div>
    </>
  );
}
