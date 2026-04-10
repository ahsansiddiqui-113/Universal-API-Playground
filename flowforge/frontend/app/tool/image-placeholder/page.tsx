'use client';

import { useState, useRef, useEffect } from 'react';
import ToolShell from '@/components/tool/ToolShell';

type Pattern = 'solid' | 'grid' | 'diagonal' | 'dots';

function generatePlaceholder(w: number, h: number, bg: string, fg: string, pattern: Pattern, text: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  if (pattern === 'grid') {
    ctx.strokeStyle = fg + '30'; ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
  } else if (pattern === 'diagonal') {
    ctx.strokeStyle = fg + '25'; ctx.lineWidth = 1;
    for (let i = -h; i < w; i += 20) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+h,h); ctx.stroke(); }
  } else if (pattern === 'dots') {
    ctx.fillStyle = fg + '30';
    for (let x = 10; x < w; x += 20) for (let y = 10; y < h; y += 20) { ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill(); }
  }

  // Cross lines
  ctx.strokeStyle = fg + '40'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w,h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w,0); ctx.lineTo(0,h); ctx.stroke();

  // Label
  const label = text || `${w}×${h}`;
  const fontSize = Math.max(12, Math.min(24, Math.floor(Math.min(w,h) / 6)));
  ctx.font = `${fontSize}px monospace`;
  ctx.fillStyle = fg + 'aa';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, w/2, h/2);

  return canvas.toDataURL('image/png');
}

export default function ImagePlaceholderPage() {
  const [width, setWidth]     = useState(400);
  const [height, setHeight]   = useState(300);
  const [bg, setBg]           = useState('#1e293b');
  const [fg, setFg]           = useState('#94a3b8');
  const [pattern, setPattern] = useState<Pattern>('grid');
  const [text, setText]       = useState('');
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    setDataUrl(generatePlaceholder(width, height, bg, fg, pattern, text));
  }, [width, height, bg, fg, pattern, text]);

  const tailwindSnippet = `<img src="${dataUrl.slice(0,40)}..." width={${width}} height={${height}} alt="placeholder" className="object-cover" />`;
  const base64Short = dataUrl ? dataUrl.slice(0, 80) + '...' : '';

  const inputSlot = (
    <div className="p-4 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-gray-500 font-mono mb-1.5">Width (px)</p>
          <input type="number" value={width} min={1} max={2000}
            onChange={e => setWidth(Math.min(2000, Math.max(1, +e.target.value)))}
            className="w-full h-9 px-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm font-mono outline-none focus:border-indigo-500" />
        </div>
        <div>
          <p className="text-[11px] text-gray-500 font-mono mb-1.5">Height (px)</p>
          <input type="number" value={height} min={1} max={2000}
            onChange={e => setHeight(Math.min(2000, Math.max(1, +e.target.value)))}
            className="w-full h-9 px-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm font-mono outline-none focus:border-indigo-500" />
        </div>
      </div>

      <div>
        <p className="text-[11px] text-gray-500 font-mono mb-2">Pattern</p>
        <div className="grid grid-cols-4 gap-2">
          {(['solid','grid','diagonal','dots'] as Pattern[]).map(p => (
            <button key={p} onClick={() => setPattern(p)}
              className={`py-1.5 text-xs rounded-lg font-mono border transition-all
                ${pattern === p ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-500 border-gray-700 hover:text-gray-300'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><p className="text-[11px] text-gray-500 font-mono mb-1.5">BG Color</p>
          <div className="flex items-center gap-2"><input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" /><span className="text-xs font-mono text-gray-400">{bg}</span></div></div>
        <div><p className="text-[11px] text-gray-500 font-mono mb-1.5">FG Color</p>
          <div className="flex items-center gap-2"><input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" /><span className="text-xs font-mono text-gray-400">{fg}</span></div></div>
      </div>

      <div>
        <p className="text-[11px] text-gray-500 font-mono mb-1.5">Custom label (optional)</p>
        <input value={text} onChange={e => setText(e.target.value)} placeholder={`${width}×${height}`}
          className="w-full h-9 px-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm font-mono outline-none focus:border-indigo-500" />
      </div>

      {/* Quick size presets */}
      <div>
        <p className="text-[11px] text-gray-600 font-mono mb-2">Quick sizes</p>
        <div className="flex flex-wrap gap-1.5">
          {[[400,300],[800,600],[1200,630],[16,16],[32,32],[64,64],[100,100]].map(([w,h])=>(
            <button key={`${w}x${h}`} onClick={() => { setWidth(w); setHeight(h); }}
              className="px-2 py-1 text-[10px] font-mono rounded border border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-all">
              {w}×{h}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const outputSlot = (
    <div className="p-4 space-y-4">
      {dataUrl && (
        <>
          <div className="flex items-center justify-center bg-gray-800/40 rounded-xl p-4 border border-gray-700/40">
            <img src={dataUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain' }} className="rounded" />
          </div>
          <div>
            <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mb-2">Base64 data URL</p>
            <div className="bg-gray-800/60 rounded-lg px-3 py-2 text-[10px] font-mono text-gray-500 break-all">{base64Short}</div>
            <button onClick={() => navigator.clipboard.writeText(dataUrl)}
              className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 font-mono transition-colors">
              Copy full base64
            </button>
          </div>
          <div>
            <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mb-2">Download</p>
            <a href={dataUrl} download={`placeholder-${width}x${height}.png`}
              className="inline-flex items-center gap-2 h-8 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
              Download PNG
            </a>
          </div>
        </>
      )}
    </div>
  );

  return (
    <ToolShell title="Image Placeholder Generator" description="Generate base64 placeholder images for wireframes and mockups."
      inputLabel="Configuration" outputLabel="Preview & Output"
      inputSlot={inputSlot} outputSlot={outputSlot} />
  );
}