"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import { simulateDecision, BaselineFinancialProfile } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils/currency";
import { MinimalistDecisionEngine } from "@/components/design-system/MinimalistDecisionEngine";
import { PdfReportDownloadButton } from "@/components/finance/PdfReportDownloadButton";
import {
  ArrowLeft,
  Sparkles,
  Heart,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function DecideStudioPage() {
  const { user, profile } = useAuth();
  const { currency, format } = useCurrency();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "I'm thinking of buying a KES 500,000 car.";

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [isSaved, setIsSaved] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

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
          title: "Motor Insurance",
          amount: 45000,
          frequency: "ANNUAL",
          nextDueDate: "2026-10-05",
          category: "INSURANCE",
        },
      ],
      goals: [
        {
          id: "primary-goal",
          title: "Buy a home deposit",
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

  const parsed = useMemo(() => {
    return parseDecisionQuery(queryInput, currency);
  }, [queryInput, currency]);

  const amount = parsed.isValid && parsed.extractedAmount > 0 ? parsed.extractedAmount : 500000;
  const title = parsed.isValid && parsed.extractedTitle ? parsed.extractedTitle : "Vehicle Purchase";

  const simulation = useMemo(() => {
    return simulateDecision(baselineProfile, {
      decisionTitle: title,
      amount,
      isRecurring: parsed.isRecurring,
    });
  }, [baselineProfile, title, amount, parsed.isRecurring]);

  // Strategy comparison (Layer 4)
  const strategies = useMemo(() => {
    const cashRemaining = baselineProfile.liquidSavings - amount;
    const spreadMonthly = Math.round(amount / 3);

    return [
      {
        id: "CASH",
        title: "1. Pay Cash Today",
        subtitle: "One-time Cash Outflow",
        metric: format(Math.max(0, cashRemaining), { fromCurrency: "KES" }),
        metricLabel: "Cash Reserve Remaining",
        delayText: `+${simulation.delta.delayInDays || 45} days shift`,
        badge: "Immediate",
      },
      {
        id: "SPREAD",
        title: "2. Spread over 3 Months",
        subtitle: "Monthly Cash Flow",
        metric: `${format(spreadMonthly, { fromCurrency: "KES" })} / mo`,
        metricLabel: "Monthly Outflow",
        delayText: `+${Math.max(0, Math.round((simulation.delta.delayInDays || 45) * 0.7))} days shift`,
        badge: "Smoothed",
      },
      {
        id: "POSTPONE",
        title: "3. Save First (60 Days)",
        subtitle: "Save in Advance",
        metric: format(0, { fromCurrency: "KES" }),
        metricLabel: "Immediate Impact",
        delayText: "0 days shift",
        badge: "Zero Delay",
      },
    ];
  }, [amount, simulation, baselineProfile.liquidSavings, format]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <Link
            href="/app"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Decision Studio
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Test any big financial decision before you commit.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* MINIMALIST 5-SECOND DECISION ENGINE */}
      <MinimalistDecisionEngine
        baselineProfile={baselineProfile}
        initialQuery={queryInput}
        showQuickActions={true}
      />

      {/* STRATEGY COMPARISON (LAYER 4 DETAILED OPTIONS) */}
      <section className="space-y-4 rounded-3xl border border-border/80 bg-card p-6 sm:p-8">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
            Strategy Comparison
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            3 Ways to Handle This Decision
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {strategies.map((strat) => (
            <div
              key={strat.id}
              className="p-5 rounded-2xl border border-border/70 bg-secondary/30 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {strat.badge}
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    {strat.delayText}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground pt-1">{strat.title}</h3>
                <p className="text-xs text-muted-foreground font-medium">{strat.subtitle}</p>
              </div>

              <div className="pt-2 border-t border-border/40 space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">
                  {strat.metricLabel}
                </span>
                <span className="text-base font-bold text-foreground block">{strat.metric}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground font-medium">
            Want a downloadable PDF summary of this decision analysis?
          </p>

          <PdfReportDownloadButton
            decisionTitle={title}
            amount={amount}
            currency={currency}
            verdictStatus={simulation.status}
            projectedDelayDays={simulation.delta.delayInDays || 45}
            monthlyRecovery={1875}
          />
        </div>
      </section>
    </div>
  );
}
