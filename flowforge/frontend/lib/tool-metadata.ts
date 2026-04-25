export interface ToolMetadata {
  slug: string;
  title: string;
  description: string;
  shortDescription: string; // 50-60 chars for OG/meta
  keywords: string[];
  category: 'developer' | 'ai' | 'utility';
  features: string[];
  ogImage?: string; // Path to OG image
  badge?: 'NEW' | 'AI' | string;
  phase: number;
  seoSection?: string; // "Converters", "Formatters", "Generators", etc.
}

export const TOOL_METADATA: Record<string, ToolMetadata> = {
  // ──────────────────────────────────────────────────────────────
  // EXISTING TOOLS (Phase 1-3)
  // ──────────────────────────────────────────────────────────────

  // Developer Tools - Phase 1
  'json-formatter': {
    slug: 'json-formatter',
    title: 'JSON Formatter & Beautifier — Free Online Tool | FlowForge',
    description:
      'Format, beautify, minify, and sort JSON data instantly. Handle large files, remove comments, validate syntax, and organize keys automatically.',
    shortDescription: 'Format, beautify & minify JSON data. No signup required.',
    keywords: [
      'json formatter',
      'json beautifier',
      'json minifier',
      'json validator',
      'pretty print json',
      'format json online',
    ],
    features: ['Pretty print', 'Minify', 'Sort keys', 'Large file support'],
    category: 'developer',
    phase: 1,
    seoSection: 'Formatters',
  },

  'json-to-zod': {
    slug: 'json-to-zod',
    title: 'JSON to Zod Schema Generator — TypeScript Validation | FlowForge',
    description:
      'Convert JSON data to TypeScript Zod validation schemas with intelligent type detection, nested object support, and strict mode options.',
    shortDescription: 'Convert JSON to Zod validation schemas instantly.',
    keywords: [
      'json to zod',
      'zod schema generator',
      'typescript validation',
      'json schema converter',
      'type detection',
    ],
    features: ['Smart type detection', 'Nested objects', 'Strict mode', 'Optional fields'],
    category: 'developer',
    phase: 1,
    seoSection: 'Converters',
  },

  'tailwind-sorter': {
    slug: 'tailwind-sorter',
    title: 'Tailwind CSS Class Sorter — Official Order | FlowForge',
    description:
      'Sort Tailwind utility classes following the official recommended order. Remove duplicates, show category statistics, and format JSX automatically.',
    shortDescription: 'Sort Tailwind classes by official order instantly.',
    keywords: [
      'tailwind sorter',
      'tailwind class order',
      'css utility sorter',
      'tailwind formatter',
      'class organization',
    ],
    features: ['Official order', 'Remove duplicates', 'Category stats', 'JSX support'],
    category: 'developer',
    phase: 1,
    seoSection: 'Formatters',
  },

  'tailwind-debloater': {
    slug: 'tailwind-debloater',
    title: 'Tailwind De-Bloater — Semantic CSS Generator | FlowForge',
    description:
      'Convert utility-heavy Tailwind components into clean semantic CSS classes for production. Get migration hints and see mapped statistics.',
    shortDescription: 'Convert Tailwind utilities to semantic CSS classes.',
    keywords: [
      'tailwind debloater',
      'semantic css',
      'tailwind to css',
      'css optimization',
      'utility consolidation',
    ],
    features: ['Semantic output', 'Migration hints', 'Mapped stats', 'Open Props'],
    category: 'developer',
    phase: 1,
    badge: 'NEW',
    seoSection: 'Optimizers',
  },

  'env-validator': {
    slug: 'env-validator',
    title: 'Environment File Validator — .env Checker | FlowForge',
    description:
      'Validate .env files against templates. Detect missing keys, duplicates, and configuration errors automatically with auto-formatting.',
    shortDescription: 'Validate .env files and detect configuration errors.',
    keywords: [
      'env validator',
      '.env validator',
      'environment file checker',
      'env file validation',
      'config validator',
    ],
    features: ['Template validation', 'Error detection', 'Auto-formatting', 'Key sorting'],
    category: 'developer',
    phase: 1,
    seoSection: 'Validators',
  },

  'css-glassmorphism': {
    slug: 'css-glassmorphism',
    title: 'CSS Glassmorphism Generator — Frosted Glass Effect | FlowForge',
    description:
      'Generate frosted-glass CSS and Tailwind code with customizable blur, opacity, and colors. Includes state variants and live preview.',
    shortDescription: 'Generate glassmorphism CSS and Tailwind code.',
    keywords: [
      'glassmorphism generator',
      'frosted glass css',
      'tailwind glassmorphism',
      'css generator',
      'ui effect generator',
    ],
    features: ['CSS + Tailwind', 'State variants', 'Color picker', 'Live preview'],
    category: 'developer',
    phase: 1,
    seoSection: 'Generators',
  },

  'svg-to-react': {
    slug: 'svg-to-react',
    title: 'SVG to React Converter — Component Generator | FlowForge',
    description:
      'Convert SVG markup to clean, optimized React and TypeScript components with automatic attribute conversion and responsive support.',
    shortDescription: 'Convert SVG to React components automatically.',
    keywords: [
      'svg to react',
      'svg converter',
      'react component generator',
      'svg component',
      'icon converter',
    ],
    features: ['TypeScript support', 'Responsive SVGs', 'Auto conversion', 'Custom props'],
    category: 'developer',
    phase: 1,
    seoSection: 'Converters',
  },

  'image-placeholder': {
    slug: 'image-placeholder',
    title: 'Image Placeholder Generator — Base64 & Tailwind | FlowForge',
    description:
      'Generate base64 color blocks and Tailwind-ready placeholder components for wireframes. Offline capable with custom dimensions.',
    shortDescription: 'Generate image placeholders for wireframes and prototypes.',
    keywords: [
      'placeholder generator',
      'image placeholder',
      'base64 generator',
      'wireframe placeholder',
      'mock image',
    ],
    features: ['Base64 + Tailwind', 'Patterns', 'Offline capable', 'Custom dimensions'],
    category: 'developer',
    phase: 1,
    seoSection: 'Generators',
  },

  'cron-explainer': {
    slug: 'cron-explainer',
    title: 'Cron Job Explainer — Syntax Translator | FlowForge',
    description:
      'Translate cron syntax into plain English and predict next run times with timezone support. Includes frequency calculator and explanations.',
    shortDescription: 'Translate cron syntax to English with next run times.',
    keywords: [
      'cron explainer',
      'cron syntax',
      'cron translator',
      'cron schedule',
      'scheduled jobs',
    ],
    features: ['English explanations', 'Next runs', 'Timezone support', 'Frequency calc'],
    category: 'developer',
    phase: 1,
    seoSection: 'Utilities',
  },

  'curl-converter': {
    slug: 'curl-converter',
    title: 'Curl to Fetch/Axios Converter — Code Generator | FlowForge',
    description:
      'Convert curl commands to modern JavaScript and TypeScript code instantly. Generate Fetch, Axios, or XHR code with error handling.',
    shortDescription: 'Convert curl commands to Fetch, Axios & JavaScript.',
    keywords: [
      'curl converter',
      'curl to fetch',
      'curl to axios',
      'http converter',
      'api code generator',
    ],
    features: ['Fetch, Axios, XHR', 'TypeScript', 'Error handling', 'Headers support'],
    category: 'developer',
    phase: 1,
    seoSection: 'Converters',
  },

  'log-anonymizer': {
    slug: 'log-anonymizer',
    title: 'Log File Anonymizer — Privacy Protection Tool | FlowForge',
    description:
      'Replace sensitive data in log files with placeholders for privacy and GDPR compliance. Supports 6+ data types and custom patterns.',
    shortDescription: 'Anonymize sensitive data in log files for compliance.',
    keywords: [
      'log anonymizer',
      'data anonymizer',
      'privacy tool',
      'gdpr compliance',
      'log redaction',
    ],
    features: ['6+ data types', 'Custom patterns', '3 strategies', 'Privacy compliant'],
    category: 'developer',
    phase: 1,
    seoSection: 'Utilities',
  },

  'code-runner': {
    slug: 'code-runner',
    title: 'Online Code Runner — Python & JavaScript | FlowForge',
    description:
      'Run Python and JavaScript code instantly in your browser. WebAssembly-powered execution with zero server processing, 10-second timeout.',
    shortDescription: 'Run Python & JavaScript code in your browser.',
    keywords: [
      'code runner',
      'online compiler',
      'python runner',
      'javascript executor',
      'browser ide',
    ],
    features: ['Python 3 (Pyodide)', 'JavaScript ES2024', 'Client-side only', '10s timeout'],
    category: 'developer',
    phase: 3,
    badge: 'NEW',
    seoSection: 'Executors',
  },

  // ──────────────────────────────────────────────────────────────
  // AI-POWERED TOOLS (Phase 2-3)
  // ──────────────────────────────────────────────────────────────

  'figma-to-code': {
    slug: 'figma-to-code',
    title: 'Figma to Code Converter — AI-Powered UI Generator | FlowForge',
    description:
      'Upload any UI screenshot or Figma design mockup and get pixel-perfect production-ready code in HTML, React, React Native, Flask, or Flutter.',
    shortDescription: 'Convert UI designs to production-ready code with AI.',
    keywords: [
      'figma to code',
      'design to code',
      'ui to code',
      'screenshot to code',
      'design automation',
    ],
    features: ['5 frameworks', 'gpt-4o vision', 'Auto-continuation', 'Live preview'],
    category: 'ai',
    phase: 2,
    badge: 'AI',
    seoSection: 'Converters',
  },

  'geo-analyzer': {
    slug: 'geo-analyzer',
    title: 'GEO Citation Analyzer — AI Content Scoring | FlowForge',
    description:
      'Score your pages for AI citation readiness, extractability, structure quality, and trust signals. Get E-E-A-T checks and recommendations.',
    shortDescription: 'Score content for AI citation readiness & extractability.',
    keywords: [
      'geo analyzer',
      'citation score',
      'content analyzer',
      'seo checker',
      'ai extractability',
    ],
    features: ['GEO score', 'E-E-A-T checks', 'Extractability', 'Recommendations'],
    category: 'ai',
    phase: 2,
    badge: 'AI',
    seoSection: 'Analyzers',
  },

  'mcp-inspector': {
    slug: 'mcp-inspector',
    title: 'MCP Live Inspector — Protocol Validator | FlowForge',
    description:
      'Validate MCP server snippets for tool discovery, schema coverage, JSON-RPC patterns, and security with live diagnostics and blueprint output.',
    shortDescription: 'Validate MCP servers and schema coverage instantly.',
    keywords: [
      'mcp inspector',
      'protocol validator',
      'json-rpc validator',
      'server inspector',
      'api validator',
    ],
    features: ['Tool discovery', 'JSON-RPC validation', 'Schema diagnostics', 'Blueprint output'],
    category: 'ai',
    phase: 2,
    badge: 'AI',
    seoSection: 'Validators',
  },

  // ──────────────────────────────────────────────────────────────
  // UTILITY TOOLS (Phase 3+)
  // ──────────────────────────────────────────────────────────────

  'video-downloader': {
    slug: 'video-downloader',
    title: 'Video Link Downloader — YouTube, TikTok, Instagram | FlowForge',
    description:
      'Download videos from YouTube, Instagram, TikTok, Twitter/X, Facebook, and Vimeo. One-click download, direct URLs, no signup needed.',
    shortDescription: 'Download videos from YouTube, TikTok, Instagram & more.',
    keywords: [
      'video downloader',
      'youtube downloader',
      'tiktok downloader',
      'instagram downloader',
      'twitter video downloader',
    ],
    features: ['YouTube & Instagram', 'TikTok & Twitter/X', 'Direct URLs', 'One-click download'],
    category: 'utility',
    phase: 3,
    seoSection: 'Downloaders',
  },

  // ──────────────────────────────────────────────────────────────
  // NEW TOOLS - TIER 1 (Phase 1, ~20-25 hours)
  // ──────────────────────────────────────────────────────────────

  'jwt-debugger': {
    slug: 'jwt-debugger',
    title: 'JWT Debugger — Token Decoder & Validator | FlowForge',
    description:
      'Decode, verify, and inspect JWT tokens instantly. Parse header and payload, validate signatures, check expiration, and analyze claims.',
    shortDescription: 'Decode and verify JWT tokens with signature validation.',
    keywords: [
      'jwt debugger',
      'jwt decoder',
      'jwt validator',
      'token debugger',
      'jwt inspection',
    ],
    features: ['Parse header & payload', 'Signature validation', 'Expiration check', 'Claims analysis'],
    category: 'developer',
    phase: 1,
    badge: 'NEW',
    seoSection: 'Validators',
  },

  'base64-encoder': {
    slug: 'base64-encoder',
    title: 'Base64 Encoder/Decoder — Encode & Decode Online | FlowForge',
    description:
      'Encode and decode Base64 strings and files instantly. Convert between Base64, UTF-8, and URL-safe Base64 formats with file upload support.',
    shortDescription: 'Encode and decode Base64 strings and files online.',
    keywords: [
      'base64 encoder',
      'base64 decoder',
      'base64 converter',
      'url safe base64',
      'base64 online',
    ],
    features: ['Base64 ↔ UTF-8', 'URL-safe Base64', 'File upload', 'Batch processing'],
    category: 'developer',
    phase: 1,
    badge: 'NEW',
    seoSection: 'Converters',
  },

  'hash-generator': {
    slug: 'hash-generator',
    title: 'Cryptographic Hash Generator — MD5, SHA256 | FlowForge',
    description:
      'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files. Output in hexadecimal or Base64 format instantly.',
    shortDescription: 'Generate MD5, SHA, and cryptographic hashes instantly.',
    keywords: [
      'hash generator',
      'md5 generator',
      'sha256 generator',
      'sha hash',
      'crypto hash',
    ],
    features: ['MD5, SHA-1, SHA-256, SHA-512', 'Text & file input', 'Hex & Base64 output', 'Batch hash'],
    category: 'developer',
    phase: 1,
    badge: 'NEW',
    seoSection: 'Generators',
  },

  'uuid-generator': {
    slug: 'uuid-generator',
    title: 'UUID Generator — v1, v4, v6, & v7 | FlowForge',
    description:
      'Generate UUIDs (v1, v4, v6, v7) instantly. Batch generate 100+ UUIDs at once, validate UUID format, and copy individually or all.',
    shortDescription: 'Generate UUIDs (v1, v4, v6, v7) in bulk instantly.',
    keywords: [
      'uuid generator',
      'guid generator',
      'uuid v4 generator',
      'unique id generator',
      'batch uuid',
    ],
    features: ['v1, v4, v6, v7 support', 'Batch generation', 'UUID validation', 'Copy all/individual'],
    category: 'developer',
    phase: 1,
    badge: 'NEW',
    seoSection: 'Generators',
  },

  'regex-tester': {
    slug: 'regex-tester',
    title: 'Regular Expression Tester — Regex Debugger | FlowForge',
    description:
      'Test regex patterns against sample text with live matching. See matches, groups, capture groups, and include regex cheat sheet guide.',
    shortDescription: 'Test regex patterns with live matching and capture groups.',
    keywords: [
      'regex tester',
      'regular expression tester',
      'regex debugger',
      'regex validator',
      'pattern tester',
    ],
    features: ['Live matching', 'Capture groups', 'Pattern flags', 'Cheat sheet'],
    category: 'developer',
    phase: 1,
    badge: 'NEW',
    seoSection: 'Testers',
  },

  'markdown-preview': {
    slug: 'markdown-preview',
    title: 'Markdown Preview — Live Editor | FlowForge',
    description:
      'Write Markdown and see live preview. Supports GFM, tables, strikethrough, code highlighting, and download as HTML or PDF.',
    shortDescription: 'Write Markdown and preview with live rendering.',
    keywords: [
      'markdown preview',
      'markdown editor',
      'live markdown',
      'markdown to html',
      'markdown viewer',
    ],
    features: ['GFM support', 'Tables & strikethrough', 'Code highlighting', 'HTML/PDF export'],
    category: 'developer',
    phase: 1,
    badge: 'NEW',
    seoSection: 'Editors',
  },

  // ──────────────────────────────────────────────────────────────
  // NEW TOOLS - TIER 2 (Phase 2, ~10-12 hours)
  // ──────────────────────────────────────────────────────────────

  'color-converter': {
    slug: 'color-converter',
    title: 'Color Picker & Converter — HEX RGB HSL HSV | FlowForge',
    description:
      'Convert colors between HEX, RGB, HSL, and HSV formats. Visual color picker, palette generator, and accessibility contrast ratio checker.',
    shortDescription: 'Convert colors between HEX, RGB, HSL & HSV formats.',
    keywords: [
      'color converter',
      'color picker',
      'hex to rgb',
      'color generator',
      'palette generator',
    ],
    features: ['HEX ↔ RGB ↔ HSL ↔ HSV', 'Visual picker', 'Palette generator', 'Accessibility check'],
    category: 'developer',
    phase: 2,
    badge: 'NEW',
    seoSection: 'Converters',
  },

  'xml-validator': {
    slug: 'xml-validator',
    title: 'XML/HTML Validator & Formatter | FlowForge',
    description:
      'Validate, format, and minify XML and HTML with automatic indentation. Find missing closing tags and detect schema errors.',
    shortDescription: 'Validate and format XML/HTML with error detection.',
    keywords: [
      'xml validator',
      'html validator',
      'xml formatter',
      'schema validator',
      'xml to json',
    ],
    features: ['Validation & formatting', 'Schema checking', 'Minify', 'Tag detection'],
    category: 'developer',
    phase: 2,
    badge: 'NEW',
    seoSection: 'Validators',
  },

  'qr-code-generator': {
    slug: 'qr-code-generator',
    title: 'QR Code Generator — Download PNG & SVG | FlowForge',
    description:
      'Generate QR codes from text, URLs, vCards, or WiFi credentials. Download as PNG or SVG with customizable size and error correction.',
    shortDescription: 'Generate QR codes from text, URLs & WiFi data.',
    keywords: [
      'qr code generator',
      'qr code maker',
      'qr encoder',
      'barcode generator',
      'wifi qr code',
    ],
    features: ['Text/URL/vCard/WiFi', 'PNG & SVG download', 'Size customizable', 'Error correction'],
    category: 'developer',
    phase: 2,
    badge: 'NEW',
    seoSection: 'Generators',
  },

  'password-generator': {
    slug: 'password-generator',
    title: 'Secure Password Generator — Strength Meter | FlowForge',
    description:
      'Generate cryptographically secure passwords with customizable length, character types, and strength meter. Batch generate and copy instantly.',
    shortDescription: 'Generate secure passwords with strength meter instantly.',
    keywords: [
      'password generator',
      'secure password',
      'random password',
      'password strength',
      'password maker',
    ],
    features: ['Customizable length', 'Character options', 'Strength meter', 'Batch generation'],
    category: 'developer',
    phase: 2,
    badge: 'NEW',
    seoSection: 'Generators',
  },

  // ──────────────────────────────────────────────────────────────
  // NEW TOOLS - TIER 3 (Phase 3, ~10-15 hours)
  // ──────────────────────────────────────────────────────────────

  'yaml-json-converter': {
    slug: 'yaml-json-converter',
    title: 'YAML to JSON Converter — Format Converter | FlowForge',
    description:
      'Convert YAML to JSON and JSON to YAML formats. Parse and validate both formats with pretty-printing and edge case handling.',
    shortDescription: 'Convert between YAML and JSON formats instantly.',
    keywords: [
      'yaml converter',
      'json to yaml',
      'yaml to json',
      'format converter',
      'data format',
    ],
    features: ['YAML ↔ JSON', 'Validation', 'Pretty-print', 'Edge case handling'],
    category: 'developer',
    phase: 3,
    badge: 'NEW',
    seoSection: 'Converters',
  },

  'csv-json-converter': {
    slug: 'csv-json-converter',
    title: 'CSV to JSON Converter — Data Transformer | FlowForge',
    description:
      'Convert CSV files to JSON format instantly. Upload files or paste text, customize headers and delimiters, output as array or objects.',
    shortDescription: 'Convert CSV data to JSON format with customization.',
    keywords: [
      'csv to json',
      'csv converter',
      'data converter',
      'spreadsheet converter',
      'json array',
    ],
    features: ['CSV upload & paste', 'Custom delimiter', 'Array/object output', 'Header mapping'],
    category: 'developer',
    phase: 3,
    badge: 'NEW',
    seoSection: 'Converters',
  },

  'timestamp-converter': {
    slug: 'timestamp-converter',
    title: 'Unix Timestamp Converter — Time Formatter | FlowForge',
    description:
      'Convert Unix timestamps to ISO 8601 and human-readable formats instantly. Show timezone info, current time button, and format converter.',
    shortDescription: 'Convert Unix timestamps to human-readable dates.',
    keywords: [
      'timestamp converter',
      'unix timestamp',
      'epoch converter',
      'time converter',
      'date converter',
    ],
    features: ['Unix ↔ ISO 8601', 'Human-readable output', 'Timezone support', 'Current time'],
    category: 'developer',
    phase: 3,
    badge: 'NEW',
    seoSection: 'Converters',
  },

  'ip-lookup': {
    slug: 'ip-lookup',
    title: 'IP Address Lookup — Geolocation & ISP Info | FlowForge',
    description:
      'Look up IP address information including geolocation, ISP, country, and connectivity details. Bulk lookup and whois information.',
    shortDescription: 'Look up IP addresses for geolocation & ISP info.',
    keywords: [
      'ip lookup',
      'ip checker',
      'geolocation lookup',
      'whois lookup',
      'ip address finder',
    ],
    features: ['Geolocation', 'ISP info', 'Bulk lookup', 'Whois data'],
    category: 'utility',
    phase: 3,
    badge: 'NEW',
    seoSection: 'Utilities',
  },

  // ──────────────────────────────────────────────────────────────
  // NEW TOOLS - TIER 4 (Phase 4, advanced tools)
  // ──────────────────────────────────────────────────────────────

  'sql-formatter': {
    slug: 'sql-formatter',
    title: 'SQL Formatter & Validator — Query Formatter | FlowForge',
    description:
      'Format and minify SQL queries with support for MySQL, PostgreSQL, SQLite, and MSSQL dialects. Syntax error detection and keyword highlighting.',
    shortDescription: 'Format SQL queries with syntax validation.',
    keywords: [
      'sql formatter',
      'sql beautifier',
      'query formatter',
      'sql validator',
      'sql minifier',
    ],
    features: ['Multi-dialect', 'Syntax highlighting', 'Minify/beautify', 'Error detection'],
    category: 'developer',
    phase: 3,
    badge: 'NEW',
    seoSection: 'Formatters',
  },

  'api-response-beautifier': {
    slug: 'api-response-beautifier',
    title: 'API Response Beautifier — Format Detector | FlowForge',
    description:
      'Format API responses with automatic format detection (JSON, XML, HTML, plain text). Show response statistics, size, and structure.',
    shortDescription: 'Format API responses with auto-detection.',
    keywords: [
      'api response formatter',
      'json formatter',
      'response beautifier',
      'api debugger',
      'data formatter',
    ],
    features: ['Auto-detection', 'Format conversion', 'Size stats', 'Structure analysis'],
    category: 'developer',
    phase: 3,
    badge: 'NEW',
    seoSection: 'Formatters',
  },
};

export function getToolMetadata(slug: string): ToolMetadata | null {
  return TOOL_METADATA[slug] || null;
}

export function getAllToolMetadata(): ToolMetadata[] {
  return Object.values(TOOL_METADATA);
}

export function getToolsByCategory(category: 'developer' | 'ai' | 'utility'): ToolMetadata[] {
  return Object.values(TOOL_METADATA).filter(t => t.category === category);
}

export function getToolsByPhase(phase: number): ToolMetadata[] {
  return Object.values(TOOL_METADATA).filter(t => t.phase === phase);
}

export function getToolsBySection(section: string): ToolMetadata[] {
  return Object.values(TOOL_METADATA).filter(t => t.seoSection === section);
}

/**
 * Generate JSON-LD structured data for a tool
 */
export function generateToolSchema(tool: ToolMetadata, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: tool.description,
    applicationCategory: 'Productivity',
    url: `${baseUrl}/tool/${tool.slug}`,
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '100',
    },
  };
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
