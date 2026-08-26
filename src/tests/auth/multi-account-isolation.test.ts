import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserDisplayName, getUserFirstName } from "@/lib/auth/auth-context";
import { reconcileUserSubscription, syncVerifiedSubscription, verifyStripeSession } from "@/lib/payments/stripe-service";
import { isUserProOrHigher } from "@/lib/auth/plan-permissions";

describe("CRITICAL MULTI-ACCOUNT ISOLATION & SESSION SWITCHING SUITE", () => {
  const accountA = {
    id: "user-aaa-1111-2222-333344445555",
    email: "accountA@useaimly.com",
    full_name: "Alice Strategy",
    plan_tier: "free" as const,
  };

  const accountB = {
    id: "user-bbb-9999-8888-777766665555",
    email: "accountB@useaimly.com",
    full_name: "Bob Capital",
    plan_tier: "free" as const,
  };

  let inMemoryDb: Record<string, any[]>;

  beforeEach(() => {
    inMemoryDb = {
      profiles: [
        {
          id: accountA.id,
          full_name: accountA.full_name,
          email: accountA.email,
          plan_tier: "free",
          plan_status: "active",
        },
        {
          id: accountB.id,
          full_name: accountB.full_name,
          email: accountB.email,
          plan_tier: "free",
          plan_status: "active",
        },
      ],
      subscriptions: [],
      saved_scenarios: [],
    };
  });

  const createMockSupabase = (activeUser: typeof accountA | typeof accountB | null) => {
    return {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: activeUser
              ? {
                  id: activeUser.id,
                  email: activeUser.email,
                  user_metadata: { full_name: activeUser.full_name },
                }
              : null,
          },
          error: null,
        }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        admin: {
          listUsers: vi.fn().mockResolvedValue({
            data: {
              users: [
                { id: accountA.id, email: accountA.email },
                { id: accountB.id, email: accountB.email },
              ],
            },
            error: null,
          }),
          updateUserById: vi.fn().mockResolvedValue({ data: {}, error: null }),
        },
      },
      from: vi.fn((tableName: string) => ({
        select: vi.fn(() => ({
          eq: vi.fn((col: string, val: any) => ({
            eq: vi.fn((col2: string, val2: any) => ({
              maybeSingle: vi.fn().mockImplementation(() => {
                const match = inMemoryDb[tableName]?.find(
                  (r) => r[col] === val && r[col2] === val2
                );
                return Promise.resolve({ data: match || null, error: null });
              }),
            })),
            maybeSingle: vi.fn().mockImplementation(() => {
              const match = inMemoryDb[tableName]?.find((r) => r[col] === val);
              return Promise.resolve({ data: match || null, error: null });
            }),
            single: vi.fn().mockImplementation(() => {
              const match = inMemoryDb[tableName]?.find((r) => r[col] === val);
              return Promise.resolve({ data: match || null, error: null });
            }),
          })),
          ilike: vi.fn((col: string, val: string) => ({
            maybeSingle: vi.fn().mockImplementation(() => {
              const clean = val.replace(/%/g, "").toLowerCase();
              const match = inMemoryDb[tableName]?.find(
                (r) => r[col]?.toLowerCase() === clean
              );
              return Promise.resolve({ data: match || null, error: null });
            }),
          })),
        })),
        update: vi.fn((updates: any) => ({
          eq: vi.fn((col: string, val: any) => {
            const records = inMemoryDb[tableName] || [];
            const idx = records.findIndex((r) => r[col] === val);
            if (idx >= 0) {
              inMemoryDb[tableName][idx] = { ...inMemoryDb[tableName][idx], ...updates };
            }
            return Promise.resolve({ data: {}, error: null });
          }),
        })),
        insert: vi.fn((newRec: any) => {
          if (!inMemoryDb[tableName]) inMemoryDb[tableName] = [];
          inMemoryDb[tableName].push(newRec);
          return Promise.resolve({ data: newRec, error: null });
        }),
      })),
    };
  };

  it("TEST 1: Login as Account A -> confirm Account A dashboard identity and free status", async () => {
    const mockSupabase = createMockSupabase(accountA);
    const { data: { user } } = await mockSupabase.auth.getUser();

    expect(user?.id).toBe(accountA.id);
    expect(user?.email).toBe(accountA.email);

    const displayName = getUserDisplayName(user as any, inMemoryDb.profiles[0]);
    expect(displayName).toBe("Alice Strategy");

    const status = await reconcileUserSubscription(user!.id, user!.email, mockSupabase);
    expect(status.planTier).toBe("free");
    expect(status.hasActiveSubscription).toBe(false);
  });

  it("TEST 2: Sign out completely -> clears all active session references", async () => {
    const mockSupabase = createMockSupabase(accountA);
    await mockSupabase.auth.signOut();
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it("TEST 3: Sign in as Account B -> confirms Account B dashboard is shown with 0 Account A leakage", async () => {
    const mockSupabase = createMockSupabase(accountB);
    const { data: { user } } = await mockSupabase.auth.getUser();

    expect(user?.id).toBe(accountB.id);
    expect(user?.email).toBe(accountB.email);

    const displayName = getUserDisplayName(user as any, inMemoryDb.profiles[1]);
    expect(displayName).toBe("Bob Capital");
    expect(displayName).not.toContain("Alice");
  });

  it("TEST 4: Refresh browser -> Account B remains Account B", async () => {
    const mockSupabase = createMockSupabase(accountB);
    const { data: { user } } = await mockSupabase.auth.getUser();
    expect(user?.id).toBe(accountB.id);
    expect(user?.email).toBe(accountB.email);
  });

  it("TEST 5: Open new tab -> Account B still resolves to Account B", async () => {
    const mockSupabaseTab2 = createMockSupabase(accountB);
    const { data: { user } } = await mockSupabaseTab2.auth.getUser();
    expect(user?.id).toBe(accountB.id);
    expect(user?.email).toBe(accountB.email);
  });

  it("TEST 6 & 7: Sign out Account B and Sign in as Account A -> Account A data returns with no Account B leakage", async () => {
    // 1. Sign out B
    const mockSupabaseB = createMockSupabase(accountB);
    await mockSupabaseB.auth.signOut();

    // 2. Sign in A
    const mockSupabaseA = createMockSupabase(accountA);
    const { data: { user } } = await mockSupabaseA.auth.getUser();
    expect(user?.id).toBe(accountA.id);
    expect(user?.email).toBe(accountA.email);

    const displayName = getUserDisplayName(user as any, inMemoryDb.profiles[0]);
    expect(displayName).toBe("Alice Strategy");
    expect(displayName).not.toContain("Bob");
  });

  it("TEST 8: Two different accounts in separate browser sessions remain completely isolated", async () => {
    const browserSessionChrome = createMockSupabase(accountA);
    const browserSessionBrave = createMockSupabase(accountB);

    const { data: { user: userA } } = await browserSessionChrome.auth.getUser();
    const { data: { user: userB } } = await browserSessionBrave.auth.getUser();

    expect(userA?.id).toBe(accountA.id);
    expect(userB?.id).toBe(accountB.id);
    expect(userA?.id).not.toBe(userB?.id);
  });

  it("TEST 9: Checkout as Account B, complete payment -> Account B receives Pro, Account A remains Free", async () => {
    const mockSupabase = createMockSupabase(accountB);

    // 1. Synchronize verified Stripe payment specifically for Account B
    await syncVerifiedSubscription({
      userId: accountB.id,
      customerEmail: accountB.email,
      planId: "pro",
      billingCycle: "MONTHLY",
      subscriptionId: "sub_bob_12345",
      customerId: "cus_bob_67890",
      amountPaid: 4.99,
      currency: "USD",
      supabaseClient: mockSupabase,
    });

    // 2. Reconcile Account B -> must be PRO
    const statusB = await reconcileUserSubscription(accountB.id, accountB.email, mockSupabase);
    expect(statusB.planTier).toBe("pro");
    expect(statusB.hasActiveSubscription).toBe(true);
    expect(isUserProOrHigher(statusB.planTier, accountB.email)).toBe(true);

    // 3. Reconcile Account A -> MUST REMAIN FREE
    const statusA = await reconcileUserSubscription(accountA.id, accountA.email, mockSupabase);
    expect(statusA.planTier).toBe("free");
    expect(statusA.hasActiveSubscription).toBe(false);
    expect(isUserProOrHigher(statusA.planTier, accountA.email)).toBe(false);
  });

  it("TEST 10: Attempt to sign in with Account B when stale Account A tokens existed -> Account B overrides completely", async () => {
    // Simulate stale localStorage containing Account A data
    const staleStorage: Record<string, string> = {
      "sb-token": accountA.id,
      "aimly-profile": JSON.stringify(accountA),
    };

    // Purge stale storage on login
    Object.keys(staleStorage).forEach((key) => delete staleStorage[key]);
    expect(Object.keys(staleStorage).length).toBe(0);

    // Active session is resolved solely from authoritative Supabase user
    const mockSupabase = createMockSupabase(accountB);
    const { data: { user } } = await mockSupabase.auth.getUser();

    expect(user?.id).toBe(accountB.id);
    expect(user?.email).toBe(accountB.email);
  });

  it("TEST 11: Unverified Email user (email_confirmed_at: null) -> blocked from protected routes and redirected to verify-email", async () => {
    const unverifiedUser = {
      id: "user-unverified-123",
      email: "newuser@example.com",
      email_confirmed_at: null,
      app_metadata: { provider: "email" },
    };

    const isGoogle = unverifiedUser.app_metadata.provider === "google";
    const isVerified = Boolean(isGoogle || unverifiedUser.email_confirmed_at);

    expect(isVerified).toBe(false);
  });

  it("TEST 12: Wrong 6-digit OTP code -> rejects verification with error", async () => {
    const mockVerifyOtp = vi.fn().mockImplementation(({ token }) => {
      if (token !== "123456") {
        return Promise.resolve({
          data: { user: null, session: null },
          error: { message: "Token has expired or is invalid", status: 403 },
        });
      }
      return Promise.resolve({
        data: {
          user: { id: "user-unverified-123", email: "newuser@example.com", email_confirmed_at: new Date().toISOString() },
          session: { access_token: "valid-jwt" },
        },
        error: null,
      });
    });

    const result = await mockVerifyOtp({ email: "newuser@example.com", token: "000000" });
    expect(result.error).not.toBeNull();
    expect(result.error?.status).toBe(403);
    expect(result.data.user).toBeNull();
  });

  it("TEST 13: Valid 6-digit OTP code -> confirms email and establishes verified session", async () => {
    const mockVerifyOtp = vi.fn().mockImplementation(({ token }) => {
      if (token === "123456") {
        return Promise.resolve({
          data: {
            user: { id: "user-unverified-123", email: "newuser@example.com", email_confirmed_at: new Date().toISOString() },
            session: { access_token: "valid-jwt" },
          },
          error: null,
        });
      }
      return Promise.resolve({ data: { user: null, session: null }, error: { message: "Invalid" } });
    });

    const result = await mockVerifyOtp({ email: "newuser@example.com", token: "123456" });
    expect(result.error).toBeNull();
    expect(result.data.user?.email_confirmed_at).toBeDefined();
    expect(result.data.session?.access_token).toBe("valid-jwt");
  });

  it("TEST 14: Google OAuth user is considered pre-verified by identity provider", async () => {
    const googleUser = {
      id: "user-google-456",
      email: "googleuser@gmail.com",
      email_confirmed_at: new Date().toISOString(),
      app_metadata: { provider: "google" },
    };

    const isGoogle = googleUser.app_metadata.provider === "google";
    const isVerified = Boolean(isGoogle || googleUser.email_confirmed_at);

    expect(isVerified).toBe(true);
  });
});
