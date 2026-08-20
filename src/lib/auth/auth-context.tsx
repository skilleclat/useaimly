"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/database.types";
import { useRouter } from "next/navigation";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const DEFAULT_DEMO_PROFILE: Profile = {
  id: "demo-user-id",
  full_name: "Demo Strategist",
  avatar_url: null,
  preferred_currency: "KES",
  timezone: "Africa/Nairobi",
  locale: "en",
  onboarding_completed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(DEFAULT_DEMO_PROFILE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const supabase = createClient();
  const router = useRouter();

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) {
        setProfile(data);
      }
    } catch (e) {
      console.warn("Failed to fetch profile:", e);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.warn("Session check error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(DEFAULT_DEMO_PROFILE);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    setUser(null);
    setProfile(DEFAULT_DEMO_PROFILE);
    router.push("/");
    router.refresh();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: profile || DEFAULT_DEMO_PROFILE,
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
