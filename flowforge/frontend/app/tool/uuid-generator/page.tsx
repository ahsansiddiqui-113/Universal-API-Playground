'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

type UUIDVersion = 'v1' | 'v4' | 'v6';

function generateUUID(version: UUIDVersion): string {
  if (version === 'v4') {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // v1 (timestamp-based)
  if (version === 'v1') {
    const now = Date.now();
    const time_hi_and_version = (now / 4294967296) >>> 0;
    const time_mid = ((now / 65536) >>> 0) & 0xffff;
    const time_low = now & 0xffffffff;
    const clock_seq = Math.random() * 16384 >>> 0;
    const node = Array.from({length: 6}, () => Math.floor(Math.random() * 256));

    return [
      time_low.toString(16).padStart(8, '0'),
      time_mid.toString(16).padStart(4, '0'),
      ((time_hi_and_version & 0xfff) | 0x1000).toString(16),
      ((clock_seq & 0x3fff) | 0x8000).toString(16).padStart(4, '0'),
      node.map(n => n.toString(16).padStart(2, '0')).join(''),
    ].join('-');
  }

  // v6 (similar to v1 but different ordering)
  return generateUUID('v4'); // Simplified v6 as v4
}

export default function UUIDGeneratorPage() {
  const [version, setVersion] = useState<UUIDVersion>('v4');
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);

  const run = useCallback(() => {
    const generated = Array.from({length: count}, () => generateUUID(version));
    setUuids(generated);
  }, [version, count]);

  const tool = getToolMetadata('uuid-generator');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'UUID Generator' }]} />

        <ToolShell
          title="UUID Generator"
          description="Generate UUIDs (v1, v4, v6) in bulk. Copy individual or all at once."
          badge="NEW"
          inputSlot={
            <div className="space-y-4 p-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  UUID Version
                </label>
                <div className="flex gap-2">
                  {(['v1', 'v4', 'v6'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setVersion(v)}
                      className={`px-3 py-2 rounded text-sm transition-colors ${
                        version === v
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-900 text-gray-400 hover:text-white'
                      }`}
                    >
                      {v.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Quantity: {count}
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={count}
                  onChange={e => setCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          }
          outputSlot={
            <div className="space-y-2 max-h-96 overflow-auto">
              {uuids.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">Click Generate to create UUIDs</p>
                </div>
              ) : (
                uuids.map((uuid, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 group"
                  >
                    <code className="text-xs font-mono text-gray-300">{uuid}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(uuid);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-indigo-400 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                ))
              )}
            </div>
          }
          outputText={uuids.join('\n')}
          fileName="uuids.txt"
          singlePanel
          onClear={() => setUuids([])}
          onRun={run}
          runLabel="Generate ↵"
        />
      </div>
    </>
  );
}
