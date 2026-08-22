"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear, addMonths, formatDateToISO } from "@/lib/utils/date";
import { CurrencyCode } from "@/lib/types/finance";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Check,
  AlertCircle,
  Plus,
  RefreshCw,
  Sliders,
  DollarSign,
  Wallet,
  CheckCircle2,
  Heart,
  Edit3,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowLeft,
  Info,
} from "lucide-react";

import { runStressTest, STRESS_SCENARIOS, StressScenarioId } from "@/lib/finance/stress-tester";
import { OpportunityCostMatrix } from "@/components/finance/OpportunityCostMatrix";

type ScenarioType =
  | "SAVE_MORE"
  | "SAVE_LESS"
  | "EARN_MORE"
  | "EARN_LESS"
  | "SPEND_MORE"
  | "SPEND_LESS"
  | "TAKE_LOAN"
  | "REPAY_DEBT";

interface PresetScenario {
  id: string;
  name: string;
  type: ScenarioType;
  monthlyDelta: number;
  oneTimeDelta: number;
  badge: string;
  desc: string;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "sc-1",
    name: "Save +10,000 / month",
    type: "SAVE_MORE",
    monthlyDelta: 10000,
    oneTimeDelta: 0,
    badge: "4 months ahead",
    desc: "Direct 10,000 extra cash flow each month to your primary destination.",
  },
  {
    id: "sc-2",
    name: "Side Consulting (+25k/mo)",
    type: "EARN_MORE",
    monthlyDelta: 25000,
    oneTimeDelta: 0,
    badge: "8 months ahead",
    desc: "Generate additional net income and allocate 100% to savings.",
  },
  {
    id: "sc-3",
    name: "Reduce Subscriptions (-12k/mo)",
    type: "SPEND_LESS",
    monthlyDelta: 12000,
    oneTimeDelta: 0,
    badge: "5 months ahead",
    desc: "Trim discretionary recurring expenses to expand available cash flow.",
  },
];

