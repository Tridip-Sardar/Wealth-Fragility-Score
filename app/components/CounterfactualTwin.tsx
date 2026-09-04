"use client";

import { FragilityInput, FragilityBreakdown, computeFragilityScore } from "@/lib/fragilityScore";
import { rankAllInterventions } from "@/lib/whatIfProjection";
import CollapsibleSection from "./ui/CollapsibleSection";
import { scoreColor } from "./score-utils";

interface CounterfactualTwinProps {
  input: FragilityInput;
  result: FragilityBreakdown;
}

export default function CounterfactualTwin({ input, result }: CounterfactualTwinProps) {
  const ranked = rankAllInterventions(input, result);
  if (ranked.length === 0) return null;

  const top = ranked[0];
  const topInterventions = ranked.slice(0, 3);
  const afterResult = computeFragilityScore(top.fixedInput);

  const runwayImproved =
    afterResult.pillars.savingsRunway.runwayMonths > result.pillars.savingsRunway.runwayMonths;
  const debtImproved = afterResult.pillars.debtBurden.score > result.pillars.debtBurden.score;
  const shockImproved = afterResult.pillars.shockDefense.score > result.pillars.shockDefense.score;
  const healthImproved = !input.hasHealthInsurance && top.fixedInput.hasHealthInsurance;
  const termImproved = !input.hasTermLifeInsurance && top.fixedInput.hasTermLifeInsurance;

  return (
    <CollapsibleSection title="Compare your future if you fix this">
      <div className="space-y-8 sm:space-y-10">
        {/* All interventions list */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-[#5E6C84]">
            Highest-leverage steps to strengthen your resilience score.
          </p>
          {topInterventions.map((projection, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-md bg-white border border-[#E8E3DA]"
            >
              <p className="text-xs sm:text-sm text-[#1A2332] flex-1">
                <span className="font-semibold">{i + 1}.</span> By{" "}
                <span className="font-medium text-[#1A2332] underline underline-offset-2 decoration-[#E8E3DA]">
                  {projection.fixDescription}
                </span>
              </p>
              <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 text-xs sm:text-sm font-mono">
                <span className="text-[#5E6C84] line-through">{projection.currentScore}</span>
                <span className="text-[#5E6C84]">→</span>
                <span className="font-bold text-[#1A2332]">{projection.projectedScore}</span>
                <span className="text-[#2D5A4A] font-semibold text-xs font-sans">+{projection.scoreDelta} pts</span>
              </div>
            </div>
          ))}
        </div>

        {/* Counterfactual comparison */}
        <div className="space-y-4 sm:space-y-5">
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-[#1A2332]">
              You today vs. you after fixing your weakest link
            </h4>
            <p className="text-xs sm:text-sm text-[#5E6C84] mt-1">
              Targeted action: <span className="font-medium text-[#1A2332]">{top.fixDescription}</span> (+{top.scoreDelta} pts).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Today */}
            <div className="bg-white/60 rounded-md p-4 sm:p-5 border border-[#E8E3DA] space-y-3.5 sm:space-y-4">
              <div className="flex items-baseline justify-between pb-3 border-b border-[#E8E3DA]">
                <span className="text-xs font-semibold text-[#5E6C84]">Today</span>
                <span className={`text-base sm:text-lg font-bold font-mono ${scoreColor(result.score)}`}>
                  {result.score} <span className="text-xs font-normal text-[#5E6C84]">({result.category})</span>
                </span>
              </div>
              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <dt className="text-[#5E6C84]">Savings runway</dt>
                  <dd className="font-mono text-[#1A2332]">
                    {result.pillars.savingsRunway.runwayMonths.toFixed(1)} mo
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[#5E6C84]">Debt burden score</dt>
                  <dd className="font-mono text-[#1A2332]">{result.pillars.debtBurden.score}/100</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[#5E6C84]">Shock defense score</dt>
                  <dd className="font-mono text-[#1A2332]">{result.pillars.shockDefense.score}/100</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[#5E6C84]">Health insurance</dt>
                  <dd className="text-[#1A2332]">{input.hasHealthInsurance ? "Yes" : "No"}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[#5E6C84]">Term life insurance</dt>
                  <dd className="text-[#1A2332]">{input.hasTermLifeInsurance ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </div>

            {/* After Fixing */}
            <div className="bg-white rounded-md p-4 sm:p-5 border border-[#E8E3DA] space-y-3.5 sm:space-y-4">
              <div className="flex items-baseline justify-between pb-3 border-b border-[#E8E3DA]">
                <span className="text-xs font-semibold text-[#1A2332]">After fixing weakest link</span>
                <span className={`text-base sm:text-lg font-bold font-mono ${scoreColor(afterResult.score)}`}>
                  {afterResult.score}{" "}
                  <span className="text-xs font-normal text-[#5E6C84]">({afterResult.category})</span>
                </span>
              </div>
              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <dt className="text-[#5E6C84]">Savings runway</dt>
                  <dd className={`font-mono ${runwayImproved ? "text-[#2D5A4A] font-semibold" : "text-[#5E6C84]"}`}>
                    {afterResult.pillars.savingsRunway.runwayMonths.toFixed(1)} mo
                    {runwayImproved && (
                      <span className="text-[11px] ml-1 font-sans font-normal">
                        (+(
                        {(
                          afterResult.pillars.savingsRunway.runwayMonths -
                          result.pillars.savingsRunway.runwayMonths
                        ).toFixed(1)}
                        ))
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[#5E6C84]">Debt burden score</dt>
                  <dd className={`font-mono ${debtImproved ? "text-[#2D5A4A] font-semibold" : "text-[#5E6C84]"}`}>
                    {afterResult.pillars.debtBurden.score}/100
                    {debtImproved && (
                      <span className="text-[11px] ml-1 font-sans font-normal">
                        (+{afterResult.pillars.debtBurden.score - result.pillars.debtBurden.score})
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[#5E6C84]">Shock defense score</dt>
                  <dd className={`font-mono ${shockImproved ? "text-[#2D5A4A] font-semibold" : "text-[#5E6C84]"}`}>
                    {afterResult.pillars.shockDefense.score}/100
                    {shockImproved && (
                      <span className="text-[11px] ml-1 font-sans font-normal">
                        (+{afterResult.pillars.shockDefense.score - result.pillars.shockDefense.score})
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[#5E6C84]">Health insurance</dt>
                  <dd className={healthImproved ? "text-[#2D5A4A] font-semibold" : "text-[#5E6C84]"}>
                    {top.fixedInput.hasHealthInsurance ? "Yes" : "No"}
                    {healthImproved && <span className="text-[11px] ml-1 font-normal">(Fixed)</span>}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[#5E6C84]">Term life insurance</dt>
                  <dd className={termImproved ? "text-[#2D5A4A] font-semibold" : "text-[#5E6C84]"}>
                    {top.fixedInput.hasTermLifeInsurance ? "Yes" : "No"}
                    {termImproved && <span className="text-[11px] ml-1 font-normal">(Fixed)</span>}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
