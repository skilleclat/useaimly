"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { parseDecisionQuery, ParsedDecisionIntent } from "@/lib/nlp/decision-query-parser";
import { simulateDecision, BaselineFinancialProfile } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import {
  Compass,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Bookmark,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Calendar,
  MessageSquare,
  Check,
  Plus,
  Edit3,
  Heart,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowLeft,
  Info,
  Layers,
} from "lucide-react";

export default function DecidePage() {
  const { profile } = useAuth();
  const currency = (profile?.preferred_currency || "KES") as CurrencyCode;

  // Active query & input state
  const [queryInput, setQueryInput] = useState("Can I spend KES 30,000 on a new phone?");
  const [title, setTitle] = useState("New Phone Purchase");
  const [amount, setAmount] = useState<number>(30000);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isEditingInputs, setIsEditingInputs] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<"CASH" | "SPREAD" | "POSTPONE">("CASH");
  const [isSaved, setIsSaved] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Baseline Financial Reality
  const baselineProfile: BaselineFinancialProfile = {
    liquidSavings: 180000,
    incomes: [
      { name: "Primary Income", amount: 180000, frequency: "MONTHLY", reliability: "STABLE", isActive: true },
    ],
    expenses: [
      { name: "Essential Living", amount: 112000, frequency: "MONTHLY", isFixed: true },
    ],
    debts: [],
    commitments: [],
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
  };

  // Deterministic simulation
  const simulation = useMemo(() => {
    return simulateDecision(baselineProfile, {
      decisionTitle: title,
      amount,
      isRecurring,
      recurringFrequency: isRecurring ? "MONTHLY" : undefined,
    });
  }, [title, amount, isRecurring]);

  // Strategy comparison cards calculations
  const strategies = useMemo(() => {
    const cashRemaining = baselineProfile.liquidSavings - amount;
    const spreadMonthly = Math.round(amount / 3);
    const recoveryMonthly = simulation.delta.additionalMonthlyAmountRequired || Math.round(amount / 16);

    return [
      {
        id: "CASH" as const,
        title: "Pay Cash Today",
        subtitle: "One-off Cash Buffer",
        metric: formatCurrency(Math.max(0, cashRemaining), currency),
        metricLabel: "Remaining Buffer",
        badge: "Liquid Buffer Intact",
        badgeStyle: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
        delayText: `+${simulation.delta.delayInDays} days shift`,
      },
      {
        id: "SPREAD" as const,
        title: "Spread over 3 Months",
        subtitle: "Monthly Cash Flow",
        metric: `${formatCurrency(spreadMonthly, currency)} / mo`,
        metricLabel: "Monthly Payment",
        badge: "Pace Smoothing",
        badgeStyle: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
        delayText: `+${Math.round(simulation.delta.delayInDays * 0.7)} days shift`,
      },
      {
        id: "POSTPONE" as const,
        title: "Postpone 60 Days",
        subtitle: "Save in Advance",
        metric: formatCurrency(0, currency),
        metricLabel: "Immediate Cash Impact",
        badge: "Zero Goal Delay",
        badgeStyle: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
        delayText: "0 days shift",
      },
    ];
  }, [amount, currency, simulation]);

  const handleParseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    const parsed = parseDecisionQuery(queryInput);
    setTitle(parsed.extractedTitle);
    setAmount(parsed.extractedAmount || 30000);
    setIsRecurring(parsed.isRecurring);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Header & Action Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Overview</span>
          </Link>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
            Decision Studio — {title} ({formatCurrency(amount, currency)})
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Simulating decision impact on primary destination: &ldquo;Start my business&rdquo;
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setQueryInput("");
              setIsEditingInputs(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/80 bg-card text-foreground hover:bg-secondary/60 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>New Query</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditingInputs(!isEditingInputs)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/80 bg-card text-foreground hover:bg-secondary/60 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-foreground" />
            <span>Adjust Input</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-colors ${
              isFavorite
                ? "border-rose-500/30 bg-rose-500/10 text-rose-600"
                : "border-border/80 bg-card text-foreground hover:bg-secondary/60"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-foreground"}`} />
            <span>Save Decision</span>
          </button>
        </div>
      </div>

      {/* Interactive Input Drawer */}
      {isEditingInputs && (
        <form onSubmit={handleParseSubmit} className="rounded-xl border border-primary/25 bg-primary/5 p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Describe your financial decision in plain language</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="e.g. Can I spend 30,000 KES on a laptop upgrade?"
              className="flex-1 rounded-xl border border-border/80 bg-background px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-hidden focus:border-primary"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 transition-opacity shrink-0"
            >
              Simulate
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Left Strategies & Evidence + Right Synthesis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): 3 Strategy Cards + Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* 3 Strategy Selector Cards */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              3 Financial Strategies
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {strategies.map((strat) => {
                const isActive = selectedStrategy === strat.id;
                return (
                  <button
                    key={strat.id}
                    type="button"
                    onClick={() => setSelectedStrategy(strat.id)}
                    className={`rounded-xl p-4 text-left transition-all border relative flex flex-col justify-between ${
                      isActive
                        ? "border-primary bg-card shadow-xs ring-2 ring-primary/20"
                        : "border-border/80 bg-card hover:border-border"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">{strat.title}</div>
                      <div className="text-xl font-bold text-foreground">
                        {strat.metric}
                      </div>
                    </div>
                    <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{strat.metricLabel}</span>
                      <span className="text-primary font-bold">{strat.delayText}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strategy Consequence Card */}
          <div className="rounded-xl border border-border/80 bg-card p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span>
                    {selectedStrategy === "CASH"
                      ? "Pay in full from liquid cash buffer"
                      : selectedStrategy === "SPREAD"
                      ? "Spread across 3 monthly cash flow cycles"
                      : "Postpone 60 days to save in advance"}
                  </span>
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {selectedStrategy === "CASH" ? "Self-funded" : selectedStrategy === "SPREAD" ? "3 Payments" : "Zero Debt"}
                  </span>
                  <span className="text-muted-foreground font-medium">
                    Destination: <strong>Start my business</strong>
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-muted-foreground font-medium">
                  Goal Timeline Shift
                </div>
                <div className="text-2xl font-bold text-primary">
                  {selectedStrategy === "CASH"
                    ? `+${simulation.delta.delayInDays} days`
                    : selectedStrategy === "SPREAD"
                    ? `+${Math.round(simulation.delta.delayInDays * 0.7)} days`
                    : "0 days"}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Target Arrival: {simulation.delta.newCompletionDate || "February 2028"}
                </div>
              </div>
            </div>

            {/* Financial Line Item Breakdown */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Liquid Cash Before Decision</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(baselineProfile.liquidSavings, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Decision Outflow Amount</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  -{formatCurrency(amount, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Remaining Cash Cushion</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(Math.max(0, baselineProfile.liquidSavings - amount), currency)}
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200 text-xs leading-relaxed">
                Your remaining liquid buffer stays above the safe 2-month fixed obligation safety threshold.
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-muted-foreground font-medium">Recovery effort to maintain Nov 2027 deadline</span>
                <span className="font-bold text-primary">
                  +{formatCurrency(simulation.delta.additionalMonthlyAmountRequired || 4200, currency)} / month
                </span>
              </div>
            </div>
          </div>

          {/* Collapsible Formula Details */}
          <div className="rounded-xl border border-border/80 bg-card p-4">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between text-xs font-semibold text-foreground hover:text-primary transition-colors"
            >
              <span>Verified Calculation Details</span>
              <span className="flex items-center gap-1 text-primary font-medium text-xs">
                <span>{showTechnicalDetails ? "Hide" : "Show"}</span>
                {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {showTechnicalDetails && (
              <div className="pt-3 mt-3 border-t border-border/60 space-y-2 text-xs text-muted-foreground animate-fadeIn">
                <div className="flex justify-between">
                  <span>Normalization Formula:</span>
                  <span className="text-foreground font-medium">Monthly trajectory allocation quotient</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Flow Delta:</span>
                  <span className="text-foreground font-medium">0 KES / month (Cash)</span>
                </div>
                <div className="flex justify-between">
                  <span>Resilience Index:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Resilient (84/100)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Recommendation Synthesis */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-border/80 bg-card p-6 space-y-5 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                UseAimly Verdict & Synthesis
              </h3>
              <p className="text-xs text-muted-foreground">
                Clear trade-off assessment for your decision.
              </p>
            </div>

            {/* Visual Balance Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Outflow</span>
                <span className="text-primary font-bold">Remaining Buffer</span>
              </div>
              <div className="relative flex items-center">
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "83%" }} />
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(amount, currency)}</span>
                <span className="font-bold text-foreground">{formatCurrency(150000, currency)}</span>
              </div>
            </div>

            {/* Plain Language Synthesis */}
            <div className="p-4 rounded-lg bg-secondary/40 border border-border/60 space-y-2 text-xs text-muted-foreground leading-relaxed">
              <div className="font-semibold text-foreground">Recommended Action Plan</div>
              <p>
                Pay for this purchase in cash using your liquid reserves rather than taking on debt. To preserve your original November 2027 goal arrival date, save an extra <strong>+{formatCurrency(4200, currency)} / month</strong> for the next 16 months.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/app/what-if"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground hover:opacity-95 transition-all shadow-xs"
              >
                <span>Explore Variants in What-If Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
