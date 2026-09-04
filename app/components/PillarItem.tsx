"use client";

import { useState } from "react";
import { scoreColor, pillarBarColor } from "./score-utils";

interface PillarItemProps {
  name: string;
  score: number;
  weight: number;
  note: string;
  methodology: string;
}

export default function PillarItem({
  name,
  score,
  weight,
  note,
  methodology,
}: PillarItemProps) {
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="py-4 sm:py-5 border-b border-[#E8E3DA] last:border-b-0 space-y-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <div className="flex items-baseline gap-2">
          <h4 className="text-sm sm:text-base font-semibold text-[#1A2332]">{name}</h4>
          <span className="text-xs sm:text-sm text-[#5E6C84]">({(weight * 100).toFixed(0)}% weight)</span>
        </div>
        <span className={`text-base sm:text-lg font-bold tabular-nums font-mono ${scoreColor(score)}`}>
          {score}<span className="text-xs sm:text-sm text-[#5E6C84]/60 font-normal">/100</span>
        </span>
      </div>

      <div className="w-full bg-[#E8E3DA]/60 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pillarBarColor(score)}`}
          style={{ width: `${Math.max(score, 2)}%` }}
        />
      </div>

      <p className="text-xs sm:text-sm text-[#5E6C84] leading-relaxed pt-0.5">{note}</p>

      <div className="pt-0.5">
        <button
          type="button"
          onClick={() => setShowMethodology(!showMethodology)}
          className="inline-flex items-center min-h-[36px] sm:min-h-0 text-xs text-[#1A2332]/70 hover:text-[#1A2332] transition underline underline-offset-2 decoration-[#E8E3DA] cursor-pointer"
        >
          {showMethodology ? "Hide methodology" : "Why this number?"}
        </button>

        {showMethodology && (
          <p className="mt-2 text-xs sm:text-sm text-[#5E6C84] bg-white/70 border border-[#E8E3DA] rounded p-3 leading-relaxed">
            {methodology}
          </p>
        )}
      </div>
    </div>
  );
}
