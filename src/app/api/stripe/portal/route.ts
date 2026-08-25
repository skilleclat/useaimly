import { NextRequest, NextResponse } from "next/server";
import { createStripePortalSession } from "@/lib/payments/stripe-service";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const customerId = body.customerId || undefined;

    const portal = await createStripePortalSession({
      customerId,
      userEmail: user?.email || undefined,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://useaimly.com"}/app/settings`,
    });

    return NextResponse.json({ success: true, url: portal.url });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, url: "/app/settings", error: error?.message },
      { status: 500 }
    );
  }
}
