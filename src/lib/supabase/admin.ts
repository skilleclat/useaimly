import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const DEFAULT_SUPABASE_URL = "https://ozlkmamtmkoigweidnij.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_QtKMSP03_yvgm1ZXDfvZog_B6Ihi6nH";

/**
 * Creates a privileged Supabase client for Server Route Handlers and Webhooks.
 * Uses SUPABASE_SERVICE_ROLE_KEY if defined, falling back to anon key.
 */
export function createAdminClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim() || DEFAULT_SUPABASE_URL;
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim() || DEFAULT_SUPABASE_ANON_KEY;

  const keyToUse = serviceKey.length > 0 ? serviceKey : anonKey;

  return createSupabaseClient<Database>(url, keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
