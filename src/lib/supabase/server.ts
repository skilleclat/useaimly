/**
 * Supabase Server Client
 * Used in Server Components, Server Actions, and Route Handlers.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./database.types";

const DEFAULT_SUPABASE_URL = "https://ozlkmamtmkoigweidnij.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_QtKMSP03_yvgm1ZXDfvZog_B6Ihi6nH";

export async function createClient() {
  const cookieStore = await cookies();

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const supabaseUrl = url.length > 0 ? url : DEFAULT_SUPABASE_URL;

  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  const supabaseAnonKey = key.length > 0 ? key : DEFAULT_SUPABASE_ANON_KEY;

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
