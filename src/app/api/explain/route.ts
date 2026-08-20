import { NextRequest, NextResponse } from "next/server";
import { defaultExplanationEngine } from "@/lib/ai/explanation-engine";
import { DecisionExplanationPayload } from "@/lib/types/ai";

export async function POST(req: NextRequest) {
  try {
    const payload: DecisionExplanationPayload = await req.json();

    if (!payload || !payload.simulation) {
      return NextResponse.json(
        { error: "Invalid payload: simulation data is required" },
        { status: 400 }
      );
    }

    const explanation = await defaultExplanationEngine.explainDecision(payload);

    return NextResponse.json(explanation);
  } catch (error) {
    console.error("AI Explanation error:", error);
    return NextResponse.json(
      { error: "Failed to generate decision explanation" },
      { status: 500 }
    );
  }
}
