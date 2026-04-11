import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://flowforge.dev';

const TOOL_PAGES = [
  { slug: 'json-formatter',     priority: 1.0, changeFreq: 'weekly' as const },
  { slug: 'curl-converter',     priority: 1.0, changeFreq: 'weekly' as const },
  { slug: 'base64-encoder',     priority: 0.9, changeFreq: 'weekly' as const },
  { slug: 'jwt-decoder',        priority: 0.9, changeFreq: 'weekly' as const },
  { slug: 'uuid-generator',     priority: 0.9, changeFreq: 'weekly' as const },
  { slug: 'regex-tester',       priority: 0.9, changeFreq: 'weekly' as const },
  { slug: 'sql-formatter',      priority: 0.9, changeFreq: 'weekly' as const },
  { slug: 'markdown-preview',   priority: 0.9, changeFreq: 'weekly' as const },
  { slug: 'html-beautifier',    priority: 0.9, changeFreq: 'weekly' as const },
  { slug: 'color-converter',    priority: 0.9, changeFreq: 'weekly' as const },
  { slug: 'timestamp-converter',priority: 0.9, changeFreq: 'weekly' as const },
  { slug: 'json-to-zod',        priority: 0.8, changeFreq: 'monthly' as const },
  { slug: 'tailwind-sorter',    priority: 0.8, changeFreq: 'monthly' as const },
  { slug: 'tailwind-debloater', priority: 0.8, changeFreq: 'monthly' as const },
  { slug: 'env-validator',      priority: 0.8, changeFreq: 'monthly' as const },
  { slug: 'css-glassmorphism',  priority: 0.8, changeFreq: 'monthly' as const },
  { slug: 'svg-to-react',       priority: 0.8, changeFreq: 'monthly' as const },
  { slug: 'image-placeholder',  priority: 0.7, changeFreq: 'monthly' as const },
  { slug: 'cron-explainer',     priority: 0.7, changeFreq: 'monthly' as const },
  { slug: 'log-anonymizer',     priority: 0.7, changeFreq: 'monthly' as const },
  { slug: 'code-runner',        priority: 0.8, changeFreq: 'monthly' as const },
  { slug: 'geo-analyzer',       priority: 0.7, changeFreq: 'monthly' as const },
  { slug: 'mcp-inspector',      priority: 0.7, changeFreq: 'monthly' as const },
  { slug: 'video-downloader',   priority: 0.7, changeFreq: 'monthly' as const },
];

// Programmatic SEO variant pages
const PROGRAMMATIC_PAGES = [
  'curl-to-fetch-react',
  'curl-to-fetch-nodejs',
  'curl-to-fetch-axios',
  'curl-to-fetch-python',
  'json-formatter-pretty',
  'json-formatter-minify',
  'json-formatter-validate',
  'base64-encode-online',
  'base64-decode-online',
];

// SEO landing pages (standalone)
const LANDING_PAGES = [
  'json-formatter-online',
  'curl-to-fetch-converter',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/tool`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/figma-to-code`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = TOOL_PAGES.map(({ slug, priority, changeFreq }) => ({
    url: `${BASE_URL}/tool/${slug}`,
    lastModified: now,
    changeFrequency: changeFreq,
    priority,
  }));

  const programmaticRoutes: MetadataRoute.Sitemap = PROGRAMMATIC_PAGES.map((slug) => ({
    url: `${BASE_URL}/tools/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const landingRoutes: MetadataRoute.Sitemap = LANDING_PAGES.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...toolRoutes, ...programmaticRoutes, ...landingRoutes];
}
