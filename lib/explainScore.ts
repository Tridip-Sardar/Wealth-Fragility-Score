import { FragilityBreakdown, FragilityInput } from "./fragilityScore";

export function buildExplanationPrompts(input: FragilityInput, result: FragilityBreakdown) {
    const systemInstruction = `You are explaining a financial resilience score to someone who has likely never had personal finance explained to them by a parent or advisor. They are a first-generation earner in India — the first in their family to have a stable income, but without inherited financial knowledge or a safety net.

Tone: direct, warm, urgent where necessary — like a knowledgeable friend, not a bank or a wealth manager. Avoid clinical terms like "asset-to-liability ratio" or "diversification." Use plain language and concrete numbers. Do not be condescending. Do not be alarmist for its own sake — be honest about real risk.

Write a short explanation (120-180 words) with exactly this structure:
1. One sentence stating their real situation plainly (not just repeating the score).
2. One sentence naming the SINGLE biggest driver of their fragility — be specific, using their actual numbers.
3. One concrete, highest-leverage action they should take first, before anything else (e.g. before investing, before optimizing savings elsewhere).

Do not list multiple recommendations. Pick the ONE thing that matters most given their specific pillars. Do not use bullet points — write it as short, direct sentences.`;

    const prompt = `Their data:
- Monthly income: ₹${input.monthlyIncome.toLocaleString("en-IN")}
- Monthly essential expenses: ₹${input.monthlyEssentialExpenses.toLocaleString("en-IN")}
- Income type: ${input.incomeStability}
- Dependents relying on their income: ${input.dependentsCount}
- Health insurance: ${input.hasHealthInsurance ? "Yes" : "No"}
- Term life insurance: ${input.hasTermLifeInsurance ? "Yes" : "No"}
- High-interest revolving debt: ${input.hasHighInterestRevolvingDebt ? "Yes" : "No"}

Their computed score: ${result.score}/100 (${result.category})
- Income stability pillar: ${result.pillars.incomeStability.score}/100 — ${result.pillars.incomeStability.note}
- Savings runway pillar: ${result.pillars.savingsRunway.score}/100 — ${result.pillars.savingsRunway.note}
- Debt burden pillar: ${result.pillars.debtBurden.score}/100 — ${result.pillars.debtBurden.note}
- Shock defense pillar: ${result.pillars.shockDefense.score}/100 — ${result.pillars.shockDefense.note}
${result.cappedByInsuranceGate ? "- Note: their score was capped at 60 because they lack health insurance, regardless of other strengths — this must be explained as the dominant issue." : ""}`;

    return { systemInstruction, prompt };
}

export async function getScoreExplanation(
    input: FragilityInput,
    result: FragilityBreakdown,
    apiKey: string
): Promise<string> {
    const { systemInstruction, prompt } = buildExplanationPrompts(input, result);

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemInstruction }],
                },
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    maxOutputTokens: 400,
                    temperature: 0.7,
                },
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ?? "Explanation could not be generated.";
}
