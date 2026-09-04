import { describe, it, expect } from "vitest";
import { FragilityInput, computeFragilityScore } from "./fragilityScore";
import { rankAllInterventions } from "./whatIfProjection";

const baseFragileProfile: FragilityInput = {
    monthlyIncome: 80000,
    monthlyEssentialExpenses: 40000,
    incomeStability: "salaried_fixed",
    liquidSavings: 20000, // less than 1 month runway
    goldValueSelfReported: 0,
    chitFundValue: 0,
    concentratedAssetValue: 0,
    diversifiedInvestments: 0,
    monthlyDebtPayments: 35000, // high debt FOIR
    hasHighInterestRevolvingDebt: true,
    dependentsCount: 1,
    hasHealthInsurance: false,
    hasTermLifeInsurance: false,
};

describe("rankAllInterventions", () => {
    it("returns ranked interventions sorted in descending order of scoreDelta", () => {
        const currentResult = computeFragilityScore(baseFragileProfile);
        const ranked = rankAllInterventions(baseFragileProfile, currentResult);

        expect(ranked.length).toBeGreaterThan(0);

        for (let i = 0; i < ranked.length - 1; i++) {
            expect(ranked[i].scoreDelta).toBeGreaterThanOrEqual(ranked[i + 1].scoreDelta);
        }
    });

    it("filters out interventions with zero score delta", () => {
        // Create an already resilient profile with maxed shock defense and zero debt
        const resilientProfile: FragilityInput = {
            monthlyIncome: 200000,
            monthlyEssentialExpenses: 30000,
            incomeStability: "salaried_fixed",
            liquidSavings: 1000000, // massive runway
            goldValueSelfReported: 0,
            chitFundValue: 0,
            concentratedAssetValue: 0,
            diversifiedInvestments: 500000,
            monthlyDebtPayments: 0,
            hasHighInterestRevolvingDebt: false,
            dependentsCount: 0,
            hasHealthInsurance: true,
            hasTermLifeInsurance: true,
        };

        const currentResult = computeFragilityScore(resilientProfile);
        const ranked = rankAllInterventions(resilientProfile, currentResult);

        // All interventions should have 0 delta since score is already at maximum (100)
        expect(ranked.length).toBe(0);
    });

    it("identifies health insurance as an intervention when missing", () => {
        const currentResult = computeFragilityScore(baseFragileProfile);
        const ranked = rankAllInterventions(baseFragileProfile, currentResult);

        const healthFix = ranked.find((r) => r.fixDescription.includes("health insurance"));
        expect(healthFix).toBeDefined();
        expect(healthFix?.fixedInput.hasHealthInsurance).toBe(true);
        expect(healthFix?.scoreDelta).toBeGreaterThan(0);
    });

    it("identifies high-interest revolving debt removal as an intervention when present", () => {
        const currentResult = computeFragilityScore(baseFragileProfile);
        const ranked = rankAllInterventions(baseFragileProfile, currentResult);

        const debtFix = ranked.find((r) => r.fixDescription.includes("revolving credit card"));
        expect(debtFix).toBeDefined();
        expect(debtFix?.fixedInput.hasHighInterestRevolvingDebt).toBe(false);
        expect(debtFix?.scoreDelta).toBeGreaterThan(0);
    });

    it("identifies emergency fund boost as an intervention for thin liquid savings", () => {
        const currentResult = computeFragilityScore(baseFragileProfile);
        const ranked = rankAllInterventions(baseFragileProfile, currentResult);

        const fundFix = ranked.find((r) => r.fixDescription.includes("starter emergency fund"));
        expect(fundFix).toBeDefined();
        expect(fundFix?.fixedInput.liquidSavings).toBe(
            baseFragileProfile.liquidSavings + baseFragileProfile.monthlyEssentialExpenses * 3
        );
        expect(fundFix?.scoreDelta).toBeGreaterThan(0);
    });

    it("identifies formal debt reduction as an intervention when debt payments exist", () => {
        const currentResult = computeFragilityScore(baseFragileProfile);
        const ranked = rankAllInterventions(baseFragileProfile, currentResult);

        const paydownFix = ranked.find((r) => r.fixDescription.includes("paying down formal debt"));
        expect(paydownFix).toBeDefined();
        expect(paydownFix?.fixedInput.monthlyDebtPayments).toBe(
            Math.round(baseFragileProfile.monthlyDebtPayments * 0.7)
        );
        expect(paydownFix?.scoreDelta).toBeGreaterThan(0);
    });
});
