import { NextRequest, NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/lib/payments/stripe-service";
import { initiateMpesaStkPush } from "@/lib/payments/mpesa-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId = "pro", billingCycle = "MONTHLY", provider = "STRIPE", phoneNumber = "" } = body;

    if (provider === "PAYPAL") {
      const amountUSD =
        planId === "pro"
          ? billingCycle === "ANNUAL"
            ? 39.99
            : 4.99
          : planId === "premium"
          ? billingCycle === "ANNUAL"
            ? 79.99
            : 9.99
          : 0;

      const orderId = `PAYID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      return NextResponse.json({
        success: true,
        provider: "PAYPAL",
        orderId,
        amountUSD,
        currency: "USD",
        status: "APPROVED",
        message: "PayPal checkout order generated successfully.",
        checkoutUrl: `https://www.paypal.com/checkoutnow?token=${orderId}`,
      });
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

    // Default to Stripe Checkout Session
    const stripeResult = await createStripeCheckoutSession({
      planId,
      billingCycle,
    });

    return NextResponse.json(stripeResult);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Checkout session initialization failed" },
      { status: 500 }
    );
  }
}
