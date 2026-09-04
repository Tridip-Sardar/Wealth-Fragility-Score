"use client";

import { useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E8E3DA]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 sm:py-5 text-left group cursor-pointer"
      >
        <span className="text-sm sm:text-base font-semibold text-[#1A2332] group-hover:text-[#2D5A4A] transition-colors pr-2">
          {title}
        </span>
        <svg
          className={`w-4 h-4 text-[#5E6C84] transition-transform duration-300 shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* grid-rows trick: 0fr → 1fr gives smooth height transition without JS */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="pb-8 sm:pb-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
