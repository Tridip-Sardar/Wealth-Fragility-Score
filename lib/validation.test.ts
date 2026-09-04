import { describe, it, expect } from "vitest";
import { validateFragilityInput } from "./validation";
import { FragilityInput } from "./fragilityScore";

const validPayload: FragilityInput = {
    monthlyIncome: 75000,
    monthlyEssentialExpenses: 30000,
    incomeStability: "salaried_fixed",
    liquidSavings: 150000,
    goldValueSelfReported: 50000,
    chitFundValue: 0,
    concentratedAssetValue: 0,
    diversifiedInvestments: 20000,
    monthlyDebtPayments: 10000,
    hasHighInterestRevolvingDebt: false,
    dependentsCount: 1,
    hasHealthInsurance: true,
    hasTermLifeInsurance: false,
};

describe("validateFragilityInput", () => {
    it("accepts valid FragilityInput objects", () => {
        const result = validateFragilityInput(validPayload);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(validPayload);
    });

    it("rejects non-object or null payloads", () => {
        expect(validateFragilityInput(null).success).toBe(false);
        expect(validateFragilityInput(undefined).success).toBe(false);
        expect(validateFragilityInput([]).success).toBe(false);
        expect(validateFragilityInput("string").success).toBe(false);
    });

    it("rejects negative numeric values", () => {
        const invalid = { ...validPayload, monthlyIncome: -100 };
        const result = validateFragilityInput(invalid);
        expect(result.success).toBe(false);
        expect(result.error).toContain("monthlyIncome");
    });

    it("rejects invalid incomeStability values", () => {
        const invalid = { ...validPayload, incomeStability: "crypto_gambler" };
        const result = validateFragilityInput(invalid);
        expect(result.success).toBe(false);
        expect(result.error).toContain("incomeStability");
    });

    it("rejects non-boolean insurance flags", () => {
        const invalid = { ...validPayload, hasHealthInsurance: "yes" as unknown as boolean };
        const result = validateFragilityInput(invalid);
        expect(result.success).toBe(false);
        expect(result.error).toContain("hasHealthInsurance");
    });
});
