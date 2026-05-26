import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import Footer from "@/components/layout/Footer";
import SkipToMain from "@/components/ui/SkipToMain";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Pipelio — Your Job Search Pipeline, Organized",
    template: "%s | Pipelio",
  },
  description:
    "Stop juggling spreadsheets. Pipelio gives you a beautiful kanban board, deep analytics, AI resume tools, and smart reminders to land your next role faster. Free forever.",
  keywords: [
    "job tracker", "job application tracker", "job search organizer",
    "career", "free job tracker", "pipelio", "job hunt", "job pipeline",
  ],
  authors: [{ name: "Pipelio" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Pipelio — Your Job Search Pipeline, Organized",
    description: "Beautiful kanban board, deep analytics, AI resume tools. Free forever.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Pipelio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pipelio — Your Job Search Pipeline, Organized",
    description: "Stop juggling spreadsheets. Track your job search with Pipelio.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('pipelio-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <GoogleAnalytics />
        <SkipToMain />
        <div className="flex-1" id="main-content">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
