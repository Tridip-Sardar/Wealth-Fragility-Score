import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Pillar bar colors — returned dynamically from pillarBarColor()
    "bg-[#2D5A4A]",
    "bg-[#1A2332]/50",
    "bg-[#B54834]",
    // Score text colors — returned dynamically from scoreColor()
    "text-[#2D5A4A]",
    "text-[#1A2332]",
    // Shock simulator — dynamic status colors
    "text-[#B54834]",
    "border-l-[#B54834]",
    "border-l-[#1A2332]/40",
    "border-l-[#2D5A4A]",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-fraunces)", "serif"],
      },
      colors: {
        forest: "#2D5A4A",
        forestHover: "#24493C",
        warmBg: "#FAF8F4",
        deepNavy: "#1A2332",
        navyMuted: "#5E6C84",
        warmBorder: "#E8E3DA",
        warmSurface: "#F4F0E8",
        brick: "#B54834",
      },
    },
  },
  plugins: [],
};

export default config;
