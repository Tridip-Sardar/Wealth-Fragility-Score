"use client";

import { FragilityBreakdown } from "@/lib/fragilityScore";
import CollapsibleSection from "./ui/CollapsibleSection";
import PillarItem from "./PillarItem";

interface PillarBreakdownProps {
  result: FragilityBreakdown;
}

export default function PillarBreakdown({ result }: PillarBreakdownProps) {
  return (
    <CollapsibleSection title="See what's driving your score">
      <div className="divide-y divide-[#E8E3DA]">
        <PillarItem
          name="Income stability"
          score={result.pillars.incomeStability.score}
          weight={result.pillars.incomeStability.weight}
          note={result.pillars.incomeStability.note}
          methodology="Salaried fixed income provides strong predictability. Variable and gig earnings introduce higher fragility under sudden loss."
        />
        <PillarItem
          name="Savings runway"
          score={result.pillars.savingsRunway.score}
          weight={result.pillars.savingsRunway.weight}
          note={result.pillars.savingsRunway.note}
          methodology="Calculated from effective liquid assets divided by dependency-adjusted essential burn. Gold (~22%) and chit funds (~35%) reflect liquidation haircuts."
        />
        <PillarItem
          name="Debt burden"
          score={result.pillars.debtBurden.score}
          weight={result.pillars.debtBurden.weight}
          note={result.pillars.debtBurden.note}
          methodology="Evaluated using Fixed Obligation to Income Ratio (FOIR). Revolving high-interest credit card or BNPL debt triggers an additional 40% penalty."
        />
        <PillarItem
          name="Shock defense"
          score={result.pillars.shockDefense.score}
          weight={result.pillars.shockDefense.weight}
          note={result.pillars.shockDefense.note}
          methodology="Assesses catastrophic protection. Health insurance is the primary safety net preventing out-of-pocket medical insolvency."
        />
      </div>
    </CollapsibleSection>
  );
}
