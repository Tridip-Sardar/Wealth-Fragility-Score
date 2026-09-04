// Wealth Fragility Score — deterministic, rules-based scoring engine
// Weights and mechanisms grounded in research: Lusardi/Schneider/Tufano financial
// fragility framework, World Bank Global Findex (South Asia resilience data),
// Dvara Research/PwC Financial Health Survey (India), RBI household savings data.
//
// Design principle: the SCORE is fully deterministic and auditable — no LLM in
// this file. The LLM is used only downstream to explain the score in plain
// language. This keeps the number trustworthy: a user (or judge) can see exactly
// why they got the score they got.

export type IncomeStability = "salaried_fixed" | "salaried_variable" | "business_gig";

export interface FragilityInput {
    monthlyIncome: number; // in INR
    monthlyEssentialExpenses: number; // rent, food, utilities, transport — non-discretionary
    incomeStability: IncomeStability;

    liquidSavings: number; // cash + savings account + liquid mutual funds
    goldValueSelfReported: number; // current market value of gold jewelry/coins, 0 if none
    chitFundValue: number; // current accumulated/expected chit fund value, 0 if none
    concentratedAssetValue: number; // e.g. a single property, a single business stake, 0 if none
    diversifiedInvestments: number; // mutual funds, equities, diversified portfolio

    monthlyDebtPayments: number; // EMIs, credit card minimums, all formal debt service
    hasHighInterestRevolvingDebt: boolean; // credit card revolving / BNPL / payday-style debt

    dependentsCount: number; // self-defined: "how many people rely partly/fully on your income"

    hasHealthInsurance: boolean; // adequate family floater or equivalent
    hasTermLifeInsurance: boolean; // adequate term cover
}

export interface FragilityBreakdown {
    score: number; // 0-100, higher = more resilient
    category: "Fragile" | "Coping" | "Resilient";
    pillars: {
        incomeStability: { score: number; weight: number; note: string };
        savingsRunway: { score: number; weight: number; note: string; runwayMonths: number };
        debtBurden: { score: number; weight: number; note: string };
        shockDefense: { score: number; weight: number; note: string };
    };
    cappedByInsuranceGate: boolean;
    rawFacts: {
        effectiveLiquidAssets: number;
        goldHaircutApplied: number;
        dependencyAdjustedBurnRate: number;
    };
}

const GOLD_HAIRCUT = 0.22; // discount for making charges / LTV limits on liquidation, per research
const CHIT_FUND_HAIRCUT = 0.35; // illiquid outside auction cycle, counterparty risk
const CONCENTRATED_ASSET_LIQUIDITY_HAIRCUT = 0.6; // e.g. property — technically valuable, slow/hard to access in 30 days
const DEPENDENCY_BURN_MULTIPLIER = 0.18; // each dependent adds ~18% to effective monthly burn rate

function scoreIncomeStability(input: FragilityInput): number {
    switch (input.incomeStability) {
        case "salaried_fixed":
            return 100;
        case "salaried_variable":
            return 65;
        case "business_gig":
            return 40;
    }
}

function computeEffectiveLiquidAssets(input: FragilityInput) {
    const goldEffective = input.goldValueSelfReported * (1 - GOLD_HAIRCUT);
    const chitEffective = input.chitFundValue * (1 - CHIT_FUND_HAIRCUT);
    const concentratedEffective =
        input.concentratedAssetValue * (1 - CONCENTRATED_ASSET_LIQUIDITY_HAIRCUT);

    const diversifiedEffective = input.diversifiedInvestments * 0.85;

    const effectiveLiquidAssets =
        input.liquidSavings + goldEffective + chitEffective + concentratedEffective + diversifiedEffective;

    return { effectiveLiquidAssets, goldEffective, chitEffective };
}

