"use client";

interface WarningBannerProps {
  warnings?: string[];
}

export default function WarningBanner({ warnings }: WarningBannerProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="mb-8 p-4 sm:p-5 bg-[#FAF0ED] border border-[#F2D6CF] border-l-4 border-l-[#B54834] rounded-r-md space-y-2">
      <div className="flex items-center gap-2 text-[#B54834] font-semibold text-xs sm:text-sm uppercase tracking-wider">
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>Diagnostic Warning: Profile Inconsistencies</span>
      </div>
      <ul className="space-y-1 text-xs sm:text-sm text-[#1A2332]/90 pl-5 list-disc">
        {warnings.map((w, idx) => (
          <li key={idx} className="leading-relaxed">
            {w}
          </li>
        ))}
      </ul>
    </div>
  );
}
