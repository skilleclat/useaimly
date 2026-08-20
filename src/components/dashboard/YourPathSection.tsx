"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { TrendingUp, ShoppingBag, Target, Wallet, ArrowUpRight, ShieldCheck } from "lucide-react";

interface YourPathSectionProps {
  monthlyIncome: number;
  monthlyCommitments: number;
  availableForGoals: number;
  currentSavings: number;
  currency: CurrencyCode;
}

export function YourPathSection({
  monthlyIncome = 180000,
  monthlyCommitments = 112000,
  availableForGoals = 68000,
  currentSavings = 180000,
  currency = "KES",
}: YourPathSectionProps) {
  const savingsRate = monthlyIncome > 0 ? Math.round((availableForGoals / monthlyIncome) * 100) : 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-editorial text-foreground tracking-tight">
            Your path
          </h3>
          <p className="text-xs text-muted-foreground">
            The steady engine driving your trajectory month over month.
          </p>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-mono text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>{savingsRate}% converted to future goals</span>
        </span>
      </div>

      {/* 4 Spacious Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Income */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-3 shadow-elevation-1 hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Monthly Inflow
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-financial text-foreground">
              {formatCurrency(monthlyIncome, currency)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active salary & consulting inflow
            </p>
          </div>
        </div>

        {/* Monthly Commitments */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-3 shadow-elevation-1 hover:border-Useaimly-expense/30 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Monthly Commitments
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-financial text-foreground">
              {formatCurrency(monthlyCommitments, currency)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Living costs, debt & obligations
            </p>
          </div>
        </div>

        {/* Available for Goals */}
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-6 space-y-3 shadow-elevation-1 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between text-primary">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Available for Goals
            </span>
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-financial text-primary">
              {formatCurrency(availableForGoals, currency)}
            </div>
            <p className="text-[11px] text-primary/80 mt-1">
              Free cash flow dedicated to destination
            </p>
          </div>
        </div>

        {/* Current Savings */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-3 shadow-elevation-1 hover:border-Useaimly-savings/30 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Current Reserves
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-financial text-foreground">
              {formatCurrency(currentSavings, currency)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Total liquid checking & MMF buffer
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
