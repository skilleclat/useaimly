import { NextRequest, NextResponse } from "next/server";
import { reconcileUserSubscription } from "@/lib/payments/stripe-service";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: true,
        planTier: "free",
        planStatus: "active",
        hasActiveSubscription: false,
        isAuthenticated: false,
      });
    }

    const sub = await reconcileUserSubscription(user.id, user.email, supabase);

    return NextResponse.json({
      success: true,
      planTier: sub.planTier,
      planStatus: sub.planStatus,
      hasActiveSubscription: sub.hasActiveSubscription,
      isAuthenticated: true,
      userId: user.id,
      email: user.email,
    });
  } catch (error: any) {
    console.warn("Error checking subscription status:", error);
    return NextResponse.json(
      { success: false, planTier: "free", planStatus: "active", error: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
