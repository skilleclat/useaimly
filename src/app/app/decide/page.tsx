"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import { simulateDecision, BaselineFinancialProfile } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { PdfReportDownloadButton } from "@/components/finance/PdfReportDownloadButton";
import { OpportunityCostMatrix } from "@/components/finance/OpportunityCostMatrix";
import { PDFReportData } from "@/lib/utils/pdf-report-generator";
import { canAccessAllDecisionStrategies } from "@/lib/auth/plan-permissions";
import { PlanUpgradeGate } from "@/components/finance/PlanUpgradeGate";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowLeft,
  Sliders,
  TrendingUp,
  DollarSign,
  Calendar,
  HelpCircle,
  Heart,
  Plus,
  Lock,
  X,
} from "lucide-react";

import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";

import { generateSeniorStrategistAssessment } from "@/lib/ai/senior-strategist-engine";

export default function DecideStudioPage() {
  const { user, profile } = useAuth();
  const { currency } = useCurrency();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "Can I spend 30,000 KES on a new phone?";

  // Decision Input States
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [activeScenarioType, setActiveScenarioType] = useState<
    "PURCHASE" | "RECURRING" | "INCOME" | "SAVINGS"
  >("PURCHASE");
  
  const [title, setTitle] = useState("Smartphone Purchase");
  const [amount, setAmount] = useState<number>(30000);
  const [isRecurring, setIsRecurring] = useState(false);

  const [selectedStrategy, setSelectedStrategy] = useState<"CASH" | "SPREAD" | "POSTPONE">("CASH");
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showUpgradeGateModal, setShowUpgradeGateModal] = useState(false);

  const hasStrategyAccess = canAccessAllDecisionStrategies(profile?.plan_tier, user?.email);

  // Parse natural language queries when user updates queryInput
  useEffect(() => {
    if (!queryInput.trim()) return;
    const parsed = parseDecisionQuery(queryInput, currency);
    if (parsed.isValid && parsed.extractedAmount > 0) {
      setTitle(parsed.extractedTitle);
      setAmount(parsed.extractedAmount);
      setIsRecurring(parsed.isRecurring);

      if (parsed.decisionType === "INCOME_CHANGE" || parsed.decisionType === "WINDFALL") {
        setActiveScenarioType("INCOME");
      } else if (parsed.isRecurring) {
        setActiveScenarioType("RECURRING");
      } else {
        setActiveScenarioType("PURCHASE");
      }
    }
  }, [queryInput, currency]);

  // Baseline Financial Reality
  const baselineProfile: BaselineFinancialProfile = useMemo(
    () => ({
      liquidSavings: 180000,
      incomes: [
        { name: "Primary Income", amount: 180000, frequency: "MONTHLY", reliability: "STABLE", isActive: true },
      ],
      expenses: [
        { name: "Essential Living", amount: 112000, frequency: "MONTHLY", isFixed: true },
      ],
      debts: [],
      commitments: [
        {
          title: "Comprehensive Motor Insurance",
          amount: 45000,
          frequency: "ANNUAL",
          nextDueDate: "2026-10-05",
          category: "INSURANCE",
        },
      ],
      goals: [
        {
          id: "primary-goal",
          title: "Start my business",
          targetAmount: 500000,
          currentAmount: 180000,
          targetDate: "2027-12-31",
          priority: "HIGH",
          status: "ACTIVE",
        },
      ],
    }),
    []
  );

  // Simulation Evaluation
  const simulation = useMemo(() => {
    return simulateDecision(baselineProfile, {
      decisionTitle: title,
      amount,
      isRecurring,
      recurringFrequency: isRecurring ? "MONTHLY" : undefined,
    });
  }, [baselineProfile, title, amount, isRecurring]);

  const primaryGoal = baselineProfile.goals[0];
  const goalTitle = primaryGoal?.title || "Start my business";

  // Senior Wealth Strategist Master Assessment
  const strategistOutput = useMemo(() => {
    return generateSeniorStrategistAssessment({
      currency,
      monthlyInflow: baselineProfile.incomes.reduce((acc, i) => acc + i.amount, 0),
      monthlyOutflow: baselineProfile.expenses.reduce((acc, e) => acc + e.amount, 0),
      monthlyFreeCashFlow: 68000,
      totalLiquidSavings: baselineProfile.liquidSavings,
      targetAmount: primaryGoal?.targetAmount || 500000,
      targetDate: primaryGoal?.targetDate || "2027-12-31",
      destinationTitle: goalTitle,
      projectedDate: simulation.delta.newCompletionDate,
      delayInDays: simulation.delta.delayInDays,
      requiredMonthlySavings: Math.round((primaryGoal?.targetAmount || 500000) / 24),
      decisionContext: {
        title,
        amount,
        isRecurring,
      },
    });
  }, [currency, baselineProfile, primaryGoal, goalTitle, simulation, title, amount, isRecurring]);

  // 3 Comparison Strategies
  const strategies = useMemo(() => {
    const cashRemaining = baselineProfile.liquidSavings - amount;
    const spreadMonthly = Math.round(amount / 3);

    return [
      {
        id: "CASH" as const,
        title: "Pay Cash Today",
        subtitle: "One-off Cash Buffer",
        metric: formatCurrency(Math.max(0, cashRemaining), currency),
        metricLabel: "Remaining Liquid Cash",
        delayText: `+${simulation.delta.delayInDays} days shift`,
        badge: "Immediate Outflow",
      },
      {
        id: "SPREAD" as const,
        title: "Spread over 3 Months",
        subtitle: "Monthly Cash Flow",
        metric: `${formatCurrency(spreadMonthly, currency)} / mo`,
        metricLabel: "Monthly Outflow",
        delayText: `+${Math.max(0, Math.round(simulation.delta.delayInDays * 0.7))} days shift`,
        badge: "Smooth Monthly Pace",
      },
      {
        id: "POSTPONE" as const,
        title: "Postpone 60 Days",
        subtitle: "Save in Advance",
        metric: formatCurrency(0, currency),
        metricLabel: "Immediate Cash Impact",
        delayText: "0 days shift",
        badge: "Zero Goal Delay",
      },
    ];
  }, [amount, currency, simulation, baselineProfile.liquidSavings]);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    const parsed = parseDecisionQuery(queryInput, currency);
    if (parsed.isValid && parsed.extractedAmount > 0) {
      setTitle(parsed.extractedTitle);
      setAmount(parsed.extractedAmount);
      setIsRecurring(parsed.isRecurring);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <Link
            href="/app"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <h1 className="text-2xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight">
            Decision Studio
          </h1>
          <p className="text-xs text-muted-foreground">
            Test any purchase, income change, or hypothetical scenario before you commit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/app/notes"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all"
            title="View Notepad Rules synced with AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Notepad AI Rules Synced</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isSaved
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-card border-border/80 text-foreground hover:border-primary/40"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-emerald-500 text-emerald-500" : ""}`} />
            <span>{isSaved ? "Decision Saved" : "Save Decision"}</span>
          </button>
        </div>
      </div>

      {/* Universal Scenario Input Card */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Scenario Type Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Scenario Type:
          </span>

          <button
            type="button"
            onClick={() => {
              setActiveScenarioType("PURCHASE");
              setIsRecurring(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeScenarioType === "PURCHASE"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            One-off Purchase
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveScenarioType("RECURRING");
              setIsRecurring(true);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeScenarioType === "RECURRING"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly Expense
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveScenarioType("INCOME");
              setIsRecurring(true);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeScenarioType === "INCOME"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Income Boost / Raise
          </button>
        </div>

        {/* Natural Language Query Bar */}
        <form onSubmit={handleQuerySubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 sm:relative shadow-xs">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="e.g. Can I spend 30,000 KES on a laptop?"
              className="w-full rounded-2xl border-2 border-border/80 bg-background px-4 sm:px-5 py-3.5 sm:py-4 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary transition-all sm:pr-32 font-medium"
            />
            <button
              type="submit"
              className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-2 sm:bottom-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 sm:py-0 text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer min-h-[44px] sm:min-h-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate</span>
            </button>
          </div>
        </form>

        {/* Fine-Tuning Amount Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50 text-xs">
          <div>
            <label className="text-muted-foreground font-semibold block mb-1">
              Decision Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground font-medium"
            />
          </div>

          <div>
            <label className="text-muted-foreground font-semibold block mb-1">
              Amount ({currency})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground font-medium font-mono"
            />
          </div>
        </div>
      </section>

      {/* RESULT HERO: THE ANSWER + TIME CONSEQUENCE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-editorial text-foreground">
              Simulation Trajectory Results
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Evaluated against baseline liquid reserves &amp; primary destination.
            </p>
          </div>
          <PdfReportDownloadButton
            data={{
              destinationTitle: title || "Decision Analysis",
              targetAmount: primaryGoal?.targetAmount || 500000,
              currentAmount: primaryGoal?.currentAmount || 180000,
              targetDate: primaryGoal?.targetDate || "2027-12-31",
              projectedDate: simulation.delta.newCompletionDate,
              delayInDays: simulation.delta.delayInDays,
              currency,
              monthlyInflow: baselineProfile.incomes.reduce((acc, i) => acc + i.amount, 0),
              monthlyOutflow: baselineProfile.expenses.reduce((acc, e) => acc + e.amount, 0),
              availableForGoals: 68000,
              liquidSavings: baselineProfile.liquidSavings,
              status: simulation.status,
              headlineVerdict: strategistOutput.headlineVerdict,
              whatYouCanDo: strategistOutput.whatYouCanDo,
              whatItChanges: strategistOutput.whatItChanges,
              toStayOnTrack: strategistOutput.toStayOnTrack,
              strategicRead: strategistOutput.strategicRead,
              masterStrategyParagraph: strategistOutput.masterStrategyParagraph,
              burnRateRunwayMonths: strategistOutput.burnRateRunwayMonths,
            }}
            variant="secondary"
            label="Export Decision PDF Dossier"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Verdict Card */}
          <div className="md:col-span-5 rounded-3xl border border-border/80 bg-card p-6 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                1. Decision Verdict
              </span>

              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>{simulation.headlineVerdict || "Yes. Fully Affordable."}</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">
                {title}
              </h3>
              <p className="text-sm font-semibold text-muted-foreground">
                {formatCurrency(amount, currency)} {isRecurring ? "/ month" : "one-off"}
              </p>
            </div>
          </div>

          {/* Time Impact Hero */}
          <div className="md:col-span-7 rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                2. Future Trajectory Impact
              </span>
              <Clock className="w-5 h-5 text-primary" />
            </div>

            <div>
              <div className="text-4xl sm:text-6xl font-bold font-editorial text-foreground tracking-tight">
                +{simulation.delta.delayInDays} days
              </div>
              <p className="text-sm text-foreground/80 mt-1">
                Your destination <span className="font-bold text-foreground">&ldquo;{goalTitle}&rdquo;</span> shifts to{" "}
                <span className="font-bold text-primary underline font-mono">{simulation.delta.newCompletionDate}</span>.
              </p>
            </div>

            <div className="pt-3 border-t border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground font-semibold">
                Recovery Effort required:
              </span>
              <span className="font-bold text-foreground bg-background px-3 py-1 rounded-lg border border-border/80 font-mono">
                +{formatCurrency(simulation.delta.additionalMonthlyAmountRequired || 1667, currency)} / month
              </span>
            </div>
          </div>
        </div>

        {/* SENIOR WEALTH STRATEGIST MASTER ASSESSMENT */}
        <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Senior Wealth Strategist Master Assessment</span>
            </div>
            <span className="rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-wider">
              30-Year Advisory Trajectory Synthesis
            </span>
          </div>

          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans font-normal text-justify">
            {strategistOutput.masterStrategyParagraph}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">
                Immediate Action
              </span>
              <p className="text-muted-foreground">{strategistOutput.whatYouCanDo}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-primary">
                Recovery Directive
              </span>
              <p className="text-muted-foreground">{strategistOutput.toStayOnTrack}</p>
            </div>
          </div>
        </div>

        {/* 3 Strategy Comparison Grid */}
        <div className="space-y-3 pt-4">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            3 Strategy Comparison
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {strategies.map((strat) => {
              const isActive = selectedStrategy === strat.id;
              const isLocked = !hasStrategyAccess && strat.id !== "CASH";

              return (
                <button
                  key={strat.id}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      setShowUpgradeGateModal(true);
                      return;
                    }
                    setSelectedStrategy(strat.id);
                  }}
                  className={`rounded-2xl p-5 text-left transition-all border flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden ${
                    isActive
                      ? "border-primary bg-card shadow-xs ring-2 ring-primary/20"
                      : isLocked
                      ? "border-border/60 bg-secondary/20 hover:border-primary/40 opacity-80"
                      : "border-border/80 bg-card hover:border-border"
                  }`}
                >
                  {isLocked && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                      <Lock className="w-3 h-3" />
                      <span>Aimly Pro</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">{strat.title}</div>
                    <div className="text-xl font-bold text-foreground font-mono">
                      {strat.metric}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">{strat.metricLabel}</span>
                    <span className="text-primary font-bold">{strat.delayText}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* GAME CHANGER #1: OPPORTUNITY COST MATRIX */}
        <OpportunityCostMatrix
          decisionTitle={title}
          amount={amount}
          currency={currency}
          goalTitle={primaryGoal?.title || "Start my business"}
          delayInDays={simulation.delta.delayInDays}
          monthlyFreeCashFlow={68000}
          currentLiquidSavings={baselineProfile.liquidSavings}
          monthlyGoalContribution={45000}
        />

        {/* Human Language 3 Pillars Breakdown */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-4">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors"
          >
            <span>3-Pillar Financial Health Breakdown</span>
            <span className="flex items-center gap-1 text-primary text-xs">
              <span>{showTechnicalDetails ? "Hide Breakdown" : "View Breakdown"}</span>
              {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {showTechnicalDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-border/60 animate-fadeIn text-xs">
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>1. Cash Affordability</span>
                </div>
                <p className="text-muted-foreground">
                  Liquid cash covers this purchase with {formatCurrency(simulation.affordability.cashRemainingAfterDecision, currency)} remaining.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>2. Essential Cushion</span>
                </div>
                <p className="text-muted-foreground">
                  {simulation.affordability.obligationsPreservedMonths} months of essential expenses remain fully safe in your liquid reserves.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>3. Goal Timeline</span>
                </div>
                <p className="text-muted-foreground">
                  +{simulation.delta.delayInDays} days shift on arrival.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PRO PLAN UPGRADE GATE MODAL FOR STRATEGIES */}
      {showUpgradeGateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl my-auto">
            <button
              type="button"
              onClick={() => setShowUpgradeGateModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <PlanUpgradeGate
              requiredTier="pro"
              featureTitle="Unlock 3-Strategy Decision Studio"
              featureTitleFr="Débloquez le Studio Décisionnel à 3 Stratégies"
              featureDescription="The Free plan provides basic cash evaluation. Upgrade to Aimly Pro to compare 3-month spreading, postponement accumulation curves, and minimum drag recovery paths."
              featureDescriptionFr="La formule Gratuite évalue uniquement le paiement comptant. Passez à Aimly Pro pour comparer l'échelonnement sur 3 mois et les stratégies d'épargne préalable."
            />
          </div>
        </div>
      )}
    </div>
  );
}
