import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import TourButton from "@/components/onboarding/TourButton";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowForge – API Workflow Builder",
  description: "Build, connect and run API workflows visually.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        <header className="shrink-0 border-b border-white/5 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="text-xl">⚡</span>
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                FlowForge
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/workflows"
                className="text-sm text-gray-400 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-md transition-all"
              >
                Workflows
              </Link>
              <Link
                href="/figma-to-code"
                className="text-sm text-gray-400 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5"
              >
                <span>🎨</span> Figma → Code
              </Link>
              <TourButton />
            </nav>
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        <OnboardingModal />
      </body>
    </html>
  );
}
