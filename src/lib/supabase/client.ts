/**
 * Supabase Browser Client
 * Used exclusively in Client Components and custom hooks.
 */

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./database.types";

const DEFAULT_SUPABASE_URL = "https://ozlkmamtmkoigweidnij.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_QtKMSP03_yvgm1ZXDfvZog_B6Ihi6nH";

export function createClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const supabaseUrl = url.length > 0 ? url : DEFAULT_SUPABASE_URL;

  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  const supabaseAnonKey = key.length > 0 ? key : DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
