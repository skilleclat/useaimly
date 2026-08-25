import { NextRequest, NextResponse } from "next/server";
import { syncVerifiedSubscription, updateSubscriptionLifecycleStatus } from "@/lib/payments/stripe-service";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * Validates Stripe webhook signature according to Stripe specification:
 * Header: t=timestamp,v1=signature
 * Expected: HMAC-SHA256(timestamp.rawBody, webhookSecret)
 */
function verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  try {
    if (!signatureHeader || !secret) return false;

    const parts = signatureHeader.split(",");
    let timestamp = "";
    let signature = "";

    for (const part of parts) {
      const [key, value] = part.trim().split("=");
      if (key === "t") timestamp = value;
      if (key === "v1") signature = value;
    }

    if (!timestamp || !signature) return false;

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (err) {
    console.warn("Signature verification failed:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();

    // Enforce cryptographic signature verification when webhook secret is configured
    if (webhookSecret) {
      if (!signature || !verifyStripeSignature(rawBody, signature, webhookSecret)) {
        console.error("[Stripe Webhook] Invalid signature rejected.");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid payload JSON" }, { status: 400 });
    }

    const eventType = event.type;
    const eventId = event.id;
    const dataObject = event.data?.object;

    if (!dataObject) {
      return NextResponse.json({ received: true, note: "No data object in event" });
    }

    console.log(`[Stripe Webhook] Processing event: ${eventType} (ID: ${eventId})`);

    switch (eventType) {
      // 1. Initial Checkout Completed
      case "checkout.session.completed": {
        const metadata = dataObject.metadata || {};
        const userId = dataObject.client_reference_id || metadata.userId;
        const customerEmail = dataObject.customer_details?.email || dataObject.customer_email;
        const planId = metadata.planId === "premium" ? "premium" : "pro";
        const billingCycle = metadata.billingCycle === "ANNUAL" ? "ANNUAL" : "MONTHLY";
        const subscriptionId = typeof dataObject.subscription === "string" ? dataObject.subscription : dataObject.id;
        const customerId = typeof dataObject.customer === "string" ? dataObject.customer : undefined;
        const amountPaid = (dataObject.amount_total || 499) / 100;
        const currency = (dataObject.currency || "usd").toUpperCase();

        await syncVerifiedSubscription({
          userId,
          customerEmail,
          planId,
          billingCycle,
          subscriptionId,
          customerId,
          amountPaid,
          currency,
        });
        break;
      }

      // 2. Invoice Paid / Renewed Successfully
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const subscriptionId = dataObject.subscription;
        const customerId = typeof dataObject.customer === "string" ? dataObject.customer : undefined;
        const customerEmail = dataObject.customer_email || dataObject.customer_details?.email;
        const amountPaid = (dataObject.amount_paid || 499) / 100;
        const currency = (dataObject.currency || "usd").toUpperCase();
        const lines = dataObject.lines?.data || [];
        const interval = lines[0]?.price?.recurring?.interval;
        const billingCycle = interval === "year" ? "ANNUAL" : "MONTHLY";
        const planId = lines[0]?.price?.product === "premium" ? "premium" : "pro";

        const currentPeriodEnd = lines[0]?.period?.end
          ? new Date(lines[0].period.end * 1000).toISOString()
          : undefined;

        if (subscriptionId) {
          await syncVerifiedSubscription({
            customerEmail,
            planId,
            billingCycle,
            subscriptionId,
            customerId,
            amountPaid,
            currency,
            currentPeriodEnd,
          });
        }
        break;
      }

      // 3. Subscription Created or Updated (Lifecycle State Changes)
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const status = dataObject.status; // 'active', 'past_due', 'canceled', 'unpaid', 'trialing'
        const subscriptionId = dataObject.id;
        const customerId = typeof dataObject.customer === "string" ? dataObject.customer : undefined;
        const metadata = dataObject.metadata || {};
        const userId = metadata.userId || metadata.user_id;
        const planId = dataObject.items?.data?.[0]?.price?.product === "premium" || metadata.planId === "premium" ? "premium" : "pro";
        const interval = dataObject.items?.data?.[0]?.price?.recurring?.interval;
        const billingCycle = interval === "year" || metadata.billingCycle === "ANNUAL" ? "ANNUAL" : "MONTHLY";
        const cancelAtPeriodEnd = Boolean(dataObject.cancel_at_period_end);
        const currentPeriodEnd = dataObject.current_period_end
          ? new Date(dataObject.current_period_end * 1000).toISOString()
          : undefined;

        if (status === "active" || status === "trialing") {
          // If cancel_at_period_end is true, user maintains PRO until currentPeriodEnd
          await updateSubscriptionLifecycleStatus({
            userId,
            subscriptionId,
            customerId,
            planTier: planId,
            planStatus: "active",
            cancelAtPeriodEnd,
            currentPeriodEnd,
          });
        } else if (status === "past_due") {
          // Mark past_due in database
          await updateSubscriptionLifecycleStatus({
            userId,
            subscriptionId,
            customerId,
            planTier: planId,
            planStatus: "past_due",
            cancelAtPeriodEnd,
            currentPeriodEnd,
          });
        } else if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
          // Access revoked upon definite cancellation or non-payment
          await updateSubscriptionLifecycleStatus({
            userId,
            subscriptionId,
            customerId,
            planTier: "free",
            planStatus: "canceled",
            cancelAtPeriodEnd: false,
            currentPeriodEnd,
          });
        }
        break;
      }

      // 4. Subscription Terminated / Deleted
      case "customer.subscription.deleted": {
        const subscriptionId = dataObject.id;
        const customerId = typeof dataObject.customer === "string" ? dataObject.customer : undefined;
        const metadata = dataObject.metadata || {};
        const userId = metadata.userId || metadata.user_id;

        await updateSubscriptionLifecycleStatus({
          userId,
          subscriptionId,
          customerId,
          planTier: "free",
          planStatus: "canceled",
          cancelAtPeriodEnd: false,
        });
        break;
      }

      // 5. Payment Failed / Renewal Attempt Failed
      case "invoice.payment_failed": {
        const subscriptionId = dataObject.subscription;
        const customerId = typeof dataObject.customer === "string" ? dataObject.customer : undefined;

        if (subscriptionId) {
          await updateSubscriptionLifecycleStatus({
            subscriptionId,
            customerId,
            planTier: "pro",
            planStatus: "past_due",
          });
        }
        break;
      }

      // 6. Action Required (e.g. 3D Secure Verification)
      case "invoice.payment_action_required": {
        const subscriptionId = dataObject.subscription;
        const customerId = typeof dataObject.customer === "string" ? dataObject.customer : undefined;

        if (subscriptionId) {
          await updateSubscriptionLifecycleStatus({
            subscriptionId,
            customerId,
            planTier: "pro",
            planStatus: "past_due",
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true, eventId, event: eventType });
  } catch (error: any) {
    console.error("[Stripe Webhook Exception]:", error?.message || error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}
