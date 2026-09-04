"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import {
  computeFragilityScore,
  FragilityBreakdown,
  FragilityInput,
  IncomeStability,
} from "@/lib/fragilityScore";
import { rankAllInterventions } from "@/lib/whatIfProjection";
import { simulateShock, ShockType } from "@/lib/shockSimulator";

const DEFAULT_INPUT: FragilityInput = {
  monthlyIncome: 0,
  monthlyEssentialExpenses: 0,
  incomeStability: "salaried_fixed",
  liquidSavings: 0,
  goldValueSelfReported: 0,
  chitFundValue: 0,
  concentratedAssetValue: 0,
  diversifiedInvestments: 0,
  monthlyDebtPayments: 0,
  hasHighInterestRevolvingDebt: false,
  dependentsCount: 0,
  hasHealthInsurance: false,
  hasTermLifeInsurance: false,
};

// Mercury/Wealthfront fintech palette:
// Sole accent: Forest green #2D5A4A used only for primary action and resilient score.
function scoreColor(score: number) {
  if (score >= 80) return "text-[#2D5A4A]";
  return "text-[#1A2332]";
}

function pillarBarColor(score: number) {
  if (score >= 70) return "bg-[#2D5A4A]";
  if (score >= 40) return "bg-[#1A2332]/50";
  return "bg-[#B54834]";
}

// ─── Field components ──────────────────────────────────────────────

