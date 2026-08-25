import { NextRequest, NextResponse } from "next/server";
import { recoverExistingStripeSubscription } from "@/lib/payments/stripe-service";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Endpoint for safe, one-time server-side recovery of an existing Stripe Sandbox subscription.
 * Verifies the subscription against Stripe API and idempotently associates it with the authenticated UseAimly user in PostgreSQL.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to reconcile subscription." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const subscriptionId = body.subscriptionId || body.stripeSubscriptionId;
    const customerId = body.customerId || body.stripeCustomerId;
    const customerEmail = body.customerEmail || body.email || user.email;

    const result = await recoverExistingStripeSubscription({
      userId: user.id,
      userEmail: user.email || customerEmail,
      subscriptionId,
      customerId,
      supabaseClient: supabase,
    });

    return NextResponse.json({
      success: result.success,
      planTier: result.planTier,
      planStatus: result.planStatus,
      stripeCustomerId: result.stripeCustomerId,
      stripeSubscriptionId: result.stripeSubscriptionId,
      matchedVia: result.matchedVia,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Reconciliation recovery error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to recover subscription" },
      { status: 500 }
    );
  }
}
