import { NextRequest, NextResponse } from "next/server";
import { defaultConversationalEngine } from "@/lib/ai/conversational-engine";
import { CurrencyCode } from "@/lib/types/finance";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, currency, userOverride } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await defaultConversationalEngine.processUserMessage(
      message,
      history || [],
      (currency || "KES") as CurrencyCode,
      userOverride
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

