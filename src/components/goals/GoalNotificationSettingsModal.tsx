"use client";

import React, { useState } from "react";
import { GoalNotificationSetting, NotificationFrequency } from "@/lib/types/goal-notifications";
import { updateGoalNotificationSetting } from "@/lib/goals/goal-notification-service";
import {
  Bell,
  X,
  Check,
  Clock,
  Send,
  Sliders,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface GoalNotificationSettingsModalProps {
  goalId?: string;
  goalTitle?: string;
  targetDate?: string;
  onClose: () => void;
  onSaved?: () => void;
}

export function GoalNotificationSettingsModal({
  goalId = "dest-1",
  goalTitle = "Start my business",
  targetDate = "2027-12-31",
  onClose,
  onSaved,
}: GoalNotificationSettingsModalProps) {
  const [leadTimeDays, setLeadTimeDays] = useState<number>(30); // 30 days = 1 month
  const [frequency, setFrequency] = useState<NotificationFrequency>("WEEKLY");
  const [notifyApp, setNotifyApp] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateGoalNotificationSetting(goalId, {
      goal_title: goalTitle,
      target_date: targetDate,
      lead_time_days: leadTimeDays,
      frequency,
      notify_via_app: notifyApp,
      notify_via_whatsapp: notifyWhatsApp,
    });

    setIsSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => {
      onClose();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full rounded-3xl border border-border/80 bg-card p-6 space-y-5 shadow-2xl my-auto font-sans">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Bell className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-foreground">Configure Proactive Alerts</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSaved ? (
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn py-8">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Alert lead time saved! You will receive countdown digests {leadTimeDays} days before target date.</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground block">Target Goal</span>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 text-xs font-semibold text-foreground">
                {goalTitle} • Target: {targetDate}
              </div>
            </div>

            {/* Lead Time Days Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Alert Lead Time Trigger (When to start sending weekly alerts)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: 30, label: "30 Days (1 Mo)" },
                  { days: 14, label: "14 Days (2 Wks)" },
                  { days: 7, label: "7 Days (1 Wk)" },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setLeadTimeDays(item.days)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      leadTimeDays === item.days
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-xs"
                        : "border-border/80 bg-secondary/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Digest Frequency */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Notification Digest Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as NotificationFrequency)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-secondary/50 text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="WEEKLY">Weekly Countdown Digest (Recommended)</option>
                <option value="DAILY">Daily Countdown Reminders</option>
                <option value="ON_TRIGGER">Only On Threshold Breach</option>
              </select>
            </div>

            {/* Delivery Channels */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-foreground block">Dispatch Channels</label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-secondary/30 text-xs font-medium cursor-pointer">
                  <span className="text-foreground">In-App Countdown Banners &amp; Insights Hub</span>
                  <input
                    type="checkbox"
                    checked={notifyApp}
                    onChange={(e) => setNotifyApp(e.target.checked)}
                    className="rounded border-border text-amber-500 focus:ring-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-secondary/30 text-xs font-medium cursor-pointer">
                  <span className="text-foreground">WhatsApp Countdown Digest (Weekly)</span>
                  <input
                    type="checkbox"
                    checked={notifyWhatsApp}
                    onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                    className="rounded border-border text-amber-500 focus:ring-amber-500"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-border bg-secondary/50 text-xs font-semibold text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white shadow-xs"
              >
                Save Alert Settings
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
