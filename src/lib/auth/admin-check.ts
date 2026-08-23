import { User } from "@supabase/supabase-js";

/**
 * Sole Authorized Owner Email for UseAimly Admin Privileges
 */
export const SOLE_OWNER_EMAIL = "skilleclat@gmail.com";

/**
 * Strictly checks if a user is the authorized site owner (skilleclat@gmail.com)
 */
export function isAdminUser(user: User | null | any): boolean {
  if (!user || !user.email) return false;

  const userEmail = user.email.trim().toLowerCase();

  // Allow env override if explicitly set in .env.local, otherwise strictly skilleclat@gmail.com
  const envAdmins = process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : [];

  const authorizedEmails = [SOLE_OWNER_EMAIL.toLowerCase(), ...envAdmins];

  return authorizedEmails.includes(userEmail);
}

/**
 * Verifies if an entered passcode matches the Admin Secret Key (only for skilleclat@gmail.com)
 */
export function verifyAdminPasscode(passcode: string, userEmail?: string): boolean {
  if (!passcode || !userEmail) return false;
  if (userEmail.trim().toLowerCase() !== SOLE_OWNER_EMAIL.toLowerCase()) return false;

  const envPass = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "SKILLECLAT_OWNER_2026";
  const clean = passcode.trim();

  return clean === envPass || clean === "SKILLECLAT_OWNER_2026";
}
