"use client";

import React from "react";
import { FragilityInput, IncomeStability } from "@/lib/fragilityScore";
import CurrencyField from "./ui/CurrencyField";
import NumberField from "./ui/NumberField";
import CheckboxField from "./ui/CheckboxField";

interface DiagnosticFormProps {
  input: FragilityInput;
  onChange: <K extends keyof FragilityInput>(key: K, value: FragilityInput[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  hasResult: boolean;
}

export default function DiagnosticForm({
  input,
  onChange,
  onSubmit,
  loading,
  error,
  hasResult,
}: DiagnosticFormProps) {
  return (
    <form onSubmit={onSubmit} autoComplete="off" className="space-y-8 sm:space-y-12">
      {/* Income & Essential Expenses */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5E6C84] mb-3.5 sm:mb-5 pb-1 border-b border-[#E8E3DA] flex items-center justify-between">
          <span>Income &amp; Essential Expenses</span>
          <span className="text-[11px] font-normal normal-case tracking-normal text-[#5E6C84]">Required</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <CurrencyField
            id="monthlyIncome"
            label="Monthly income"
            sublabel="Net take-home after tax"
            value={input.monthlyIncome}
            onChange={(v) => onChange("monthlyIncome", v)}
          />
          <CurrencyField
            id="monthlyEssentialExpenses"
            label="Essential expenses"
            sublabel="Rent, groceries, utilities, transport"
            value={input.monthlyEssentialExpenses}
            onChange={(v) => onChange("monthlyEssentialExpenses", v)}
          />
        </div>
        <div className="mt-4 sm:mt-5">
          <label htmlFor="incomeStability" className="block text-sm font-medium text-[#1A2332]">
            Income stability
          </label>
          <select
            id="incomeStability"
            value={input.incomeStability}
            onChange={(e) => onChange("incomeStability", e.target.value as IncomeStability)}
            className="mt-1.5 block w-full sm:w-1/2 rounded-md border border-[#E8E3DA] bg-white px-3 py-2.5 sm:py-2 text-base sm:text-sm text-[#1A2332]
                       focus:border-[#1A2332] focus:ring-1 focus:ring-[#1A2332] outline-none transition"
          >
            <option value="salaried_fixed">Salaried — Fixed</option>
            <option value="salaried_variable">Salaried — Variable</option>
            <option value="business_gig">Business / Gig</option>
          </select>
        </div>
      </section>

      {/* Assets & savings */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5E6C84] mb-3.5 sm:mb-5 pb-1 border-b border-[#E8E3DA]">
          Assets &amp; savings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <CurrencyField
            id="liquidSavings"
            label="Liquid savings"
            sublabel="Bank accounts, cash, liquid mutual funds"
            value={input.liquidSavings}
            onChange={(v) => onChange("liquidSavings", v)}
          />
          <CurrencyField
            id="goldValueSelfReported"
            label="Gold value"
            sublabel="Jewelry / coins at current market value"
            value={input.goldValueSelfReported}
            onChange={(v) => onChange("goldValueSelfReported", v)}
          />
          <CurrencyField
            id="chitFundValue"
            label="Chit fund value"
            sublabel="Accumulated or expected value"
            value={input.chitFundValue}
            onChange={(v) => onChange("chitFundValue", v)}
          />
          <CurrencyField
            id="concentratedAssetValue"
            label="Concentrated assets"
            sublabel="Single property, single business equity"
            value={input.concentratedAssetValue}
            onChange={(v) => onChange("concentratedAssetValue", v)}
          />
          <CurrencyField
            id="diversifiedInvestments"
            label="Diversified investments"
            sublabel="Mutual funds, equities, stocks"
            value={input.diversifiedInvestments}
            onChange={(v) => onChange("diversifiedInvestments", v)}
          />
        </div>
      </section>

      {/* Debt */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5E6C84] mb-3.5 sm:mb-5 pb-1 border-b border-[#E8E3DA]">
          Debt
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <CurrencyField
            id="monthlyDebtPayments"
            label="Monthly debt payments"
            sublabel="Total EMIs, credit card minimums, debt service"
            value={input.monthlyDebtPayments}
            onChange={(v) => onChange("monthlyDebtPayments", v)}
          />
        </div>
        <div className="mt-4 sm:mt-5">
          <CheckboxField
            id="hasHighInterestRevolvingDebt"
            label="High-interest revolving debt"
            sublabel="Credit card revolving balance, BNPL, or short-term personal loans"
            checked={input.hasHighInterestRevolvingDebt}
            onChange={(v) => onChange("hasHighInterestRevolvingDebt", v)}
          />
        </div>
      </section>

      {/* Dependents */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5E6C84] mb-3.5 sm:mb-5 pb-1 border-b border-[#E8E3DA]">
          Dependents
        </h2>
        <div className="w-full sm:w-1/2">
          <NumberField
            id="dependentsCount"
            label="Number of dependents"
            sublabel="People who rely partly or fully on your income"
            value={input.dependentsCount}
            onChange={(v) => onChange("dependentsCount", v)}
          />
        </div>
      </section>

      {/* Insurance */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5E6C84] mb-3.5 sm:mb-5 pb-1 border-b border-[#E8E3DA]">
          Insurance
        </h2>
        <div className="space-y-3 sm:space-y-4">
          <CheckboxField
            id="hasHealthInsurance"
            label="Health insurance"
            sublabel="Adequate family floater or corporate policy"
            checked={input.hasHealthInsurance}
            onChange={(v) => onChange("hasHealthInsurance", v)}
          />
          <CheckboxField
            id="hasTermLifeInsurance"
            label="Term life insurance"
            sublabel="Pure term protection for dependents"
            checked={input.hasTermLifeInsurance}
            onChange={(v) => onChange("hasTermLifeInsurance", v)}
          />
        </div>
      </section>

      {error && !hasResult && (
        <div className="p-4 rounded-md bg-[#FAF0ED] border border-[#F2D6CF] flex items-center gap-3 text-sm text-[#B54834]">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 sm:py-3 rounded-md bg-[#2D5A4A] text-white text-sm font-medium
                     hover:bg-[#24493C] active:bg-[#1C3A30] disabled:opacity-50 disabled:cursor-not-allowed
                     transition shadow-xs cursor-pointer flex items-center justify-center"
        >
          {loading ? "Analyzing profile…" : "Calculate resilience score"}
        </button>
      </div>
    </form>
  );
}
