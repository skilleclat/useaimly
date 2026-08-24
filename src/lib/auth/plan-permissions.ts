import { PlanTier } from "@/lib/types/pricing";
import { SOLE_OWNER_EMAIL } from "@/lib/auth/admin-check";

/**
 * Single source of truth for Feature Gating & Subscription Permissions
 * Two-Tier Model: FREE vs PRO (with owner override)
 */
export function isUserProOrHigher(tier?: PlanTier | string | null, email?: string | null): boolean {
  if (email && email.trim().toLowerCase() === SOLE_OWNER_EMAIL.toLowerCase()) return true;
  return tier === "pro" || tier === "premium";
}

/**
 * 1. Financial Destinations / Goals Limits
 * - Free: Max 1 Goal
 * - Pro: Unlimited Goals
 */
export function canAccessMultipleGoals(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserProOrHigher(tier, email);
}

export function getMaxGoalsAllowed(tier?: PlanTier | string | null, email?: string | null): number {
  if (isUserProOrHigher(tier, email)) return 9999;
  return 1;
}

/**
 * 2. Decision Studio Strategy Comparison
 * - Free: Basic 1 strategy
 * - Pro: Full multi-scenario alternatives (Cash, Spread, Postpone, Budget Alternative)
 */
export function canAccessAllDecisionStrategies(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserProOrHigher(tier, email);
}

/**
 * 3. Proactive Insights Engine
 * - Free: Basic Cash Buffer alert
 * - Pro: 6 Proactive Decision Rules
 */
export function canAccessProactiveInsights(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserProOrHigher(tier, email);
}

/**
 * 4. Strategic Rules & Decision Notes
 * - Free: Read-only preview
 * - Pro: Full custom constraint rules & synchronization
 */
export function canAccessAiNotes(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserProOrHigher(tier, email);
}

/**
 * 5. Data Export (CSV & PDF Reports)
 * - Free: Basic
 * - Pro: Full custom executive exports
 */
export function canAccessDataExport(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserProOrHigher(tier, email);
}

/**
 * 6. "What-If" Scenario Laboratory Sandbox
 * - Free: Preview
 * - Pro: Full sandbox with unlimited hypotheses
 */
export function canAccessWhatIfLab(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserProOrHigher(tier, email);
}

/**
 * 7. Ask Aimly Decision Strategy Consultations
 * - Free: Gated after initial trials
 * - Pro: Unlimited decision intelligence consultation
 */
export function canAccessAiAdvisor(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserProOrHigher(tier, email);
}
