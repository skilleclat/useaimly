import { NextRequest, NextResponse } from "next/server";
import { simulateDecision } from "@/lib/finance/decision-simulations/decision-engine";
import { DecisionSimulateRequestSchema } from "@/lib/validation/decision.schema";
import { INITIAL_DEMO_PROFILE, INITIAL_DEMO_GOALS } from "@/lib/finance/demo-data";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DecisionSimulateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { decision } = parsed.data;
    const simulation = simulateDecision(INITIAL_DEMO_PROFILE, INITIAL_DEMO_GOALS, decision);

    return NextResponse.json(simulation);
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { error: "Failed to simulate financial decision" },
      { status: 500 }
    );
  }
}
