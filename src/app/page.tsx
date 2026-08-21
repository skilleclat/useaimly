"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import { simulateDecision, BaselineFinancialProfile } from "@/lib/finance";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { PRICING_PLANS } from "@/lib/types/pricing";
import { PricingCard } from "@/components/finance/PricingCard";
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
  const router = useRouter();
  const { user } = useAuth();
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
    // Route user to sign up or app studio
    if (user) {
      router.push("/app/decide");
    } else {
      const queryParam = queryInput ? `?query=${encodeURIComponent(queryInput)}` : "";
      router.push(`/signup${queryParam}`);
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
          <div className="space-y-5 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-wide">
              <Zap className="w-3.5 h-3.5" />
              <span>Goal-Aware Financial Decision Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-bold font-editorial text-foreground tracking-tight leading-[1.08] sm:leading-[1.05]">
              Know what your money decisions do to your future.
            </h1>

            <p className="text-base sm:text-xl text-muted-foreground font-medium max-w-2xl mx-auto px-2">
              See tomorrow before deciding today. Simulate spending decisions and understand the exact impact on your life goals.
            </p>

            {/* Dual CTA Actions: Try Live Demo vs Create Free Account */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto px-4 sm:px-0">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm px-7 py-3.5 sm:py-4 shadow-lg shadow-primary/20 hover:opacity-95 hover:scale-[1.01] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Try Live Demo (No Account Needed)</span>
              </Link>

              {!user && (
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card hover:bg-secondary/70 text-foreground font-bold text-sm px-6 py-3.5 sm:py-4 shadow-xs transition-all"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* INTERACTIVE DEMONSTRATION HERO (01 QUESTION → 02 ANSWER → 03 CONSEQUENCE → 04 RECOVERY) */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border-2 border-border/80 bg-card/90 backdrop-blur-md p-4 sm:p-10 space-y-6 sm:space-y-8 text-left shadow-xl max-w-4xl mx-auto relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
                  01 — The Question
                </span>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground">
                  What are you considering right now?
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 text-[11px] font-mono text-muted-foreground border border-border/60">
                <Compass className="w-3.5 h-3.5 text-primary" />
                <span>Live Calculator</span>
              </div>
            </div>

            {/* Natural Input Box */}
            <form onSubmit={handleQuerySubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 sm:relative shadow-xs">
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="e.g. Can I spend 30,000 KES on a phone?"
                  className="w-full rounded-2xl border-2 border-border/80 bg-background px-4 sm:px-5 py-3.5 sm:py-4 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary transition-all sm:pr-36 font-medium"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-2 sm:bottom-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 sm:py-0 text-xs font-bold hover:opacity-95 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer min-h-[44px] sm:min-h-0"
                >
                  <span>Simulate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sample Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-muted-foreground font-semibold">Examples:</span>
                <button
                  type="button"
                  onClick={() => handlePresetSelect("Can I spend 30,000 KES on a phone?", 30000, "Smartphone Purchase")}
                  className="rounded-xl border border-border/70 bg-secondary/50 px-3 py-1.5 text-foreground/80 hover:border-primary/40 transition-all font-medium text-[11px] sm:text-xs"
                >
                  30,000 KES Smartphone
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect("Can I take a 150,000 KES loan?", 150000, "Equipment Loan")}
                  className="rounded-xl border border-border/70 bg-secondary/50 px-3 py-1.5 text-foreground/80 hover:border-primary/40 transition-all font-medium text-[11px] sm:text-xs"
                >
                  150,000 KES Loan
                </button>
              </div>
            </form>

            {/* LIVE REVELATION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-border/60">
              {/* 02 — THE ANSWER & IMMEDIATE CASH IMPACT */}
              <div className="md:col-span-5 rounded-2xl border border-border/80 bg-secondary/40 p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    02 — Immediate Cash Impact
                  </span>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{simulation.headlineVerdict || "Fully Covered by Reserves"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-foreground">{evalTitle}</h4>
                  <p className="text-sm font-semibold font-mono text-muted-foreground">
                    {formatCurrency(evalAmount, currency)}
                  </p>
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/40">
                    <span>Liquid Cushion: </span>
                    <strong className="text-foreground">
                      {formatCurrency(baselineProfile.liquidSavings, currency)}
                    </strong>{" "}
                    →{" "}
                    <strong className="text-primary font-bold">
                      {formatCurrency(Math.max(0, baselineProfile.liquidSavings - evalAmount), currency)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 03 — THE CONSEQUENCE IN TIME & RECOVERY */}
              <div className="md:col-span-7 rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
                    03 — Future Shift
                  </span>
                  <Clock className="w-4 h-4 text-primary" />
                </div>

                <div>
                  <div className="text-4xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
                    +{simulation.delta.delayInDays} days
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/80 mt-1 font-medium">
                    Your goal <strong className="text-foreground">"Launch my business"</strong> moves {simulation.delta.delayInDays} days later (from Dec 12 to Dec 30).
                  </p>
                </div>

                {/* 04 — RECOVERY PLAN */}
                <div className="pt-3 border-t border-primary/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-semibold">04 — Stay on track:</span>
                    <span className="font-bold text-foreground bg-background px-3 py-1 rounded-lg border border-border/80 font-mono text-xs">
                      +{formatCurrency(simulation.delta.additionalMonthlyAmountRequired || 1667, currency)} / mo
                    </span>
                  </div>

                  <Link
                    href={user ? "/app/decide" : "/signup"}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-95 transition-all shadow-xs shrink-0"
                  >
                    <span>{user ? "Open Decision Studio" : "Analyze Your Real Decision"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 05 — THE PRODUCT ARCHITECTURE */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Product Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight">
              Calm, goal-aware control over your money.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Unlike retroactive budgeting tools, UseAimly focuses entirely on future destinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Goals */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Goals as Destinations</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Define what you are working toward. UseAimly calculates deterministic arrival dates based on your actual net cash flow.
              </p>
            </div>

            {/* Money */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 w-fit">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">6-Stream Financial Reality</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track income, fixed living expenses, debts, and liquid reserves without manual budget policing or guilt trip alerts.
              </p>
            </div>

            {/* Insights */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Proactive Foresight</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Detect cushion deficits, annual commitment spikes, and pace shortfalls 60 days before they affect your goals.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 05.5 — PRICING & PLANS */}
        {/* ========================================================================= */}
        <section id="pricing" className="space-y-8 py-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
              Monetization & Plans
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
              Transparent plans for every financial ambition.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Start free, test your baseline, and upgrade as your destinations grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
            {PRICING_PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} isYearly={true} currency="USD" />
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 06 — FINAL CTA */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-primary/30 bg-primary/5 p-8 sm:p-14 text-center space-y-6 max-w-4xl mx-auto shadow-lg shadow-primary/5">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
              Ready to See Tomorrow?
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
              Make confident decisions before spending money.
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto font-medium">
              Understand the impact of every financial choice on your destinations.
            </p>
          </div>

          <div>
            <Link
              href={user ? "/app" : "/onboarding"}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground font-bold text-sm px-8 py-4 shadow-md hover:opacity-90 transition-all"
            >
              <span>{user ? "Go to Your Dashboard" : "Start Live Interactive Demo"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
