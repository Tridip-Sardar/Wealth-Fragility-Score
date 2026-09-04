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

function scoreColor(score: number) {
  if (score < 40) return "text-red-600";
  if (score < 80) return "text-amber-600";
  return "text-emerald-600";
}

function scoreBg(score: number) {
  if (score < 40) return "bg-red-50 border-red-200";
  if (score < 80) return "bg-amber-50 border-amber-200";
  return "bg-emerald-50 border-emerald-200";
}

function pillarBarColor(score: number) {
  if (score < 40) return "bg-red-500";
  if (score < 80) return "bg-amber-500";
  return "bg-emerald-500";
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
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {sublabel && (
        <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>
      )}
      <div className="mt-1 relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">
          ₹
        </span>
        <input
          id={id}
          type="number"
          min={0}
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="block w-full rounded-lg border border-slate-300 bg-white pl-7 pr-3 py-2 text-sm
                     focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition"
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
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {sublabel && (
        <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>
      )}
      <input
        id={id}
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                   focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition"
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
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-700 
                   focus:ring-slate-500 cursor-pointer"
      />
      <div>
        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition">
          {label}
        </span>
        {sublabel && (
          <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>
        )}
      </div>
    </label>
  );
}

// ─── Pillar card ────────────────────────────────────────────────────

