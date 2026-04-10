import Link from 'next/link';
import ToolCard from '@/components/tool/ToolCard';

const DEVELOPER_TOOLS = [
  {
    href: '/tool/json-formatter',
    title: 'JSON Formatter & Beautifier',
    description: 'Format, beautify, and minify JSON data. Sort keys, remove comments, handle large files efficiently.',
    features: ['Pretty print', 'Minify', 'Sort keys', 'Large file support'],
    phase: 1 as const,
    category: 'developer' as const,
  },
  {
    href: '/tool/json-to-zod',
    title: 'JSON to Zod Schema',
    description: 'Convert JSON to TypeScript Zod validation schemas with intelligent type detection.',
    features: ['Smart type detection', 'Nested objects', 'Strict mode', 'Optional fields'],
    phase: 1 as const,
    category: 'developer' as const,
  },
  {
    href: '/tool/tailwind-sorter',
    title: 'Tailwind CSS Class Sorter',
    description: 'Sort Tailwind utility classes following the official recommended order automatically.',
    features: ['Official order', 'Remove duplicates', 'Category stats', 'JSX support'],
    phase: 1 as const,
    category: 'developer' as const,
  },
  {
    href: '/tool/tailwind-debloater',
    title: 'Tailwind De-Bloater',
    description: 'Convert utility-heavy Tailwind components into clean semantic CSS classes for production.',
    features: ['Semantic output', 'Migration hints', 'Mapped stats', 'Open Props'],
    badge: 'NEW',
    phase: 1 as const,
    category: 'developer' as const,
  },
  {
    href: '/tool/env-validator',
    title: 'Environment File Validator',
    description: 'Validate .env files against templates. Detect missing keys, duplicates, and config errors.',
    features: ['Template validation', 'Error detection', 'Auto-formatting', 'Key sorting'],
    phase: 1 as const,
    category: 'developer' as const,
  },
  {
    href: '/tool/css-glassmorphism',
    title: 'CSS Glassmorphism Generator',
    description: 'Generate frosted-glass CSS and Tailwind code with customizable blur, opacity, and colors.',
    features: ['CSS + Tailwind', 'State variants', 'Color picker', 'Live preview'],
    phase: 1 as const,
    category: 'developer' as const,
  },
  {
    href: '/tool/svg-to-react',
    title: 'SVG to React Converter',
    description: 'Convert SVG markup to clean React and TypeScript components with auto attribute conversion.',
    features: ['TypeScript support', 'Responsive SVGs', 'Auto conversion', 'Custom props'],
    phase: 1 as const,
    category: 'developer' as const,
  },
  {
    href: '/tool/image-placeholder',
    title: 'Image Placeholder Generator',
    description: 'Generate base64 color blocks and Tailwind-ready placeholder components for wireframes.',
    features: ['Base64 + Tailwind', 'Patterns', 'Offline capable', 'Custom dimensions'],
    phase: 1 as const,
    category: 'developer' as const,
  },
  {
    href: '/tool/cron-explainer',
    title: 'Cron Job Explainer',
    description: 'Translate cron syntax into plain English and predict next run times with timezone support.',
    features: ['English explanations', 'Next runs', 'Timezone support', 'Frequency calc'],
    phase: 1 as const,
    category: 'developer' as const,
  },
  {
    href: '/tool/curl-converter',
    title: 'Curl to Fetch / Axios',
    description: 'Convert curl commands to modern JavaScript and TypeScript code instantly.',
    features: ['Fetch, Axios, XHR', 'TypeScript', 'Error handling', 'Headers support'],
    phase: 1 as const,
    category: 'developer' as const,
  },
  {
    href: '/tool/log-anonymizer',
    title: 'Log File Anonymizer',
    description: 'Replace sensitive data in log files with placeholders for privacy and compliance.',
    features: ['6+ data types', 'Custom patterns', '3 strategies', 'Privacy compliant'],
    phase: 1 as const,
    category: 'developer' as const,
  },
  {
    href: '/tool/code-runner',
    title: 'Online Code Runner',
    description: 'Run Python and JavaScript instantly in your browser. WebAssembly-powered, zero server execution.',
    features: ['Python 3 (Pyodide)', 'JavaScript ES2024', 'Client-side only', '10s timeout'],
    badge: 'NEW',
    phase: 3 as const,
    category: 'developer' as const,
  },
];

const AI_TOOLS = [
  {
    href: '/figma-to-code',
    title: 'Image → Code Converter',
    description: 'Upload any UI screenshot and get pixel-perfect code in HTML, React, Flutter, React Native or Flask.',
    features: ['5 frameworks', 'gpt-4o vision', 'Auto-continuation', 'Live preview'],
    badge: 'AI',
    phase: 2 as const,
    category: 'ai' as const,
  },
  {
    href: '/tool/geo-analyzer',
    title: 'GEO Citation Analyzer',
    description: 'Score your pages for AI citation readiness, extractability, structure quality, and trust signals.',
    features: ['GEO score', 'E-E-A-T checks', 'Extractability', 'Recommendations'],
    badge: 'AI',
    phase: 2 as const,
    category: 'ai' as const,
  },
  {
    href: '/tool/mcp-inspector',
    title: 'MCP Live Inspector',
    description: 'Validate MCP server snippets for tool discovery, schema coverage, JSON-RPC patterns, and security.',
    features: ['Tool discovery', 'JSON-RPC validation', 'Schema diagnostics', 'Blueprint output'],
    badge: 'AI',
    phase: 2 as const,
    category: 'ai' as const,
  },
];

const UTILITY_TOOLS = [
  {
    href: '/tool/video-downloader',
    title: 'Video Link Downloader',
    description: 'Download videos from YouTube, Instagram, TikTok, Twitter/X, Facebook, and Vimeo.',
    features: ['YouTube & Instagram', 'TikTok & Twitter/X', 'Direct URLs', 'One-click download'],
    phase: 3 as const,
    category: 'utility' as const,
  },
];

const totalTools = DEVELOPER_TOOLS.length + AI_TOOLS.length + UTILITY_TOOLS.length;

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── Nav ────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-lg mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            FlowForge
          </Link>
          <span className="text-xs text-gray-600 font-mono">{totalTools} tools available</span>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
        <div className="max-w-screen-lg mx-auto px-6 pt-16 pb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold
                          bg-indigo-500/10 border border-indigo-500/20 text-indigo-300
                          px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Developer Tools
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
            Free tools for modern<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              web development.
            </span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-xl">
            Convert, validate, and optimize your code. No signup. No tracking.
            No limits. Just tools that work.
          </p>
        </div>
      </div>

      {/* ── Tool sections ──────────────────────────────────────────── */}
      <div className="max-w-screen-lg mx-auto px-6 pb-24 space-y-16">

        {/* Developer tools */}
        <section>
          <SectionHeader label="Developer Tools" count={DEVELOPER_TOOLS.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {DEVELOPER_TOOLS.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </section>

        {/* AI tools */}
        <section>
          <SectionHeader label="AI-Powered Tools" count={AI_TOOLS.length} accent="purple" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AI_TOOLS.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </section>

        {/* Utility tools */}
        <section>
          <SectionHeader label="Utility Tools" count={UTILITY_TOOLS.length} accent="amber" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {UTILITY_TOOLS.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

function SectionHeader({
  label,
  count,
  accent = 'indigo',
}: {
  label: string;
  count: number;
  accent?: 'indigo' | 'purple' | 'amber';
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono whitespace-nowrap">
        {label}
      </h2>
      <div className="flex-1 h-px bg-gray-800" />
      <span className="text-xs text-gray-700 font-mono">{count}</span>
    </div>
  );
}