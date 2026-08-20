"use client";

import React, { useTransition } from "react";
import { OnboardingState, OnboardingCalculatedPath } from "@/lib/onboarding/onboarding-types";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";
import { FinancialStatus } from "@/components/design-system/FinancialStatus";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Clock,
} from "lucide-react";

interface Step7TrajectoryRevealProps {
  state: OnboardingState;
  calculatedPath: OnboardingCalculatedPath;
  onFinish: () => void;
  onBack: () => void;
  onEditStep: (stepNumber: number) => void;
  isPending: boolean;
}

export function Step7TrajectoryReveal({
  state,
  calculatedPath,
  onFinish,
  onBack,
  onEditStep,
  isPending,
}: Step7TrajectoryRevealProps) {
  const { currency, destination } = state;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
          <Compass className="w-3.5 h-3.5" />
          <span>Step 7: Deterministic Trajectory Blueprint</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight leading-tight">
          Here&apos;s where you are.
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Useaimly has combined your income velocity, living commitments, and savings reserves to build your deterministic arrival path.
        </p>
      </div>

      {/* Primary Hero Trajectory Reveal Card */}
      <div className="relative rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-elevation-1 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Destination Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Anchor Destination
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-editorial text-foreground">
                {destination.title || "Primary Financial Goal"}
              </h3>
            </div>

            <FinancialStatus status={calculatedPath.trajectoryState} variant="badge" />
          </div>

          {/* Key 4 Highlights Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-border bg-background space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
                Target Capital
              </span>
              <div className="text-lg sm:text-xl font-bold font-financial text-foreground">
                {formatCurrency(destination.targetAmount, currency)}
              </div>
              <span className="text-[10px] text-muted-foreground block">
                Target: {formatMonthYear(destination.targetDate)}
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-background space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
                Current Assigned
              </span>
              <div className="text-lg sm:text-xl font-bold font-financial text-Useaimly-savings">
                {formatCurrency(calculatedPath.assignedGoalCapital, currency)}
              </div>
              <span className="text-[10px] text-muted-foreground block">
                Shortfall: {formatCurrency(calculatedPath.remainingShortfall, currency)}
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-background space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
                Required Monthly
              </span>
              <div className="text-lg sm:text-xl font-bold font-financial text-primary">
                {formatCurrency(calculatedPath.requiredMonthlySavings, currency)}/mo
              </div>
              <span className="text-[10px] text-muted-foreground block">
                To reach by target date
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-background space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
                Projected Arrival
              </span>
              <div className="text-lg sm:text-xl font-bold font-financial text-foreground">
                {calculatedPath.projectedCompletionDate.includes("does not")
                  ? "At Risk"
                  : formatMonthYear(calculatedPath.projectedCompletionDate)}
              </div>
              <span className="text-[10px] text-muted-foreground block">
                {calculatedPath.projectedMonthsToCompletion} months at current pace
              </span>
            </div>
          </div>

          {/* Financial Reality Ledger Breakdown */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-5 space-y-4">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Monthly Cash Flow Calculation Ledger
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="border-l-2 border-primary pl-2.5">
                <div className="text-muted-foreground text-[11px]">Monthly Gross Inflows</div>
                <div className="font-bold font-financial text-foreground text-sm">
                  +{formatCurrency(calculatedPath.monthlyGrossIncome, currency)}
                </div>
              </div>

              <div className="border-l-2 border-Useaimly-expense pl-2.5">
                <div className="text-muted-foreground text-[11px]">Living Outflows</div>
                <div className="font-bold font-financial text-Useaimly-expense text-sm">
                  -{formatCurrency(calculatedPath.monthlyEssentialExpenses, currency)}
                </div>
              </div>

              <div className="border-l-2 border-Useaimly-debt pl-2.5">
                <div className="text-muted-foreground text-[11px]">Debt Payments</div>
                <div className="font-bold font-financial text-Useaimly-debt text-sm">
                  -{formatCurrency(calculatedPath.monthlyDebtPayments, currency)}
                </div>
              </div>

              <div className="border-l-2 border-amber-500 pl-2.5">
                <div className="text-muted-foreground text-[11px]">Commitments</div>
                <div className="font-bold font-financial text-amber-600 dark:text-amber-400 text-sm">
                  -{formatCurrency(calculatedPath.monthlyCommitmentsAmortized, currency)}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 border-l-2 border-teal-500 pl-2.5 bg-card/60 p-1.5 rounded-r-xl">
                <div className="text-muted-foreground text-[11px] font-bold">Free Cash Flow</div>
                <div className="font-bold font-financial text-teal-600 dark:text-teal-400 text-sm">
                  {formatCurrency(calculatedPath.monthlyFreeCashFlow, currency)}/mo
                </div>
              </div>
            </div>
          </div>

          {/* Narrative Verdict Banner */}
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-1.5 text-xs text-foreground leading-relaxed">
            {calculatedPath.trajectoryState === "ON_TRACK" || calculatedPath.trajectoryState === "AHEAD" ? (
              <p>
                <strong className="text-primary font-bold">You are on track.</strong> Your monthly free cash flow of{" "}
                <span className="font-financial font-bold">{formatCurrency(calculatedPath.monthlyFreeCashFlow, currency)}/mo</span>{" "}
                covers the required pace of{" "}
                <span className="font-financial font-bold">{formatCurrency(calculatedPath.requiredMonthlySavings, currency)}/mo</span>.
                You are on schedule to arrive at{" "}
                <strong>{destination.title}</strong> by{" "}
                <strong>{formatMonthYear(calculatedPath.projectedCompletionDate)}</strong>.
              </p>
            ) : (
              <p>
                <strong className="text-amber-600 dark:text-amber-400 font-bold">Pace Adjustment Required.</strong> Your current free cash flow of{" "}
                <span className="font-financial font-bold">{formatCurrency(calculatedPath.monthlyFreeCashFlow, currency)}/mo</span>{" "}
                is below the required{" "}
                <span className="font-financial font-bold">{formatCurrency(calculatedPath.requiredMonthlySavings, currency)}/mo</span>.
                Useaimly will help you simulate decisions to recover timeline velocity.
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Edit Information</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={onFinish}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] px-8 py-4 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Trajectory & Launching Useaimly...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save Trajectory & Enter Useaimly</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
