import { NextRequest, NextResponse } from "next/server";
import { documentIntelligenceEngine } from "@/lib/ai/document-intelligence-engine";
import { AimlyIntelligenceReport, GroundedChatMessage } from "@/lib/types/document-intelligence";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, report, history = [] } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!report) {
      return NextResponse.json({ error: "Aimly report context is required" }, { status: 400 });
    }

    const responseMessage = documentIntelligenceEngine.processDocumentChatMessage(
      query,
      report as AimlyIntelligenceReport,
      history as GroundedChatMessage[]
    );

    return NextResponse.json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    console.error("Chat Document Decision error:", error);
    return NextResponse.json(
      { error: "Failed to process document chat message", details: String(error) },
      { status: 500 }
    );
  }
}