export default function WhatIfPage() {
  const { profile } = useAuth();
  const { currency } = useCurrency();

  // Baseline Financial Reality
  const baseline = {
    monthlyGrossIncome: 180000,
    monthlyExpenses: 112000,
    monthlyDebtService: 0,
    monthlyFreeCashFlow: 68000,
    currentAllocatedToGoal: 45000,
    goalTitle: "Start my business",
    targetAmount: 500000,
    currentSaved: 180000,
    remainingAmount: 320000,
    baselineTargetDate: "2027-12-31",
    baselineArrivalDate: "2027-11-15",
  };

  // Selected scenario state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("sc-1");
  const [customMonthlyDelta, setCustomMonthlyDelta] = useState<number>(10000);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasAppliedPlan, setHasAppliedPlan] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const activeScenario = useMemo(() => {
    return PRESET_SCENARIOS.find((s) => s.id === selectedScenarioId) || PRESET_SCENARIOS[0];
  }, [selectedScenarioId]);

  const monthlyDelta = activeScenario.monthlyDelta || customMonthlyDelta;

  // Deterministic simulation
  const simulation = useMemo(() => {
    const newAllocated = Math.max(5000, baseline.currentAllocatedToGoal + monthlyDelta);
    const monthsRequired = Math.ceil(baseline.remainingAmount / newAllocated);
    const monthsSaved = Math.round((monthlyDelta / baseline.currentAllocatedToGoal) * 16);

    const newArrivalDate = addMonths(new Date("2026-08-20"), monthsRequired);
    const baselineArrival = new Date("2027-11-15");

    return {
      newAllocated,
      monthsRequired,
      monthsSaved: Math.max(1, monthsSaved),
      newArrivalDateStr: formatMonthYear(newArrivalDate),
      baselineArrivalStr: formatMonthYear(baselineArrival),
      newMonthlyFreeCashFlow: baseline.monthlyFreeCashFlow + monthlyDelta,
    };
  }, [monthlyDelta, baseline]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
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
            What-If Sandbox — ({formatCurrency(monthlyDelta > 0 ? monthlyDelta : -monthlyDelta, currency)}/mo)
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Hypothesis: {activeScenario.name}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setShowConfirmation(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-95 transition-opacity shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Adopt This Plan</span>
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
            <span>Save Plan</span>
          </button>
        </div>
      </div>

      {hasAppliedPlan && (
        <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>This scenario is now set as your active target plan for &ldquo;{baseline.goalTitle}&rdquo;.</span>
        </div>
      )}

      {/* Main Grid: Left Detailed Breakdown + Right Synthesis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Scenarios Selector + Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* 3 Scenario Selector Cards */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              3 Scenarios to Accelerate Timeline
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {PRESET_SCENARIOS.map((sc) => {
                const isActive = selectedScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`rounded-xl p-4 text-left transition-all border relative flex flex-col justify-between ${
                      isActive
                        ? "border-primary bg-card shadow-xs ring-2 ring-primary/20"
                        : "border-border/80 bg-card hover:border-border"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">{sc.name}</div>
                      <div className="text-xl font-bold text-foreground">
                        {formatCurrency(sc.monthlyDelta, currency)}
                      </div>
                    </div>
                    <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Timeline Gain</span>
                      <span className="text-primary font-bold">+{sc.badge}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deep-Dive Breakdown Card */}
          <div className="rounded-xl border border-border/80 bg-card p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">
                  Savings Flow Acceleration
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    +{simulation.monthsSaved} Months Earlier
                  </span>
                  <span className="text-muted-foreground font-medium">
                    Destination: <strong>{baseline.goalTitle}</strong>
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-muted-foreground font-medium">
                  New Projected Arrival
                </div>
                <div className="text-2xl font-bold text-primary">
                  {simulation.newArrivalDateStr}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Originally: {simulation.baselineArrivalStr}
                </div>
              </div>
            </div>

            {/* Clean Itemized Breakdown */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Base Free Cash Flow</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(baseline.monthlyFreeCashFlow, currency)} / month
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Simulated Monthly Increase</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(monthlyDelta, currency)} / month
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">New Goal Allocation Capacity</span>
                <span className="font-bold text-primary">
                  {formatCurrency(simulation.newAllocated, currency)} / month
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs leading-relaxed">
                This accelerated pace preserves 100% of your essential fixed living obligations ({formatCurrency(baseline.monthlyExpenses, currency)}/month).
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Remaining Shortfall</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(baseline.remainingAmount, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-muted-foreground font-medium">Net Schedule Gain</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {simulation.monthsSaved} Months Saved
                </span>
              </div>
            </div>
          </div>

          {/* Collapsible Technical Details */}
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
                  <span>Required Months to Goal:</span>
                  <span className="text-foreground font-medium">{simulation.monthsRequired} months</span>
                </div>
                <div className="flex justify-between">
                  <span>Effective Savings Rate:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {Math.round((simulation.newAllocated / baseline.monthlyGrossIncome) * 100)}% of gross inflow
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Summary Recommendation */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-border/80 bg-card p-6 space-y-5 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                UseAimly Scenario Verdict
              </h3>
              <p className="text-xs text-muted-foreground">
                Visual timeline comparison.
              </p>
            </div>

            {/* Visual Horizon Progress Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Current Plan</span>
                <span className="text-primary font-bold">New Plan</span>
                <span>Deadline</span>
              </div>
              <div className="relative flex items-center">
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "70%" }} />
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{simulation.baselineArrivalStr}</span>
                <span className="font-bold text-foreground">{simulation.newArrivalDateStr}</span>
                <span>Dec 2027</span>
              </div>
            </div>

            {/* Plain Language Summary */}
            <div className="p-4 rounded-lg bg-secondary/40 border border-border/60 space-y-2 text-xs text-muted-foreground leading-relaxed">
              <div className="font-semibold text-foreground">Recommended Strategy</div>
              <p>
                Increasing monthly savings by <strong>+{formatCurrency(monthlyDelta, currency)} / month</strong> reaches your destination <strong>{simulation.monthsSaved} months earlier</strong> without reducing your liquid emergency buffer.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground hover:opacity-95 transition-all shadow-xs"
              >
                <span>Make This My Active Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GAME CHANGER #2: CASH FLOW STRESS-TESTER & RESILIENCE RADAR */}
      <StressTesterSection currency={currency} />

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-6 sm:pt-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="max-w-md w-full rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
            <div className="space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Confirm Plan Adoption
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This action will update your official monthly allocation for &ldquo;{baseline.goalTitle}&rdquo; to {formatCurrency(simulation.newAllocated, currency)}/month.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="w-full py-2.5 rounded-xl border border-border/80 bg-secondary/50 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmation(false);
                  setHasAppliedPlan(true);
                }}
                className="w-full py-2.5 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-95 transition-opacity shadow-xs"
              >
                Confirm Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StressTesterSection({ currency }: { currency: CurrencyCode }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<StressScenarioId>("INCOME_SHOCK_30");

  const result = useMemo(() => {
    return runStressTest(selectedScenarioId, 180000, 97000, 10000, 3750, 240000, currency);
  }, [selectedScenarioId, currency]);

  const scoreColor =
    result.resilienceScore >= 80
      ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
      : result.resilienceScore >= 55
      ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
      : "text-rose-500 border-rose-500/30 bg-rose-500/10";

  return (
    <section className="rounded-3xl border border-primary/30 bg-card p-6 sm:p-8 space-y-6 shadow-sm font-sans animate-fadeIn">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              Resilience Radar &amp; Stress-Tester
            </h2>
            <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-primary/20 text-primary text-[10px] font-extrabold px-2.5 py-0.5 border border-primary/30 uppercase tracking-wider">
              Financial Shock Simulator
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Stress-test your financial trajectory against sudden real-life economic shocks to verify your exact breakdown point.
          </p>
        </div>

        {/* Resilience Score Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 font-mono ${scoreColor}`}>
            <span className="text-2xl font-extrabold">{result.resilienceScore}/100</span>
            <div className="text-left leading-tight">
              <span className="text-[10px] uppercase font-bold block">Resilience Score</span>
              <span className="text-xs font-bold">{result.resilienceVerdict}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Guidance Banner + Visual Score Bar */}
      <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-foreground">Financial Shock Immunity Radar</span>
          <span className="text-primary font-mono font-bold">Score: {result.resilienceScore} / 100</span>
        </div>

        {/* Segmented Progress Bar */}
        <div className="w-full h-3 rounded-full bg-secondary overflow-hidden border border-border/60 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              result.resilienceScore >= 80
                ? "bg-emerald-500"
                : result.resilienceScore >= 55
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}
            style={{ width: `${result.resilienceScore}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>At a Glance</strong>: Select a shock scenario below (like an income drop or inflation surge). Your score of <strong>{result.resilienceScore}/100</strong> shows how well your liquid reserves absorb the shock without forcing debt.
        </p>
      </div>

      {/* Shock Scenario Selector Pills */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold block">
          Select Shock Scenario:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STRESS_SCENARIOS.map((sc) => {
            const isActive = selectedScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                    : "border-border/80 bg-card hover:border-border hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{sc.name}</span>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                      sc.severity === "CRITICAL"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                        : sc.severity === "HIGH"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                        : "border-blue-500/30 bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {sc.severity}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{sc.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stress Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Net Monthly Cash Flow under Stress */}
        <div className="p-4 rounded-2xl border border-border/80 bg-secondary/30 space-y-1.5">
          <span className="text-xs text-muted-foreground font-medium">Stressed Net Free Cash Flow</span>
          <div className={`text-xl font-bold font-mono ${result.stressedFreeCashFlow >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {formatCurrency(result.stressedFreeCashFlow, currency)} / mo
          </div>
          <p className="text-[11px] text-muted-foreground">
            Originally: {formatCurrency(result.originalFreeCashFlow, currency)}/mo
          </p>
        </div>

        {/* Liquid Reserve Runway under Stress */}
        <div className="p-4 rounded-2xl border border-border/80 bg-secondary/30 space-y-1.5">
          <span className="text-xs text-muted-foreground font-medium">Stressed Buffer Runway</span>
          <div className="text-xl font-bold font-mono text-foreground">
            {result.stressedRunwayMonths} Months
          </div>
          <p className="text-[11px] text-muted-foreground">
            Originally: {result.originalRunwayMonths} Months
          </p>
        </div>

        {/* Breakdown Date Warning */}
        <div className="p-4 rounded-2xl border border-border/80 bg-secondary/30 space-y-1.5">
          <span className="text-xs text-muted-foreground font-medium">Liquidity Breakdown Date</span>
          <div className="text-xl font-bold font-mono text-amber-500">
            {result.breakdownDateFormatted ? result.breakdownDateFormatted : "No Breakdown Risk"}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {result.breakdownDateFormatted
              ? `Deficit depletes reserves in ${result.breakdownMonthIndex} months.`
              : "Reserves remain intact throughout stress."}
          </p>
        </div>
      </div>

      {/* Recommended Actionable Shield Plan */}
      <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-2">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Recommended Immunization Action Plan</span>
        </h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {result.actionableShieldPlan.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
