"use client";

interface CheckboxFieldProps {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}

export default function CheckboxField({
  label,
  sublabel,
  checked,
  onChange,
  id,
}: CheckboxFieldProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3.5 cursor-pointer group select-none p-2.5 sm:p-2 -mx-2.5 sm:mx-0 rounded-lg hover:bg-[#1A2332]/[0.03] active:bg-[#1A2332]/[0.06] transition"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 sm:h-4 sm:w-4 rounded border-[#E8E3DA] text-[#2D5A4A] shrink-0
                   focus:ring-[#2D5A4A] focus:ring-offset-0 cursor-pointer accent-[#2D5A4A]"
      />
      <div>
        <span className="text-sm font-medium text-[#1A2332] transition">
          {label}
        </span>
        {sublabel && (
          <p className="text-xs text-[#5E6C84] mt-0.5 leading-relaxed">{sublabel}</p>
        )}
      </div>
    </label>
  );
}
