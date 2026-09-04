import { NextRequest, NextResponse } from "next/server";
import { computeFragilityScore } from "@/lib/fragilityScore";
import { getScoreExplanation } from "@/lib/explainScore";
import { validateFragilityInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
    try {
        const rawJson = await request.json();
        const validation = validateFragilityInput(rawJson);

        if (!validation.success || !validation.data) {
            return NextResponse.json(
                { error: validation.error || "Invalid input payload." },
                { status: 400 }
            );
        }

        const body = validation.data;
        const result = computeFragilityScore(body);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured on the server." },
                { status: 500 }
            );
        }

        const explanation = await getScoreExplanation(body, result, apiKey);

        return NextResponse.json({ result, explanation });
    } catch (err) {
        console.error("Explain route error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Unknown error" },
            { status: 500 }
        );
    }
}
