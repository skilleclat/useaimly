import { NextRequest, NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/lib/payments/stripe-service";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      planId = "pro",
      billingCycle = "MONTHLY",
      successUrl,
      cancelUrl,
    } = body;

    // Resolve authenticated user from secure server session
    let authUserId: string | undefined = undefined;
    let authEmail: string | undefined = undefined;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        authUserId = user.id;
        authEmail = user.email || undefined;
      }
    } catch (authErr) {
      console.warn("Could not retrieve server auth session for checkout:", authErr);
    }

    // Pass authenticated user identity server-side to Stripe
    const checkoutResult = await createStripeCheckoutSession({
      planId: planId === "premium" ? "premium" : "pro",
      billingCycle: billingCycle === "ANNUAL" ? "ANNUAL" : "MONTHLY",
      userId: authUserId || body.userId,
      customerEmail: authEmail || body.customerEmail,
      successUrl,
      cancelUrl,
    });

    if (!checkoutResult.success) {
      return NextResponse.json(
        { success: false, error: checkoutResult.message || "Checkout creation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutResult.checkoutUrl,
      sessionId: checkoutResult.sessionId,
      userId: authUserId,
    });
  } catch (error: any) {
    console.error("Stripe create checkout session error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error creating checkout session" },
      { status: 500 }
    );
  }
}
