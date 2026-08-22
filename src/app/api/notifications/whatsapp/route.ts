import { NextRequest, NextResponse } from "next/server";
import { dispatchWhatsAppDigest } from "@/lib/notifications/whatsapp-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber = "+254712345678", goalTitle = "Start my business", daysRemaining = 30, digestMessage = "" } = body;

    const result = await dispatchWhatsAppDigest({
      phoneNumber,
      goalTitle,
      daysRemaining,
      digestMessage: digestMessage || `⏳ USEAIMLY ALERT: Only ${daysRemaining} days remaining for "${goalTitle}"! Keep épargne pace on track.`,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "WhatsApp dispatch failed" },
      { status: 500 }
    );
  }
}
