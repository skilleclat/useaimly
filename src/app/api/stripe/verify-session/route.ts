import { NextRequest, NextResponse } from "next/server";
import { verifyStripeSession } from "@/lib/payments/stripe-service";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = body.sessionId || body.session_id;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing session_id parameter" },
        { status: 400 }
      );
    }

    // Attempt to identify authenticated user from session cookies
    let currentUserId: string | null = null;
    let currentUserEmail: string | null = null;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
        currentUserEmail = user.email || null;
      }
    } catch {
      // User may be anonymous or completing post-checkout redirect
    }

    const verified = await verifyStripeSession(sessionId, currentUserId);

    if (!verified.isValid || verified.status === "failed") {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message: "Unable to verify Stripe checkout session",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: verified.status,
      plan: verified.planId,
      billingCycle: verified.billingCycle,
      amountPaid: verified.amountPaid,
      currency: verified.currency,
      customerEmail: verified.customerEmail || currentUserEmail,
      customerId: verified.customerId,
      subscriptionId: verified.subscriptionId,
      currentPeriodEnd: verified.currentPeriodEnd,
      isAuthenticated: !!currentUserId,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal session verification error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id") || searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing session_id parameter" },
        { status: 400 }
      );
    }

    let currentUserId: string | null = null;
    let currentUserEmail: string | null = null;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
        currentUserEmail = user.email || null;
      }
    } catch {
      // ignore
    }

    const verified = await verifyStripeSession(sessionId, currentUserId);

    return NextResponse.json({
      success: verified.isValid,
      status: verified.status,
      plan: verified.planId,
      billingCycle: verified.billingCycle,
      amountPaid: verified.amountPaid,
      currency: verified.currency,
      customerEmail: verified.customerEmail || currentUserEmail,
      customerId: verified.customerId,
      subscriptionId: verified.subscriptionId,
      currentPeriodEnd: verified.currentPeriodEnd,
      isAuthenticated: !!currentUserId,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal session verification error",
      },
      { status: 500 }
    );
  }
}
