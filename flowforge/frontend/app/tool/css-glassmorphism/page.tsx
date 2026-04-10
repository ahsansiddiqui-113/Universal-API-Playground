'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool/ToolShell';

interface GlassConfig {
  blur: number; opacity: number; borderOpacity: number;
  bgColor: string; borderColor: string; borderRadius: number;
  saturation: number;
}

function generateCSS(c: GlassConfig): string {
  const bg = hexToRgba(c.bgColor, c.opacity / 100);
  const border = hexToRgba(c.borderColor, c.borderOpacity / 100);
  return `.glass {
  background: ${bg};
  backdrop-filter: blur(${c.blur}px) saturate(${c.saturation}%);
  -webkit-backdrop-filter: blur(${c.blur}px) saturate(${c.saturation}%);
  border: 1px solid ${border};
  border-radius: ${c.borderRadius}px;
}`;
}

function generateTailwind(c: GlassConfig): string {
  return `<div className="
  bg-[${hexToRgba(c.bgColor, c.opacity / 100)}]
  backdrop-blur-[${c.blur}px]
  backdrop-saturate-[${c.saturation}%]
  border border-[${hexToRgba(c.borderColor, c.borderOpacity / 100)}]
  rounded-[${c.borderRadius}px]
">`;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

const DEFAULT: GlassConfig = {
  blur: 12, opacity: 15, borderOpacity: 25,
  bgColor: '#ffffff', borderColor: '#ffffff',
  borderRadius: 16, saturation: 180,
};

export default function CssGlassmorphismPage() {
  const [cfg, setCfg] = useState<GlassConfig>(DEFAULT);
  const [tab, setTab] = useState<'css' | 'tailwind'>('css');

  const css      = generateCSS(cfg);
  const tailwind = generateTailwind(cfg);
  const output   = tab === 'css' ? css : tailwind;

  const set = (key: keyof GlassConfig, value: string | number) =>
    setCfg(c => ({ ...c, [key]: value }));

  const inputSlot = (
    <div className="p-4 space-y-5">
      {/* Live preview */}
      <div className="relative h-44 rounded-xl overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{
            background: hexToRgba(cfg.bgColor, cfg.opacity / 100),
            backdropFilter: `blur(${cfg.blur}px) saturate(${cfg.saturation}%)`,
            WebkitBackdropFilter: `blur(${cfg.blur}px) saturate(${cfg.saturation}%)`,
            border: `1px solid ${hexToRgba(cfg.borderColor, cfg.borderOpacity / 100)}`,
            borderRadius: cfg.borderRadius + 'px',
            padding: '24px 32px',
          }}>
            <p className="text-white text-sm font-semibold">Glass card preview</p>
            <p className="text-white/60 text-xs mt-1">Resize sliders to update</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {([
        ['blur',          'Blur (px)',         0, 40, 1],
        ['opacity',       'BG Opacity (%)',    0, 100, 1],
        ['borderOpacity', 'Border Opacity (%)',0, 100, 1],
        ['saturation',    'Saturation (%)',    100, 300, 10],
        ['borderRadius',  'Border Radius (px)',0, 48, 1],
      ] as [keyof GlassConfig, string, number, number, number][]).map(([key, label, min, max, step]) => (
        <div key={key}>
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] text-gray-500 font-mono">{label}</span>
            <span className="text-[11px] text-gray-400 font-mono">{cfg[key]}</span>
          </div>
          <input type="range" min={min} max={max} step={step}
            value={cfg[key] as number}
            onChange={e => set(key, Number(e.target.value))}
            className="w-full accent-indigo-500" />
        </div>
      ))}

      <div className="grid grid-cols-2 gap-4">
        <ColorPicker label="BG Color"     value={cfg.bgColor}     onChange={v => set('bgColor', v)} />
        <ColorPicker label="Border Color" value={cfg.borderColor} onChange={v => set('borderColor', v)} />
      </div>
    </div>
  );

  const outputSlot = (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-800">
        {(['css','tailwind'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-mono transition-colors
              ${tab === t ? 'text-white border-b border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {t === 'css' ? 'CSS' : 'Tailwind'}
          </button>
        ))}
      </div>
      <pre className="flex-1 p-4 text-sm font-mono text-emerald-300/80 leading-relaxed whitespace-pre-wrap">
        {output}
      </pre>
    </div>
  );

  return (
    <ToolShell
      title="CSS Glassmorphism Generator"
      description="Generate frosted-glass CSS and Tailwind with live preview."
      inputLabel="Controls"
      outputLabel="Output"
      inputSlot={inputSlot}
      outputSlot={outputSlot}
      outputText={output}
      fileName={tab === 'css' ? 'glass.css' : 'glass.tsx'}
    />
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-[11px] text-gray-500 font-mono mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
        <span className="text-xs font-mono text-gray-400">{value}</span>
      </div>
    </div>
  );
}