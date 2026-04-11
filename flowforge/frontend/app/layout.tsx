import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/navigation/SiteHeader";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import AnalyticsProvider from "@/components/providers/AnalyticsProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://flowforge.dev';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'FlowForge – Free Developer Tools & API Workflow Builder',
    template: '%s | FlowForge',
  },
  description:
    'FlowForge offers 25+ free online developer tools — JSON formatter, curl converter, Base64 encoder, JWT decoder, and more — plus a visual API workflow builder and AI image-to-code generator.',
  keywords: [
    'json formatter online', 'curl to fetch converter', 'base64 encoder decoder',
    'jwt decoder', 'uuid generator', 'regex tester', 'sql formatter online',
    'api workflow builder', 'developer tools', 'free online tools',
  ],
  authors: [{ name: 'FlowForge' }],
  creator: 'FlowForge',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'FlowForge',
    title: 'FlowForge – Free Developer Tools & API Workflow Builder',
    description:
      '25+ free developer tools: JSON formatter, curl converter, JWT decoder, regex tester, and more. Build visual API workflows and convert images to code with AI.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlowForge – Free Developer Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowForge – Free Developer Tools & API Workflow Builder',
    description: '25+ free developer tools: JSON formatter, curl converter, JWT decoder, regex tester, and more.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: BASE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        <AuthProvider>
          <AnalyticsProvider />
          <SiteHeader />
          <main className="flex-1 flex flex-col">{children}</main>
          <OnboardingModal />
        </AuthProvider>
      </body>
    </html>
  );
}
