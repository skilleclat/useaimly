import { describe, it, expect } from "vitest";
import { verifyStripeSession, createStripeCheckoutSession } from "@/lib/payments/stripe-service";

describe("Stripe Checkout and Verification Suite", () => {
  it("generates a valid Stripe checkout session request object with correct success URL", async () => {
    const result = await createStripeCheckoutSession({
      planId: "pro",
      billingCycle: "MONTHLY",
      customerEmail: "investor@useaimly.com",
    });

    expect(result.success).toBe(true);
    expect(result.sessionId).toBeDefined();
    expect(result.checkoutUrl).toContain("/payment-success");
  });

  it("verifies a mock test session cleanly and deterministically", async () => {
    const mockSessionId = "cs_test_mock_123456789";
    const verification = await verifyStripeSession(mockSessionId, "test-user-id");

    expect(verification.isValid).toBe(true);
    expect(verification.status).toBe("active");
    expect(verification.planId).toBe("pro");
    expect(verification.amountPaid).toBe(4.99);
    expect(verification.currency).toBe("USD");
  });

  it("rejects an invalid empty session string", async () => {
    const verification = await verifyStripeSession("");

    expect(verification.isValid).toBe(false);
    expect(verification.status).toBe("failed");
  });
});
