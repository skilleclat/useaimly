export type NotificationFrequency = "WEEKLY" | "DAILY" | "ON_TRIGGER";

export interface GoalNotificationSetting {
  id: string;
  user_id?: string;
  goal_id: string;
  goal_title: string;
  target_date: string;
  lead_time_days: number; // e.g. 30 (1 month), 14 (2 weeks), 7 (1 week)
  frequency: NotificationFrequency;
  notify_via_app: boolean;
  notify_via_whatsapp: boolean;
  last_notified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GoalCountdownDigest {
  id: string;
  goalId: string;
  goalTitle: string;
  targetDate: string;
  daysRemaining: number;
  monthsRemaining: number;
  currentAmount: number;
  targetAmount: number;
  progressPercent: number;
  shortfallAmount: number;
  requiredMonthlyBoost: number;
  urgencyLevel: "NOTICE" | "WARNING" | "CRITICAL";
  recommendedActions: string[];
  formattedDigestMessage: string;
}
