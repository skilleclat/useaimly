import React from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";
import { MoneyAmount } from "./MoneyAmount";
import { FinancialStatus, TrajectoryState } from "./FinancialStatus";
import { cn } from "@/lib/utils/cn";
import { Sparkles, ShieldCheck, AlertTriangle, ArrowUpRight, Clock } from "lucide-react";

export interface DecisionImpactCardProps {
  decisionTitle: string;
  decisionAmount: number;
  currency?: string;
  cashAffordable: boolean;
  liquidCashBefore: number;
  liquidCashAfter: number;
  goalTitle: string;
  targetDate: string;
  delayMonths: number;
  recoveryMonthlyAmount?: number;
  className?: string;
}

export function DecisionImpactCard({
  decisionTitle,
  decisionAmount,
  currency = "KES",
  cashAffordable,
  liquidCashBefore,
  liquidCashAfter,
  goalTitle,
  targetDate,
  delayMonths,
  recoveryMonthlyAmount = 0,
  className,
}: DecisionImpactCardProps) {
  const trajectoryState: TrajectoryState = !cashAffordable
    ? "OFF_TRACK"
    : delayMonths > 4
    ? "OFF_TRACK"
    : delayMonths > 0
    ? "AT_RISK"
    : "ON_TRACK";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-6 text-card-foreground shadow-xs space-y-5",
        className
      )}
    >
      {/* LEVEL 1: CONTEXT */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
        <div>
          <span className="text-xs text-muted-foreground font-medium block">
            Decision Simulation
          </span>
          <h3 className="text-lg font-bold text-foreground">
            {decisionTitle}
          </h3>
        </div>

        <MoneyAmount amount={decisionAmount} currency={currency as any} size="lg" intent="expense" showSign />
      </div>

      {/* LEVEL 2: PRIMARY INSIGHT (HERO CONFLICT/VERDICT) */}
      <div className={cn(
        "rounded-xl p-4 space-y-1.5 border transition-all",
        delayMonths > 0 
          ? "bg-amber-500/5 border-amber-500/20 text-amber-900 dark:text-amber-200" 
          : "bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
      )}>
        <div className="text-xs font-semibold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Primary Goal Consequence</span>
        </div>
        <div className="text-xl font-extrabold tracking-tight">
          {delayMonths > 0 
            ? `+${delayMonths} Month${delayMonths > 1 ? "s" : ""} Delay on "${goalTitle}"`
            : `"${goalTitle}" Goal Remains On Schedule`
          }
        </div>
        <p className="text-xs opacity-90 leading-relaxed font-normal">
          {delayMonths > 0
            ? `Paying ${formatCurrency(decisionAmount, currency as any)} today reduces your monthly trajectory contribution, shifting target arrival.`
            : `Your current liquid reserves absorb this purchase without delaying your life goal.`
          }
        </p>
      </div>

      {/* LEVEL 4: EVIDENCE (CASH VS PLAN DISTINCTION) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Cash Perspective */}
        <div className="rounded-xl border border-border/70 bg-secondary/30 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Cash Affordability</span>
            {cashAffordable ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Covered
              </span>
            ) : (
              <span className="text-destructive font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Shortfall
              </span>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <span>Reserves: </span>
            <strong className="text-foreground font-semibold">
              {formatCurrency(liquidCashBefore, currency as any)}
            </strong>{" "}
            →{" "}
            <strong
              className={cn(
                "font-bold",
                cashAffordable ? "text-foreground" : "text-destructive"
              )}
            >
              {formatCurrency(liquidCashAfter, currency as any)}
            </strong>
          </div>
        </div>

        {/* Plan Perspective */}
        <div className="rounded-xl border border-border/70 bg-secondary/30 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Plan Impact</span>
            <FinancialStatus status={trajectoryState} variant="badge" />
          </div>

          <div className="text-xs text-muted-foreground">
            {delayMonths > 0 ? (
              <span>Target shifted past <strong>{formatMonthYear(targetDate)}</strong></span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">On track for {formatMonthYear(targetDate)}</span>
            )}
          </div>
        </div>
      </div>

      {/* LEVEL 5: ACTION / RECOVERY OPTION */}
      {delayMonths > 0 && recoveryMonthlyAmount > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs flex items-center justify-between">
          <span className="text-muted-foreground font-medium">To stay on track for {formatMonthYear(targetDate)}:</span>
          <span className="font-bold text-primary flex items-center gap-1">
            +{formatCurrency(recoveryMonthlyAmount, currency as any)} / mo
          </span>
        </div>
      )}
    </div>
  );
}

