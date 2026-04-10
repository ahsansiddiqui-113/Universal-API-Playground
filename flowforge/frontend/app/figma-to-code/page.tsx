'use client';

import { useState, useRef, useCallback } from 'react';
import { imageToCode } from '../../lib/api';

// ── Framework definitions ──────────────────────────────────────────────────────
const FRAMEWORKS = [
  { id: 'html',          label: 'HTML / CSS / JS',      icon: '🌐', color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30'  },
  { id: 'react',         label: 'React + TypeScript',   icon: '⚛️', color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30'    },
  { id: 'react-native',  label: 'React Native',         icon: '📱', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30'    },
  { id: 'flask',         label: 'Flask (Python)',        icon: '🐍', color: 'text-green-400',   bg: 'bg-green-500/10',   border: 'border-green-500/30'   },
  { id: 'flutter',       label: 'Flutter (Dart)',        icon: '🦋', color: 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
] as const;

type FrameworkId = (typeof FRAMEWORKS)[number]['id'];

// ── Demo steps ─────────────────────────────────────────────────────────────────
const DEMO_STEPS = [
  {
    n: '1',
    icon: '🖼️',
    title: 'Upload your design',
    desc: 'Drag-and-drop or click to upload any screenshot, mockup, Figma export, or UI photo.',
  },
  {
    n: '2',
    icon: '⚙️',
    title: 'Pick a framework',
    desc: 'Choose HTML/CSS/JS, React, React Native, Flask, or Flutter — whatever you\'re building.',
  },
  {
    n: '3',
    icon: '🤖',
    title: 'AI analyses the design',
    desc: 'Vision reads every pixel: layout, colors, fonts, spacing, shadows, interactions.',
  },
  {
    n: '4',
    icon: '✨',
    title: 'Get production code',
    desc: 'Copy or download clean, commented code that replicates the design pixel-perfectly.',
  },
];

// ── Syntax-highlight lines ────────────────────────────────────────────────────
function CodeBlock({ code, framework }: { code: string; framework: FrameworkId }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function download() {
    const ext: Record<FrameworkId, string> = {
      html: 'html',
      react: 'tsx',
      'react-native': 'tsx',
      flask: 'py',
      flutter: 'dart',
    };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design.${ext[framework]}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const lang = { html: 'HTML', react: 'TSX', 'react-native': 'TSX', flask: 'Python', flutter: 'Dart' }[framework];

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs font-mono text-gray-500">{lang}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={download}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5"
          >
            ⬇ Download
          </button>
          <button
            onClick={copy}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5
              ${copied
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
              }`}
          >
            {copied ? '✓ Copied!' : '⧉ Copy'}
          </button>
        </div>
      </div>

      {/* Code */}
      <div className="bg-gray-950 overflow-auto max-h-[560px]">
        <pre className="p-5 text-[13px] leading-relaxed font-mono text-gray-300 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

// ── Upload drop zone ──────────────────────────────────────────────────────────
function DropZone({
  onFile,
  preview,
}: {
  onFile: (f: File) => void;
  preview: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden
        ${dragging
          ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
          : preview
          ? 'border-white/10 hover:border-white/20'
          : 'border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5'
        }`}
      style={{ minHeight: 240 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />

      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Design preview"
            className="w-full object-contain max-h-[400px]"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
            <span className="text-white text-sm font-semibold bg-black/60 px-4 py-2 rounded-lg">
              Click to replace
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
            🖼️
          </div>
          <div>
            <p className="text-white font-semibold">Drop your design here</p>
            <p className="text-gray-500 text-sm mt-1">
              PNG, JPG, WebP, GIF · up to 10 MB
            </p>
          </div>
          <span className="text-xs text-indigo-400 border border-indigo-500/30 rounded-full px-4 py-1.5">
            Or click to browse
          </span>
        </div>
      )}
    </div>
  );
}

// ── Framework selector ────────────────────────────────────────────────────────
function FrameworkPicker({
  value,
  onChange,
}: {
  value: FrameworkId;
  onChange: (v: FrameworkId) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {FRAMEWORKS.map(fw => (
        <button
          key={fw.id}
          onClick={() => onChange(fw.id)}
          className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-semibold transition-all
            ${value === fw.id
              ? `${fw.bg} ${fw.border} text-white scale-[1.03] shadow-lg`
              : 'bg-gray-900 border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300'
            }`}
        >
          <span className="text-xl leading-none">{fw.icon}</span>
          <span className={value === fw.id ? fw.color : ''}>{fw.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function FigmaToCodePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [framework, setFramework] = useState<FrameworkId>('react');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ code: string; framework: FrameworkId; label: string } | null>(null);
  const [error, setError] = useState('');

  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    setError('');
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleConvert() {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await imageToCode(file, framework);
      setResult(data as { code: string; framework: FrameworkId; label: string });
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectedFw = FRAMEWORKS.find(f => f.id === framework)!;

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-20 gap-5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent)] pointer-events-none" />
        <div className="inline-flex items-center gap-2 text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          FlowForge AI Powered Figma Converter
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">Design to Code.</span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Instantly.</span>
        </h1>
        <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
          Upload any UI screenshot or design mockup and get perfect,{' '}
          production-ready code in the framework of your choice — in seconds.
        </p>
        <a
          href="#converter"
          className="mt-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-purple-500/20"
        >
          Try it now →
        </a>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-16 max-w-screen-lg mx-auto w-full">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEMO_STEPS.map(step => (
            <div key={step.n} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold flex items-center justify-center shrink-0">
                  {step.n}
                </span>
                <span className="text-2xl">{step.icon}</span>
              </div>
              <p className="font-semibold text-white text-sm">{step.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Supported frameworks ─────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-14 max-w-screen-lg mx-auto w-full">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest text-center mb-8">
          Supported frameworks
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {FRAMEWORKS.map(fw => (
            <div
              key={fw.id}
              className={`rounded-xl border p-4 flex flex-col items-center gap-2 ${fw.bg} ${fw.border}`}
            >
              <span className="text-3xl">{fw.icon}</span>
              <p className={`text-xs font-semibold text-center ${fw.color}`}>{fw.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Converter ────────────────────────────────────────────────────── */}
      <section id="converter" className="border-t border-white/5 px-6 py-16 max-w-screen-lg mx-auto w-full">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white">Convert your design</h2>
          <p className="text-gray-500 text-sm mt-2">
            Upload a screenshot or design image and choose a framework.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Upload + controls */}
          <div className="flex flex-col gap-6">
            <DropZone onFile={handleFile} preview={preview} />

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Target Framework
              </label>
              <FrameworkPicker value={framework} onChange={setFramework} />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <span className="text-red-400 shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleConvert}
              disabled={!file || loading}
              className={`w-full flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all text-sm
                ${!file || loading
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-white/5'
                  : `${selectedFw.bg} ${selectedFw.border} border ${selectedFw.color} hover:opacity-90 shadow-lg`
                }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Analysing design with FlowForge
                </>
              ) : (
                <>
                  {selectedFw.icon} Generate {selectedFw.label} Code →
                </>
              )}
            </button>

            {/* Tips */}
            <div className="bg-gray-900/60 rounded-xl border border-white/5 p-4 text-[11px] text-gray-500 leading-relaxed">
              <p className="font-semibold text-gray-400 mb-2">💡 Tips for better results</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use high-resolution screenshots (1x or 2x)</li>
                <li>Include the full screen / card — avoid cropping key elements</li>
                <li>Export directly from Figma at 2x for sharpest results</li>
                <li>For Flask, the AI outputs both app.py and the HTML template</li>
              </ul>
            </div>
          </div>

          {/* Right: Result */}
          <div className="flex flex-col gap-4">
            {result ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Code generated · {result.label}
                  </div>
                </div>
                <CodeBlock code={result.code} framework={result.framework as FrameworkId} />
              </>
            ) : (
              <div
                className="flex-1 flex flex-col items-center justify-center text-center gap-4 rounded-2xl border border-dashed border-white/10"
                style={{ minHeight: 400 }}
              >
                {loading ? (
                  <>
                    <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
                    <div>
                      <p className="text-white font-semibold">FlowForge is reading your design…</p>
                      <p className="text-gray-500 text-sm mt-1">This usually takes 10–30 seconds.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-5xl opacity-20">⌨️</div>
                    <p className="text-gray-600 text-sm">
                      {file
                        ? 'Click "Generate Code" to start the conversion'
                        : 'Upload a design image to get started'}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-16 max-w-screen-lg mx-auto w-full">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest text-center mb-10">
          Frequently asked questions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            {
              q: 'What image formats are supported?',
              a: 'PNG, JPEG, WebP, GIF and any other image format up to 10 MB. PNG exports from Figma give the best results.',
            },
            {
              q: 'How accurate is the conversion?',
              a: 'Vision replicates colors, spacing, typography and layout with high fidelity. Complex custom illustrations may need minor tweaks.',
            },
            {
              q: 'Is my image stored?',
              a: 'No. Images are converted to base64, sent directly to the OpenAI API for inference, and never persisted on our servers.',
            },
            {
              q: 'Do I need to set up anything?',
              a: 'You need a free Gemini API key. Get one in seconds at aistudio.google.com/apikey (no credit card!) and add it as OPENAI_API_KEY in backend/.env, then restart the backend.',
            },
          ].map(item => (
            <div key={item.q} className="bg-gray-900/60 rounded-xl border border-white/5 p-5">
              <p className="text-sm font-semibold text-white mb-2">{item.q}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
