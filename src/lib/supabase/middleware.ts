/**
 * Supabase Middleware Gatekeeper & Route Protection
 * Refreshes auth session cookies and strictly protects application routes against unverified or unauthorized access.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "./database.types";

const DEFAULT_SUPABASE_URL = "https://ozlkmamtmkoigweidnij.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_QtKMSP03_yvgm1ZXDfvZog_B6Ihi6nH";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const supabaseUrl = url.length > 0 ? url : DEFAULT_SUPABASE_URL;

  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  const supabaseAnonKey = key.length > 0 ? key : DEFAULT_SUPABASE_ANON_KEY;

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          })
        );
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  // 1. Authoritatively validate user session against Supabase Auth backend
  let user: import("@supabase/supabase-js").User | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      user = data.user;
    }
  } catch {
    user = null;
  }

  // Determine if email is verified
  // Google OAuth automatically verifies email
  const isGoogleUser =
    user?.app_metadata?.provider === "google" ||
    user?.identities?.some((id) => id.provider === "google");
  
  const isEmailVerified = Boolean(
    user && (isGoogleUser || Boolean(user.email_confirmed_at))
  );

  const isProtectedRoute = pathname.startsWith("/app") || pathname.startsWith("/onboarding");
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/verify-email";

  // 2. Protect Authenticated Routes (/app and /onboarding)
  if (isProtectedRoute) {
    // A. Unauthenticated: Redirect to /login
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // B. Unverified Email: Strictly redirect to /verify-email
    if (!isEmailVerified) {
      const verifyUrl = new URL("/verify-email", request.url);
      if (user.email) {
        verifyUrl.searchParams.set("email", user.email);
      }
      return NextResponse.redirect(verifyUrl);
    }
  }

  // 3. Handle Auth Routes (/login, /signup, /verify-email) for already-verified users
  if (isAuthRoute && user && isEmailVerified && pathname !== "/verify-email") {
    // Verified user trying to visit login/signup -> send to /app
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return supabaseResponse;
}
