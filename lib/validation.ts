import { FragilityInput, IncomeStability } from "./fragilityScore";

const VALID_INCOME_STABILITIES: IncomeStability[] = [
    "salaried_fixed",
    "salaried_variable",
    "business_gig",
];

export interface ValidationResult {
    success: boolean;
    data?: FragilityInput;
    error?: string;
}

export function validateFragilityInput(payload: unknown): ValidationResult {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return { success: false, error: "Request body must be a valid JSON object." };
    }

    const obj = payload as Record<string, unknown>;

    const numFields: (keyof FragilityInput)[] = [
        "monthlyIncome",
        "monthlyEssentialExpenses",
        "liquidSavings",
        "goldValueSelfReported",
        "chitFundValue",
        "concentratedAssetValue",
        "diversifiedInvestments",
        "monthlyDebtPayments",
        "dependentsCount",
    ];

    for (const field of numFields) {
        const val = obj[field];
        if (typeof val !== "number" || isNaN(val) || val < 0) {
            return {
                success: false,
                error: `Field '${field}' must be a non-negative number. Received: ${String(val)}`,
            };
        }
    }

    if (
        typeof obj.incomeStability !== "string" ||
        !VALID_INCOME_STABILITIES.includes(obj.incomeStability as IncomeStability)
    ) {
        return {
            success: false,
            error: `Field 'incomeStability' must be one of: ${VALID_INCOME_STABILITIES.join(", ")}. Received: ${String(obj.incomeStability)}`,
        };
    }

    const boolFields: (keyof FragilityInput)[] = [
        "hasHighInterestRevolvingDebt",
        "hasHealthInsurance",
        "hasTermLifeInsurance",
    ];

    for (const field of boolFields) {
        if (typeof obj[field] !== "boolean") {
            return {
                success: false,
                error: `Field '${field}' must be a boolean. Received: ${String(obj[field])}`,
            };
        }
    }

    return {
        success: true,
        data: {
            monthlyIncome: Number(obj.monthlyIncome),
            monthlyEssentialExpenses: Number(obj.monthlyEssentialExpenses),
            incomeStability: obj.incomeStability as IncomeStability,
            liquidSavings: Number(obj.liquidSavings),
            goldValueSelfReported: Number(obj.goldValueSelfReported),
            chitFundValue: Number(obj.chitFundValue),
            concentratedAssetValue: Number(obj.concentratedAssetValue),
            diversifiedInvestments: Number(obj.diversifiedInvestments),
            monthlyDebtPayments: Number(obj.monthlyDebtPayments),
            hasHighInterestRevolvingDebt: Boolean(obj.hasHighInterestRevolvingDebt),
            dependentsCount: Math.round(Number(obj.dependentsCount)),
            hasHealthInsurance: Boolean(obj.hasHealthInsurance),
            hasTermLifeInsurance: Boolean(obj.hasTermLifeInsurance),
        },
    };
}
