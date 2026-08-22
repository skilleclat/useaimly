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
    return {
      id: authUser.id,
      full_name: userFullName,
      avatar_url: authUser.user_metadata?.avatar_url || null,
      preferred_currency: authUser.user_metadata?.preferred_currency || "KES",
      timezone: "Africa/Nairobi",
      locale: "en",
      onboarding_completed: true,
      plan_tier: (authUser.user_metadata?.plan_tier as any) || "free",
      plan_status: "active",
      created_at: authUser.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, []);

  const fetchProfile = useCallback(async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (data && !error) {
        const effectiveName =
          (data.full_name && data.full_name.trim().length > 0 && !data.full_name.toLowerCase().includes("demo"))
            ? data.full_name
            : getUserDisplayName(authUser, null);

        setProfile({
          ...data,
          full_name: effectiveName,
        });
        return;
      }

      // If profile record does not exist in Supabase yet, create fallback & upsert
      const fallback = buildFallbackProfile(authUser);
      setProfile(fallback);

      await (supabase.from("profiles") as any).upsert({
        id: authUser.id,
        full_name: fallback.full_name,
        preferred_currency: fallback.preferred_currency,
        plan_tier: fallback.plan_tier,
        plan_status: "active",
        onboarding_completed: true,
      });
    } catch (e) {
      console.warn("Failed to fetch profile, using metadata fallback:", e);
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
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    setUser(null);
    setProfile(null);
    router.push("/");
    router.refresh();
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
