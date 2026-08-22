"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { TrajectoryHeroChart } from "@/components/dashboard/TrajectoryHeroChart";
import { YourPathSection } from "@/components/dashboard/YourPathSection";
import { BeforeYouDecide } from "@/components/dashboard/BeforeYouDecide";
import { RecentDecisionsSection } from "@/components/dashboard/RecentDecisionsSection";
import { PrimeInsightSection } from "@/components/dashboard/PrimeInsightSection";
import { BaselineFinancialProfile } from "@/lib/finance";
import { CurrencyCode } from "@/lib/types/finance";
import { formatCurrency } from "@/lib/utils/currency";
import { GoalProgressHeroWidget } from "@/components/dashboard/GoalProgressHeroWidget";
import { InteractiveGoalCreationWizard } from "@/components/dashboard/InteractiveGoalCreationWizard";
import { ExportTrajectoryCard } from "@/components/finance/ExportTrajectoryCard";
import {
  HelpCircle,
  Target,
  Wallet,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function AuthenticatedDashboard() {
  const { user, profile } = useAuth();
  const currency = (profile?.preferred_currency || "KES") as CurrencyCode;
  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Strategist";
  const greeting = `${getTimeGreeting()}.`;

  const [showDetailedCharts, setShowDetailedCharts] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // Baseline Financial Profile for Deterministic Simulations
  const baselineProfile: BaselineFinancialProfile = useMemo(
    () => ({
      liquidSavings: 180000,
      incomes: [
        {
          name: "Primary Tech Retainer & Salary",
          amount: 180000,
          frequency: "MONTHLY",
          reliability: "STABLE",
          isActive: true,
        },
      ],
      expenses: [
        { name: "Rent & Housing", amount: 45000, frequency: "MONTHLY", isFixed: true, category: "HOUSING" },
        { name: "Food & Groceries", amount: 25000, frequency: "MONTHLY", isFixed: true, category: "FOOD" },
        { name: "Transport & Fuel", amount: 15000, frequency: "MONTHLY", isFixed: false, category: "TRANSPORT" },
        { name: "Utilities & Power", amount: 8000, frequency: "MONTHLY", isFixed: true, category: "UTILITIES" },
        { name: "Internet & Phone", amount: 5000, frequency: "MONTHLY", isFixed: true, category: "UTILITIES" },
        { name: "Family Support", amount: 10000, frequency: "MONTHLY", isFixed: true, category: "FAMILY" },
        { name: "Subscriptions", amount: 4000, frequency: "MONTHLY", isFixed: true, category: "DIGITAL" },
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
          id: "goal-1",
          title: "Buy a home",
          targetAmount: 500000,
          currentAmount: 260000,
          targetDate: "2027-06-30",
          priority: "HIGH",
          status: "ACTIVE",
        },
      ],
    }),
    []
  );

  const mainGoal = baselineProfile.goals[0];
  const goalProgressPercent = Math.min(100, Math.round((mainGoal.currentAmount / mainGoal.targetAmount) * 100));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12 animate-fadeIn font-sans">
      {/* 1. HERO GOAL PROGRESS WIDGET (MATCHING UI REFERENCE IMAGE) */}
      <GoalProgressHeroWidget
        userName={firstName}
        currency={currency}
        onOpenCreateWizard={() => setShowWizard(true)}
      />

      {showWizard && (
        <InteractiveGoalCreationWizard
          currency={currency}
          monthlyGrossIncome={180000}
          onClose={() => setShowWizard(false)}
          onGoalCreated={(newG) => {
            console.log("Goal created via wizard:", newG);
          }}
        />
      )}

      {/* 2. 2x2 GRID OF PRIMARY DESTINATION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {/* Card 1: Decide */}
        <Link
          href="/app/decide"
          className="group rounded-xl border-2 border-border/80 bg-card p-6 text-center hover:border-foreground transition-all flex flex-col items-center justify-center space-y-3 shadow-xs"
        >
          <div className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
            Decide
          </div>
          <div className="text-xs text-muted-foreground">
            Before you spend
          </div>
        </Link>

        {/* Card 2: Goals */}
        <Link
          href="/app/goals"
          className="group rounded-xl border-2 border-border/80 bg-card p-6 text-center hover:border-foreground transition-all flex flex-col items-center justify-center space-y-3 shadow-xs"
        >
          <div className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
            Goals
          </div>
          <div className="text-xs text-muted-foreground">
            Where you&apos;re going
          </div>
        </Link>

        {/* Card 3: Money */}
        <Link
          href="/app/money"
          className="group rounded-xl border-2 border-border/80 bg-card p-6 text-center hover:border-foreground transition-all flex flex-col items-center justify-center space-y-3 shadow-xs"
        >
          <div className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
            Money
          </div>
          <div className="text-xs text-muted-foreground">
            Your financial picture
          </div>
        </Link>

        {/* Card 4: Insights */}
        <Link
          href="/app/insights"
          className="group rounded-xl border-2 border-border/80 bg-card p-6 text-center hover:border-foreground transition-all flex flex-col items-center justify-center space-y-3 shadow-xs"
        >
          <div className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
            Insights
          </div>
          <div className="text-xs text-muted-foreground">
            What you should know
          </div>
        </Link>
      </div>

      {/* 3. DECISION ENGINE SECTION */}
      <section className="space-y-4 pt-4 border-t border-border/50">
        <BeforeYouDecide
          currency={currency}
          baselineProfile={baselineProfile}
        />
      </section>

      {/* 4. YOUR MAIN GOAL SECTION */}
      <section className="space-y-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            Your main goal
          </span>

          <Link
            href="/app/goals"
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Manage goals
          </Link>
        </div>

        <div className="rounded-2xl border-2 border-border/80 bg-card p-6 space-y-4 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {mainGoal.title}
            </h3>
            <div className="text-sm font-bold text-muted-foreground mt-0.5">
              {formatCurrency(mainGoal.currentAmount, currency)} / {formatCurrency(mainGoal.targetAmount, currency)}
            </div>
          </div>

          {/* Block / Segmented Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-5 bg-secondary rounded-lg overflow-hidden flex border border-border/60 p-0.5">
              <div
                className="h-full bg-foreground rounded-md transition-all duration-500"
                style={{ width: `${goalProgressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-foreground w-10 text-right">
              {goalProgressPercent}%
            </span>
          </div>

          <div className="text-xs text-muted-foreground pt-1 flex items-center justify-between">
            <span>On track · June 2027</span>
            <span className="text-[11px]">Arrival: Nov 2026</span>
          </div>
        </div>
      </section>

      {/* 4.5 FINANCIAL NOTEPAD AI CONTEXT WIDGET */}
      <section className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-amber-500/10 p-5 space-y-3 font-sans">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Strategic Financial Notepad AI Sync
              </h3>
              <p className="text-xs text-muted-foreground">
                Your handwritten rules & personal constraints are active in the AI Decision Engine.
              </p>
            </div>
          </div>

          <Link
            href="/app/notes"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0"
          >
            <span>Open Notepad</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 5. OPTIONAL EXTENDED TRAJECTORY DETAILS */}
      <section className="space-y-6 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Trajectory Analytics
          </span>

          <button
            type="button"
            onClick={() => setShowDetailedCharts(!showDetailedCharts)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:underline"
          >
            <span>{showDetailedCharts ? "Hide Trajectory Graph" : "View Trajectory Graph"}</span>
            {showDetailedCharts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showDetailedCharts && (
          <div className="space-y-6 animate-fadeIn font-sans">
            <TrajectoryHeroChart
              goalTitle={mainGoal.title}
              currentAmount={mainGoal.currentAmount}
              targetAmount={mainGoal.targetAmount}
              targetDate="2027-06-30"
              projectedArrivalDate="2026-11-15"
              monthlyFreeCashFlow={68000}
              currency={currency}
            />

            <YourPathSection
              monthlyIncome={180000}
              monthlyCommitments={112000}
              availableForGoals={68000}
              currentSavings={180000}
              currency={currency}
            />

            <RecentDecisionsSection currency={currency} />

            <PrimeInsightSection
              goalTitle={mainGoal.title}
              monthlyFreeCashFlow={68000}
              currency={currency}
            />

            {/* 6. RECENT DECISIONS AUDIT LOG */}
            <RecentDecisionsSection currency={currency} />

            {/* 7. MULTI-FORMAT EXPORTER (CSV / EXCEL / PDF HD) */}
            <ExportTrajectoryCard currency={currency} />
          </div>
        )}
      </section>
    </div>
  );
}
