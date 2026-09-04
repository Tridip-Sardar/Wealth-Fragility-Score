"use client";

import { FragilityInput } from "@/lib/fragilityScore";
import { simulateShock, ShockType } from "@/lib/shockSimulator";
import CollapsibleSection from "./ui/CollapsibleSection";

interface ShockSimulatorSectionProps {
  input: FragilityInput;
  activeShock: ShockType | null;
  onSelectShock: (shock: ShockType) => void;
}

export default function ShockSimulatorSection({
  input,
  activeShock,
  onSelectShock,
}: ShockSimulatorSectionProps) {
  return (
    <CollapsibleSection title="What happens if things go wrong?">
      <div className="space-y-5 sm:space-y-6">
        <p className="text-xs sm:text-sm text-[#5E6C84]">
          Stress-test your liquid buffer over a 6-month horizon against sudden events.
        </p>

        {/* Simulation buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => onSelectShock("job_loss")}
            className={`p-3.5 sm:p-4 rounded-md text-left transition border cursor-pointer ${
              activeShock === "job_loss"
                ? "bg-white border-[#1A2332] ring-1 ring-[#1A2332]"
                : "bg-white/60 border-[#E8E3DA] hover:border-[#1A2332]/40"
            }`}
          >
            <div className="flex flex-col xs:flex-row xs:items-baseline justify-between gap-1">
              <span className="text-sm font-semibold text-[#1A2332]">Simulate job loss</span>
              <span className="text-xs text-[#5E6C84] font-mono shrink-0">Income = ₹0</span>
            </div>
            <p className="text-xs text-[#5E6C84] mt-1.5 leading-relaxed">
              Income drops to zero while living expenses and debt service continue.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSelectShock("medical_emergency")}
            className={`p-3.5 sm:p-4 rounded-md text-left transition border cursor-pointer ${
              activeShock === "medical_emergency"
                ? "bg-white border-[#1A2332] ring-1 ring-[#1A2332]"
                : "bg-white/60 border-[#E8E3DA] hover:border-[#1A2332]/40"
            }`}
          >
            <div className="flex flex-col xs:flex-row xs:items-baseline justify-between gap-1">
              <span className="text-sm font-semibold text-[#1A2332]">Simulate medical emergency</span>
              <span className="text-xs text-[#5E6C84] font-mono shrink-0">
                {input.hasHealthInsurance ? "₹60k net" : "₹300k net"}
              </span>
            </div>
            <p className="text-xs text-[#5E6C84] mt-1.5 leading-relaxed">
              {input.hasHealthInsurance
                ? "₹60,000 out-of-pocket shock (80% covered by health policy)."
                : "₹3,00,000 catastrophic shock without health insurance."}
            </p>
          </button>
        </div>

        {/* Simulation Result */}
        {activeShock && (() => {
          const timeline = simulateShock(input, activeShock);
          const maxBalance = Math.max(...timeline.map((t) => t.liquidBalance), 1);
          const exhaustedItem = timeline.find((t) => t.status === "exhausted");
          const criticalItem = timeline.find((t) => t.status === "critical");

          return (
            <div className="space-y-4 pt-2">
              {/* Status Note */}
              <div
                className={`p-3 sm:p-3.5 bg-white border border-[#E8E3DA] rounded-md text-xs sm:text-sm text-[#1A2332] leading-relaxed border-l-4 ${
                  exhaustedItem
                    ? "border-l-[#B54834]"
                    : criticalItem
                      ? "border-l-[#1A2332]/40"
                      : "border-l-[#2D5A4A]"
                }`}
              >
                {exhaustedItem ? (
                  <span>
                    <strong className="font-semibold">Reserves exhausted in month {exhaustedItem.month}.</strong>{" "}
                    {activeShock === "job_loss"
                      ? "Effective liquid savings hit zero. Debt payments and basic living expenses can no longer be serviced without borrowing."
                      : "The medical shock wiped out liquid reserves immediately in month 0."}
                  </span>
                ) : criticalItem ? (
                  <span>
                    <strong className="font-semibold">Critical threshold reached in month {criticalItem.month}.</strong>{" "}
                    Liquid balance falls below 1 month of essential expenses and debt payments.
                  </span>
                ) : (
                  <span>
                    <strong className="font-semibold text-[#2D5A4A]">Resilient defense.</strong> Liquid assets remain
                    above critical threshold across all 6 months under this scenario.
                  </span>
                )}
              </div>

              {/* Progress rows */}
              <div className="space-y-3 pt-2">
                {timeline.map((point) => {
                  const isExhausted = point.status === "exhausted";
                  const pct = Math.max(0, Math.min(100, Math.round((point.liquidBalance / maxBalance) * 100)));

                  const barColor = isExhausted
                    ? "bg-[#B54834]"
                    : pct >= 50
                      ? "bg-[#2D5A4A]"
                      : pct >= 20
                        ? "bg-[#1A2332]/50"
                        : "bg-[#B54834]";

                  const textColor = isExhausted
                    ? "text-[#B54834]"
                    : pct >= 50
                      ? "text-[#2D5A4A]"
                      : pct >= 20
                        ? "text-[#1A2332]"
                        : "text-[#B54834]";

                  return (
                    <div key={point.month} className="space-y-1.5 text-xs sm:text-sm">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-[#5E6C84] truncate">
                          {point.month === 0 ? "Month 0 (Shock event)" : `Month ${point.month}`}
                        </span>
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <span className={`font-mono font-semibold ${textColor}`}>
                            ₹{point.liquidBalance.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-[#5E6C84] capitalize">
                            · {point.status}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-[#E8E3DA]/60 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </CollapsibleSection>
  );
}
