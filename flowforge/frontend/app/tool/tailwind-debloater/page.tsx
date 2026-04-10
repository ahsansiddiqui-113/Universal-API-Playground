// ══════════════════════════════════════════════════
// tailwind-debloater/page.tsx
// ══════════════════════════════════════════════════
'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool/ToolShell';

function debloat(input: string): string {
  const GROUPS: Record<string, string[]> = {
    'flex-center':    ['flex', 'items-center', 'justify-center'],
    'flex-between':   ['flex', 'items-center', 'justify-between'],
    'absolute-fill':  ['absolute', 'inset-0'],
    'flex-col-center': ['flex', 'flex-col', 'items-center', 'justify-center'],
    'sr-only':        ['absolute', 'w-px', 'h-px', 'overflow-hidden'],
    'truncate':       ['overflow-hidden', 'text-ellipsis', 'whitespace-nowrap'],
  };

  const classes = input.match(/className="([^"]*)"/g) ?? [input];
  let output = input;
  let suggestions: string[] = [];

  for (const [semantic, group] of Object.entries(GROUPS)) {
    const pattern = group.join(' ');
    if (input.includes(pattern)) {
      suggestions.push(`/* Consider: .${semantic} { @apply ${group.join(' ')}; } */`);
    }
  }

  // Generate semantic CSS
  const allClasses = input.match(/\b[a-z-]+(?:-[a-z0-9.]+)*\b/g) ?? [];
  const uniqueClasses = [...new Set(allClasses.filter(c => c.length > 2))];

  const cssMap: Record<string, string> = {
    'flex': 'display: flex',
    'hidden': 'display: none',
    'block': 'display: block',
    'relative': 'position: relative',
    'absolute': 'position: absolute',
    'sticky': 'position: sticky',
    'fixed': 'position: fixed',
    'overflow-hidden': 'overflow: hidden',
    'overflow-auto': 'overflow: auto',
    'text-center': 'text-align: center',
    'text-left': 'text-align: left',
    'text-right': 'text-align: right',
    'font-bold': 'font-weight: 700',
    'font-semibold': 'font-weight: 600',
    'font-medium': 'font-weight: 500',
    'font-normal': 'font-weight: 400',
    'italic': 'font-style: italic',
    'underline': 'text-decoration: underline',
    'uppercase': 'text-transform: uppercase',
    'lowercase': 'text-transform: lowercase',
    'capitalize': 'text-transform: capitalize',
    'truncate': 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap',
    'whitespace-nowrap': 'white-space: nowrap',
    'cursor-pointer': 'cursor: pointer',
    'cursor-not-allowed': 'cursor: not-allowed',
    'select-none': 'user-select: none',
    'pointer-events-none': 'pointer-events: none',
    'w-full': 'width: 100%',
    'h-full': 'height: 100%',
    'min-h-screen': 'min-height: 100vh',
    'w-screen': 'width: 100vw',
    'h-screen': 'height: 100vh',
    'items-center': 'align-items: center',
    'items-start': 'align-items: flex-start',
    'items-end': 'align-items: flex-end',
    'justify-center': 'justify-content: center',
    'justify-between': 'justify-content: space-between',
    'justify-start': 'justify-content: flex-start',
    'justify-end': 'justify-content: flex-end',
    'flex-col': 'flex-direction: column',
    'flex-row': 'flex-direction: row',
    'flex-wrap': 'flex-wrap: wrap',
    'flex-1': 'flex: 1 1 0%',
    'flex-none': 'flex: none',
    'grid': 'display: grid',
    'inset-0': 'inset: 0',
    'border': 'border-width: 1px',
    'border-0': 'border-width: 0',
    'rounded': 'border-radius: 0.25rem',
    'rounded-lg': 'border-radius: 0.5rem',
    'rounded-xl': 'border-radius: 0.75rem',
    'rounded-full': 'border-radius: 9999px',
    'rounded-none': 'border-radius: 0',
    'opacity-0': 'opacity: 0',
    'opacity-50': 'opacity: 0.5',
    'opacity-100': 'opacity: 1',
    'transition': 'transition-property: color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter; transition-timing-function: cubic-bezier(0.4,0,0.2,1); transition-duration: 150ms',
    'transition-all': 'transition-property: all; transition-timing-function: cubic-bezier(0.4,0,0.2,1); transition-duration: 150ms',
    'transition-colors': 'transition-property: color,background-color,border-color; transition-timing-function: cubic-bezier(0.4,0,0.2,1); transition-duration: 150ms',
    'antialiased': '-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale',
  };

  const matched = uniqueClasses.filter(c => cssMap[c]);
  if (!matched.length) return `/* No directly mappable classes found.\nConsider using @apply for complex utilities. */\n\n/* Input classes analyzed:\n${uniqueClasses.slice(0,20).join(', ')}\n*/`;

  const css = [
    '/* Generated semantic CSS */',
    '.component {',
    ...matched.map(c => `  /* ${c} */`).map((comment, i) => `${comment}\n  ${cssMap[matched[i]]};`),
    '}',
    '',
    ...(suggestions.length ? ['/* Utility suggestions:', ...suggestions, '*/'] : []),
  ].join('\n');

  return css;
}

export default function TailwindDebloaterPage() {
  const [input, setInput]   = useState('');
  const [output, setOutput] = useState('');

  function run() {
    if (!input.trim()) { setOutput(''); return; }
    setOutput(debloat(input));
  }

  const inputSlot = (
    <textarea value={input} onChange={e => setInput(e.target.value)}
      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run(); }}
      placeholder={'<div className="flex items-center justify-center min-h-screen bg-gray-900 text-white font-semibold">\n  Content\n</div>'}
      spellCheck={false}
      className="w-full h-full min-h-[500px] bg-transparent text-gray-300 text-sm font-mono p-4 resize-none outline-none placeholder-gray-700 leading-relaxed" />
  );

  const outputSlot = (
    <div className="w-full h-full min-h-[500px]">
      {output ? <pre className="p-4 text-sm font-mono text-emerald-300/80 leading-relaxed whitespace-pre-wrap">{output}</pre>
        : <div className="flex items-center justify-center h-full text-gray-700 text-sm font-mono">semantic CSS appears here</div>}
    </div>
  );

  return (
    <ToolShell title="Tailwind De-Bloater" description="Convert Tailwind utility classes to semantic CSS. Press ⌘↵ to run."
      inputLabel="HTML / JSX with Tailwind" outputLabel="Semantic CSS"
      inputSlot={inputSlot} outputSlot={outputSlot} outputText={output} fileName="styles.css"
      onClear={() => { setInput(''); setOutput(''); }} onRun={run} runLabel="Convert ↵" />
  );
}