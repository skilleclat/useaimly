"use client";

import React, { useTransition } from "react";
import { OnboardingState, OnboardingCalculatedPath } from "@/lib/onboarding/onboarding-types";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";
import { FinancialStatus } from "@/components/design-system/FinancialStatus";
import { PdfReportDownloadButton } from "@/components/finance/PdfReportDownloadButton";
import { WhatsAppDispatchCard } from "@/components/finance/WhatsAppDispatchCard";
import { PDFReportData } from "@/lib/utils/pdf-report-generator";
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

import { generateSeniorStrategistAssessment } from "@/lib/ai/senior-strategist-engine";

import { useI18n } from "@/lib/i18n/i18n-context";

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
  const { language } = useI18n();
  const { currency, destination } = state;

  const monthlyOutflow = calculatedPath.monthlyEssentialExpenses + calculatedPath.monthlyDebtPayments + calculatedPath.monthlyCommitmentsAmortized;

  const strategistOutput = generateSeniorStrategistAssessment({
    language,
    currency,
    monthlyInflow: calculatedPath.monthlyGrossIncome,
    monthlyOutflow,
    monthlyFreeCashFlow: calculatedPath.monthlyFreeCashFlow,
    totalLiquidSavings: calculatedPath.totalLiquidSavings,
    targetAmount: destination.targetAmount,
    targetDate: destination.targetDate,
    destinationTitle: destination.title || (language === "fr" ? "Objectif Principal" : "Primary Goal"),
    projectedDate: formatMonthYear(calculatedPath.projectedCompletionDate),
    delayInDays: calculatedPath.monthlyFreeCashFlow <= 0 ? 0 : Math.max(0, (calculatedPath.projectedMonthsToCompletion - 24) * 30),
    requiredMonthlySavings: calculatedPath.requiredMonthlySavings,
  });

  const pdfData: PDFReportData = {
    language,
    destinationTitle: destination.title || (language === "fr" ? "Objectif Principal" : "Primary Goal"),
    targetAmount: destination.targetAmount,
    currentAmount: destination.currentAmount,
    targetDate: formatMonthYear(destination.targetDate),
    projectedDate: formatMonthYear(calculatedPath.projectedCompletionDate),
    delayInDays: calculatedPath.monthlyFreeCashFlow <= 0 ? 0 : Math.max(0, (calculatedPath.projectedMonthsToCompletion - 24) * 30),
    currency,
    monthlyInflow: calculatedPath.monthlyGrossIncome,
    monthlyOutflow,
    availableForGoals: calculatedPath.monthlyFreeCashFlow,
    liquidSavings: calculatedPath.totalLiquidSavings,
    status: strategistOutput.archetype === "DEFICIT_BURN_RATE" ? "OFF_TRACK" : calculatedPath.trajectoryState === "ON_TRACK" || calculatedPath.trajectoryState === "AHEAD" ? "SAFE" : "HIGH_IMPACT",
    headlineVerdict: strategistOutput.headlineVerdict,
    whatYouCanDo: strategistOutput.whatYouCanDo,
    whatItChanges: strategistOutput.whatItChanges,
    toStayOnTrack: strategistOutput.toStayOnTrack,
    strategicRead: strategistOutput.strategicRead,
    masterStrategyParagraph: strategistOutput.masterStrategyParagraph,
    burnRateRunwayMonths: strategistOutput.burnRateRunwayMonths,
  };


  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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

        {/* PDF Executive Download Button */}
        <div className="shrink-0 flex justify-center sm:justify-end">
          <PdfReportDownloadButton data={pdfData} variant="primary" />
        </div>
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

              <div className="border-l-2 border-amber-500 pl-2.5">
                <div className="text-muted-foreground text-[11px]">Living Expenses</div>
                <div className="font-bold font-financial text-foreground text-sm">
                  -{formatCurrency(calculatedPath.monthlyEssentialExpenses, currency)}
                </div>
              </div>

              <div className="border-l-2 border-rose-500 pl-2.5">
                <div className="text-muted-foreground text-[11px]">Debt Repayments</div>
                <div className="font-bold font-financial text-foreground text-sm">
                  -{formatCurrency(calculatedPath.monthlyDebtPayments, currency)}
                </div>
              </div>

              <div className="border-l-2 border-teal-500 pl-2.5">
                <div className="text-muted-foreground text-[11px]">Free Cash Flow</div>
                <div className="font-bold font-financial text-primary text-sm">
                  {formatCurrency(calculatedPath.monthlyFreeCashFlow, currency)}
                </div>
              </div>

              <div className="border-l-2 border-blue-500 pl-2.5 col-span-2 sm:col-span-1">
                <div className="text-muted-foreground text-[11px]">Liquid Cash Cushion</div>
                <div className="font-bold font-financial text-foreground text-sm">
                  {formatCurrency(calculatedPath.totalLiquidSavings, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Senior Wealth Strategist Master Assessment & Tactical Action Plan */}
          <div className="space-y-4">
            {/* 4 Tactical Action Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
                  01 • Immediate Liquidity Action
                </span>
                <p className="text-foreground/90 font-medium">
                  {strategistOutput.whatYouCanDo}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
                  02 • Time &amp; Trajectory Shift
                </span>
                <p className="text-foreground/90 font-medium">
                  {strategistOutput.whatItChanges}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-primary">
                  03 • Recommended Catch-up Plan
                </span>
                <p className="text-foreground/90 font-medium">
                  {strategistOutput.toStayOnTrack}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
                  04 • Strategic Resilience Read
                </span>
                <p className="text-foreground/90 font-medium">
                  {strategistOutput.strategicRead}
                </p>
              </div>
            </div>

            {/* The Master Wealth Strategist Executive Blueprint */}
            <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-7 space-y-3 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
                <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Senior Wealth Strategist Master Assessment</span>
                </div>
                <span className="rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-wider">
                  30-Year Private Wealth Advisory Caliber
                </span>
              </div>

              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans font-normal text-justify">
                {strategistOutput.masterStrategyParagraph}
              </p>
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

    {/* WHATSAPP PRO DISPATCH INTELLIGENCE CARD */}
    <WhatsAppDispatchCard
      destinationTitle={destination.title}
      targetDate={formatMonthYear(destination.targetDate)}
      projectedDate={formatMonthYear(calculatedPath.projectedCompletionDate)}
      delayInDays={Math.max(0, (calculatedPath.projectedMonthsToCompletion - 24) * 30)}
      monthlyGoalCapacity={calculatedPath.monthlyFreeCashFlow}
      currency={currency}
    />
  </div>
  );
}
