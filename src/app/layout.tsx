import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ClarityProvider } from "@/components/providers/clarity-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { createMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import { env } from "@/env";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = createMetadata({
  title: "Models.surf",
  description: "Surf AI Models",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased font-sans",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <QueryProvider>
          <NuqsAdapter>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </NuqsAdapter>
        </QueryProvider>
        <GoogleAnalytics gaId={env.GA_ID} />
        <ClarityProvider />
      </body>
    </html>
  );
}
