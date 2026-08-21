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
    label: "On Track",
    narrative: "You are on schedule for your target arrival date.",
    badgeStyle: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    bannerStyle: "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200",
    icon: CheckCircle2,
  },
  SAFE: {
    label: "Plan Protected",
    narrative: "Decision fully preserves your liquid reserves and target date.",
    badgeStyle: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    bannerStyle: "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200",
    icon: ShieldCheck,
  },
  MANAGEABLE: {
    label: "Pace Shift",
    narrative: "Affordable in cash, but creates a slight shift in your target date.",
    badgeStyle: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    bannerStyle: "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200",
    icon: AlertTriangle,
  },
  HIGH_IMPACT: {
    label: "Buffer Risk",
    narrative: "Lowers your emergency cushion below the safe 3-month threshold.",
    badgeStyle: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    bannerStyle: "bg-orange-500/10 border-orange-500/20 text-orange-800 dark:text-orange-200",
    icon: ShieldAlert,
  },
  AT_RISK: {
    label: "Timeline Shift",
    narrative: "Your current pace is falling behind the required monthly allocation.",
    badgeStyle: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    bannerStyle: "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200",
    icon: AlertTriangle,
  },
  OFF_TRACK: {
    label: "Goal Delay Risk",
    narrative: "Current trajectory will not reach target by target date without adjustments.",
    badgeStyle: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
    bannerStyle: "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-200",
    icon: AlertOctagon,
  },
  AHEAD: {
    label: "Ahead of Schedule",
    narrative: "Your savings pace is accelerating your goal arrival date.",
    badgeStyle: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
    bannerStyle: "bg-teal-500/10 border-teal-500/20 text-teal-800 dark:text-teal-200",
    icon: TrendingUp,
  },
  COMPLETED: {
    label: "Target Achieved",
    narrative: "Goal milestone successfully achieved.",
    badgeStyle: "bg-primary/10 text-primary border-primary/20",
    bannerStyle: "bg-primary/10 border-primary/20 text-primary",
    icon: Sparkles,
  },
  OVERDUE: {
    label: "Action Needed",
    narrative: "Target date reached with remaining shortfall.",
    badgeStyle: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
    bannerStyle: "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-200",
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
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
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
          "flex items-center gap-3 p-3.5 rounded-xl border text-xs font-medium",
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
          "p-4 rounded-xl border flex flex-col justify-between gap-2",
          config.bannerStyle,
          className
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider">
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
