import { NextRequest, NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/lib/payments/stripe-service";
import { initiateMpesaStkPush } from "@/lib/payments/mpesa-service";
import { createPayPalOrder } from "@/lib/payments/paypal-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId = "pro", billingCycle = "MONTHLY", provider = "STRIPE", phoneNumber = "", customerEmail = "" } = body;

    if (provider === "PAYPAL") {
      const paypalResult = await createPayPalOrder({
        planId,
        billingCycle,
        customerEmail,
      });
      return NextResponse.json(paypalResult);
    }

    if (provider === "MPESA") {
      const amountKES =
        planId === "pro"
          ? billingCycle === "ANNUAL"
            ? 5200
            : 650
          : planId === "premium"
          ? billingCycle === "ANNUAL"
            ? 10400
            : 1300
          : 0;

      const mpesaResult = await initiateMpesaStkPush({
        phoneNumber: phoneNumber || "254712345678",
        amount: amountKES,
        accountReference: `UseAimly ${planId.toUpperCase()}`,
        transactionDesc: `UseAimly ${planId} Subscription (${billingCycle})`,
      });

      return NextResponse.json(mpesaResult);
    }

    // Resolve authenticated user session if available
    let authUserId = body.userId;
    let authEmail = customerEmail;

    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        authUserId = user.id;
        authEmail = user.email || customerEmail;
      }
    } catch {
      // Unauthenticated checkout or guest flow
    }

    // Default to Stripe Checkout Session
    const stripeResult = await createStripeCheckoutSession({
      planId,
      billingCycle,
      userId: authUserId,
      customerEmail: authEmail,
    });

    return NextResponse.json(stripeResult, { status: stripeResult.success ? 200 : 400 });
  } catch (error: any) {
    console.error("POST /api/checkout exception:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Checkout session initialization failed" },
      { status: 500 }
    );
  }
}
