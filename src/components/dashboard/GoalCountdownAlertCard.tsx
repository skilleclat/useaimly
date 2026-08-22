"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { GoalCountdownDigest } from "@/lib/types/goal-notifications";
import { computeGoalCountdownDigest } from "@/lib/goals/goal-notification-service";
import {
  Clock,
  Sparkles,
  AlertTriangle,
  Send,
  CheckCircle2,
  Bell,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Flame,
} from "lucide-react";

interface GoalCountdownAlertCardProps {
  goalTitle?: string;
  targetDateStr?: string;
  currentAmount?: number;
  targetAmount?: number;
  currency?: CurrencyCode;
  onOpenSettings?: () => void;
}

export function GoalCountdownAlertCard({
  goalTitle = "Start my business",
  targetDateStr = "2027-12-31",
  currentAmount = 260000,
  targetAmount = 500000,
  currency = "KES",
  onOpenSettings,
}: GoalCountdownAlertCardProps) {
  const [copied, setCopied] = useState(false);
  const digest: GoalCountdownDigest = computeGoalCountdownDigest(
    goalTitle,
    targetDateStr,
    currentAmount,
    targetAmount,
    currency,
    30
  );

  const urgencyBadge =
    digest.urgencyLevel === "CRITICAL"
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
      : digest.urgencyLevel === "WARNING"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";

  function handleShareWhatsApp() {
    const text = encodeURIComponent(digest.formattedDigestMessage);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function handleCopyDigest() {
    navigator.clipboard.writeText(digest.formattedDigestMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-card p-6 sm:p-8 space-y-6 shadow-sm font-sans animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-extrabold text-foreground tracking-tight">
              Goal Countdown &amp; Proactive Alert Digest
            </h3>
            <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-primary/20 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold px-2.5 py-0.5 border border-amber-500/30 uppercase tracking-wider">
              Weekly Digest Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Automated lead-time notification engine alerting you before goal target dates arrive.
          </p>
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="px-3.5 py-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/70 text-foreground text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-primary" />
            <span>Alert Lead Times</span>
          </button>
        )}
      </div>

      {/* Countdown Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-primary/10 to-card border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500 shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-foreground">{digest.goalTitle}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyBadge}`}>
                {digest.daysRemaining} Days Remaining
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Target Date: <strong>{digest.targetDate}</strong> • Progress: <strong>{digest.progressPercent}%</strong>
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 font-mono">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Shortfall Gap</span>
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {formatCurrency(digest.shortfallAmount, currency)}
          </span>
        </div>
      </div>

      {/* Recommended Pace & Micro-Actions */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Recommended Weekly Immunization Micro-Actions</span>
        </h4>

        <div className="space-y-2">
          {digest.recommendedActions.map((action, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-border/80 bg-secondary/30 text-xs text-foreground flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer (WhatsApp & Copy) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-border/60">
        <button
          onClick={handleShareWhatsApp}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Weekly Digest to WhatsApp</span>
        </button>

        <button
          onClick={handleCopyDigest}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/80 text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Digest Copied!</span>
            </>
          ) : (
            <span>Copy Digest Text</span>
          )}
        </button>
      </div>
    </div>
  );
}
