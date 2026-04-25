'use client';

import { useState, useCallback, useEffect } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

// Simple QR code generation using a free API (fallback to datamatrix)
async function generateQRCode(text: string, size: number = 300): Promise<string> {
  // Using qrserver.com API
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
}

export default function QRCodeGeneratorPage() {
  const [input, setInput] = useState('https://flowforge.dev');
  const [size, setSize] = useState(300);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    try {
      const url = await generateQRCode(input, size);
      setQrUrl(url);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [input, size]);

  // Generate on mount
  useEffect(() => {
    run();
  }, []);

  const tool = getToolMetadata('qr-code-generator');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'QR Code Generator' }]} />

        <ToolShell
          title="QR Code Generator"
          description="Generate QR codes from text or URLs. Download as PNG."
          badge="NEW"
          inputLabel="Content"
          outputLabel="QR Code"
          inputSlot={
            <div className="space-y-4 p-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Text/URL
                </label>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Enter text or URL..."
                  className="w-full h-24 px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm font-mono text-gray-300 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Size: {size}px
                </label>
                <input
                  type="range"
                  min="100"
                  max="500"
                  step="50"
                  value={size}
                  onChange={e => setSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          }
          outputSlot={
            loading ? (
              <div className="text-center py-12 text-gray-500">Generating...</div>
            ) : qrUrl ? (
              <div className="flex flex-col items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="QR Code" className="border border-gray-800 rounded" />
                <a
                  href={qrUrl}
                  download="qrcode.png"
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-500 transition-colors"
                >
                  Download PNG
                </a>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">Click Generate to create QR code</div>
            )
          }
          singlePanel
          onClear={() => {
            setInput('');
            setQrUrl('');
          }}
          onRun={run}
          running={loading}
          runLabel="Generate ↵"
        />
      </div>
    </>
  );
}
