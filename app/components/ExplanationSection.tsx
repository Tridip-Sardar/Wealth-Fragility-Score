"use client";

interface ExplanationSectionProps {
  loading: boolean;
  explanation: string | null;
}

export default function ExplanationSection({
  loading,
  explanation,
}: ExplanationSectionProps) {
  if (loading) {
    return (
      <div className="py-6 border-b border-[#E8E3DA] flex items-center gap-3 text-sm sm:text-base text-[#5E6C84]">
        <div className="h-4 w-4 rounded-full border-2 border-[#E8E3DA] border-t-[#2D5A4A] animate-spin shrink-0" />
        <span>Generating personalized explanation…</span>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <section className="py-8 sm:py-10 border-b border-[#E8E3DA] space-y-3.5 sm:space-y-4">
      <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#5E6C84]">
        What this means for you
      </h3>
      <div className="bg-[#F4F0E8]/40 border border-[#E8E3DA] border-l-4 border-l-[#1A2332] rounded-r-md p-4 sm:p-5">
        <p className="text-sm sm:text-[15px] text-[#1A2332] leading-relaxed whitespace-pre-line font-normal">
          {explanation}
        </p>
      </div>
    </section>
  );
}
