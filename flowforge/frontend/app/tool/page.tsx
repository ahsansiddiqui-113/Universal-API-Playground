'use client';
import Link from 'next/link';
import ToolCard from '@/components/tool/ToolCard';
import ToolSearch from '@/components/tool/ToolSearch';
import { getAllToolMetadata, getToolsByCategory } from '@/lib/tool-metadata';

// Map metadata to ToolCard props
function toolMetadataToCard(tool: any) {
  return {
    href: tool.slug.startsWith('http') ? tool.slug : `/tool/${tool.slug}`,
    title: tool.title.split(' — ')[0], // Remove SEO suffix for display
    description: tool.shortDescription,
    features: tool.features,
    category: tool.category,
    badge: tool.badge,
    phase: tool.phase,
  };
}

export default function ToolsHubPage() {
  const allTools = getAllToolMetadata();
  const developerTools = getToolsByCategory('developer');
  const aiTools = getToolsByCategory('ai');
  const utilityTools = getToolsByCategory('utility');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
        <div className="max-w-screen-lg mx-auto px-6 pt-16 pb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Developer Tools Hub
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
            Free tools for modern<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              web development.
            </span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-xl">
            {allTools.length}+ free online tools. Convert, validate, optimize, and automate. No signup. No tracking. Just tools that work.
          </p>
        </div>
      </div>

      {/* ── Search ────────────────────────────────────────────────── */}
      <div className="max-w-screen-lg mx-auto px-6 py-12">
        <ToolSearch tools={allTools} />
      </div>

      {/* ── Tool sections ──────────────────────────────────────────── */}
      <div className="max-w-screen-lg mx-auto px-6 pb-24 space-y-16">
        {/* Developer tools */}
        <section>
          <SectionHeader label="Developer Tools" count={developerTools.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {developerTools.map((tool) => (
              <ToolCard key={tool.slug} {...toolMetadataToCard(tool)} />
            ))}
          </div>
        </section>

        {/* AI tools */}
        <section>
          <SectionHeader label="AI-Powered Tools" count={aiTools.length} accent="purple" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiTools.map((tool) => (
              <ToolCard key={tool.slug} {...toolMetadataToCard(tool)} />
            ))}
          </div>
        </section>

        {/* Utility tools */}
        <section>
          <SectionHeader label="Utility Tools" count={utilityTools.length} accent="amber" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {utilityTools.map((tool) => (
              <ToolCard key={tool.slug} {...toolMetadataToCard(tool)} />
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