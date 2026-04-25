'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

// Simple markdown converter
function markdownToHtml(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gm, '<em>$1</em>')
    .replace(/_(.+?)_/gm, '<em>$1</em>')
    // Code
    .replace(/`(.*?)`/gm, '<code>$1</code>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2">$1</a>')
    // Lists
      .replace(/^\* (.*?)$/gm, '<li>$1</li>')
      // Wrap consecutive <li>...</li> in <ul>...</ul>
      .replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>')
    // Line breaks
    .replace(/\n\n/gm, '</p><p>')
    .replace(/\n/gm, '<br />');

  return `<p>${html}</p>`;
}

export default function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState(`# Hello Markdown

This is a **bold** text and this is *italic*.

## Features

* Live preview
* Syntax highlighting
* Export as HTML

Visit [FlowForge](https://flowforge.dev) for more tools.
`);

  const tool = getToolMetadata('markdown-preview');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'Markdown Preview' }]} />

        <ToolShell
          title="Markdown Preview"
          description="Write Markdown and see live preview with syntax support."
          badge="NEW"
          inputLabel="Markdown"
          outputLabel="Preview"
          inputSlot={
            <textarea
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              placeholder="Enter Markdown here..."
              className="w-full h-64 bg-transparent text-gray-300 text-sm font-mono p-4 outline-none resize-none"
            />
          }
          outputSlot={
            <div className="prose prose-invert max-w-none">
              <div
                className="text-sm leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(markdown),
                }}
              />
            </div>
          }
          outputText={markdown}
          fileName="content.md"
          onClear={() => setMarkdown('')}
          runLabel="Preview ↵"
          singlePanel={false}
        />
      </div>
    </>
  );
}
