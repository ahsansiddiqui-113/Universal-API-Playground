'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

function formatXml(xml: string, indent = 0): string {
  let formatted = '';
  let indentStr = '  '.repeat(indent);

  xml = xml.replace(/></g, '>\n<');
  const lines = xml.split('\n');

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('<?')) {
      formatted += indentStr + line + '\n';
    } else if (line.startsWith('</')) {
      indentStr = '  '.repeat(Math.max(0, indent - 1));
      formatted += indentStr + line + '\n';
      indent--;
    } else if (line.startsWith('<') && !line.endsWith('/>')) {
      formatted += indentStr + line + '\n';
      if (!line.endsWith('</')) indent++;
    } else {
      formatted += indentStr + line + '\n';
    }
  }

  return formatted;
}

export default function XMLValidatorPage() {
  const [input, setInput] = useState('<?xml version="1.0"?>\n<root>\n  <item>Value</item>\n</root>');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'format' | 'minify' | 'validate'>('format');

  const run = useCallback(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/xml');

      if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid XML: ' + doc.getElementsByTagName('parsererror')[0].textContent);
      }

      if (mode === 'format') {
        setOutput(formatXml(input));
        setError('');
      } else if (mode === 'minify') {
        setOutput(input.replace(/>\s+</g, '><'));
        setError('');
      } else {
        setOutput('✓ Valid XML\n' + input.substring(0, 100) + '...');
        setError('');
      }
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input, mode]);

  const tool = getToolMetadata('xml-validator');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'XML Validator' }]} />

        <ToolShell
          title="XML Validator & Formatter"
          description="Validate, format, and minify XML with error detection."
          badge="NEW"
          inputLabel="XML Input"
          outputLabel="Output"
          inputSlot={
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste XML here..."
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
          fileName="output.xml"
          onClear={() => {
            setInput('');
            setOutput('');
            setError('');
          }}
          onRun={run}
          runLabel="Process ↵"
          toolbar={
            <div className="flex gap-2">
              {(['format', 'minify', 'validate'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    mode === m
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          }
        />
      </div>
    </>
  );
}
