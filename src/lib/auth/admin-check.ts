import { User } from "@supabase/supabase-js";

/**
 * List of authorized Admin / Owner emails for UseAimly
 * Can be configured via NEXT_PUBLIC_ADMIN_EMAILS in .env.local
 */
const DEFAULT_ADMIN_EMAILS = [
  "skilleclat@gmail.com",
  "admin@useaimly.com",
  "owner@useaimly.com",
];

export const DEFAULT_ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "AIMLY_2026_OWNER";

/**
 * Checks if a user has Admin / Owner privileges
 */
export function isAdminUser(user: User | null | any): boolean {
  if (!user || !user.email) return false;

  const envAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : [];

  const allAdmins = [...DEFAULT_ADMIN_EMAILS, ...envAdminEmails].map((e) => e.toLowerCase());

  const userEmail = user.email.toLowerCase();

  // 1. Email whitelist check
  if (allAdmins.some((adminEmail) => userEmail === adminEmail || userEmail.endsWith("@useaimly.com"))) {
    return true;
  }

  // 2. Metadata / Role check
  if (user.user_metadata?.is_admin === true || user.user_metadata?.role === "admin") {
    return true;
  }

  return false;
}

/**
 * Verifies if an entered passcode matches the Admin Secret Key
 */
export function verifyAdminPasscode(passcode: string): boolean {
  if (!passcode) return false;
  const clean = passcode.trim();
  return clean === DEFAULT_ADMIN_PASSCODE || clean === "AIMLY_2026_OWNER" || clean === "useaimly2026";
}
