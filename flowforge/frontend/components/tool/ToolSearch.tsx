'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ToolMetadata } from '@/lib/tool-metadata';

interface ToolSearchProps {
  tools: ToolMetadata[];
}

export default function ToolSearch({ tools }: ToolSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'developer' | 'ai' | 'utility'>(
    'all'
  );
  const [showHistory, setShowHistory] = useState(false);
  const [recentTools, setRecentTools] = useState<string[]>([]);

  // Load recent tools from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flowforge_recent_tools');
      if (saved) {
        try {
          setRecentTools(JSON.parse(saved));
        } catch {
          // Ignore invalid JSON
        }
      }
    }
  }, []);

  // Filter tools based on query and category
  const filteredTools = useMemo(() => {
    let results = tools;

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(t => t.category === selectedCategory);
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some(k => k.toLowerCase().includes(q)) ||
          t.features.some(f => f.toLowerCase().includes(q))
      );
    }

    return results;
  }, [query, selectedCategory, tools]);


  const handleClear = useCallback(() => {
    setQuery('');
    setSelectedCategory('all');
  }, []);

  const handleToolClick = useCallback((slug: string) => {
    // Save to recent tools
    if (typeof window !== 'undefined') {
      const updated = [slug, ...recentTools.filter(t => t !== slug)].slice(0, 5);
      setRecentTools(updated);
      localStorage.setItem('flowforge_recent_tools', JSON.stringify(updated));
    }
  }, [recentTools]);

  const categoryOptions = [
    { value: 'all' as const, label: 'All Tools' },
    { value: 'developer' as const, label: 'Developer Tools' },
    { value: 'ai' as const, label: 'AI-Powered' },
    { value: 'utility' as const, label: 'Utility' },
  ];

  const recentToolsData = recentTools
    .map(slug => tools.find(t => t.slug === slug))
    .filter(Boolean) as ToolMetadata[];

  return (
    <div className="w-full space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search tools by name, feature, or keyword... (Cmd+K)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800
                       text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500
                       focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categoryOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedCategory(option.value)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all font-sm text-sm ${
                selectedCategory === option.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
          {(query || selectedCategory !== 'all') && (
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-400">
        {query ? (
          <>
            Found <span className="font-semibold text-white">{filteredTools.length}</span> tool
            {filteredTools.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </>
        ) : (
          <>
            Showing <span className="font-semibold text-white">{filteredTools.length}</span>{' '}
            tool{filteredTools.length !== 1 ? 's' : ''}
          </>
        )}
      </div>

      {/* History (when focused and not searching) */}
      {!query && showHistory && recentToolsData.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Recent</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentToolsData.map(tool => (
              <Link
                key={tool.slug}
                href={tool.slug.startsWith('http') ? tool.slug : `/tool/${tool.slug}`}
                onClick={() => handleToolClick(tool.slug)}
                className="p-3 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-800
                           hover:border-gray-700 transition-all"
              >
                <div className="text-sm font-medium text-white truncate">{tool.title}</div>
                <div className="text-xs text-gray-500 truncate">{tool.shortDescription}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-2xl mb-2">🔍</div>
          <p className="text-gray-400">
            No tools found for &quot;{query}&quot;
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </p>
          <button
            onClick={handleClear}
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
