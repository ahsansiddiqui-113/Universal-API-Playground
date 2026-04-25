'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

type HashType = 'sha256' | 'sha1' | 'md5';

// Simple implementation using Web Crypto API (SHA256, SHA1)
async function generateHash(text: string, type: HashType): Promise<string> {
  if (type === 'md5') {
    // For MD5, use a simple JS implementation (not cryptographically secure but fast)
    return md5(text);
  }

  const algorithm = type === 'sha256' ? 'SHA-256' : 'SHA-1';
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple MD5 implementation
function md5(str: string): string {
  const rotLeft = (n: number, b: number) => (n << b) | (n >>> (32 - b));
  const addUnsigned = (x: number, y: number) => {
    const x8 = x & 0x80000000;
    const y8 = y & 0x80000000;
    const x4 = x & 0x40000000;
    const y4 = y & 0x40000000;
    const result = (x & 0x3fffffff) + (y & 0x3fffffff);
    if (x4 & y4) return result ^ 0x80000000 ^ x8 ^ y8;
    if (x4 | y4) return result ^ 0x40000000 ^ x8 ^ y8;
    return result ^ x8 ^ y8;
  };

  let k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];

  const message = str;
  const msgLen = message.length;
  const messageBytes: number[] = [];

  for (let i = 0; i < msgLen; i++) {
    messageBytes[i >> 2] |= message.charCodeAt(i) << ((i % 4) * 8);
  }

  messageBytes[msgLen >> 2] |= 0x80 << ((msgLen % 4) * 8);
  messageBytes[(((msgLen + 8) >> 6) << 4) + 14] = msgLen * 8;

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  for (let i = 0; i < messageBytes.length; i += 16) {
    const aa = a, bb = b, cc = c, dd = d;

    for (let j = 0; j < 64; j++) {
      let f: number, g: number;
      if (j < 16) {
        f = (b & c) | (~b & d);
        g = j;
      } else if (j < 32) {
        f = (d & b) | (~d & c);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * j) % 16;
      }

      const temp = d;
      d = c;
      c = b;
      b = addUnsigned(b, rotLeft(addUnsigned(addUnsigned(a, f), addUnsigned(k[j], messageBytes[i + g])), [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21][j]));
      a = temp;
    }

    a = addUnsigned(a, aa);
    b = addUnsigned(b, bb);
    c = addUnsigned(c, cc);
    d = addUnsigned(d, dd);
  }

  const result = [a, b, c, d].map(x => {
    const hex = ((x >>> 0).toString(16)).padStart(8, '0');
    return hex[6] + hex[7] + hex[4] + hex[5] + hex[2] + hex[3] + hex[0] + hex[1];
  }).join('');

  return result;
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState('');
  const [hashType, setHashType] = useState<HashType>('sha256');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const hash = await generateHash(input, hashType);
      setOutput(hash);
    } catch (e) {
      setOutput(`Error: ${(e as Error).message}`);
    }
    setLoading(false);
  };

  const tool = getToolMetadata('hash-generator');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'Hash Generator' }]} />

        <ToolShell
          title="Hash Generator"
          description="Generate SHA-256, SHA-1, and MD5 hashes from text instantly."
          badge="NEW"
          inputLabel="Text to Hash"
          outputLabel="Hash Output"
          inputSlot={
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full h-64 bg-transparent text-gray-300 text-sm font-mono p-4 outline-none resize-none"
            />
          }
          outputSlot={
            <div className="space-y-3">
              <div className="p-4 bg-gray-900 rounded-lg">
                <pre className="text-xs font-mono text-gray-300 break-all">{output}</pre>
              </div>
              {output && (
                <div className="text-xs text-gray-400 space-y-1">
                  <p>📊 Length: {output.length} chars</p>
                  <p>🔐 Algorithm: {hashType.toUpperCase()}</p>
                </div>
              )}
            </div>
          }
          outputText={output}
          fileName="hash.txt"
          onClear={() => {
            setInput('');
            setOutput('');
          }}
          onRun={run}
          running={loading}
          runLabel="Generate ↵"
          toolbar={
            <div className="flex gap-2">
              {(['sha256', 'sha1', 'md5'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setHashType(type)}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    hashType === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          }
        />
      </div>
    </>
  );
}
