'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

type Mode = 'encode' | 'decode';

export default function Base64EncoderPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const [error, setError] = useState('');

  const run = useCallback(() => {
    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(input)));
        setOutput(decoded);
      }
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input, mode]);

  const tool = getToolMetadata('base64-encoder');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'Base64 Encoder/Decoder' }]} />

        <ToolShell
          title="Base64 Encoder/Decoder"
          description="Encode text to Base64 or decode Base64 strings instantly."
          badge="NEW"
          inputLabel={mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
          outputLabel={mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
          inputSlot={
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 string...'}
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
          fileName={mode === 'encode' ? 'encoded.txt' : 'decoded.txt'}
          onClear={() => {
            setInput('');
            setOutput('');
            setError('');
          }}
          onRun={run}
          runLabel={mode === 'encode' ? 'Encode ↵' : 'Decode ↵'}
          toolbar={
            <div className="flex gap-2">
              <button
                onClick={() => setMode('encode')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  mode === 'encode'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                Encode
              </button>
              <button
                onClick={() => setMode('decode')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  mode === 'decode'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                Decode
              </button>
            </div>
          }
        />
      </div>
    </>
  );
}
