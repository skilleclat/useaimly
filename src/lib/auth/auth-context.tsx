"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/database.types";
import { useRouter } from "next/navigation";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function getUserDisplayName(user: User | null, profile: Profile | null): string {
  // 1. If profile has a real database record and full_name (not demo)
  if (profile && profile.id !== "demo-user-id" && profile.full_name && profile.full_name.trim().length > 0 && !profile.full_name.toLowerCase().includes("demo")) {
    return profile.full_name.trim();
  }

  // 2. If user metadata from Supabase Auth has full_name or name
  if (user?.user_metadata) {
    const metaName =
      user.user_metadata.full_name ||
      user.user_metadata.name ||
      user.user_metadata.fullName;
    if (typeof metaName === "string" && metaName.trim().length > 0 && !metaName.toLowerCase().includes("demo")) {
      return metaName.trim();
    }
  }

  // 3. User email prefix formatted nicely (e.g., "herimanya" -> "Herimanya", "john.doe" -> "John Doe")
  if (user?.email) {
    const prefix = user.email.split("@")[0];
    if (prefix && prefix.trim().length > 0) {
      return prefix
        .replace(/[._-]/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }

  // 4. If profile has any non-empty full_name
  if (profile?.full_name && profile.full_name.trim().length > 0 && !profile.full_name.toLowerCase().includes("demo")) {
    return profile.full_name.trim();
  }

  return user ? "User" : "Strategist";
}

export function getUserFirstName(user: User | null, profile: Profile | null): string {
  const full = getUserDisplayName(user, profile);
  return full.split(" ")[0] || full;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  displayName: string;
  firstName: string;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = createClient();
  const router = useRouter();

  const buildFallbackProfile = useCallback((authUser: User): Profile => {
    const userFullName = getUserDisplayName(authUser, null);
    const isOwner = authUser.email?.trim().toLowerCase() === "skilleclat@gmail.com";
    return {
      id: authUser.id,
      full_name: userFullName,
      avatar_url: authUser.user_metadata?.avatar_url || null,
      preferred_currency: authUser.user_metadata?.preferred_currency || "KES",
      timezone: "Africa/Nairobi",
      locale: "en",
      onboarding_completed: true,
      plan_tier: isOwner ? "premium" : "free",
      plan_status: "active",
      created_at: authUser.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, []);

  const fetchProfile = useCallback(async (authUser: User) => {
    const isOwner = authUser.email?.trim().toLowerCase() === "skilleclat@gmail.com";
    try {
      // 1. Fetch profile record from PostgreSQL
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      // 2. Query server-authoritative subscription status
      let verifiedPlanTier: "free" | "pro" | "premium" = isOwner ? "premium" : "free";
      let verifiedPlanStatus: "active" | "canceled" | "trial" = "active";

      try {
        const subRes = await fetch("/api/auth/subscription-status", {
          method: "GET",
          cache: "no-store",
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.success && subData.planTier) {
            verifiedPlanTier = isOwner ? "premium" : subData.planTier;
            verifiedPlanStatus = subData.planStatus || "active";
          }
        }
      } catch (subErr) {
        console.warn("Subscription status verification note:", subErr);
      }

      if (data && !error) {
        const effectiveName =
          (data.full_name && data.full_name.trim().length > 0 && !data.full_name.toLowerCase().includes("demo"))
            ? data.full_name
            : getUserDisplayName(authUser, null);

        // Server authoritative tier takes precedence over stale cached state
        const effectiveTier = isOwner
          ? "premium"
          : verifiedPlanTier !== "free"
          ? verifiedPlanTier
          : (data.plan_tier || "free");

        setProfile({
          ...data,
          full_name: effectiveName,
          plan_tier: effectiveTier,
          plan_status: verifiedPlanStatus,
        });

        // Automatically sync owner status in Supabase if not already premium
        if (isOwner && data.plan_tier !== "premium") {
          await (supabase.from("profiles") as any)
            .update({
              plan_tier: "premium",
              plan_status: "active",
            })
            .eq("id", authUser.id);
          await supabase.auth.updateUser({
            data: { plan_tier: "premium", is_admin: true },
          });
        }
        return;
      }

      // If profile record does not exist in Supabase yet, create fallback & upsert
      const fallback = buildFallbackProfile(authUser);
      fallback.plan_tier = verifiedPlanTier;
      setProfile(fallback);

      await (supabase.from("profiles") as any).upsert({
        id: authUser.id,
        full_name: fallback.full_name,
        preferred_currency: fallback.preferred_currency,
        plan_tier: isOwner ? "premium" : verifiedPlanTier,
        plan_status: "active",
        onboarding_completed: true,
      });

      if (isOwner) {
        await supabase.auth.updateUser({
          data: { plan_tier: "premium", is_admin: true },
        });
      }
    } catch (e) {
      console.warn("Failed to fetch profile, using fallback:", e);
      setProfile(buildFallbackProfile(authUser));
    }
  }, [supabase, buildFallbackProfile]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Immediately set a truthful metadata-based profile to prevent flashing demo names
          setProfile(buildFallbackProfile(currentUser));
          await fetchProfile(currentUser);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.warn("Session check error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          setProfile(buildFallbackProfile(currentUser));
          await fetchProfile(currentUser);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, buildFallbackProfile, fetchProfile]);

  const signOut = async () => {
    setIsLoading(true);

    // 1. Immediately reset React state
    setUser(null);
    setProfile(null);

    // 2. Synchronously clear client local storage & session storage tokens
    try {
      if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach((key) => {
          if (
            key.includes("supabase") ||
            key.includes("sb-") ||
            key.includes("aimly") ||
            key.includes("auth") ||
            key.includes("user")
          ) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn("Storage clear error:", e);
    }

    // 3. Fire client & server session invalidation in parallel without blocking UI
    try {
      await Promise.allSettled([
        supabase.auth.signOut({ scope: "local" }).catch(() => {}),
        fetch("/api/auth/signout", { method: "POST", keepalive: true }).catch(() => {}),
      ]);
    } catch {
      // Non-blocking
    }

    // 4. Hard browser redirect to /login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.push("/login");
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const displayName = useMemo(() => getUserDisplayName(user, profile), [user, profile]);
  const firstName = useMemo(() => getUserFirstName(user, profile), [user, profile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        displayName,
        firstName,
        isLoading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
