import type { Metadata } from 'next';
import { getToolMetadata } from '@/lib/tool-metadata';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://flowforge.dev';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolMetadata(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found | FlowForge',
      description: 'This tool could not be found.',
    };
  }

  const ogImage = tool.ogImage ? `${BASE_URL}${tool.ogImage}` : `${BASE_URL}/og-image.png`;
  const url = `${BASE_URL}/tool/${slug}`;

  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
      title: tool.title,
      description: tool.shortDescription,
      type: 'website',
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: tool.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.title,
      description: tool.shortDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {children}
    </div>
  );
}