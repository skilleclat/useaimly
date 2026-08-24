import { NextRequest, NextResponse } from "next/server";
import { dispatchWhatsAppDigest } from "@/lib/notifications/whatsapp-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      phoneNumber = "+254712345678",
      goalTitle = "Start my business",
      daysRemaining = 30,
      targetDate = "Dec 2027",
      projectedDate = "Dec 2027",
      monthlyCapacity = 68000,
      currency = "KES",
      digestMessage = "",
      aiTip = "",
      triggers = { goalPace: true, expenses: true, aiCoaching: true },
    } = body;

    const result = await dispatchWhatsAppDigest({
      phoneNumber,
      goalTitle,
      daysRemaining,
      targetDate,
      projectedDate,
      monthlyCapacity,
      currency,
      digestMessage,
      aiTip,
      triggers,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "WhatsApp dispatch failed" },
      { status: 500 }
    );
  }
}
