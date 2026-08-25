import { NextRequest, NextResponse } from "next/server";
import { reconcileUserSubscription } from "@/lib/payments/stripe-service";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be authenticated to sync your Stripe subscription.",
        },
        { status: 401 }
      );
    }

    const diag = await reconcileUserSubscription(user.id, user.email, supabase);

    return NextResponse.json({
      success: true,
      userId: user.id,
      userEmail: user.email,
      planTier: diag.planTier,
      planStatus: diag.planStatus,
      hasActiveSubscription: diag.hasActiveSubscription,
      matchedVia: diag.matchedVia,
      stripeCustomerId: diag.stripeCustomerId,
      stripeSubscriptionId: diag.stripeSubscriptionId,
      currentPeriodEnd: diag.currentPeriodEnd,
      stripeConfigured: diag.isConfigured,
      message: diag.details,
    });
  } catch (error: any) {
    console.error("Account Stripe sync error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Sync failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
