import { PlanTier } from "@/lib/types/pricing";
import { SOLE_OWNER_EMAIL } from "@/lib/auth/admin-check";

/**
 * Single source of truth for Feature Gating & Subscription Permissions
 */
export function isUserEliteOrOwner(tier?: PlanTier | string | null, email?: string | null): boolean {
  if (email && email.trim().toLowerCase() === SOLE_OWNER_EMAIL.toLowerCase()) return true;
  return tier === "premium";
}

export function isUserProOrHigher(tier?: PlanTier | string | null, email?: string | null): boolean {
  if (email && email.trim().toLowerCase() === SOLE_OWNER_EMAIL.toLowerCase()) return true;
  return tier === "pro" || tier === "premium";
}

/**
 * 1. Financial Destinations / Goals Limits
 * - Free: Max 1 Goal
 * - Pro & Premium: Unlimited Goals
 */
export function canAccessMultipleGoals(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserProOrHigher(tier, email);
}

export function getMaxGoalsAllowed(tier?: PlanTier | string | null, email?: string | null): number {
  if (isUserProOrHigher(tier, email)) return 9999;
  return 1;
}

/**
 * 2. 3-Strategy Decision Studio (Spread / Postpone)
 * - Free: Cash Only (1 strategy)
 * - Pro & Premium: 3 Strategies (Cash, Spread 3-mo, Postpone)
 */
export function canAccessAllDecisionStrategies(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserProOrHigher(tier, email);
}

/**
 * 3. Proactive Insights Engine (6 Foresight Rules)
 * - Free: Basic Cash Buffer only
 * - Pro & Premium: 6 Proactive Rules
 */
export function canAccessProactiveInsights(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserProOrHigher(tier, email);
}

/**
 * 4. AI Strategic Notepad & Rules Engine
 * - Free: Read-only preview
 * - Pro & Premium: Full custom constraint rules & synchronization
 */
export function canAccessAiNotes(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserProOrHigher(tier, email);
}

/**
 * 5. Data Export (CSV & Trajectory Reports)
 * - Free: Locked
 * - Pro & Premium: Unlocked
 */
export function canAccessDataExport(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserProOrHigher(tier, email);
}

/**
 * 6. "What-If" Scenario Simulation Laboratory
 * - Free & Pro: Locked (Preview only)
 * - Premium / Elite: Full sandbox with unlimited hypotheses
 */
export function canAccessWhatIfLab(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserEliteOrOwner(tier, email);
}

/**
 * 7. Dedicated AI Financial Advisor / Chat (Gemini / GPT-4)
 * - Free & Pro: Locked
 * - Premium / Elite: Unlimited interactive AI consultation
 */
export function canAccessAiAdvisor(tier?: PlanTier | string | null, email?: string | null): boolean {
  return isUserEliteOrOwner(tier, email);
}