function PillarCard({
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
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700">{name}</h3>
        <span className={`text-lg font-bold tabular-nums ${scoreColor(score)}`}>
          {score}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${pillarBarColor(score)}`}
          style={{ width: `${Math.max(score, 3)}%` }}
        />
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{note}</p>
      
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400">Weight: {(weight * 100).toFixed(0)}%</p>
          <button
            type="button"
            onClick={() => setShowMethodology(!showMethodology)}
            className="text-[10px] flex items-center gap-1 text-indigo-500 hover:text-indigo-600 transition"
          >
            <svg className={`w-3 h-3 transition-transform ${showMethodology ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            Why this number?
          </button>
        </div>
        
        {showMethodology && (
          <div className="bg-indigo-50 rounded p-2 text-[10px] text-indigo-800 leading-relaxed">
            {methodology}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────

export default function Home() {
  const [input, setInput] = useState<FragilityInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<FragilityBreakdown | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

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

    // Compute score client-side (instant)
    const computed = computeFragilityScore(input);
    setResult(computed);

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
    <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Wealth Fragility Score
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A research-backed diagnostic — how many months can you survive a shock?
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Income ── */}
          <section>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
              Income
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CurrencyField
                id="monthlyIncome"
                label="Monthly Income"
                sublabel="Take-home after tax"
                value={input.monthlyIncome}
                onChange={(v) => update("monthlyIncome", v)}
              />
              <CurrencyField
                id="monthlyEssentialExpenses"
                label="Essential Expenses"
                sublabel="Rent, food, utilities, transport"
                value={input.monthlyEssentialExpenses}
                onChange={(v) => update("monthlyEssentialExpenses", v)}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="incomeStability" className="block text-sm font-medium text-slate-700">
                Income Stability
              </label>
              <select
                id="incomeStability"
                value={input.incomeStability}
                onChange={(e) => update("incomeStability", e.target.value as IncomeStability)}
                className="mt-1 block w-full sm:w-1/2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                           focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition"
              >
                <option value="salaried_fixed">Salaried — Fixed</option>
                <option value="salaried_variable">Salaried — Variable</option>
                <option value="business_gig">Business / Gig</option>
              </select>
            </div>
          </section>

          {/* ── Assets ── */}
          <section>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
              Assets &amp; Savings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CurrencyField
                id="liquidSavings"
                label="Liquid Savings"
                sublabel="Cash + savings account + liquid MFs"
                value={input.liquidSavings}
                onChange={(v) => update("liquidSavings", v)}
              />
              <CurrencyField
                id="goldValueSelfReported"
                label="Gold Value"
                sublabel="Jewelry / coins at current market value"
                value={input.goldValueSelfReported}
                onChange={(v) => update("goldValueSelfReported", v)}
              />
              <CurrencyField
                id="chitFundValue"
                label="Chit Fund Value"
                sublabel="Accumulated / expected value"
                value={input.chitFundValue}
                onChange={(v) => update("chitFundValue", v)}
              />
              <CurrencyField
                id="concentratedAssetValue"
                label="Concentrated Assets"
                sublabel="Single property, single business stake"
                value={input.concentratedAssetValue}
                onChange={(v) => update("concentratedAssetValue", v)}
              />
              <CurrencyField
                id="diversifiedInvestments"
                label="Diversified Investments"
                sublabel="Mutual funds, equities, portfolio"
                value={input.diversifiedInvestments}
                onChange={(v) => update("diversifiedInvestments", v)}
              />
            </div>
          </section>

          {/* ── Debt ── */}
          <section>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
              Debt
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CurrencyField
                id="monthlyDebtPayments"
                label="Monthly Debt Payments"
                sublabel="EMIs, credit card minimums, all debt service"
                value={input.monthlyDebtPayments}
                onChange={(v) => update("monthlyDebtPayments", v)}
              />
            </div>
            <div className="mt-4">
              <CheckboxField
                id="hasHighInterestRevolvingDebt"
                label="High-interest revolving debt"
                sublabel="Credit card revolving balance, BNPL, or payday-style debt"
                checked={input.hasHighInterestRevolvingDebt}
                onChange={(v) => update("hasHighInterestRevolvingDebt", v)}
              />
            </div>
          </section>

          {/* ── Dependents ── */}
          <section>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
              Dependents
            </h2>
            <div className="w-full sm:w-1/2">
              <NumberField
                id="dependentsCount"
                label="Number of Dependents"
                sublabel="People who rely partly or fully on your income"
                value={input.dependentsCount}
                onChange={(v) => update("dependentsCount", v)}
              />
            </div>
          </section>

          {/* ── Insurance ── */}
          <section>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
              Insurance
            </h2>
            <div className="space-y-3">
              <CheckboxField
                id="hasHealthInsurance"
                label="Health Insurance"
                sublabel="Adequate family floater or equivalent"
                checked={input.hasHealthInsurance}
                onChange={(v) => update("hasHealthInsurance", v)}
              />
              <CheckboxField
                id="hasTermLifeInsurance"
                label="Term Life Insurance"
                sublabel="Adequate term cover"
                checked={input.hasTermLifeInsurance}
                onChange={(v) => update("hasTermLifeInsurance", v)}
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-slate-800 text-white text-sm font-medium
                       hover:bg-slate-700 active:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed
                       transition cursor-pointer"
          >
            {loading ? "Analysing…" : "Get My Score"}
          </button>
        </form>

        {/* ── Results ── */}
        {result && (
          <div className="mt-10 space-y-6">
            {/* Score hero */}
            <div className={`rounded-xl border p-6 text-center ${scoreBg(result.score)}`}>
              <p className="text-sm font-medium text-slate-600 mb-1">Your Resilience Score</p>
              <p className={`text-5xl font-bold tabular-nums ${scoreColor(result.score)}`}>
                {result.score}
                <span className="text-lg font-normal text-slate-400"> / 100</span>
              </p>
              <p className={`mt-2 text-sm font-semibold ${scoreColor(result.score)}`}>
                {result.category}
              </p>
              {result.cappedByInsuranceGate && (
                <p className="mt-2 text-xs text-red-600 bg-red-100 inline-block px-3 py-1 rounded-full">
                  Score capped at 60 — no health insurance
                </p>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-400 text-center px-4 leading-relaxed">
              This is a self-reported estimate, not financial advice. It doesn't connect to your bank or verify these numbers — it's meant to help you think about your resilience, not replace a financial advisor.
            </p>

            {/* Pillar breakdown */}
            <div>
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
                Pillar Breakdown
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PillarCard
                  name="Income Stability"
                  score={result.pillars.incomeStability.score}
                  weight={result.pillars.incomeStability.weight}
                  note={result.pillars.incomeStability.note}
                  methodology="Variable and gig income are scored lower because unpredictable cash flow reduces resilience even at high income levels — based on Dvara Research's Financial Health Survey findings on income volatility."
                />
                <PillarCard
                  name="Savings Runway"
                  score={result.pillars.savingsRunway.score}
                  weight={result.pillars.savingsRunway.weight}
                  note={result.pillars.savingsRunway.note}
                  methodology="Gold is discounted ~22% and chit funds ~35% to reflect real liquidation costs (making charges, RBI gold loan LTV limits, and illiquidity outside auction cycles), not their full market value."
                />
                <PillarCard
                  name="Debt Burden"
                  score={result.pillars.debtBurden.score}
                  weight={result.pillars.debtBurden.weight}
                  note={result.pillars.debtBurden.note}
                  methodology="Scored using FOIR (Fixed Obligation to Income Ratio); high-interest revolving debt like credit cards or BNPL is penalized further as a sign of cash-flow strain."
                />
                <PillarCard
                  name="Shock Defense"
                  score={result.pillars.shockDefense.score}
                  weight={result.pillars.shockDefense.weight}
                  note={result.pillars.shockDefense.note}
                  methodology="Health insurance is weighted heavily because over 62% of medical costs in India are paid out-of-pocket — a single medical event can erase years of savings without it."
                />
              </div>
            </div>

            {/* Raw facts and Debugger */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Under the Hood
                </h3>
                <button 
                  onClick={() => setDebugMode(!debugMode)}
                  className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                >
                  {debugMode ? "Hide Debugger" : "Developer Mode"}
                </button>
              </div>
              
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500 text-xs">Effective Liquid Assets</dt>
                  <dd className="font-medium text-slate-800">
                    ₹{result.rawFacts.effectiveLiquidAssets.toLocaleString("en-IN")}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs">Gold Haircut Applied</dt>
                  <dd className="font-medium text-slate-800">
                    ₹{result.rawFacts.goldHaircutApplied.toLocaleString("en-IN")}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs">Adjusted Monthly Burn</dt>
                  <dd className="font-medium text-slate-800">
                    ₹{result.rawFacts.dependencyAdjustedBurnRate.toLocaleString("en-IN")}
                  </dd>
                </div>
              </dl>

              {debugMode && (
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
                  <h4 className="text-sm font-semibold text-slate-700">How This Score Was Built</h4>

                  {/* Pillar scores */}
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Pillar Scores</p>
                    <div className="space-y-2">
                      {[
                        { label: "Income Stability", pillar: result.pillars.incomeStability },
                        { label: "Savings Runway",   pillar: result.pillars.savingsRunway },
                        { label: "Debt Burden",      pillar: result.pillars.debtBurden },
                        { label: "Shock Defense",    pillar: result.pillars.shockDefense },
                      ].map(({ label, pillar }) => (
                        <div key={label} className="bg-slate-50 rounded-lg p-3 text-xs">
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="font-semibold text-slate-700">{label}</span>
                            <span className={`font-bold tabular-nums ${scoreColor(pillar.score)}`}>
                              {pillar.score} / 100
                              <span className="text-slate-400 font-normal ml-1">(weight: {(pillar.weight * 100).toFixed(0)}%)</span>
                            </span>
                          </div>
                          <p className="text-slate-500 leading-relaxed">{pillar.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final score assembly */}
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Score Assembly</p>
                    <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Weighted sum</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {(
                            result.pillars.incomeStability.score * result.pillars.incomeStability.weight +
                            result.pillars.savingsRunway.score   * result.pillars.savingsRunway.weight +
                            result.pillars.debtBurden.score      * result.pillars.debtBurden.weight +
                            result.pillars.shockDefense.score    * result.pillars.shockDefense.weight
                          ).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance gate applied?</span>
                        <span className={`font-semibold ${result.cappedByInsuranceGate ? "text-red-600" : "text-emerald-600"}`}>
                          {result.cappedByInsuranceGate ? "Yes — capped at 60" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                        <span className="font-semibold text-slate-700">Final Score</span>
                        <span className={`font-bold text-base tabular-nums ${scoreColor(result.score)}`}>{result.score} ({result.category})</span>
                      </div>
                    </div>
                  </div>

                  {/* Input profile */}
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Input Profile</p>
                    <div className="bg-slate-50 rounded-lg p-3 text-xs grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-slate-600">
                      <div className="flex justify-between"><span>Monthly Income</span><span className="font-mono font-semibold text-slate-800">₹{input.monthlyIncome.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Essential Expenses</span><span className="font-mono font-semibold text-slate-800">₹{input.monthlyEssentialExpenses.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Income Stability</span><span className="font-semibold text-slate-800">{input.incomeStability}</span></div>
                      <div className="flex justify-between"><span>Liquid Savings</span><span className="font-mono font-semibold text-slate-800">₹{input.liquidSavings.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Gold (self-reported)</span><span className="font-mono font-semibold text-slate-800">₹{input.goldValueSelfReported.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Chit Fund Value</span><span className="font-mono font-semibold text-slate-800">₹{input.chitFundValue.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Concentrated Asset</span><span className="font-mono font-semibold text-slate-800">₹{input.concentratedAssetValue.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Diversified Investments</span><span className="font-mono font-semibold text-slate-800">₹{input.diversifiedInvestments.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Monthly Debt Payments</span><span className="font-mono font-semibold text-slate-800">₹{input.monthlyDebtPayments.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>High-Interest Revolving Debt</span><span className={`font-semibold ${input.hasHighInterestRevolvingDebt ? "text-red-600" : "text-emerald-600"}`}>{input.hasHighInterestRevolvingDebt ? "Yes" : "No"}</span></div>
                      <div className="flex justify-between"><span>Dependents</span><span className="font-semibold text-slate-800">{input.dependentsCount}</span></div>
                      <div className="flex justify-between"><span>Health Insurance</span><span className={`font-semibold ${input.hasHealthInsurance ? "text-emerald-600" : "text-red-600"}`}>{input.hasHealthInsurance ? "Yes" : "No"}</span></div>
                      <div className="flex justify-between"><span>Term Life Insurance</span><span className={`font-semibold ${input.hasTermLifeInsurance ? "text-emerald-600" : "text-red-600"}`}>{input.hasTermLifeInsurance ? "Yes" : "No"}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI explanation */}
            {loading && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
                  <p className="text-sm text-slate-500">
                    Generating your personalised explanation…
                  </p>
                </div>
              </div>
            )}

            {explanation && (
              <>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    What This Means For You
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {explanation}
                  </p>
                </div>

                {(() => {
                  const ranked = rankAllInterventions(input, result);
                  const topInterventions = ranked.slice(0, 3);
                  
                  if (topInterventions.length > 0) {
                    return (
                      <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6 mt-6">
                        <h3 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-3">
                          High-Impact Interventions
                        </h3>
                        <p className="text-sm text-emerald-900 mb-6">
                          Based on your specific financial profile, here are the most effective steps to increase your resilience:
                        </p>
                        
                        <div className="space-y-4">
                          {topInterventions.map((projection, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
                              <p className="text-sm text-slate-700 flex-1">
                                {i + 1}. By <span className="font-semibold text-emerald-800">{projection.fixDescription}</span>...
                              </p>
                              
                              <div className="flex items-center gap-4 shrink-0">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-slate-400 line-through decoration-emerald-200/50">{projection.currentScore}</p>
                                </div>
                                <div className="text-emerald-400">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </div>
                                <div className="text-center">
                                  <p className="text-3xl font-bold text-emerald-600">+{projection.scoreDelta}</p>
                                </div>
                                <div className="text-center ml-2">
                                  <p className="text-[10px] text-emerald-700 uppercase font-semibold">New Score</p>
                                  <p className="text-xl font-bold text-emerald-600">{projection.projectedScore}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div className="pt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleDownloadShareCard}
                    disabled={downloading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium
                               hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                               transition cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {downloading ? "Generating…" : "Download Share Card"}
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                <p className="text-sm text-red-700">{error}</p>
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
            className={`w-[540px] flex flex-col p-12 gap-12 ${scoreBg(result.score)}`}
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            <div>
              <p className="text-sm font-semibold text-slate-500 tracking-widest uppercase mb-8">
                Wealth Fragility Score
              </p>
              
              <div className="space-y-0">
                <p className="text-xl font-medium text-slate-500">My Resilience Score is</p>
                <p className={`text-[180px] leading-none font-bold tabular-nums tracking-tighter ${scoreColor(result.score)} -ml-2`}>
                  {result.score}
                </p>
                <p className={`text-3xl font-semibold tracking-tight ${scoreColor(result.score)}`}>
                  {result.category}
                </p>
              </div>

              <div className="mt-10 text-2xl font-medium text-slate-800 leading-snug border-l-4 border-slate-300 pl-6">
                "{explanation.split(/(?<=\.)\s/)[0]}"
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <p className="text-slate-800 text-2xl font-bold">Check your own score →</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
