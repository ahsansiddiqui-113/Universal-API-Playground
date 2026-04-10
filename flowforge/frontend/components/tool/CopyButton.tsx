'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  size?: 'sm' | 'md';
  label?: string;
}

export default function CopyButton({ text, size = 'md', label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const sizes = { md: 'h-8 px-3 text-xs', sm: 'h-6 px-2 text-[10px]' };

  return (
    <button
      onClick={handleCopy}
      className={`${sizes[size]} font-medium rounded-lg border transition-all duration-150
                  flex items-center gap-1.5 ${
        copied
          ? 'border-emerald-700 bg-emerald-900/40 text-emerald-400'
          : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
      }`}
    >
      {copied ? (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="3.5" y="0.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1"/>
            <path d="M2 3H1C0.724 3 0.5 3.224 0.5 3.5V9C0.5 9.276 0.724 9.5 1 9.5H6.5C6.776 9.5 7 9.276 7 9V8"
                  stroke="currentColor" strokeWidth="1"/>
          </svg>
          {label}
        </>
      )}
    </button>
  );
}