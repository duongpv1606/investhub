import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Syne } from "next/font/google";
import { Space_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap", weight: ["400","500","600","700","800"] });
const spaceMono = Space_Mono({ subsets: ["latin"], variable: "--font-space-mono", weight: ["400","700"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "InvestHub", template: "%s | InvestHub" },
  description: "Real-time stocks, crypto, AI analysis and portfolio tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${syne.variable} ${spaceMono.variable} dark`}>
      <body className="min-h-screen bg-background antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}