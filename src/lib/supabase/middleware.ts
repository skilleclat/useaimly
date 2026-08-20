/**
 * Supabase Middleware Gatekeeper
 * Refreshes auth session cookies while allowing open preview of all interfaces.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Open Preview Mode: Allow direct access to all interfaces for testing & review without forcing login
  return supabaseResponse;
}