function scoreSavingsRunway(input: FragilityInput) {
    const { effectiveLiquidAssets } = computeEffectiveLiquidAssets(input);

    const dependencyAdjustedBurnRate =
        input.monthlyEssentialExpenses * (1 + input.dependentsCount * DEPENDENCY_BURN_MULTIPLIER);

    const runwayMonths =
        dependencyAdjustedBurnRate > 0 ? effectiveLiquidAssets / dependencyAdjustedBurnRate : 0;

    let score: number;
    if (runwayMonths >= 12) score = 100;
    else if (runwayMonths >= 6) score = 70 + ((runwayMonths - 6) / 6) * 30;
    else score = (runwayMonths / 6) * 70;

    return { score: Math.round(score), runwayMonths, dependencyAdjustedBurnRate };
}

function scoreDebtBurden(input: FragilityInput): number {
    const foir = input.monthlyIncome > 0 ? input.monthlyDebtPayments / input.monthlyIncome : 0;

    let score: number;
    if (foir <= 0.2) score = 100;
    else if (foir >= 0.5) score = 0;
    else score = 100 - ((foir - 0.2) / 0.3) * 100;

    if (input.hasHighInterestRevolvingDebt) score *= 0.6;

    return Math.round(Math.max(0, score));
}

function scoreShockDefense(input: FragilityInput): number {
    let score = 0;
    if (input.hasHealthInsurance) score += 60;
    if (input.hasTermLifeInsurance) score += 40;
    return score;
}

export function computeFragilityScore(input: FragilityInput): FragilityBreakdown {
    const incomeScore = scoreIncomeStability(input);
    const runway = scoreSavingsRunway(input);
    const debtScore = scoreDebtBurden(input);
    const shockScore = scoreShockDefense(input);
    const { effectiveLiquidAssets, goldEffective } = computeEffectiveLiquidAssets(input);

    const weights = {
        incomeStability: 0.25,
        savingsRunway: 0.35,
        debtBurden: 0.2,
        shockDefense: 0.2,
    };

    let weightedScore =
        incomeScore * weights.incomeStability +
        runway.score * weights.savingsRunway +
        debtScore * weights.debtBurden +
        shockScore * weights.shockDefense;

    let cappedByInsuranceGate = false;
    if (!input.hasHealthInsurance && weightedScore > 60) {
        weightedScore = 60;
        cappedByInsuranceGate = true;
    }

    const finalScore = Math.round(Math.max(0, Math.min(100, weightedScore)));

    const category: FragilityBreakdown["category"] =
        finalScore < 40 ? "Fragile" : finalScore < 80 ? "Coping" : "Resilient";

    return {
        score: finalScore,
        category,
        pillars: {
            incomeStability: {
                score: incomeScore,
                weight: weights.incomeStability,
                note:
                    input.incomeStability === "salaried_fixed"
                        ? "Stable, predictable income — a strong foundation."
                        : input.incomeStability === "salaried_variable"
                            ? "Variable salaried income adds unpredictability to your resilience."
                            : "Business/gig income is the least predictable — resilience must come from savings, not income certainty.",
            },
            savingsRunway: {
                score: runway.score,
                weight: weights.savingsRunway,
                note: `Approximately ${runway.runwayMonths.toFixed(1)} months of runway if income stopped today, after accounting for dependents and illiquid-asset haircuts.`,
                runwayMonths: runway.runwayMonths,
            },
            debtBurden: {
                score: debtScore,
                weight: weights.debtBurden,
                note: input.hasHighInterestRevolvingDebt
                    ? "High-interest revolving debt (credit card/BNPL) is actively eroding your resilience."
                    : "Debt load assessed against income via FOIR.",
            },
            shockDefense: {
                score: shockScore,
                weight: weights.shockDefense,
                note:
                    !input.hasHealthInsurance
                        ? "No health insurance — this is your single biggest point of exposure."
                        : !input.hasTermLifeInsurance
                            ? "Health insurance in place, but no term life cover for dependents."
                            : "Strong shock defense — insured against the two most common catastrophic risks.",
            },
        },
        cappedByInsuranceGate,
        rawFacts: {
            effectiveLiquidAssets: Math.round(effectiveLiquidAssets),
            goldHaircutApplied: Math.round(input.goldValueSelfReported - goldEffective),
            dependencyAdjustedBurnRate: Math.round(runway.dependencyAdjustedBurnRate),
        },
    };
}
