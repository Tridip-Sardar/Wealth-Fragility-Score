"use client";

import { FragilityBreakdown } from "@/lib/fragilityScore";
import { scoreColor } from "./score-utils";

interface ScoreHeroProps {
  result: FragilityBreakdown;
}

export default function ScoreHero({ result }: ScoreHeroProps) {
  return (
    <section className="text-center py-10 sm:py-16 md:py-20 border-y border-[#E8E3DA] space-y-4 sm:space-y-5">
      <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#5E6C84]">
        Financial resilience score
      </p>

      <div className="flex items-baseline justify-center">
        <span
          className={`font-serif text-7xl xs:text-8xl sm:text-[120px] md:text-[140px] font-normal leading-none tracking-tight ${scoreColor(result.score)}`}
        >
          {result.score}
        </span>
        <span className="text-lg sm:text-2xl font-light text-[#5E6C84]/50 ml-1.5 sm:ml-2">
          / 100
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-base sm:text-lg font-semibold text-[#1A2332]">
          {result.category}
        </p>
        <p className="text-xs sm:text-sm text-[#5E6C84]">
          {result.pillars.savingsRunway.runwayMonths.toFixed(1)} months estimated runway
        </p>
      </div>

      {result.cappedByInsuranceGate && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0ED] border border-[#F2D6CF] text-xs sm:text-sm text-[#B54834] mt-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Score capped at 60 due to absence of health insurance</span>
        </div>
      )}

      {result.cappedByInsolvency && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0ED] border border-[#F2D6CF] text-xs sm:text-sm text-[#B54834] mt-2 ml-0 sm:ml-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Score capped at 30 due to acute cash-flow deficit without liquid reserves</span>
        </div>
      )}
    </section>
  );
}
