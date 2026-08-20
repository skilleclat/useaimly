import React from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";
import { MoneyAmount } from "./MoneyAmount";
import { FinancialStatus, TrajectoryState } from "./FinancialStatus";
import { cn } from "@/lib/utils/cn";
import { Zap, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

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
        "rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-elevation-1 space-y-5",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
              Decision Simulation Impact
            </span>
            <h3 className="text-base font-bold font-editorial text-foreground">
              {decisionTitle}
            </h3>
          </div>
        </div>

        <MoneyAmount amount={decisionAmount} currency={currency as any} size="lg" intent="expense" showSign />
      </div>

      {/* Distinction Matrix: Cash Affordability vs Plan Affordability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Cash Perspective */}
        <div className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Cash Today</span>
            {cashAffordable ? (
              <span className="text-primary font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Affordable
              </span>
            ) : (
              <span className="text-destructive font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Shortfall
              </span>
            )}
          </div>

          <div className="text-xs text-muted-foreground pt-1">
            <span>Liquid Cash: </span>
            <strong className="text-foreground font-financial font-medium">
              {formatCurrency(liquidCashBefore, currency as any)}
            </strong>{" "}
            →{" "}
            <strong
              className={cn(
                "font-financial font-bold",
                cashAffordable ? "text-foreground" : "text-destructive"
              )}
            >
              {formatCurrency(liquidCashAfter, currency as any)}
            </strong>
          </div>
        </div>

        {/* Plan Perspective */}
        <div className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Plan for &ldquo;{goalTitle}&rdquo;</span>
            <FinancialStatus status={trajectoryState} variant="badge" />
          </div>

          <div className="text-xs text-muted-foreground pt-1">
            {delayMonths > 0 ? (
              <span>
                Timeline Shift:{" "}
                <strong className="text-amber-600 dark:text-amber-300 font-financial font-bold">
                  +{delayMonths} month{delayMonths > 1 ? "s" : ""} delay
                </strong>
              </span>
            ) : (
              <span className="text-primary font-semibold">
                No shift in goal timeline
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recovery requirement summary */}
      {delayMonths > 0 && recoveryMonthlyAmount > 0 && (
        <div className="rounded-2xl border border-border bg-card p-3.5 text-xs flex items-center justify-between">
          <span className="text-muted-foreground">To maintain {formatMonthYear(targetDate)}:</span>
          <span className="font-financial font-bold text-primary">
            +{formatCurrency(recoveryMonthlyAmount, currency as any)} / month
          </span>
        </div>
      )}
    </div>
  );
}
