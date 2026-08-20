import React from "react";
import { cn } from "@/lib/utils/cn";
import { CheckCircle2, AlertTriangle, AlertOctagon, TrendingUp, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";

export type TrajectoryState =
  | "ON_TRACK"
  | "AT_RISK"
  | "OFF_TRACK"
  | "AHEAD"
  | "SAFE"
  | "MANAGEABLE"
  | "HIGH_IMPACT"
  | "COMPLETED"
  | "OVERDUE";

export interface FinancialStatusProps {
  status: TrajectoryState | string;
  variant?: "badge" | "banner" | "card" | "inline";
  customMessage?: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    narrative: string;
    badgeStyle: string;
    bannerStyle: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  ON_TRACK: {
    label: "ON TRACK",
    narrative: "You're moving toward your destination.",
    badgeStyle: "bg-Useaimly-on-track-muted text-Useaimly-on-track-foreground border-Useaimly-on-track-border",
    bannerStyle: "bg-Useaimly-on-track-muted/50 border-Useaimly-on-track-border text-Useaimly-on-track-foreground",
    icon: CheckCircle2,
  },
  SAFE: {
    label: "SAFE",
    narrative: "Decision fully preserves your buffer and destination arrival.",
    badgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    bannerStyle: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    icon: ShieldCheck,
  },
  MANAGEABLE: {
    label: "MANAGEABLE",
    narrative: "Affordable with buffer, but introduces arrival delay.",
    badgeStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    bannerStyle: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    icon: AlertTriangle,
  },
  HIGH_IMPACT: {
    label: "HIGH IMPACT",
    narrative: "Significantly lowers your emergency reserves below recommended threshold.",
    badgeStyle: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    bannerStyle: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
    icon: ShieldAlert,
  },
  AT_RISK: {
    label: "AT RISK",
    narrative: "Your current path may delay your destination.",
    badgeStyle: "bg-Useaimly-at-risk-muted text-Useaimly-at-risk-foreground border-Useaimly-at-risk-border",
    bannerStyle: "bg-Useaimly-at-risk-muted/50 border-Useaimly-at-risk-border text-Useaimly-at-risk-foreground",
    icon: AlertTriangle,
  },
  OFF_TRACK: {
    label: "OFF TRACK",
    narrative: "Your current trajectory does not reach the target.",
    badgeStyle: "bg-Useaimly-off-track-muted text-Useaimly-off-track-foreground border-Useaimly-off-track-border",
    bannerStyle: "bg-Useaimly-off-track-muted/50 border-Useaimly-off-track-border text-Useaimly-off-track-foreground",
    icon: AlertOctagon,
  },
  AHEAD: {
    label: "AHEAD",
    narrative: "You're currently ahead of the required pace.",
    badgeStyle: "bg-Useaimly-ahead-muted text-Useaimly-ahead-foreground border-Useaimly-ahead-border",
    bannerStyle: "bg-Useaimly-ahead-muted/50 border-Useaimly-ahead-border text-Useaimly-ahead-foreground",
    icon: TrendingUp,
  },
  COMPLETED: {
    label: "COMPLETED",
    narrative: "Target capital milestone achieved.",
    badgeStyle: "bg-primary/10 text-primary border-primary/20",
    bannerStyle: "bg-primary/10 border-primary/20 text-primary",
    icon: Sparkles,
  },
  OVERDUE: {
    label: "OVERDUE",
    narrative: "Target date has passed with remaining shortfall.",
    badgeStyle: "bg-destructive/10 text-destructive border-destructive/20",
    bannerStyle: "bg-destructive/10 border-destructive/20 text-destructive",
    icon: AlertOctagon,
  },
};

export function FinancialStatus({
  status,
  variant = "badge",
  customMessage,
  className,
}: FinancialStatusProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ON_TRACK;
  const Icon = config.icon;

  if (variant === "badge") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border font-mono uppercase tracking-wider",
          config.badgeStyle,
          className
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-medium",
          config.bannerStyle,
          className
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span>{customMessage || config.narrative}</span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "p-4 rounded-2xl border flex flex-col justify-between gap-2",
          config.bannerStyle,
          className
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-mono uppercase tracking-wider">
            {config.label}
          </span>
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-xs opacity-90">{customMessage || config.narrative}</p>
      </div>
    );
  }

  // Inline variant
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <Icon className="w-3.5 h-3.5" />
      <span>{customMessage || config.label}</span>
    </span>
  );
}
