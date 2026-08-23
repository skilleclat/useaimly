"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { MinimalistDecisionEngine } from "@/components/design-system/MinimalistDecisionEngine";
import { BaselineFinancialProfile } from "@/lib/finance";
import { Sparkles, Target, Wallet, ArrowRight } from "lucide-react";

export default function AuthenticatedDashboard() {
  const { user, firstName } = useAuth();
  const { currency, format } = useCurrency();

  // Baseline Financial Profile
  const baselineProfile: BaselineFinancialProfile = useMemo(
    () => ({
      liquidSavings: 180000,
      incomes: [
        {
          name: "Primary Income",
          amount: 180000,
          frequency: "MONTHLY",
          reliability: "STABLE",
          isActive: true,
        },
      ],
      expenses: [
        { name: "Rent & Housing", amount: 45000, frequency: "MONTHLY", isFixed: true },
        { name: "Food & Living", amount: 35000, frequency: "MONTHLY", isFixed: true },
        { name: "Transport & Fuel", amount: 15000, frequency: "MONTHLY", isFixed: false },
        { name: "Utilities", amount: 12000, frequency: "MONTHLY", isFixed: true },
      ],
      debts: [],
      commitments: [],
      goals: [
        {
          id: "goal-1",
          title: "Buy a home deposit",
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
  const goalProgressPercent = Math.min(
    100,
    Math.round((mainGoal.currentAmount / mainGoal.targetAmount) * 100)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10 font-sans animate-fadeIn">
      {/* 1. HERO GREETING & VALUE PROPOSITION */}
      <section className="space-y-2 text-left border-b border-border/60 pb-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {firstName || "Friend"}</span>
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Cash Reserve: <strong className="text-foreground font-bold">{format(180000, { fromCurrency: "KES" })}</strong>
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Before you spend big, ask UseAimly.
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground font-medium">
          See what your next money decision could mean for your finances and goals.
        </p>
      </section>

      {/* 2. MINIMALIST DECISION ENGINE (CARDS + INPUT FIELD + 4-LAYER VERDICT) */}
      <section className="w-full">
        <MinimalistDecisionEngine
          baselineProfile={baselineProfile}
          showQuickActions={true}
        />
      </section>

      {/* 3. YOUR GOAL SUMMARY AT A GLANCE */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Your Primary Goal</h3>
              <p className="text-xs text-muted-foreground font-medium">{mainGoal.title}</p>
            </div>
          </div>

          <Link
            href="/app/goals"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View all goals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground">
              {format(mainGoal.currentAmount, { fromCurrency: "KES" })} / {format(mainGoal.targetAmount, { fromCurrency: "KES" })} ({goalProgressPercent}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${goalProgressPercent}%` }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
