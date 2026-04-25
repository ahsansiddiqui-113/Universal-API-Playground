'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';
import { useKeyboardShortcuts, createShortcut } from '@/lib/useKeyboardShortcuts';

interface JWTPayload {
  header: Record<string, any>;
  payload: Record<string, any>;
  signature: string;
  isValid: boolean;
  expiresAt?: string;
  expiresIn?: string;
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
    }

    const [headerEncoded, payloadEncoded, signature] = parts;

    // Decode base64url
    const decode = (str: string) => {
      const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
      const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(binary.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
    };

    const header = decode(headerEncoded);
    const payload = decode(payloadEncoded);

    // Calculate expiration
    let expiresAt: string | undefined;
    let expiresIn: string | undefined;
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      expiresAt = expDate.toISOString();
      const now = Math.floor(Date.now() / 1000);
      expiresIn =
        now < payload.exp
          ? `${Math.floor((payload.exp - now) / 3600)} hours`
          : 'Expired';
    }

    return {
      header,
      payload,
      signature,
      isValid: true,
      expiresAt,
      expiresIn,
    };
  } catch (e) {
    return null;
  }
}

export default function JWTDebuggerPage() {
  const [input, setInput] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjo5OTk5OTk5OTk5fQ.fake-signature'
  );
  const [decoded, setDecoded] = useState<JWTPayload | null>(null);
  const [error, setError] = useState('');

  const run = useCallback(() => {
    const result = decodeJWT(input);
    if (result) {
      setDecoded(result);
      setError('');
    } else {
      setDecoded(null);
      setError('Invalid JWT format. Please check your token.');
    }
  }, [input]);

  useKeyboardShortcuts([
    createShortcut('Enter', () => {
      run();
    }),
  ]);

  const tool = getToolMetadata('jwt-debugger');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'JWT Debugger' }]} />

        <ToolShell
          title="JWT Debugger"
          description="Decode, verify, and inspect JWT tokens. Parse header and payload, check expiration, and analyze claims."
          badge="NEW"
          inputLabel="JWT Token"
          outputLabel="Decoded Token"
          inputSlot={
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste your JWT token here..."
              className="w-full h-64 bg-transparent text-gray-300 text-sm font-mono p-4 outline-none resize-none"
            />
          }
          outputSlot={
            error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            ) : decoded ? (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Header</h3>
                  <pre className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-300 overflow-auto max-h-40">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>

                {/* Payload */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Payload</h3>
                  <pre className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-300 overflow-auto max-h-40">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                </div>

                {/* Signature */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Signature (Not Verified)</h3>
                  <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-500 break-all">
                    {decoded.signature}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ⚠️ Signature verification requires the secret key. This tool cannot verify without it.
                  </p>
                </div>

                {/* Expiration Info */}
                {decoded.expiresAt && (
                  <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                    <p className="text-sm text-indigo-300">
                      <span className="font-semibold">Expires:</span> {decoded.expiresAt}
                    </p>
                    <p className="text-sm text-indigo-300">
                      <span className="font-semibold">Expires in:</span> {decoded.expiresIn}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">Paste a JWT token above and click Decode to see the breakdown.</p>
              </div>
            )
          }
          outputText={decoded ? JSON.stringify(decoded.payload, null, 2) : ''}
          fileName="jwt-payload.json"
          onClear={() => {
            setInput('');
            setDecoded(null);
            setError('');
          }}
          onRun={run}
          runLabel="Decode ↵"
        />
      </div>
    </>
  );
}
