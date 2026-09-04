"use client";

import { useState } from "react";
import { FragilityInput, FragilityBreakdown } from "@/lib/fragilityScore";
import CollapsibleSection from "./ui/CollapsibleSection";

interface DebuggerSectionProps {
  input: FragilityInput;
  result: FragilityBreakdown;
}

export default function DebuggerSection({ input, result }: DebuggerSectionProps) {
  const [debugMode, setDebugMode] = useState(false);

  return (
    <CollapsibleSection title="See the full math behind this">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <p className="text-xs sm:text-sm text-[#5E6C84]">Raw arithmetic, haircuts, and inputs behind the score.</p>
          <button
            type="button"
            onClick={() => setDebugMode(!debugMode)}
            className="text-xs text-[#1A2332] hover:underline underline-offset-2 font-medium self-start sm:self-auto min-h-[32px] sm:min-h-0 inline-flex items-center cursor-pointer"
          >
            {debugMode ? "Hide details" : "Inspect arithmetic"}
          </button>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="bg-white/60 p-3.5 rounded border border-[#E8E3DA]">
            <dt className="text-[#5E6C84]">Effective liquid assets</dt>
            <dd className="font-mono font-semibold text-[#1A2332] mt-1 text-sm">
              ₹{result.rawFacts.effectiveLiquidAssets.toLocaleString("en-IN")}
            </dd>
          </div>
          <div className="bg-white/60 p-3.5 rounded border border-[#E8E3DA]">
            <dt className="text-[#5E6C84]">Gold haircut applied</dt>
            <dd className="font-mono font-semibold text-[#1A2332] mt-1 text-sm">
              ₹{result.rawFacts.goldHaircutApplied.toLocaleString("en-IN")}
            </dd>
          </div>
          <div className="bg-white/60 p-3.5 rounded border border-[#E8E3DA]">
            <dt className="text-[#5E6C84]">Adjusted monthly burn</dt>
            <dd className="font-mono font-semibold text-[#1A2332] mt-1 text-sm">
              ₹{result.rawFacts.dependencyAdjustedBurnRate.toLocaleString("en-IN")}
            </dd>
          </div>
        </dl>

        {debugMode && (
          <div className="pt-4 space-y-4 border-t border-[#E8E3DA] text-xs">
            <div>
              <h4 className="font-semibold text-[#1A2332] mb-2">Score assembly</h4>
              <div className="bg-white rounded p-3.5 border border-[#E8E3DA] space-y-1.5 text-[#5E6C84]">
                <div className="flex justify-between">
                  <span>Weighted pillar sum</span>
                  <span className="font-mono text-[#1A2332]">
                    {(
                      result.pillars.incomeStability.score * result.pillars.incomeStability.weight +
                      result.pillars.savingsRunway.score * result.pillars.savingsRunway.weight +
                      result.pillars.debtBurden.score * result.pillars.debtBurden.weight +
                      result.pillars.shockDefense.score * result.pillars.shockDefense.weight
                    ).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance gate applied?</span>
                  <span className="text-[#1A2332] font-semibold">
                    {result.cappedByInsuranceGate ? "Yes (capped at 60)" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Insolvency cap applied?</span>
                  <span className="text-[#1A2332] font-semibold">
                    {result.cappedByInsolvency ? "Yes (capped at 30)" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Net monthly cashflow</span>
                  <span
                    className={`font-mono font-semibold ${
                      (result.rawFacts.netMonthlyCashflow ?? 0) < 0 ? "text-[#B54834]" : "text-[#2D5A4A]"
                    }`}
                  >
                    ₹{(result.rawFacts.netMonthlyCashflow ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#E8E3DA] pt-1 mt-1 font-semibold text-[#1A2332]">
                  <span>Final resilience score</span>
                  <span className="font-mono font-bold">{result.score} / 100</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[#1A2332] mb-2">Input profile snapshot</h4>
              <div className="bg-white rounded p-3.5 border border-[#E8E3DA] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[#5E6C84]">
                <div className="flex justify-between">
                  <span>Monthly income:</span>
                  <span className="font-mono text-[#1A2332]">₹{input.monthlyIncome.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Essential expenses:</span>
                  <span className="font-mono text-[#1A2332]">
                    ₹{input.monthlyEssentialExpenses.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Income stability:</span>
                  <span className="text-[#1A2332]">{input.incomeStability}</span>
                </div>
                <div className="flex justify-between">
                  <span>Liquid savings:</span>
                  <span className="font-mono text-[#1A2332]">₹{input.liquidSavings.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gold:</span>
                  <span className="font-mono text-[#1A2332]">
                    ₹{input.goldValueSelfReported.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chit funds:</span>
                  <span className="font-mono text-[#1A2332]">₹{input.chitFundValue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Debt payments:</span>
                  <span className="font-mono text-[#1A2332]">
                    ₹{input.monthlyDebtPayments.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dependents:</span>
                  <span className="text-[#1A2332]">{input.dependentsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Health insurance:</span>
                  <span className="text-[#1A2332]">{input.hasHealthInsurance ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Term life insurance:</span>
                  <span className="text-[#1A2332]">{input.hasTermLifeInsurance ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
