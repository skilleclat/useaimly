"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { simulateDecision, BaselineFinancialProfile } from "@/lib/finance";
import { FinancialStatus } from "@/components/design-system/FinancialStatus";
import {
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Info,
} from "lucide-react";

interface BeforeYouDecideProps {
  currency: CurrencyCode;
  baselineProfile: BaselineFinancialProfile;
}

const PRESET_QUESTIONS = [
  { text: "Can I afford a KES 20,000 phone?", amount: 20000, title: "New Smartphone", isRecurring: false },
  { text: "Should I take this KES 150,000 loan?", amount: 150000, title: "New Loan Facility", isRecurring: false },
  { text: "Can I spend KES 10,000 this weekend?", amount: 10000, title: "Weekend Entertainment", isRecurring: false },
];

export function BeforeYouDecide({ currency = "KES", baselineProfile }: BeforeYouDecideProps) {
  const [queryText, setQueryText] = useState("");
  const [amount, setAmount] = useState<number>(20000);
  const [decisionTitle, setDecisionTitle] = useState("New Phone Purchase");
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Deterministic simulation
  const simulation = simulateDecision(baselineProfile, {
    decisionTitle,
    amount,
    isRecurring,
    recurringFrequency: "MONTHLY",
  });

  const handleSelectPreset = (preset: typeof PRESET_QUESTIONS[0]) => {
    setQueryText(preset.text);
    setAmount(preset.amount);
    setDecisionTitle(preset.title);
    setIsRecurring(preset.isRecurring);
    setHasEvaluated(true);
  };

  const handleAsk = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setHasEvaluated(true);
    }, 200);
  };

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <HelpCircle className="w-4 h-4" />
            <span>Before You Spend</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">
            What financial decision are you considering today?
          </h3>
        </div>

        <Link
          href="/app/decide"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Open Full Decision Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Input Sandbox */}
      <form onSubmit={handleAsk} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="e.g. Can I afford a KES 20,000 phone?"
              className="w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-xs sm:text-sm text-foreground focus:outline-hidden focus:border-primary transition-colors"
            />
            {queryText && (
              <button
                type="button"
                onClick={() => setQueryText("")}
                className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isEvaluating}
            className="rounded-xl bg-primary text-primary-foreground px-6 py-3 text-xs font-semibold hover:opacity-95 shadow-xs transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEvaluating ? "Calculating..." : "Test Decision"}</span>
          </button>
        </div>

        {/* Quick Question Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground font-medium">Examples:</span>
          {PRESET_QUESTIONS.map((preset) => (
            <button
              key={preset.text}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-xs rounded-lg border border-border/60 bg-secondary/40 px-3 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              {preset.text}
            </button>
          ))}
        </div>
      </form>

      {/* Evaluated Impact Sandbox Result */}
      {hasEvaluated && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-5 sm:p-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/15 pb-3">
            <div>
              <span className="text-xs font-semibold text-primary block">
                Simulation Consequence
              </span>
              <h4 className="text-lg font-bold text-foreground">
                {decisionTitle} ({formatCurrency(amount, currency)})
              </h4>
            </div>

            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
              ✓ Liquid Cash Covered
            </span>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Cash Buffer Remaining</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(Math.max(0, baselineProfile.liquidSavings - amount), currency)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Primary Goal Timeline (&ldquo;Start my business&rdquo;)</span>
              <span className="font-bold text-primary">
                +{simulation.delta.delayInDays} days delay
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">To Maintain Original Date</span>
              <span className="font-bold text-foreground">
                Save +{formatCurrency(simulation.delta.additionalMonthlyAmountRequired || 3500, currency)} / month
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end border-t border-primary/15">
            <Link
              href="/app/decide"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>Compare alternative strategies in Decision Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
