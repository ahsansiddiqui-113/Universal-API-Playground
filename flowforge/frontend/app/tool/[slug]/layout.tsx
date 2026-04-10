import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FlowForge Tools',
  description: 'Free developer tools — no signup, no limits.',
};

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {children}
    </div>
  );
}