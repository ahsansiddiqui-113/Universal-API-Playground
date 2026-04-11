import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/navigation/SiteHeader";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import AnalyticsProvider from "@/components/providers/AnalyticsProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

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
