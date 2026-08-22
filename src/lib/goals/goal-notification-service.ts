import { createClient } from "@/lib/supabase/client";
import { GoalNotificationSetting, GoalCountdownDigest } from "@/lib/types/goal-notifications";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";

const STORAGE_KEY = "useaimly_goal_notification_settings";

export const DEFAULT_NOTIFICATION_SETTINGS: GoalNotificationSetting[] = [
  {
    id: "gns-1",
    goal_id: "dest-1",
    goal_title: "Start my business",
    target_date: "2027-12-31",
    lead_time_days: 30, // Notify 1 month before
    frequency: "WEEKLY",
    notify_via_app: true,
    notify_via_whatsapp: true,
  },
  {
    id: "gns-2",
    goal_id: "dest-2",
    goal_title: "Buy a home",
    target_date: "2027-06-30",
    lead_time_days: 60, // Notify 2 months before
    frequency: "WEEKLY",
    notify_via_app: true,
    notify_via_whatsapp: true,
  },
];

export async function fetchGoalNotificationSettings(): Promise<GoalNotificationSetting[]> {
  try {
    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();

    if (session?.session?.user) {
      const { data, error } = await supabase
        .from("goal_notification_settings")
        .select("*")
        .order("target_date", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as GoalNotificationSetting[];
      }
    }
  } catch (err) {
    console.warn("Supabase fetch failed for goal notification settings, using local fallback", err);
  }

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored notification settings", e);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATION_SETTINGS));
  }

  return DEFAULT_NOTIFICATION_SETTINGS;
}

export async function updateGoalNotificationSetting(
  goalId: string,
  updates: Partial<GoalNotificationSetting>
): Promise<GoalNotificationSetting> {
  const current = await fetchGoalNotificationSettings();
  const existing = current.find((s) => s.goal_id === goalId) || {
    id: `gns-${Date.now()}`,
    goal_id: goalId,
    goal_title: updates.goal_title || "Goal",
    target_date: updates.target_date || "2027-12-31",
    lead_time_days: 30,
    frequency: "WEEKLY",
    notify_via_app: true,
    notify_via_whatsapp: true,
  };

  const updated: GoalNotificationSetting = {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();

    if (session?.session?.user) {
      await supabase
        .from("goal_notification_settings")
        .upsert({
          id: updated.id,
          user_id: session.session.user.id,
          goal_id: updated.goal_id,
          goal_title: updated.goal_title,
          target_date: updated.target_date,
          lead_time_days: updated.lead_time_days,
          frequency: updated.frequency,
          notify_via_app: updated.notify_via_app,
          notify_via_whatsapp: updated.notify_via_whatsapp,
        });
    }
  } catch (err) {
    console.warn("Supabase update goal notification setting failed, using local storage", err);
  }

  const newList = [updated, ...current.filter((s) => s.goal_id !== goalId)];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  }

  return updated;
}

export function computeGoalCountdownDigest(
  goalTitle: string,
  targetDateStr: string,
  currentAmount: number,
  targetAmount: number,
  currency: CurrencyCode = "KES",
  leadTimeDays: number = 30
): GoalCountdownDigest {
  const targetDate = new Date(targetDateStr);
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));

  const progressPercent = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;
  const shortfallAmount = Math.max(0, targetAmount - currentAmount);
  const requiredMonthlyBoost = Math.round(shortfallAmount / monthsRemaining);

  const urgencyLevel: "NOTICE" | "WARNING" | "CRITICAL" =
    daysRemaining <= 14 || progressPercent < 40
      ? "CRITICAL"
      : daysRemaining <= 30 || progressPercent < 70
      ? "WARNING"
      : "NOTICE";

  const recommendedActions = [
    `Reallocate KES 5,000/month from discretionary spending to bridge the ${formatCurrency(shortfallAmount, currency)} gap.`,
    `Execute a micro-boost from MMF dividend yields to shave ${Math.min(30, daysRemaining)} days off the countdown.`,
    `Audit silent subscription leaks to unlock extra weekly liquidity.`,
  ];

  const formattedDigestMessage = `⏳ USEAIMLY COUNTDOWN ALERT: Only ${daysRemaining} days remaining for "${goalTitle}"!\n\n` +
    `• Target Date: ${targetDateStr}\n` +
    `• Progress: ${progressPercent}% (${formatCurrency(currentAmount, currency)} of ${formatCurrency(targetAmount, currency)})\n` +
    `• Remaining Gap: ${formatCurrency(shortfallAmount, currency)}\n` +
    `• Required Monthly Pace: ${formatCurrency(requiredMonthlyBoost, currency)}/mo\n\n` +
    `👉 Action Plan: Reallocate ${formatCurrency(requiredMonthlyBoost, currency)}/mo now to reach 100% on time!`;

  return {
    id: `gcd-${Date.now()}`,
    goalId: "dest-1",
    goalTitle,
    targetDate: targetDateStr,
    daysRemaining,
    monthsRemaining,
    currentAmount,
    targetAmount,
    progressPercent,
    shortfallAmount,
    requiredMonthlyBoost,
    urgencyLevel,
    recommendedActions,
    formattedDigestMessage,
  };
}
