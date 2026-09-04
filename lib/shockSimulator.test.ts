import { expect, test, describe } from 'vitest';
import { simulateShock } from './shockSimulator';
import { FragilityInput } from './fragilityScore';

const baseInput: FragilityInput = {
    monthlyIncome: 100000,
    monthlyEssentialExpenses: 40000,
    incomeStability: "salaried_fixed",
    liquidSavings: 120000, // 3 months runway (40k/mo)
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

describe('Shock Simulator Engine', () => {
    test('Job loss decreases liquid balance month-by-month until exhausted', () => {
        const timeline = simulateShock(baseInput, 'job_loss');
        
        // Month 0: 120,000 (ok)
        // Month 1: 80,000 (ok, 80k >= 40k)
        // Month 2: 40,000 (ok, 40k >= 40k)
        // Month 3: 0 (exhausted, stops at month 3)
        expect(timeline.length).toBe(4);
        expect(timeline[0]).toEqual({ month: 0, liquidBalance: 120000, status: 'ok' });
        expect(timeline[1]).toEqual({ month: 1, liquidBalance: 80000, status: 'ok' });
        expect(timeline[2]).toEqual({ month: 2, liquidBalance: 40000, status: 'ok' });
        expect(timeline[3]).toEqual({ month: 3, liquidBalance: 0, status: 'exhausted' });
    });

    test('Job loss marks status as critical when balance is below 1 month burn rate', () => {
        const input: FragilityInput = {
            ...baseInput,
            liquidSavings: 70000, // 70k, burn is 40k
        };
        const timeline = simulateShock(input, 'job_loss');
        
        // Month 0: 70,000 (ok)
        // Month 1: 30,000 (critical, < 40,000)
        // Month 2: 0 (exhausted, stops)
        expect(timeline.length).toBe(3);
        expect(timeline[0].status).toBe('ok');
        expect(timeline[1]).toEqual({ month: 1, liquidBalance: 30000, status: 'critical' });
        expect(timeline[2]).toEqual({ month: 2, liquidBalance: 0, status: 'exhausted' });
    });

    test('Medical emergency reduces shock cost by 80% if health insurance is true', () => {
        // baseInput has liquidSavings: 120000, hasHealthInsurance: true
        // shock cost = 300000 * 0.2 = 60000
        // Month 0 balance = 120000 - 60000 = 60000
        const timeline = simulateShock(baseInput, 'medical_emergency');
        
        expect(timeline[0].month).toBe(0);
        expect(timeline[0].liquidBalance).toBe(60000);
        expect(timeline[0].status).toBe('ok');
        // Income (100k) > monthlyBurn (40k), so normal monthly burn is 0
        expect(timeline.length).toBe(7); // Month 0..6
        expect(timeline[6].liquidBalance).toBe(60000);
    });

    test('Medical emergency applies full 300,000 cost without health insurance and exhausts if insufficient', () => {
        const input: FragilityInput = {
            ...baseInput,
            hasHealthInsurance: false,
            liquidSavings: 120000,
        };
        const timeline = simulateShock(input, 'medical_emergency');
        
        // 120,000 - 300,000 = -180,000 -> 0 (exhausted at month 0)
        expect(timeline.length).toBe(1);
        expect(timeline[0]).toEqual({ month: 0, liquidBalance: 0, status: 'exhausted' });
    });

    test('Includes dependents and debt in monthly burn rate', () => {
        const input: FragilityInput = {
            ...baseInput,
            monthlyEssentialExpenses: 30000,
            dependentsCount: 2, // 30000 * (1 + 2 * 0.18) = 30000 * 1.36 = 40800
            monthlyDebtPayments: 10000, // total burn = 50800
            liquidSavings: 100000,
        };
        const timeline = simulateShock(input, 'job_loss');
        
        // Month 0: 100000 (ok)
        // Month 1: 100000 - 50800 = 49200 (critical, since 49200 < 50800)
        // Month 2: 0 (exhausted)
        expect(timeline[0].liquidBalance).toBe(100000);
        expect(timeline[1].liquidBalance).toBe(49200);
        expect(timeline[1].status).toBe('critical');
        expect(timeline[2].liquidBalance).toBe(0);
        expect(timeline[2].status).toBe('exhausted');
    });
});
