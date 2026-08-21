"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { simulateDecision, BaselineFinancialProfile } from "@/lib/finance";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import {
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface BeforeYouDecideProps {
  currency?: CurrencyCode;
  baselineProfile: BaselineFinancialProfile;
  onDecisionChange?: (amount: number, delayInDays: number) => void;
}

const QUICK_EXAMPLES = [
  { text: `"Can I afford a $2,000 laptop?"`, amount: 2000, title: "Laptop Purchase" },
  { text: `"Can I spend 30,000 KES on a phone?"`, amount: 30000, title: "Smartphone Purchase" },
  { text: `"What if I get a 25,000 KES raise?"`, amount: 25000, title: "Income Increase", isIncome: true },
];

export function BeforeYouDecide({
  currency = "KES",
  baselineProfile,
  onDecisionChange,
}: BeforeYouDecideProps) {
  const [queryText, setQueryText] = useState("");
  const [activeAmount, setActiveAmount] = useState<number>(2000);
  const [activeTitle, setActiveTitle] = useState("Laptop Purchase");
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(true);
  const [showPillars, setShowPillars] = useState(false);

  // Parse natural language input on typing
  const parsedIntent = useMemo(() => {
    if (!queryText.trim()) return null;
    return parseDecisionQuery(queryText, currency);
  }, [queryText, currency]);

  // Derived evaluation params
  const evalAmount = parsedIntent?.isValid && parsedIntent.extractedAmount > 0
    ? parsedIntent.extractedAmount
    : activeAmount;
    
  const evalTitle = parsedIntent?.isValid && parsedIntent.extractedTitle
    ? parsedIntent.extractedTitle
    : activeTitle;

  const evalRecurring = parsedIntent?.isRecurring ?? isRecurring;

  // Run deterministic simulation engine
  const simulation = useMemo(() => {
    return simulateDecision(baselineProfile, {
      decisionTitle: evalTitle,
      amount: evalAmount,
      isRecurring: evalRecurring,
      recurringFrequency: "MONTHLY",
    });
  }, [baselineProfile, evalTitle, evalAmount, evalRecurring]);

  const handleSelectPreset = (example: typeof QUICK_EXAMPLES[0]) => {
    setQueryText(example.text);
    setActiveAmount(example.amount);
    setActiveTitle(example.title);
    setIsRecurring(false);
    setHasEvaluated(true);
    if (onDecisionChange) {
      const sim = simulateDecision(baselineProfile, {
        decisionTitle: example.title,
        amount: example.amount,
        isRecurring: false,
      });
      onDecisionChange(example.amount, sim.delta.delayInDays);
    }
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedIntent && parsedIntent.extractedAmount > 0) {
      setActiveAmount(parsedIntent.extractedAmount);
      setActiveTitle(parsedIntent.extractedTitle);
      setIsRecurring(parsedIntent.isRecurring);
    }
    setHasEvaluated(true);
    if (onDecisionChange) {
      onDecisionChange(evalAmount, simulation.delta.delayInDays);
    }
  };

  const answerColorClass =
    simulation.status === "SAFE"
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : simulation.status === "MANAGEABLE"
      ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
      : simulation.status === "HIGH_IMPACT"
      ? "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20"
      : "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";

  const answerHeadline =
    simulation.status === "SAFE"
      ? "Yes. Fully affordable."
      : simulation.status === "MANAGEABLE"
      ? "Yes, manageable."
      : simulation.status === "HIGH_IMPACT"
      ? "Proceed with caution."
      : "Not recommended right now.";

  const primaryGoal = baselineProfile.goals[0];
  const goalTitle = primaryGoal?.title || "My Primary Goal";

  return (
    <div className="space-y-4 font-mono">
      <div className="text-sm font-semibold text-foreground">
        What are you considering?
      </div>

      {/* Input Box matching wireframe design: "Can I afford a $2,000 laptop?" -> */}
      <form onSubmit={handleQuerySubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 sm:relative">
          <input
            type="text"
            value={queryText}
            onChange={(e) => {
              setQueryText(e.target.value);
              setHasEvaluated(true);
            }}
            placeholder={`"Can I afford a $2,000 laptop?"`}
            className="w-full rounded-xl border-2 border-border/90 bg-card px-4 py-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-foreground transition-all sm:pr-14"
          />
          <button
            type="submit"
            className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-2 sm:bottom-2 rounded-lg bg-foreground text-background px-4 py-2.5 sm:py-0 text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center shrink-0 min-h-[44px] sm:min-h-0"
            title="Evaluate Decision"
          >
            →
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-muted-foreground">Examples:</span>
          {QUICK_EXAMPLES.map((example) => (
            <button
              key={example.text}
              type="button"
              onClick={() => handleSelectPreset(example)}
              className="rounded-lg border border-border/70 bg-card px-2.5 py-1 text-foreground/80 hover:border-foreground transition-all text-[11px]"
            >
              {example.text}
            </button>
          ))}
        </div>
      </form>

      {/* RESULT DISPLAY */}
      {hasEvaluated && (
        <div className="rounded-2xl border-2 border-border/80 bg-card p-5 space-y-5 animate-fadeIn mt-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* The Verdict */}
            <div className="md:col-span-5 rounded-xl border border-border/80 bg-secondary/30 p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[11px] uppercase text-muted-foreground font-semibold">
                  Verdict
                </span>
                <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${answerColorClass}`}>
                  {simulation.status === "SAFE" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{answerHeadline}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {evalTitle}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatCurrency(evalAmount, currency)}
                  {evalRecurring ? " / month" : " one-time"}
                </p>
              </div>
            </div>

            {/* The Time Consequence */}
            <div className="md:col-span-7 rounded-xl border border-border/80 bg-secondary/20 p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase text-muted-foreground font-semibold">
                  Consequence in Time
                </span>
                <Clock className="w-3.5 h-3.5 text-foreground" />
              </div>

              <div>
                <div className="text-3xl font-bold text-foreground">
                  +{simulation.delta.delayInDays} days
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Goal <span className="text-foreground font-semibold">&ldquo;{goalTitle}&rdquo;</span> shifts to{" "}
                  <span className="text-foreground font-bold">{simulation.delta.newCompletionDate}</span>.
                </p>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Recovery Effort:</span>
                <span className="font-bold text-foreground">
                  +{formatCurrency(simulation.delta.additionalMonthlyAmountRequired || 1667, currency)} / mo
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground leading-relaxed pt-1">
            {simulation.detailedAnalysis}
          </div>

          {/* Toggle 3 Pillars */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowPillars(!showPillars)}
              className="inline-flex items-center gap-1.5 text-xs text-foreground hover:underline"
            >
              <span>{showPillars ? "Hide 3-Pillar Breakdown" : "View 3-Pillar Breakdown"}</span>
              {showPillars ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showPillars && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
                <div className="p-3 rounded-lg border border-border/70 bg-background space-y-1">
                  <div className="font-bold text-foreground">1. Cash</div>
                  <div className="text-muted-foreground">
                    {simulation.affordability.canPhysicallyPay ? "Liquid Covered" : "Deficit"}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/70 bg-background space-y-1">
                  <div className="font-bold text-foreground">2. Cushion</div>
                  <div className="text-muted-foreground">
                    {simulation.affordability.obligationsPreservedMonths} mo safe
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/70 bg-background space-y-1">
                  <div className="font-bold text-foreground">3. Trajectory</div>
                  <div className="text-muted-foreground">
                    +{simulation.delta.delayInDays}d shift
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
