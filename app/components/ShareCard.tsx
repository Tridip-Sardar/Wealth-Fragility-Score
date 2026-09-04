"use client";

import React from "react";
import { FragilityBreakdown } from "@/lib/fragilityScore";
import { scoreColor } from "./score-utils";

interface ShareCardProps {
  result: FragilityBreakdown | null;
  explanation: string | null;
  shareCardRef: React.RefObject<HTMLDivElement | null>;
}

export default function ShareCard({
  result,
  explanation,
  shareCardRef,
}: ShareCardProps) {
  if (!result || !explanation) return null;

  return (
    <div className="fixed -left-[9999px] top-0 pointer-events-none">
      <div
        ref={shareCardRef}
        className="w-[540px] flex flex-col p-14 gap-12 bg-[#FAF8F4] border-8 border-[#1A2332]"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <div>
          <p className="text-xs font-medium text-[#5E6C84] mb-8">
            Wealth Fragility Score
          </p>

          <div className="space-y-1">
            <p className="text-sm font-medium text-[#5E6C84]">Financial resilience score</p>
            <p
              className={`font-serif text-[150px] leading-none font-normal tracking-tight ${scoreColor(result.score)} -ml-2`}
            >
              {result.score}
            </p>
            <p className="text-2xl font-semibold text-[#1A2332]">
              {result.category}
            </p>
          </div>

          <div className="mt-10 text-lg font-normal text-[#1A2332] leading-relaxed border-l-2 border-[#1A2332] pl-5">
            &ldquo;{explanation.split(/(?<=\.)\s/)[0]}&rdquo;
          </div>
        </div>

        <div className="border-t border-[#E8E3DA] pt-6 flex justify-between items-baseline text-[#1A2332]">
          <p className="font-serif text-base font-normal">Check your own score</p>
          <p className="text-xs text-[#5E6C84]">Research-backed diagnostic</p>
        </div>
      </div>
    </div>
  );
}
