import { expect, test, describe } from 'vitest';
import { computeFragilityScore, FragilityInput } from './fragilityScore';

const baseInput: FragilityInput = {
    monthlyIncome: 100000,
    monthlyEssentialExpenses: 40000,
    incomeStability: "salaried_fixed",
    liquidSavings: 120000, // 3 months runway roughly
    goldValueSelfReported: 0,
    chitFundValue: 0,
    concentratedAssetValue: 0,
    diversifiedInvestments: 0,
    monthlyDebtPayments: 0,
    hasHighInterestRevolvingDebt: false,
    dependentsCount: 0,
    hasHealthInsurance: true,
    hasTermLifeInsurance: true,
};

describe('Fragility Engine', () => {
    test('Calculates score properly for an ideal resilient profile', () => {
        const input = { ...baseInput, liquidSavings: 500000 };
        const result = computeFragilityScore(input);
        expect(result.category).toBe('Resilient');
        expect(result.score).toBeGreaterThan(80);
    });

    test('Caps score at 60 if health insurance is missing', () => {
        const input = { ...baseInput, liquidSavings: 500000, hasHealthInsurance: false };
        const result = computeFragilityScore(input);
        expect(result.cappedByInsuranceGate).toBe(true);
        expect(result.score).toBe(60);
    });

    test('Applies FOIR correctly (debt > 50% = 0 debt score)', () => {
        const input = { ...baseInput, monthlyDebtPayments: 50000 }; // 50% FOIR
        const result = computeFragilityScore(input);
        expect(result.pillars.debtBurden.score).toBe(0);
    });
    
    test('Penalizes revolving debt', () => {
        const cleanInput = { ...baseInput, monthlyDebtPayments: 10000 }; 
        const dirtyInput = { ...cleanInput, hasHighInterestRevolvingDebt: true }; 
        
        const cleanResult = computeFragilityScore(cleanInput);
        const dirtyResult = computeFragilityScore(dirtyInput);
        
        expect(dirtyResult.pillars.debtBurden.score).toBeLessThan(cleanResult.pillars.debtBurden.score);
    });
});
