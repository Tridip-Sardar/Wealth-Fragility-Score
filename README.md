# Wealth Fragility Score

A tool that scores an individual's true financial resilience — not income or
net worth — and explains in plain language how exposed they are to a single
financial shock.

## The problem

Most financial tools measure wealth accumulation: how much you have and how
fast it's growing. That's useful once you already have a cushion. This tool
is for people who don't yet — first-generation earners in India, typically
22–40, who may earn well but have no inherited financial literacy or safety
net. Only about a third of people in South Asia can access emergency funds
within 30 days without difficulty (World Bank Findex). This is a legitimate,
under-served, and earlier entry point than existing tools address.

## How it works

- **The score is fully deterministic — no AI.** It's built on four pillars:
  - Income Stability (25%)
  - Savings Runway (35%) — with India-specific haircuts on illiquid assets
    (gold, chit funds, concentrated holdings)
  - Debt Burden (20%) — via FOIR (Fixed Obligation to Income Ratio)
  - Shock Defense (20%) — health and term insurance coverage
  - A hard gate: no health insurance caps the score at 60, regardless of
    other pillars.
- **AI (Gemini) is used only to explain the score**, not to decide it. It
  generates a short, plain-language explanation naming the single biggest
  driver of the score and one concrete action to improve it.
- **Shock Simulator** projects month-by-month liquid balance over 6 months
  under a job-loss or medical-emergency scenario.
- **Counterfactual Twin** shows a side-by-side comparison of the user's
  score today vs. after fixing their single weakest pillar.
- **Progressive disclosure UI**: only the score, explanation, and top
  intervention are shown by default. Pillar breakdown, shock simulator,
  full scoring math, and the counterfactual twin are collapsed behind
  plain-language section headers — because the target user should not be
  handed four dashboards at once.

## Research grounding

- Lusardi/Schneider/Tufano financial fragility framework
- World Bank Global Findex
- Dvara Research / PwC India Financial Health Survey
- RBI household savings and gold loan LTV data

## Tech stack

Next.js (App Router), TypeScript, Tailwind CSS v3, Gemini API
(`gemini-3.1-flash-lite`), Vercel.

## Running locally

\`\`\`bash
npm install
npm run dev
\`\`\`

## Tests

\`\`\`bash
npm test
\`\`\`

## Live demo

https://wealth-fragility-score.vercel.app/