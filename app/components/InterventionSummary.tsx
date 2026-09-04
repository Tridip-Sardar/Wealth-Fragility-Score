"use client";

import { FragilityInput, FragilityBreakdown } from "@/lib/fragilityScore";
import { rankAllInterventions } from "@/lib/whatIfProjection";

interface InterventionSummaryProps {
  input: FragilityInput;
  result: FragilityBreakdown;
  hasExplanation: boolean;
  downloading: boolean;
  onDownloadShareCard: () => void;
}

export default function InterventionSummary({
  input,
  result,
  hasExplanation,
  downloading,
  onDownloadShareCard,
}: InterventionSummaryProps) {
  const ranked = rankAllInterventions(input, result);
  const top = ranked.length > 0 ? ranked[0] : null;

  return (
    <>
      {top && (
        <div className="py-5 sm:py-6 border-b border-[#E8E3DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#5E6C84] mb-1">Your highest-impact next step</p>
            <p className="text-sm text-[#1A2332]">{top.fixDescription}</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-sm font-mono bg-white sm:bg-transparent px-3 py-1.5 sm:p-0 rounded border sm:border-0 border-[#E8E3DA]">
            <span className="text-[#5E6C84] line-through">{top.currentScore}</span>
            <span className="text-[#5E6C84]">→</span>
            <span className="font-bold text-[#1A2332]">{top.projectedScore}</span>
            <span className="text-[#2D5A4A] font-semibold text-xs ml-1">+{top.scoreDelta} pts</span>
          </div>
        </div>
      )}

      {hasExplanation && (
        <div className="py-6 sm:py-8 border-b border-[#E8E3DA] flex justify-start">
          <button
            type="button"
            onClick={onDownloadShareCard}
            disabled={downloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-md bg-[#2D5A4A] text-white text-xs sm:text-sm font-medium
                       hover:bg-[#24493C] active:bg-[#1C3A30] disabled:opacity-50 disabled:cursor-not-allowed
                       transition cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloading ? "Generating share card…" : "Download share card"}
          </button>
        </div>
      )}
    </>
  );
}
