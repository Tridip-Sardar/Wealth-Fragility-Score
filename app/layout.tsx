import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wealth Fragility Score — How resilient are you, really?",
  description:
    "A research-backed financial resilience diagnostic for first-generation earners in India. Get your score and understand what to fix first.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAF8F4] text-[#1A2332] font-[family-name:var(--font-inter)] antialiased selection:bg-[#2D5A4A] selection:text-[#FAF8F4]">
        {children}
      </body>
    </html>
  );
}
