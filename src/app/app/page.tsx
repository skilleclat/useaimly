"use client";

import React, { useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { TrajectoryHeroChart } from "@/components/dashboard/TrajectoryHeroChart";
import { YourPathSection } from "@/components/dashboard/YourPathSection";
import { BeforeYouDecide } from "@/components/dashboard/BeforeYouDecide";
import { LookAheadSection } from "@/components/dashboard/LookAheadSection";
import { RecentDecisionsSection } from "@/components/dashboard/RecentDecisionsSection";
import { PrimeInsightSection } from "@/components/dashboard/PrimeInsightSection";
import { BaselineFinancialProfile } from "@/lib/finance";
import { CurrencyCode } from "@/lib/types/finance";
import { Compass, Sparkles } from "lucide-react";

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
  const greeting = `${getTimeGreeting()}, ${firstName}.`;

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
          frequency: "ANNUAL", // 3,750 / mo
          nextDueDate: "2026-10-05",
          category: "INSURANCE",
        },
      ],
      goals: [
        {
          id: "goal-1",
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fadeIn">
      {/* Top Greeting & Emotional Core */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
          <Compass className="w-4 h-4" />
          <span>Useaimly Decision Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
          {greeting}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
          Here is your financial trajectory. See where your money is carrying you before making any decisions today.
        </p>
      </div>

      {/* SECTION 1: MAIN HERO — Primary Destination Trajectory */}
      <section id="goals">
        <TrajectoryHeroChart
          goalTitle="Start my business"
          currentAmount={180000}
          targetAmount={500000}
          targetDate="2027-12-31"
          projectedArrivalDate="2027-11-15"
          monthlyFreeCashFlow={68000}
          currency={currency}
        />
      </section>

      {/* SECTION 2: "Your path" — Inflow, Commitments, Available, Savings */}
      <section id="money">
        <YourPathSection
          monthlyIncome={180000}
          monthlyCommitments={112000}
          availableForGoals={68000}
          currentSavings={180000}
          currency={currency}
        />
      </section>

      {/* SECTION 3: "Before you decide" — Decision Simulation Input & Evaluation */}
      <BeforeYouDecide
        currency={currency}
        baselineProfile={baselineProfile}
      />

      {/* SECTION 4: "Look ahead" — Foresight Cards */}
      <section id="what-if">
        <LookAheadSection currency={currency} />
      </section>

      {/* SECTION 5: "Recent decisions" — Evaluated spending history */}
      <RecentDecisionsSection currency={currency} />

      {/* SECTION 6: "One thing to know" — Prime Insight Highlight */}
      <PrimeInsightSection
        goalTitle="Start my business"
        monthlyFreeCashFlow={68000}
        currency={currency}
      />
    </div>
  );
}
