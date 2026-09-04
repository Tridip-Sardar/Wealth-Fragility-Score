"use client";

import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import {
  computeFragilityScore,
  FragilityBreakdown,
  FragilityInput,
} from "@/lib/fragilityScore";
import { ShockType } from "@/lib/shockSimulator";

import DiagnosticForm from "@/app/components/DiagnosticForm";
import WarningBanner from "@/app/components/WarningBanner";
import ScoreHero from "@/app/components/ScoreHero";
import ExplanationSection from "@/app/components/ExplanationSection";
import InterventionSummary from "@/app/components/InterventionSummary";
import PillarBreakdown from "@/app/components/PillarBreakdown";
import ShockSimulatorSection from "@/app/components/ShockSimulatorSection";
import CounterfactualTwin from "@/app/components/CounterfactualTwin";
import DebuggerSection from "@/app/components/DebuggerSection";
import ShareCard from "@/app/components/ShareCard";
import ErrorBoundary from "@/app/components/ErrorBoundary";

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

export default function Home() {
  const [input, setInput] = useState<FragilityInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<FragilityBreakdown | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeShock, setActiveShock] = useState<ShockType | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable accidental wheel/scroll number changes on all number inputs
    const handleWheel = (e: WheelEvent) => {
      const active = document.activeElement;
      if (active && active.tagName === "INPUT" && (active as HTMLInputElement).type === "number") {
        e.preventDefault();
        (active as HTMLElement).blur();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

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
        <DiagnosticForm
          input={input}
          onChange={update}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          hasResult={!!result}
        />

        {/* ── Results Area ── */}
        {result && (
          <div ref={resultsRef} className="mt-12 sm:mt-20 space-y-0">
            <ErrorBoundary fallbackTitle="Could not load resilience diagnostics">
              {/* Inconsistency / Risk Warning Banner */}
              <WarningBanner warnings={result.warnings} />

              {/* 1. HERO SCORE */}
              <ScoreHero result={result} />

              {/* 2. AI EXPLANATION */}
              <ExplanationSection loading={loading} explanation={explanation} />

              {/* 3. TOP INTERVENTION SUMMARY & SHARE ACTION */}
              <InterventionSummary
                input={input}
                result={result}
                hasExplanation={!!explanation}
                downloading={downloading}
                onDownloadShareCard={handleDownloadShareCard}
              />

              {/* ── COLLAPSIBLE SECTIONS ── */}
              <div className="space-y-0 pt-2 sm:pt-4">
                {/* 5. PILLAR BREAKDOWN */}
                <PillarBreakdown result={result} />

                {/* 6. SHOCK SIMULATOR */}
                <ShockSimulatorSection
                  input={input}
                  activeShock={activeShock}
                  onSelectShock={setActiveShock}
                />

                {/* 7. COUNTERFACTUAL TWIN + FULL INTERVENTIONS */}
                <CounterfactualTwin input={input} result={result} />

                {/* 8. UNDER THE HOOD / DEBUGGER */}
                <DebuggerSection input={input} result={result} />
              </div>

              {error && (
                <div className="bg-red-50/70 border border-red-200 rounded-md p-4 text-xs text-red-800 mt-8">
                  {error}
                </div>
              )}
            </ErrorBoundary>
          </div>
        )}
      </div>

      {/* Hidden share card for html-to-image (9:16 aspect ratio) */}
      <ShareCard
        result={result}
        explanation={explanation}
        shareCardRef={shareCardRef}
      />
    </main>
  );
}
