'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

export default function TimestampConverterPage() {
  const [unix, setUnix] = useState(Math.floor(Date.now() / 1000).toString());
  const [iso, setIso] = useState(new Date().toISOString());
  const [output, setOutput] = useState('');

  const convertFromUnix = useCallback((value: string) => {
    try {
      const num = parseInt(value);
      const date = new Date(num * 1000);
      setUnix(value);
      setIso(date.toISOString());
      setOutput(`
Unix Timestamp: ${num}
ISO 8601: ${date.toISOString()}
Human Readable: ${date.toString()}
Timezone: ${date.toString().split('GMT')[1]}
      `.trim());
    } catch (e) {
      setOutput('Invalid timestamp');
    }
  }, []);

  const convertFromISO = useCallback((value: string) => {
    try {
      const date = new Date(value);
      const unix = Math.floor(date.getTime() / 1000);
      setIso(value);
      setUnix(unix.toString());
      setOutput(`
Unix Timestamp: ${unix}
ISO 8601: ${date.toISOString()}
Human Readable: ${date.toString()}
Timezone: ${date.toString().split('GMT')[1]}
      `.trim());
    } catch (e) {
      setOutput('Invalid date');
    }
  }, []);

  const getNow = useCallback(() => {
    const now = new Date();
    const unixNow = Math.floor(now.getTime() / 1000);
    setUnix(unixNow.toString());
    setIso(now.toISOString());
    convertFromUnix(unixNow.toString());
  }, [convertFromUnix]);

  const tool = getToolMetadata('timestamp-converter');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'Timestamp Converter' }]} />

        <ToolShell
          title="Unix Timestamp Converter"
          description="Convert Unix timestamps to ISO 8601 and human-readable dates."
          badge="NEW"
          inputLabel="Inputs"
          outputLabel="Output"
          inputSlot={
            <div className="space-y-4 p-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Unix Timestamp
                </label>
                <input
                  type="text"
                  value={unix}
                  onChange={e => convertFromUnix(e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm font-mono text-gray-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  ISO 8601
                </label>
                <input
                  type="text"
                  value={iso}
                  onChange={e => convertFromISO(e.target.value)}
                  placeholder="2024-01-01T00:00:00Z"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm font-mono text-gray-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={getNow}
                className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-500 transition-colors"
              >
                Use Current Time
              </button>
            </div>
          }
          outputSlot={
            <pre className="text-sm font-mono text-gray-300">{output}</pre>
          }
          outputText={output}
          singlePanel
          runLabel="Convert ↵"
        />
      </div>
    </>
  );
}
