import { ToolMetadata, generateToolSchema } from '@/lib/tool-metadata';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://flowforge.dev';

interface SchemaMarkupProps {
  tool: ToolMetadata;
}

/**
 * Renders JSON-LD schema markup for a tool
 * Improves SEO and helps search engines understand tool metadata
 */
export default function SchemaMarkup({ tool }: SchemaMarkupProps) {
  const schema = generateToolSchema(tool, BASE_URL);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
