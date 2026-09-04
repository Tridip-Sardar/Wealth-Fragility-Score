import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wealth Fragility Score — How resilient are you, really?",
  description:
    "A research-backed financial resilience diagnostic for first-generation earners in India. Get your score and understand what to fix first.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
