"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import { simulateDecision, BaselineFinancialProfile } from "@/lib/finance";
import {
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Target,
  Wallet,
  Zap,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Compass,
} from "lucide-react";

export default function LandingPage() {
  const currency: CurrencyCode = "KES";

  // Interactive Live Hero State
  const [queryInput, setQueryInput] = useState("Can I spend 30,000 KES on a phone?");
  const [activeAmount, setActiveAmount] = useState<number>(30000);
  const [activeTitle, setActiveTitle] = useState("Smartphone Purchase");
  const [isRecurring, setIsRecurring] = useState(false);

  // Baseline Financial Reality for Live Demonstration
  const baselineProfile: BaselineFinancialProfile = useMemo(
    () => ({
      liquidSavings: 180000,
      incomes: [
        { name: "Primary Tech Retainer", amount: 180000, frequency: "MONTHLY", reliability: "STABLE", isActive: true },
      ],
      expenses: [
        { name: "Essential Living", amount: 112000, frequency: "MONTHLY", isFixed: true },
      ],
      debts: [],
      commitments: [],
      goals: [
        {
          id: "launch-business",
          title: "Launch my business",
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

  // Parse natural language input on typing
  const parsedIntent = useMemo(() => {
    if (!queryInput.trim()) return null;
    return parseDecisionQuery(queryInput, currency);
  }, [queryInput, currency]);

  // Derived params
  const evalAmount = parsedIntent?.isValid && parsedIntent.extractedAmount > 0
    ? parsedIntent.extractedAmount
    : activeAmount;

  const evalTitle = parsedIntent?.isValid && parsedIntent.extractedTitle
    ? parsedIntent.extractedTitle
    : activeTitle;

  const evalRecurring = parsedIntent?.isRecurring ?? isRecurring;

  // Run deterministic simulation
  const simulation = useMemo(() => {
    return simulateDecision(baselineProfile, {
      decisionTitle: evalTitle,
      amount: evalAmount,
      isRecurring: evalRecurring,
    });
  }, [baselineProfile, evalTitle, evalAmount, evalRecurring]);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedIntent && parsedIntent.extractedAmount > 0) {
      setActiveAmount(parsedIntent.extractedAmount);
      setActiveTitle(parsedIntent.extractedTitle);
      setIsRecurring(parsedIntent.isRecurring);
    }
  };

  const handlePresetSelect = (text: string, amt: number, ttl: string) => {
    setQueryInput(text);
    setActiveAmount(amt);
    setActiveTitle(ttl);
    setIsRecurring(false);
  };

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/15">
      {/* Main Landing Canvas */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
        {/* ========================================================================= */}
        {/* HERO SECTION: Know what your money decisions do to your future */}
        {/* ========================================================================= */}
        <section className="text-center space-y-8">
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Goal-Aware Decision Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-editorial text-foreground tracking-tight leading-[1.05]">
              Know what your money decisions do to your future.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground font-medium">
              See tomorrow before deciding today.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* INTERACTIVE DEMONSTRATION HERO (01 QUESTION → 02 ANSWER → 03 CONSEQUENCE → 04 PATH) */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border-2 border-border/80 bg-card p-6 sm:p-10 space-y-8 text-left shadow-xs max-w-4xl mx-auto relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                01 — The Question
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                What are you considering?
              </h2>
            </div>

            {/* Natural Input Box */}
            <form onSubmit={handleQuerySubmit} className="space-y-3">
              <div className="relative flex items-center shadow-xs">
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="e.g. Can I spend 30,000 KES on a phone?"
                  className="w-full rounded-2xl border-2 border-border/80 bg-background px-5 py-4 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary transition-all pr-32 font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 rounded-xl bg-primary text-primary-foreground px-5 text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Evaluate</span>
                </button>
              </div>

              {/* Sample Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-muted-foreground font-semibold">Examples:</span>
                <button
                  type="button"
                  onClick={() => handlePresetSelect("Can I spend 30,000 KES on a phone?", 30000, "Smartphone Purchase")}
                  className="rounded-xl border border-border/70 bg-secondary/50 px-3 py-1.5 text-foreground/80 hover:border-primary/40 transition-all"
                >
                  Can I spend 30,000 KES on a phone?
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect("Can I take a 150,000 KES loan?", 150000, "Tech Loan")}
                  className="rounded-xl border border-border/70 bg-secondary/50 px-3 py-1.5 text-foreground/80 hover:border-primary/40 transition-all"
                >
                  Can I take a 150,000 KES loan?
                </button>
              </div>
            </form>

            {/* LIVE REVELATION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-border/60">
              {/* 02 — THE ANSWER */}
              <div className="md:col-span-5 rounded-2xl border border-border/80 bg-secondary/30 p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    02 — The Answer
                  </span>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{simulation.headlineVerdict || "Yes. Fully Affordable."}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-foreground">{evalTitle}</h4>
                  <p className="text-sm font-medium text-muted-foreground">
                    {formatCurrency(evalAmount, currency)}
                  </p>
                </div>
              </div>

              {/* 03 — THE CONSEQUENCE IN TIME */}
              <div className="md:col-span-7 rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                    03 — The Consequence
                  </span>
                  <Clock className="w-4 h-4 text-primary" />
                </div>

                <div>
                  <div className="text-4xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
                    +{simulation.delta.delayInDays} days
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/80 mt-1 font-medium">
                    Your business goal moves 18 days later (from Dec 12 to Dec 30).
                  </p>
                </div>

                {/* 04 — THE PATH TO STAY ON TRACK */}
                <div className="pt-3 border-t border-primary/20 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">04 — Stay on track:</span>
                  <span className="font-bold text-foreground bg-background px-3 py-1 rounded-lg border border-border/80 font-mono">
                    +{formatCurrency(simulation.delta.additionalMonthlyAmountRequired || 1667, currency)} / mo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 05 — THE PRODUCT: GOALS / MONEY / INSIGHTS */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              05 — The Product Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight">
              Calm control over your future.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Goals */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Goals as Destinations</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Define what you are working toward. UseAimly calculates exact arrival dates based on your cash flow.
              </p>
            </div>

            {/* Money */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-4">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 w-fit">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Your Financial Picture</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track income, fixed living expenses, debt service, and liquid reserves without manual budget policing.
              </p>
            </div>

            {/* Insights */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Proactive Foresight</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Detect cushion deficits, annual commitment spikes, and goal pace shortfalls 60 days in advance.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 06 — CTA */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-primary/30 bg-primary/5 p-8 sm:p-14 text-center space-y-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
              06 — Final Step
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
              Make better decisions before they become expensive.
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto font-medium">
              Join thousands who evaluate spending choices before committing.
            </p>
          </div>

          <div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground font-bold text-sm px-8 py-4 shadow-xs hover:opacity-90 transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
