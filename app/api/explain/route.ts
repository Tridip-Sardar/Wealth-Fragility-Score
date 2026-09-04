import { NextRequest, NextResponse } from "next/server";
import { computeFragilityScore, FragilityInput } from "@/lib/fragilityScore";
import { getScoreExplanation } from "@/lib/explainScore";

export async function POST(request: NextRequest) {
    try {
        const body: FragilityInput = await request.json();

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