function CurrencyField({
  label,
  sublabel,
  value,
  onChange,
  id,
}: {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (v: number) => void;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#1A2332]">
        {label}
      </label>
      {sublabel && (
        <p className="text-xs text-[#5E6C84] mt-0.5">{sublabel}</p>
      )}
      <div className="mt-1.5 relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#5E6C84] text-base sm:text-sm font-mono pointer-events-none">
          ₹
        </span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={0}
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="block w-full rounded-md border border-[#E8E3DA] bg-white pl-7 pr-3 py-2.5 sm:py-2 text-base sm:text-sm text-[#1A2332]
                     focus:border-[#1A2332] focus:ring-1 focus:ring-[#1A2332] outline-none transition placeholder-[#5E6C84]/40"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function NumberField({
  label,
  sublabel,
  value,
  onChange,
  id,
}: {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (v: number) => void;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#1A2332]">
        {label}
      </label>
      {sublabel && (
        <p className="text-xs text-[#5E6C84] mt-0.5">{sublabel}</p>
      )}
      <input
        id={id}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1.5 block w-full rounded-md border border-[#E8E3DA] bg-white px-3 py-2.5 sm:py-2 text-base sm:text-sm text-[#1A2332]
                   focus:border-[#1A2332] focus:ring-1 focus:ring-[#1A2332] outline-none transition placeholder-[#5E6C84]/40"
        placeholder="0"
      />
    </div>
  );
}

function CheckboxField({
  label,
  sublabel,
  checked,
  onChange,
  id,
}: {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3.5 cursor-pointer group select-none p-2.5 sm:p-2 -mx-2.5 sm:mx-0 rounded-lg hover:bg-[#1A2332]/[0.03] active:bg-[#1A2332]/[0.06] transition"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 sm:h-4 sm:w-4 rounded border-[#E8E3DA] text-[#2D5A4A] shrink-0
                   focus:ring-[#2D5A4A] focus:ring-offset-0 cursor-pointer accent-[#2D5A4A]"
      />
      <div>
        <span className="text-sm font-medium text-[#1A2332] transition">
          {label}
        </span>
        {sublabel && (
          <p className="text-xs text-[#5E6C84] mt-0.5 leading-relaxed">{sublabel}</p>
        )}
      </div>
    </label>
  );
}

// ─── Pillar item (Unboxed, clean typographic row) ───────────────────

function PillarItem({
  name,
  score,
  weight,
  note,
  methodology,
}: {
  name: string;
  score: number;
  weight: number;
  note: string;
  methodology: string;
}) {
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="py-4 sm:py-5 border-b border-[#E8E3DA] last:border-b-0 space-y-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <div className="flex items-baseline gap-2">
          <h4 className="text-sm sm:text-base font-semibold text-[#1A2332]">{name}</h4>
          <span className="text-xs sm:text-sm text-[#5E6C84]">({(weight * 100).toFixed(0)}% weight)</span>
        </div>
        <span className={`text-base sm:text-lg font-bold tabular-nums font-mono ${scoreColor(score)}`}>
          {score}<span className="text-xs sm:text-sm text-[#5E6C84]/60 font-normal">/100</span>
        </span>
      </div>

      <div className="w-full bg-[#E8E3DA]/60 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pillarBarColor(score)}`}
          style={{ width: `${Math.max(score, 2)}%` }}
        />
      </div>

      <p className="text-xs sm:text-sm text-[#5E6C84] leading-relaxed pt-0.5">{note}</p>

      <div className="pt-0.5">
        <button
          type="button"
          onClick={() => setShowMethodology(!showMethodology)}
          className="inline-flex items-center min-h-[36px] sm:min-h-0 text-xs text-[#1A2332]/70 hover:text-[#1A2332] transition underline underline-offset-2 decoration-[#E8E3DA] cursor-pointer"
        >
          {showMethodology ? "Hide methodology" : "Why this number?"}
        </button>

        {showMethodology && (
          <p className="mt-2 text-xs sm:text-sm text-[#5E6C84] bg-white/70 border border-[#E8E3DA] rounded p-3 leading-relaxed">
            {methodology}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Collapsible section (smooth CSS grid-rows animation) ────────────

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E8E3DA]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 sm:py-5 text-left group cursor-pointer"
      >
        <span className="text-sm sm:text-base font-semibold text-[#1A2332] group-hover:text-[#2D5A4A] transition-colors pr-2">
          {title}
        </span>
        <svg
          className={`w-4 h-4 text-[#5E6C84] transition-transform duration-300 shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* grid-rows trick: 0fr → 1fr gives smooth height transition without JS */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="pb-8 sm:pb-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}


export default function Home() {
  const [input, setInput] = useState<FragilityInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<FragilityBreakdown | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [activeShock, setActiveShock] = useState<ShockType | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function handleDownloadShareCard() {
    if (!shareCardRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(shareCardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "wealth-fragility-score.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
      alert("Failed to generate share image.");
    } finally {
      setDownloading(false);
    }
  }

  function update<K extends keyof FragilityInput>(key: K, value: FragilityInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setExplanation(null);
    setActiveShock(null);

    // Validation for realistic, non-empty profiles
    if (input.monthlyIncome <= 0 && input.monthlyEssentialExpenses <= 0) {
      setError("Please enter your monthly income and essential living expenses to calculate your resilience score.");
      return;
    }
    if (input.monthlyIncome <= 0) {
      setError("Please enter your take-home monthly income (must be greater than ₹0).");
      return;
    }
    if (input.monthlyEssentialExpenses <= 0) {
      setError("Please enter your monthly essential expenses (food, rent, utilities).");
      return;
    }

    // Compute score client-side (instant)
    const computed = computeFragilityScore(input);
    setResult(computed);

    // Auto-scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    // Call API for explanation
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setExplanation(data.explanation);
      }
    } catch {
      setError("Failed to fetch explanation. Check your network and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 py-8 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-12 w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8 sm:mb-14 pb-6 sm:pb-8 border-b border-[#E8E3DA]">
          <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl font-normal text-[#1A2332] tracking-tight">
            Wealth Fragility Score
          </h1>
          <p className="mt-2 sm:mt-2.5 text-xs sm:text-sm text-[#5E6C84] leading-relaxed max-w-xl">
            A research-backed resilience diagnostic for first-generation earners — how many months of shock can you absorb before wealth breaks?
          </p>
        </header>

        {/* Diagnostic Form */}
        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">
          {/* Income */}
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
                onChange={(v) => update("monthlyIncome", v)}
              />
              <CurrencyField
                id="monthlyEssentialExpenses"
                label="Essential expenses"
                sublabel="Rent, groceries, utilities, transport"
                value={input.monthlyEssentialExpenses}
                onChange={(v) => update("monthlyEssentialExpenses", v)}
              />
            </div>
            <div className="mt-4 sm:mt-5">
              <label htmlFor="incomeStability" className="block text-sm font-medium text-[#1A2332]">
                Income stability
              </label>
              <select
                id="incomeStability"
                value={input.incomeStability}
                onChange={(e) => update("incomeStability", e.target.value as IncomeStability)}
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
                onChange={(v) => update("liquidSavings", v)}
              />
              <CurrencyField
                id="goldValueSelfReported"
                label="Gold value"
                sublabel="Jewelry / coins at current market value"
                value={input.goldValueSelfReported}
                onChange={(v) => update("goldValueSelfReported", v)}
              />
              <CurrencyField
                id="chitFundValue"
                label="Chit fund value"
                sublabel="Accumulated or expected value"
                value={input.chitFundValue}
                onChange={(v) => update("chitFundValue", v)}
              />
              <CurrencyField
                id="concentratedAssetValue"
                label="Concentrated assets"
                sublabel="Single property, single business equity"
                value={input.concentratedAssetValue}
                onChange={(v) => update("concentratedAssetValue", v)}
              />
              <CurrencyField
                id="diversifiedInvestments"
                label="Diversified investments"
                sublabel="Mutual funds, equities, stocks"
                value={input.diversifiedInvestments}
                onChange={(v) => update("diversifiedInvestments", v)}
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
                onChange={(v) => update("monthlyDebtPayments", v)}
              />
            </div>
            <div className="mt-4 sm:mt-5">
              <CheckboxField
                id="hasHighInterestRevolvingDebt"
                label="High-interest revolving debt"
                sublabel="Credit card revolving balance, BNPL, or short-term personal loans"
                checked={input.hasHighInterestRevolvingDebt}
                onChange={(v) => update("hasHighInterestRevolvingDebt", v)}
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
                onChange={(v) => update("dependentsCount", v)}
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
                onChange={(v) => update("hasHealthInsurance", v)}
              />
              <CheckboxField
                id="hasTermLifeInsurance"
                label="Term life insurance"
                sublabel="Pure term protection for dependents"
                checked={input.hasTermLifeInsurance}
                onChange={(v) => update("hasTermLifeInsurance", v)}
              />
            </div>
          </section>

          {error && !result && (
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

        {/* ── Results Area ── */}
        {result && (
          <div ref={resultsRef} className="mt-12 sm:mt-20 space-y-0">

            {/* Inconsistency / Risk Warning Banner */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="mb-8 p-4 sm:p-5 bg-[#FAF0ED] border border-[#F2D6CF] border-l-4 border-l-[#B54834] rounded-r-md space-y-2">
                <div className="flex items-center gap-2 text-[#B54834] font-semibold text-xs sm:text-sm uppercase tracking-wider">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Diagnostic Warning: Profile Inconsistencies</span>
                </div>
                <ul className="space-y-1 text-xs sm:text-sm text-[#1A2332]/90 pl-5 list-disc">
                  {result.warnings.map((w, idx) => (
                    <li key={idx} className="leading-relaxed">{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 1. HERO SCORE — always visible */}
            <section className="text-center py-10 sm:py-16 md:py-20 border-y border-[#E8E3DA] space-y-4 sm:space-y-5">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#5E6C84]">
                Financial resilience score
              </p>

              <div className="flex items-baseline justify-center">
                <span className={`font-serif text-7xl xs:text-8xl sm:text-[120px] md:text-[140px] font-normal leading-none tracking-tight ${scoreColor(result.score)}`}>
                  {result.score}
                </span>
                <span className="text-lg sm:text-2xl font-light text-[#5E6C84]/50 ml-1.5 sm:ml-2">
                  / 100
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-base sm:text-lg font-semibold text-[#1A2332]">
                  {result.category}
                </p>
                <p className="text-xs sm:text-sm text-[#5E6C84]">
                  {result.pillars.savingsRunway.runwayMonths.toFixed(1)} months estimated runway
                </p>
              </div>

              {result.cappedByInsuranceGate && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0ED] border border-[#F2D6CF] text-xs sm:text-sm text-[#B54834] mt-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Score capped at 60 due to absence of health insurance</span>
                </div>
              )}

              {result.cappedByInsolvency && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0ED] border border-[#F2D6CF] text-xs sm:text-sm text-[#B54834] mt-2 ml-0 sm:ml-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Score capped at 30 due to acute cash-flow deficit without liquid reserves</span>
                </div>
              )}
            </section>

            {/* 2. AI EXPLANATION — always visible */}
            {loading && (
              <div className="py-6 border-b border-[#E8E3DA] flex items-center gap-3 text-sm sm:text-base text-[#5E6C84]">
                <div className="h-4 w-4 rounded-full border-2 border-[#E8E3DA] border-t-[#2D5A4A] animate-spin shrink-0" />
                <span>Generating personalized explanation…</span>
              </div>
            )}

            {explanation && (
              <section className="py-8 sm:py-10 border-b border-[#E8E3DA] space-y-3.5 sm:space-y-4">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#5E6C84]">
                  What this means for you
                </h3>
                <div className="bg-[#F4F0E8]/40 border border-[#E8E3DA] border-l-4 border-l-[#1A2332] rounded-r-md p-4 sm:p-5">
                  <p className="text-sm sm:text-[15px] text-[#1A2332] leading-relaxed whitespace-pre-line font-normal">
                    {explanation}
                  </p>
                </div>
              </section>
            )}

            {/* 3. TOP INTERVENTION SUMMARY — always visible */}
            {(() => {
              const ranked = rankAllInterventions(input, result);
              if (ranked.length === 0) return null;
              const top = ranked[0];
              return (
                <div className="py-5 sm:py-6 border-b border-[#E8E3DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#5E6C84] mb-1">Your highest-impact next step</p>
                    <p className="text-sm text-[#1A2332]">
                      {top.fixDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-sm font-mono bg-white sm:bg-transparent px-3 py-1.5 sm:p-0 rounded border sm:border-0 border-[#E8E3DA]">
                    <span className="text-[#5E6C84] line-through">{top.currentScore}</span>
                    <span className="text-[#5E6C84]">→</span>
                    <span className="font-bold text-[#1A2332]">{top.projectedScore}</span>
                    <span className="text-[#2D5A4A] font-semibold text-xs ml-1">+{top.scoreDelta} pts</span>
                  </div>
                </div>
              );
            })()}

            {/* 4. SHARE BUTTON — always visible (once explanation loads) */}
            {explanation && (
              <div className="py-6 sm:py-8 border-b border-[#E8E3DA] flex justify-start">
                <button
                  type="button"
                  onClick={handleDownloadShareCard}
                  disabled={downloading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-md bg-[#2D5A4A] text-white text-xs sm:text-sm font-medium
                             hover:bg-[#24493C] active:bg-[#1C3A30] disabled:opacity-50 disabled:cursor-not-allowed
                             transition cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {downloading ? "Generating share card…" : "Download share card"}
                </button>
              </div>
            )}

            {/* ── COLLAPSIBLE SECTIONS ── */}
            <div className="space-y-0 pt-2 sm:pt-4">

              {/* 5. PILLAR BREAKDOWN */}
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

              {/* 6. SHOCK SIMULATOR */}
              <CollapsibleSection title="What happens if things go wrong?">
                <div className="space-y-5 sm:space-y-6">
                  <p className="text-xs sm:text-sm text-[#5E6C84]">
                    Stress-test your liquid buffer over a 6-month horizon against sudden events.
                  </p>

                  {/* Simulation buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveShock("job_loss")}
                      className={`p-3.5 sm:p-4 rounded-md text-left transition border cursor-pointer ${
                        activeShock === "job_loss"
                          ? "bg-white border-[#1A2332] ring-1 ring-[#1A2332]"
                          : "bg-white/60 border-[#E8E3DA] hover:border-[#1A2332]/40"
                      }`}
                    >
                      <div className="flex flex-col xs:flex-row xs:items-baseline justify-between gap-1">
                        <span className="text-sm font-semibold text-[#1A2332]">Simulate job loss</span>
                        <span className="text-xs text-[#5E6C84] font-mono shrink-0">Income = ₹0</span>
                      </div>
                      <p className="text-xs text-[#5E6C84] mt-1.5 leading-relaxed">
                        Income drops to zero while living expenses and debt service continue.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveShock("medical_emergency")}
                      className={`p-3.5 sm:p-4 rounded-md text-left transition border cursor-pointer ${
                        activeShock === "medical_emergency"
                          ? "bg-white border-[#1A2332] ring-1 ring-[#1A2332]"
                          : "bg-white/60 border-[#E8E3DA] hover:border-[#1A2332]/40"
                      }`}
                    >
                      <div className="flex flex-col xs:flex-row xs:items-baseline justify-between gap-1">
                        <span className="text-sm font-semibold text-[#1A2332]">Simulate medical emergency</span>
                        <span className="text-xs text-[#5E6C84] font-mono shrink-0">
                          {input.hasHealthInsurance ? "₹60k net" : "₹300k net"}
                        </span>
                      </div>
                      <p className="text-xs text-[#5E6C84] mt-1.5 leading-relaxed">
                        {input.hasHealthInsurance
                          ? "₹60,000 out-of-pocket shock (80% covered by health policy)."
                          : "₹3,00,000 catastrophic shock without health insurance."}
                      </p>
                    </button>
                  </div>

                  {/* Simulation Result */}
                  {activeShock && (() => {
                    const timeline = simulateShock(input, activeShock);
                    const maxBalance = Math.max(...timeline.map((t) => t.liquidBalance), 1);
                    const exhaustedItem = timeline.find((t) => t.status === "exhausted");
                    const criticalItem = timeline.find((t) => t.status === "critical");

                    return (
                      <div className="space-y-4 pt-2">
                        {/* Status Note */}
                        <div className={`p-3 sm:p-3.5 bg-white border border-[#E8E3DA] rounded-md text-xs sm:text-sm text-[#1A2332] leading-relaxed border-l-4 ${
                            exhaustedItem ? "border-l-[#B54834]" :
                            criticalItem  ? "border-l-[#1A2332]/40" :
                            "border-l-[#2D5A4A]"
                          }`}>
                          {exhaustedItem ? (
                            <span>
                              <strong className="font-semibold">Reserves exhausted in month {exhaustedItem.month}.</strong>{" "}
                              {activeShock === "job_loss"
                                ? "Effective liquid savings hit zero. Debt payments and basic living expenses can no longer be serviced without borrowing."
                                : "The medical shock wiped out liquid reserves immediately in month 0."}
                            </span>
                          ) : criticalItem ? (
                            <span>
                              <strong className="font-semibold">Critical threshold reached in month {criticalItem.month}.</strong>{" "}
                              Liquid balance falls below 1 month of essential expenses and debt payments.
                            </span>
                          ) : (
                            <span>
                              <strong className="font-semibold text-[#2D5A4A]">Resilient defense.</strong> Liquid assets remain above critical threshold across all 6 months under this scenario.
                            </span>
                          )}
                        </div>

                        {/* Progress rows */}
                        <div className="space-y-3 pt-2">
                          {timeline.map((point) => {
                            const isExhausted = point.status === "exhausted";
                            const pct = Math.max(0, Math.min(100, Math.round((point.liquidBalance / maxBalance) * 100)));

                            const barColor =
                              isExhausted ? "bg-[#B54834]" :
                              pct >= 50   ? "bg-[#2D5A4A]" :
                              pct >= 20   ? "bg-[#1A2332]/50" :
                              "bg-[#B54834]";

                            const textColor =
                              isExhausted ? "text-[#B54834]" :
                              pct >= 50   ? "text-[#2D5A4A]" :
                              pct >= 20   ? "text-[#1A2332]" :
                              "text-[#B54834]";

                            return (
                              <div key={point.month} className="space-y-1.5 text-xs sm:text-sm">
                                <div className="flex justify-between items-baseline gap-2">
                                  <span className="text-[#5E6C84] truncate">
                                    {point.month === 0 ? "Month 0 (Shock event)" : `Month ${point.month}`}
                                  </span>
                                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                    <span className={`font-mono font-semibold ${textColor}`}>
                                      ₹{point.liquidBalance.toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] text-[#5E6C84] capitalize">
                                      · {point.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-[#E8E3DA]/60 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </CollapsibleSection>

              {/* 7. COUNTERFACTUAL TWIN + FULL INTERVENTIONS */}
              {(() => {
                const ranked = rankAllInterventions(input, result);
                if (ranked.length === 0) return null;
                const top = ranked[0];
                const topInterventions = ranked.slice(0, 3);
                const afterResult = computeFragilityScore(top.fixedInput);

                const runwayImproved = afterResult.pillars.savingsRunway.runwayMonths > result.pillars.savingsRunway.runwayMonths;
                const debtImproved = afterResult.pillars.debtBurden.score > result.pillars.debtBurden.score;
                const shockImproved = afterResult.pillars.shockDefense.score > result.pillars.shockDefense.score;
                const healthImproved = !input.hasHealthInsurance && top.fixedInput.hasHealthInsurance;
                const termImproved = !input.hasTermLifeInsurance && top.fixedInput.hasTermLifeInsurance;

                return (
                  <CollapsibleSection title="Compare your future if you fix this">
                    <div className="space-y-8 sm:space-y-10">

                      {/* All interventions list */}
                      <div className="space-y-3">
                        <p className="text-xs sm:text-sm text-[#5E6C84]">Highest-leverage steps to strengthen your resilience score.</p>
                        {topInterventions.map((projection, i) => (
                          <div
                            key={i}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-md bg-white border border-[#E8E3DA]"
                          >
                            <p className="text-xs sm:text-sm text-[#1A2332] flex-1">
                              <span className="font-semibold">{i + 1}.</span> By{" "}
                              <span className="font-medium text-[#1A2332] underline underline-offset-2 decoration-[#E8E3DA]">
                                {projection.fixDescription}
                              </span>
                            </p>
                            <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 text-xs sm:text-sm font-mono">
                              <span className="text-[#5E6C84] line-through">{projection.currentScore}</span>
                              <span className="text-[#5E6C84]">→</span>
                              <span className="font-bold text-[#1A2332]">{projection.projectedScore}</span>
                              <span className="text-[#2D5A4A] font-semibold text-xs font-sans">+{projection.scoreDelta} pts</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Counterfactual comparison */}
                      <div className="space-y-4 sm:space-y-5">
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold text-[#1A2332]">
                            You today vs. you after fixing your weakest link
                          </h4>
                          <p className="text-xs sm:text-sm text-[#5E6C84] mt-1">
                            Targeted action: <span className="font-medium text-[#1A2332]">{top.fixDescription}</span> (+{top.scoreDelta} pts).
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          {/* Today */}
                          <div className="bg-white/60 rounded-md p-4 sm:p-5 border border-[#E8E3DA] space-y-3.5 sm:space-y-4">
                            <div className="flex items-baseline justify-between pb-3 border-b border-[#E8E3DA]">
                              <span className="text-xs font-semibold text-[#5E6C84]">Today</span>
                              <span className={`text-base sm:text-lg font-bold font-mono ${scoreColor(result.score)}`}>
                                {result.score} <span className="text-xs font-normal text-[#5E6C84]">({result.category})</span>
                              </span>
                            </div>
                            <dl className="space-y-2.5 text-xs">
                              <div className="flex justify-between items-center"><dt className="text-[#5E6C84]">Savings runway</dt><dd className="font-mono text-[#1A2332]">{result.pillars.savingsRunway.runwayMonths.toFixed(1)} mo</dd></div>
                              <div className="flex justify-between items-center"><dt className="text-[#5E6C84]">Debt burden score</dt><dd className="font-mono text-[#1A2332]">{result.pillars.debtBurden.score}/100</dd></div>
                              <div className="flex justify-between items-center"><dt className="text-[#5E6C84]">Shock defense score</dt><dd className="font-mono text-[#1A2332]">{result.pillars.shockDefense.score}/100</dd></div>
                              <div className="flex justify-between items-center"><dt className="text-[#5E6C84]">Health insurance</dt><dd className="text-[#1A2332]">{input.hasHealthInsurance ? "Yes" : "No"}</dd></div>
                              <div className="flex justify-between items-center"><dt className="text-[#5E6C84]">Term life insurance</dt><dd className="text-[#1A2332]">{input.hasTermLifeInsurance ? "Yes" : "No"}</dd></div>
                            </dl>
                          </div>

                          {/* After Fixing */}
                          <div className="bg-white rounded-md p-4 sm:p-5 border border-[#E8E3DA] space-y-3.5 sm:space-y-4">
                            <div className="flex items-baseline justify-between pb-3 border-b border-[#E8E3DA]">
                              <span className="text-xs font-semibold text-[#1A2332]">After fixing weakest link</span>
                              <span className={`text-base sm:text-lg font-bold font-mono ${scoreColor(afterResult.score)}`}>
                                {afterResult.score} <span className="text-xs font-normal text-[#5E6C84]">({afterResult.category})</span>
                              </span>
                            </div>
                            <dl className="space-y-2.5 text-xs">
                              <div className="flex justify-between items-center"><dt className="text-[#5E6C84]">Savings runway</dt><dd className={`font-mono ${runwayImproved ? "text-[#2D5A4A] font-semibold" : "text-[#5E6C84]"}`}>{afterResult.pillars.savingsRunway.runwayMonths.toFixed(1)} mo{runwayImproved && <span className="text-[11px] ml-1 font-sans font-normal">(+{(afterResult.pillars.savingsRunway.runwayMonths - result.pillars.savingsRunway.runwayMonths).toFixed(1)})</span>}</dd></div>
                              <div className="flex justify-between items-center"><dt className="text-[#5E6C84]">Debt burden score</dt><dd className={`font-mono ${debtImproved ? "text-[#2D5A4A] font-semibold" : "text-[#5E6C84]"}`}>{afterResult.pillars.debtBurden.score}/100{debtImproved && <span className="text-[11px] ml-1 font-sans font-normal">(+{afterResult.pillars.debtBurden.score - result.pillars.debtBurden.score})</span>}</dd></div>
                              <div className="flex justify-between items-center"><dt className="text-[#5E6C84]">Shock defense score</dt><dd className={`font-mono ${shockImproved ? "text-[#2D5A4A] font-semibold" : "text-[#5E6C84]"}`}>{afterResult.pillars.shockDefense.score}/100{shockImproved && <span className="text-[11px] ml-1 font-sans font-normal">(+{afterResult.pillars.shockDefense.score - result.pillars.shockDefense.score})</span>}</dd></div>
                              <div className="flex justify-between items-center"><dt className="text-[#5E6C84]">Health insurance</dt><dd className={healthImproved ? "text-[#2D5A4A] font-semibold" : "text-[#5E6C84]"}>{top.fixedInput.hasHealthInsurance ? "Yes" : "No"}{healthImproved && <span className="text-[11px] ml-1 font-normal">(Fixed)</span>}</dd></div>
                              <div className="flex justify-between items-center"><dt className="text-[#5E6C84]">Term life insurance</dt><dd className={termImproved ? "text-[#2D5A4A] font-semibold" : "text-[#5E6C84]"}>{top.fixedInput.hasTermLifeInsurance ? "Yes" : "No"}{termImproved && <span className="text-[11px] ml-1 font-normal">(Fixed)</span>}</dd></div>
                            </dl>
                          </div>
                        </div>
                      </div>

                    </div>
                  </CollapsibleSection>
                );
              })()}

              {/* 8. UNDER THE HOOD / DEBUGGER */}
              <CollapsibleSection title="See the full math behind this">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <p className="text-xs sm:text-sm text-[#5E6C84]">Raw arithmetic, haircuts, and inputs behind the score.</p>
                    <button
                      type="button"
                      onClick={() => setDebugMode(!debugMode)}
                      className="text-xs text-[#1A2332] hover:underline underline-offset-2 font-medium self-start sm:self-auto min-h-[32px] sm:min-h-0 inline-flex items-center cursor-pointer"
                    >
                      {debugMode ? "Hide details" : "Inspect arithmetic"}
                    </button>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
                    <div className="bg-white/60 p-3.5 rounded border border-[#E8E3DA]">
                      <dt className="text-[#5E6C84]">Effective liquid assets</dt>
                      <dd className="font-mono font-semibold text-[#1A2332] mt-1 text-sm">
                        ₹{result.rawFacts.effectiveLiquidAssets.toLocaleString("en-IN")}
                      </dd>
                    </div>
                    <div className="bg-white/60 p-3.5 rounded border border-[#E8E3DA]">
                      <dt className="text-[#5E6C84]">Gold haircut applied</dt>
                      <dd className="font-mono font-semibold text-[#1A2332] mt-1 text-sm">
                        ₹{result.rawFacts.goldHaircutApplied.toLocaleString("en-IN")}
                      </dd>
                    </div>
                    <div className="bg-white/60 p-3.5 rounded border border-[#E8E3DA]">
                      <dt className="text-[#5E6C84]">Adjusted monthly burn</dt>
                      <dd className="font-mono font-semibold text-[#1A2332] mt-1 text-sm">
                        ₹{result.rawFacts.dependencyAdjustedBurnRate.toLocaleString("en-IN")}
                      </dd>
                    </div>
                  </dl>

                  {debugMode && (
                    <div className="pt-4 space-y-4 border-t border-[#E8E3DA] text-xs">
                      <div>
                        <h4 className="font-semibold text-[#1A2332] mb-2">Score assembly</h4>
                        <div className="bg-white rounded p-3.5 border border-[#E8E3DA] space-y-1.5 text-[#5E6C84]">
                          <div className="flex justify-between">
                            <span>Weighted pillar sum</span>
                            <span className="font-mono text-[#1A2332]">
                              {(
                                result.pillars.incomeStability.score * result.pillars.incomeStability.weight +
                                result.pillars.savingsRunway.score * result.pillars.savingsRunway.weight +
                                result.pillars.debtBurden.score * result.pillars.debtBurden.weight +
                                result.pillars.shockDefense.score * result.pillars.shockDefense.weight
                              ).toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Insurance gate applied?</span>
                            <span className="text-[#1A2332] font-semibold">
                              {result.cappedByInsuranceGate ? "Yes (capped at 60)" : "No"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Insolvency cap applied?</span>
                            <span className="text-[#1A2332] font-semibold">
                              {result.cappedByInsolvency ? "Yes (capped at 30)" : "No"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Net monthly cashflow</span>
                            <span className={`font-mono font-semibold ${
                              (result.rawFacts.netMonthlyCashflow ?? 0) < 0 ? "text-[#B54834]" : "text-[#2D5A4A]"
                            }`}>
                              ₹{(result.rawFacts.netMonthlyCashflow ?? 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-[#E8E3DA] pt-1 mt-1 font-semibold text-[#1A2332]">
                            <span>Final resilience score</span>
                            <span className="font-mono font-bold">{result.score} / 100</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#1A2332] mb-2">Input profile snapshot</h4>
                        <div className="bg-white rounded p-3.5 border border-[#E8E3DA] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[#5E6C84]">
                          <div className="flex justify-between"><span>Monthly income:</span><span className="font-mono text-[#1A2332]">₹{input.monthlyIncome.toLocaleString("en-IN")}</span></div>
                          <div className="flex justify-between"><span>Essential expenses:</span><span className="font-mono text-[#1A2332]">₹{input.monthlyEssentialExpenses.toLocaleString("en-IN")}</span></div>
                          <div className="flex justify-between"><span>Income stability:</span><span className="text-[#1A2332]">{input.incomeStability}</span></div>
                          <div className="flex justify-between"><span>Liquid savings:</span><span className="font-mono text-[#1A2332]">₹{input.liquidSavings.toLocaleString("en-IN")}</span></div>
                          <div className="flex justify-between"><span>Gold:</span><span className="font-mono text-[#1A2332]">₹{input.goldValueSelfReported.toLocaleString("en-IN")}</span></div>
                          <div className="flex justify-between"><span>Chit funds:</span><span className="font-mono text-[#1A2332]">₹{input.chitFundValue.toLocaleString("en-IN")}</span></div>
                          <div className="flex justify-between"><span>Debt payments:</span><span className="font-mono text-[#1A2332]">₹{input.monthlyDebtPayments.toLocaleString("en-IN")}</span></div>
                          <div className="flex justify-between"><span>Dependents:</span><span className="text-[#1A2332]">{input.dependentsCount}</span></div>
                          <div className="flex justify-between"><span>Health insurance:</span><span className="text-[#1A2332]">{input.hasHealthInsurance ? "Yes" : "No"}</span></div>
                          <div className="flex justify-between"><span>Term life insurance:</span><span className="text-[#1A2332]">{input.hasTermLifeInsurance ? "Yes" : "No"}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>

            </div>

            {error && (
              <div className="bg-red-50/70 border border-red-200 rounded-md p-4 text-xs text-red-800 mt-8">
                {error}
              </div>
            )}

          </div>
        )}
      </div>

      {/* Hidden share card for html-to-image (9:16 aspect ratio) */}
      {result && explanation && (
        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          <div
            ref={shareCardRef}
            className="w-[540px] flex flex-col p-14 gap-12 bg-[#FAF8F4] border-8 border-[#1A2332]"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            <div>
              <p className="text-xs font-medium text-[#5E6C84] mb-8">
                Wealth Fragility Score
              </p>

              <div className="space-y-1">
                <p className="text-sm font-medium text-[#5E6C84]">Financial resilience score</p>
                <p className={`font-serif text-[150px] leading-none font-normal tracking-tight ${scoreColor(result.score)} -ml-2`}>
                  {result.score}
                </p>
                <p className="text-2xl font-semibold text-[#1A2332]">
                  {result.category}
                </p>
              </div>

              <div className="mt-10 text-lg font-normal text-[#1A2332] leading-relaxed border-l-2 border-[#1A2332] pl-5">
                &ldquo;{explanation.split(/(?<=\.)\s/)[0]}&rdquo;
              </div>
            </div>

            <div className="border-t border-[#E8E3DA] pt-6 flex justify-between items-baseline text-[#1A2332]">
              <p className="font-serif text-base font-normal">Check your own score</p>
              <p className="text-xs text-[#5E6C84]">Research-backed diagnostic</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
