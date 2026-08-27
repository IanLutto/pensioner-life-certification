// app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "CPF Pension Self-Certification",
  description: "Confirm your pension status securely from your phone.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#16302b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-screen antialiased [font-family:var(--font-body)]">{children}</body>
      </html>
  );
}
