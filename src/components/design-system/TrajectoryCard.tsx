import React from "react";
import { formatMonthYear } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils/currency";
import { FinancialStatus, TrajectoryState } from "./FinancialStatus";
import { cn } from "@/lib/utils/cn";
import { TrendingUp, Calendar, Clock, ArrowRight } from "lucide-react";

export interface TrajectoryCardProps {
  goalTitle: string;
  originalTargetDate: string;
  projectedDate: string;
  delayMonths: number;
  trajectoryState: TrajectoryState;
  additionalMonthlyRequired?: number;
  currency?: string;
  className?: string;
}

export function TrajectoryCard({
  goalTitle,
  originalTargetDate,
  projectedDate,
  delayMonths,
  trajectoryState,
  additionalMonthlyRequired = 0,
  currency = "KES",
  className,
}: TrajectoryCardProps) {
  const isDelayed = delayMonths > 0;

  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-elevation-1 space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-secondary text-primary">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Trajectory Forecast
          </span>
        </div>

        <FinancialStatus status={trajectoryState} variant="badge" />
      </div>

      <div>
        <h4 className="text-base font-editorial font-bold text-foreground">
          {goalTitle}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isDelayed
            ? `Your current pace shifts destination completion by ${delayMonths} month${delayMonths > 1 ? "s" : ""}.`
            : "Your current pace is aligned with your destination target."}
        </p>
      </div>

      {/* Timeline Shift Comparison */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="rounded-2xl border border-border bg-secondary/40 p-3">
          <span className="text-[11px] text-muted-foreground block">Original Target</span>
          <span className="text-sm font-bold font-financial text-foreground mt-0.5 block">
            {formatMonthYear(originalTargetDate)}
          </span>
        </div>

        <div
          className={cn(
            "rounded-2xl border p-3",
            isDelayed
              ? "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-300"
              : "border-border bg-secondary/40 text-foreground"
          )}
        >
          <span className="text-[11px] text-muted-foreground block">Projected Arrival</span>
          <span className="text-sm font-bold font-financial mt-0.5 block">
            {formatMonthYear(projectedDate)}
          </span>
        </div>
      </div>

      {/* Recovery pace callout */}
      {isDelayed && additionalMonthlyRequired > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-xs space-y-1">
          <div className="font-bold text-primary font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Trajectory Recovery Pace</span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            To preserve the original {formatMonthYear(originalTargetDate)} target, add{" "}
            <strong className="text-foreground font-financial">
              +{formatCurrency(additionalMonthlyRequired, currency as any)}/mo
            </strong>{" "}
            to your monthly savings.
          </p>
        </div>
      )}
    </div>
  );
}
