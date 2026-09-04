import {
    FragilityInput,
    computeEffectiveLiquidAssets,
    computeDependencyAdjustedBurnRate,
} from "./fragilityScore";

export type ShockType = "job_loss" | "medical_emergency";

export type ShockStatus = "ok" | "critical" | "exhausted";

export interface ShockMonthState {
    month: number;
    liquidBalance: number;
    status: ShockStatus;
}

/**
 * Simulates month-by-month financial state over a 6-month horizon following a financial shock.
 * 
 * - 'job_loss': Income becomes 0. Essential expenses (adjusted for dependents) continue,
 *   and debt payments continue. Liquid assets decrease each month by the burn rate until
 *   reaching zero or 6 months pass.
 * 
 * - 'medical_emergency': An immediate one-time cost (₹300,000 default, reduced by 80% if
 *   hasHealthInsurance is true) is applied to liquid assets in month 0. Normal monthly burn
 *   continues for the remaining months.
 * 
 * Returns an array of monthly states with status:
 *   - 'exhausted': balance <= 0
 *   - 'critical': balance < 1 month of burn rate
 *   - 'ok': balance >= 1 month of burn rate
 */
export function simulateShock(
    input: FragilityInput,
    shockType: ShockType
): ShockMonthState[] {
    const { effectiveLiquidAssets } = computeEffectiveLiquidAssets(input);
    const dependencyAdjustedBurnRate = computeDependencyAdjustedBurnRate(input);
    const monthlyDebtPayments = input.monthlyDebtPayments || 0;

    // Monthly burn rate (essential living costs + debt service)
    const monthlyBurnRate = dependencyAdjustedBurnRate + monthlyDebtPayments;

    const timeline: ShockMonthState[] = [];

    const getStatus = (balance: number): ShockStatus => {
        if (balance <= 0) return "exhausted";
        if (balance < monthlyBurnRate) return "critical";
        return "ok";
    };

    let currentBalance = effectiveLiquidAssets;

    if (shockType === "job_loss") {
        // Month 0: Starting balance when shock occurs
        const status0 = getStatus(currentBalance);
        timeline.push({
            month: 0,
            liquidBalance: Math.max(0, Math.round(currentBalance)),
            status: status0,
        });

        if (status0 === "exhausted") {
            return timeline;
        }

        // Months 1 to 6: income is 0, burns monthly living + debt costs
        for (let m = 1; m <= 6; m++) {
            currentBalance -= monthlyBurnRate;

            const status = getStatus(currentBalance);
            timeline.push({
                month: m,
                liquidBalance: Math.max(0, Math.round(currentBalance)),
                status,
            });

            if (status === "exhausted") {
                break;
            }
        }
    } else if (shockType === "medical_emergency") {
        // Medical emergency: ₹300,000, reduced by 80% if health insurance is present (so ₹60,000)
        const shockCost = input.hasHealthInsurance ? 300000 * 0.2 : 300000;

        // Apply immediate one-time cost in month 0
        currentBalance -= shockCost;
        const status0 = getStatus(currentBalance);
        timeline.push({
            month: 0,
            liquidBalance: Math.max(0, Math.round(currentBalance)),
            status: status0,
        });

        if (status0 === "exhausted") {
            return timeline;
        }

        // Continue normal monthly burn for the remaining months
        const normalMonthlyBurn = Math.max(0, monthlyBurnRate - (input.monthlyIncome || 0));

        for (let m = 1; m <= 6; m++) {
            currentBalance -= normalMonthlyBurn;

            const status = getStatus(currentBalance);
            timeline.push({
                month: m,
                liquidBalance: Math.max(0, Math.round(currentBalance)),
                status,
            });

            if (status === "exhausted") {
                break;
            }
        }
    }

    return timeline;
}
