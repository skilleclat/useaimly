/**
 * Useaimly User & Preferences Types
 */

import { CurrencyCode } from "./finance";

export interface UserPreferences {
  theme: "dark" | "light" | "system";
  currency: CurrencyCode;
  locale: string;
  conservativeProjections: boolean; // default: true
  inflationRate: number; // default: 0.05 (5%)
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  planTier?: "free" | "pro" | "premium";
  planStatus?: "active" | "trial" | "canceled";
  createdAt: string;
}
