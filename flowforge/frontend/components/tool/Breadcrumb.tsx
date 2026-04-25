import Link from 'next/link';
import { generateBreadcrumbSchema } from '@/lib/tool-metadata';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://flowforge.dev';

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Tools', href: '/tool' },
    ...items,
  ];

  const schemaItems = breadcrumbItems.map(item => ({
    name: item.name,
    url: item.href ? `${BASE_URL}${item.href}` : BASE_URL,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(schemaItems, BASE_URL)),
        }}
      />
      <nav aria-label="breadcrumb" className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        {breadcrumbItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {item.href ? (
              <>
                <Link
                  href={item.href}
                  className="hover:text-indigo-400 transition-colors"
                >
                  {item.name}
                </Link>
                {idx < breadcrumbItems.length - 1 && <span className="text-gray-600">/</span>}
              </>
            ) : (
              <>
                <span className="text-gray-300">{item.name}</span>
                {idx < breadcrumbItems.length - 1 && <span className="text-gray-600">/</span>}
              </>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
