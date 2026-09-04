"use client";

import { useState, useEffect } from "react";

interface CurrencyFieldProps {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (v: number) => void;
  id: string;
}

export default function CurrencyField({
  label,
  sublabel,
  value,
  onChange,
  id,
}: CurrencyFieldProps) {
  const [displayVal, setDisplayVal] = useState<string>(value === 0 ? "" : String(value));

  useEffect(() => {
    if (value === 0 && displayVal === "") return;
    if (Number(displayVal) !== value) {
      setDisplayVal(value === 0 ? "" : String(value));
    }
  }, [value]);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#1A2332]">
        {label}
      </label>
      {sublabel && (
        <p className="text-xs text-[#5E6C84] mt-0.5">{sublabel}</p>
      )}
      <div className="mt-1.5 relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#5E6C84] text-base sm:text-sm font-mono pointer-events-none">
          ₹
        </span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          autoComplete="off"
          value={displayVal}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const raw = e.target.value;
            setDisplayVal(raw);
            const num = Number(raw);
            onChange(isNaN(num) ? 0 : num);
          }}
          className="block w-full rounded-md border border-[#E8E3DA] bg-white pl-7 pr-3 py-2.5 sm:py-2 text-base sm:text-sm text-[#1A2332]
                     focus:border-[#1A2332] focus:ring-1 focus:ring-[#1A2332] outline-none transition placeholder-[#5E6C84]/40"
          placeholder="0"
        />
      </div>
    </div>
  );
}
