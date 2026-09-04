import { computeFragilityScore, FragilityInput, FragilityBreakdown } from "./fragilityScore";

// Takes the user's current input and the AI's identified weakest pillar, then
// simulates the score improvement if that ONE thing were fixed. Reuses the same
// deterministic engine — no new scoring logic, just a modified input passed
// through the existing function. This keeps the projection just as auditable
// as the original score.

export interface WhatIfResult {
    currentScore: number;
    projectedScore: number;
    scoreDelta: number;
    fixDescription: string;
    fixedInput: FragilityInput;
}

export function rankAllInterventions(
    input: FragilityInput,
    currentResult: FragilityBreakdown
): WhatIfResult[] {
    const interventions: { id: string; desc: string; apply: (i: FragilityInput) => FragilityInput }[] = [
        {
            id: "health_insurance",
            desc: "getting a basic health insurance policy",
            apply: (i) => ({ ...i, hasHealthInsurance: true })
        },
        {
            id: "term_life",
            desc: "securing adequate term life insurance",
            apply: (i) => ({ ...i, hasTermLifeInsurance: true })
        },
        {
            id: "revolving_debt",
            desc: "clearing high-interest revolving credit card/BNPL balances",
            apply: (i) => ({ ...i, hasHighInterestRevolvingDebt: false })
        },
        {
            id: "emergency_fund",
            desc: "building a 3-month starter emergency fund",
            apply: (i) => ({
                ...i,
                liquidSavings: i.liquidSavings + (i.monthlyEssentialExpenses * 3)
            })
        },
        {
            id: "debt_paydown",
            desc: "paying down formal debt to reduce monthly EMIs by 30%",
            apply: (i) => ({
                ...i,
                monthlyDebtPayments: Math.round(i.monthlyDebtPayments * 0.7)
            })
        }
    ];

    const results: WhatIfResult[] = interventions.map((intervention) => {
        const fixedInput = intervention.apply(input);
        const projected = computeFragilityScore(fixedInput);
        
        return {
            currentScore: currentResult.score,
            projectedScore: projected.score,
            scoreDelta: projected.score - currentResult.score,
            fixDescription: intervention.desc,
            fixedInput,
        };
    });

    // Filter out zero impact and sort by highest delta
    return results
        .filter(r => r.scoreDelta > 0)
        .sort((a, b) => b.scoreDelta - a.scoreDelta);
}