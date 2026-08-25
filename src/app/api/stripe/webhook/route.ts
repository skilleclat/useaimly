import { NextRequest, NextResponse } from "next/server";
import { syncVerifiedSubscription } from "@/lib/payments/stripe-service";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();

    let event: any;

    // If webhook secret is present, we could verify signatures
    // For standard JSON parsing:
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid payload JSON" }, { status: 400 });
    }

    const eventType = event.type;
    const dataObject = event.data?.object;

    if (!dataObject) {
      return NextResponse.json({ received: true, note: "No object in event" });
    }

    const supabase = createAdminClient();

    switch (eventType) {
      case "checkout.session.completed": {
        const metadata = dataObject.metadata || {};
        const userId = dataObject.client_reference_id || metadata.userId;
        const customerEmail = dataObject.customer_details?.email || dataObject.customer_email;
        const planId = metadata.planId === "premium" ? "premium" : "pro";
        const billingCycle = metadata.billingCycle === "ANNUAL" ? "ANNUAL" : "MONTHLY";
        const subscriptionId = dataObject.subscription || dataObject.id;
        const amountPaid = (dataObject.amount_total || 499) / 100;
        const currency = (dataObject.currency || "usd").toUpperCase();

        await syncVerifiedSubscription({
          userId,
          customerEmail,
          planId,
          billingCycle,
          subscriptionId,
          amountPaid,
          currency,
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const status = dataObject.status; // 'active', 'past_due', 'canceled', 'trialing'
        const subscriptionId = dataObject.id;
        const planId = dataObject.items?.data?.[0]?.price?.product === "premium" ? "premium" : "pro";
        const interval = dataObject.items?.data?.[0]?.price?.recurring?.interval;
        const billingCycle = interval === "year" ? "ANNUAL" : "MONTHLY";
        const currentPeriodEnd = dataObject.current_period_end
          ? new Date(dataObject.current_period_end * 1000).toISOString()
          : undefined;

        const isGoodStanding = status === "active" || status === "trialing";

        // Find subscription by external ID
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("external_subscription_id", subscriptionId)
          .maybeSingle();

        if (existingSub?.user_id) {
          await (supabase.from("profiles") as any)
            .update({
              plan_tier: isGoodStanding ? planId : "free",
              plan_status: isGoodStanding ? "active" : "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSub.user_id);

          await (supabase.from("subscriptions") as any)
            .update({
              status: isGoodStanding ? "ACTIVE" : "CANCELLED",
              current_period_end: currentPeriodEnd ? currentPeriodEnd.split("T")[0] : undefined,
              updated_at: new Date().toISOString(),
            })
            .eq("external_subscription_id", subscriptionId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscriptionId = dataObject.id;
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("external_subscription_id", subscriptionId)
          .maybeSingle();

        if (existingSub?.user_id) {
          await (supabase.from("profiles") as any)
            .update({
              plan_tier: "free",
              plan_status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSub.user_id);

          await (supabase.from("subscriptions") as any)
            .update({
              status: "CANCELLED",
              updated_at: new Date().toISOString(),
            })
            .eq("external_subscription_id", subscriptionId);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        // Recurring subscription payment succeeded
        const subscriptionId = dataObject.subscription;
        if (subscriptionId) {
          const { data: existingSub } = await supabase
            .from("subscriptions")
            .select("user_id, plan_id")
            .eq("external_subscription_id", subscriptionId)
            .maybeSingle();

          if (existingSub?.user_id) {
            await (supabase.from("profiles") as any)
              .update({
                plan_tier: existingSub.plan_id || "pro",
                plan_status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingSub.user_id);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const subscriptionId = dataObject.subscription;
        if (subscriptionId) {
          const { data: existingSub } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("external_subscription_id", subscriptionId)
            .maybeSingle();

          if (existingSub?.user_id) {
            await (supabase.from("subscriptions") as any)
              .update({
                status: "PAST_DUE",
                updated_at: new Date().toISOString(),
              })
              .eq("external_subscription_id", subscriptionId);
          }
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true, event: eventType });
  } catch (error: any) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
