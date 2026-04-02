'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'flowforge_onboarding_v1';

// ─── Mini demo node card ──────────────────────────────────────────────────────
function DemoNode({
  icon, label, color, bg, border, active = false,
}: {
  icon: string; label: string; color: string; bg: string; border: string; active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 flex flex-col items-center gap-1.5 min-w-[72px] text-center
        transition-all duration-300 ${bg} ${border}
        ${active ? 'scale-110 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/30' : ''}`}
    >
      <span className={`text-xl leading-none ${color}`}>{icon}</span>
      <span className="text-[10px] font-semibold text-gray-300 leading-none">{label}</span>
    </div>
  );
}

// ─── Animated edge between nodes ─────────────────────────────────────────────
function DemoConnector({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-300
            ${active ? 'bg-indigo-400 animate-pulse' : 'bg-white/10'}`}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
      <span className="text-gray-600 text-xs ml-1">→</span>
    </div>
  );
}

// ─── Slide 0: Welcome ─────────────────────────────────────────────────────────
function SlideWelcome() {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
          <span className="text-4xl">⚡</span>
        </div>
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-500 border-2 border-gray-900 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        </span>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-white">Welcome to FlowForge</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-[360px]">
          The visual API workflow builder. Chain HTTP requests, transform data, and automate
          pipelines —{' '}
          <span className="text-indigo-300 font-medium">no code required.</span>
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {['Visual & intuitive', 'No code required', 'Runs instantly', '4 node types'].map(tag => (
          <span
            key={tag}
            className="text-xs bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 1: Node types ──────────────────────────────────────────────────────
const NODE_TYPES = [
  {
    icon: '↘', label: 'Input Node', color: 'text-blue-400',
    bg: 'bg-blue-500/10', border: 'border-blue-500/20',
    desc: 'Declare the fields your workflow accepts — like userId or query.',
    delay: '0ms',
  },
  {
    icon: '⚡', label: 'API Node', color: 'text-emerald-400',
    bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
    desc: 'Call any HTTP endpoint. Inject dynamic values with {{field}} syntax.',
    delay: '80ms',
  },
  {
    icon: '⚙', label: 'Transform Node', color: 'text-purple-400',
    bg: 'bg-purple-500/10', border: 'border-purple-500/20',
    desc: '11 built-in methods — pick, omit, merge, filterArray and more.',
    delay: '160ms',
  },
  {
    icon: '↗', label: 'Output Node', color: 'text-amber-400',
    bg: 'bg-amber-500/10', border: 'border-amber-500/20',
    desc: 'Format and return the final result as JSON or plain text.',
    delay: '240ms',
  },
];

function SlideNodes() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">Four building blocks</h2>
        <p className="text-gray-400 text-sm mt-1">Every workflow is built with these node types.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {NODE_TYPES.map(n => (
          <div
            key={n.label}
            className={`rounded-xl border p-4 flex flex-col gap-2 ${n.bg} ${n.border} transition-all duration-500`}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transitionDelay: n.delay,
            }}
          >
            <span className={`text-2xl leading-none ${n.color}`}>{n.icon}</span>
            <p className={`text-xs font-bold ${n.color}`}>{n.label}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">{n.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 2: Canvas / connect ────────────────────────────────────────────────
const CANVAS_NODES = [
  { icon: '↘', label: 'Input', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  { icon: '⚡', label: 'API', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  { icon: '⚙', label: 'Transform', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  { icon: '↗', label: 'Output', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
];

function SlideCanvas() {
  const [active, setActive] = useState(-1);
  useEffect(() => {
    let i = 0;
    const tick = () => { setActive(i); i = (i + 1) % CANVAS_NODES.length; };
    tick();
    const id = setInterval(tick, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">Connect your workflow</h2>
        <p className="text-gray-400 text-sm mt-1">
          Add nodes from the palette and wire them together on the canvas.
        </p>
      </div>

      <div className="bg-gray-950 rounded-xl border border-white/5 p-5">
        <div className="flex items-center gap-1.5 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-gray-500 font-medium">Canvas preview</span>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {CANVAS_NODES.map((n, i) => (
            <div key={n.label} className="flex items-center gap-2">
              <DemoNode {...n} active={active === i} />
              {i < CANVAS_NODES.length - 1 && <DemoConnector active={active === i} />}
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-gray-600 mt-4">
          Data flows left → right through each node in order
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
          <p className="text-gray-300 font-semibold mb-1">🖱 Add nodes</p>
          <p className="text-gray-500">Click + buttons in the left panel to place nodes on the canvas.</p>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
          <p className="text-gray-300 font-semibold mb-1">🔗 Connect</p>
          <p className="text-gray-500">Drag from an output handle to the next node's input handle.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 3: Run ─────────────────────────────────────────────────────────────
const RUN_RESULTS = [
  { nodeId: 'input_1',     color: 'text-blue-400',    value: '{ "userId": 42 }',                              delay: '0ms'   },
  { nodeId: 'api_1',       color: 'text-emerald-400', value: '{ "id": 42, "name": "Alice", "role": "admin" }', delay: '150ms' },
  { nodeId: 'transform_1', color: 'text-purple-400',  value: '{ "name": "Alice", "role": "admin" }',           delay: '300ms' },
  { nodeId: 'output_1',    color: 'text-amber-400',   value: '"Alice (admin)"',                                delay: '450ms' },
];

function SlideRun() {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">Run & inspect results</h2>
        <p className="text-gray-400 text-sm mt-1">
          Supply JSON input, hit ▶ Run, and see per-node output instantly.
        </p>
      </div>

      <div className="bg-gray-950 rounded-xl border border-white/5 overflow-hidden font-mono text-xs">
        {/* Input */}
        <div className="border-b border-white/5 px-4 py-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider font-sans font-semibold mb-2">
            Input JSON
          </p>
          <pre className="text-blue-300">{`{ "userId": 42 }`}</pre>
        </div>

        {/* Status bar */}
        <div className="border-b border-white/5 px-4 py-2.5 flex items-center gap-2.5">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-500 ${
              phase === 0 ? 'bg-white/20' :
              phase === 1 ? 'bg-yellow-400 animate-pulse' :
              'bg-emerald-400'
            }`}
          />
          <span
            className={`text-[11px] font-sans transition-colors duration-500 ${
              phase === 0 ? 'text-gray-600' :
              phase === 1 ? 'text-yellow-300' :
              'text-emerald-300'
            }`}
          >
            {phase === 0 ? 'Ready' : phase === 1 ? 'Running workflow…' : '✓ Completed in 312ms'}
          </span>
        </div>

        {/* Per-node results */}
        <div className="px-4 py-3 space-y-2.5">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider font-sans font-semibold">
            Per-node results
          </p>
          {RUN_RESULTS.map(r => (
            <div
              key={r.nodeId}
              className="flex gap-3 transition-all duration-500"
              style={{
                opacity: phase === 2 ? 1 : 0,
                transform: phase === 2 ? 'translateX(0)' : 'translateX(-8px)',
                transitionDelay: phase === 2 ? r.delay : '0ms',
              }}
            >
              <span className={`shrink-0 min-w-[100px] ${r.color}`}>{r.nodeId}</span>
              <span className="text-gray-400 truncate">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Slide 4: Ready ───────────────────────────────────────────────────────────
function SlideReady({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-6">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
        <span className="text-4xl">🚀</span>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">You're all set!</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-[340px]">
          Head to Workflows to build your first pipeline. The editor will guide you through
          adding nodes, connecting them, and running your workflow.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 w-full max-w-[260px]">
        <Link
          href="/workflows"
          onClick={onDismiss}
          className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
        >
          Open Workflows →
        </Link>
        <button
          onClick={onDismiss}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          I'll explore on my own
        </button>
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
const SLIDES = ['welcome', 'nodes', 'canvas', 'run', 'ready'] as const;

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Show on first ever visit
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTimeout(() => {
          setOpen(true);
          setTimeout(() => setVisible(true), 10);
        }, 600);
      }
    } catch { /* localStorage unavailable in SSR or private mode */ }

    // Listen for manual re-open (from TourButton in header)
    const handler = () => {
      setStep(0);
      setOpen(true);
      setTimeout(() => setVisible(true), 10);
    };
    window.addEventListener('flowforge:open-tour', handler);
    return () => window.removeEventListener('flowforge:open-tour', handler);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => setOpen(false), 300);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
  }, []);

  const next = () => {
    if (step < SLIDES.length - 1) setStep(s => s + 1);
    else dismiss();
  };
  const back = () => { if (step > 0) setStep(s => s - 1); };

  if (!open) return null;
  const isLast = step === SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 300ms ease' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div
        className="relative bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] overflow-y-auto"
        style={{
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          transition: 'transform 300ms ease',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gray-900/90 backdrop-blur-sm rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <span className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              FlowForge
            </span>
            <span className="text-xs text-gray-600 font-mono">/ quick tour</span>
          </div>
          <button
            onClick={dismiss}
            aria-label="Close tour"
            className="text-gray-500 hover:text-gray-200 w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/5 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-4 pb-1">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? '20px' : '8px',
                height: '8px',
                background: i <= step ? 'rgb(99 102 241)' : 'rgba(255,255,255,0.1)',
                opacity: i < step ? 0.45 : 1,
              }}
            />
          ))}
        </div>

        {/* Slide content */}
        <div className="px-6 pb-2 pt-2">
          {step === 0 && <SlideWelcome />}
          {step === 1 && <SlideNodes />}
          {step === 2 && <SlideCanvas />}
          {step === 3 && <SlideRun />}
          {step === 4 && <SlideReady onDismiss={dismiss} />}
        </div>

        {/* Footer nav — hidden on last slide (it has its own CTA) */}
        {!isLast && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 mt-4">
              <button
                onClick={back}
                className={`text-sm text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors ${
                  step === 0 ? 'invisible pointer-events-none' : ''
                }`}
              >
                ← Back
              </button>
              <span className="text-xs text-gray-600 tabular-nums">
                {step + 1} / {SLIDES.length}
              </span>
              <button
                onClick={next}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
              >
                {step === SLIDES.length - 2 ? "Let's go →" : 'Next →'}
              </button>
            </div>
            <div className="text-center pb-4">
              <button
                onClick={dismiss}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Skip tour
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
