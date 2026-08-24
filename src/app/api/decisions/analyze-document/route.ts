import { NextRequest, NextResponse } from "next/server";
import { documentIngestionService } from "@/lib/documents/document-ingestion-service";
import { decisionContextBuilder } from "@/lib/documents/decision-context-builder";
import { documentIntelligenceEngine } from "@/lib/ai/document-intelligence-engine";
import { CurrencyCode } from "@/lib/types/finance";
import { UserFinancialContextInput } from "@/lib/types/document-intelligence";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userDecisionText = "Financial Decision",
      files = [],
      userContext = {},
      currency = "KES",
    } = body;

    // 1. Ingest Documents
    const ingestedDocs = await documentIngestionService.ingestMultipleDocuments(files);

    // 2. Build Unified Decision Context
    const context = decisionContextBuilder.buildContext({
      userDecisionText,
      documents: ingestedDocs,
      userContext: userContext as UserFinancialContextInput,
      currency: currency as CurrencyCode,
    });

    // 3. Generate Complete Aimly Intelligence Report
    const report = documentIntelligenceEngine.generateReport(context);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Analyze Document Decision error:", error);
    return NextResponse.json(
      { error: "Failed to analyze document decision", details: String(error) },
      { status: 500 }
    );
  }
}
