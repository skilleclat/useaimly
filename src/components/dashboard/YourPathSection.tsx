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
          <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Your Monthly Rhythm
          </h3>
          <p className="text-xs text-muted-foreground">
            The cash flow engine powering your life goals month over month.
          </p>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs text-muted-foreground font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>{savingsRate}% directed to goals</span>
        </span>
      </div>

      {/* 4 Metric Cards: 2x2 on mobile, 4x1 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Monthly Income */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-5 space-y-1.5 sm:space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
              Monthly Inflow
            </span>
            <div className="p-1 sm:p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-2xl font-bold font-mono text-foreground tracking-tight">
              {formatCurrency(monthlyIncome, currency)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
              Active income & consulting
            </p>
          </div>
        </div>

        {/* Monthly Commitments */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-5 space-y-1.5 sm:space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
              Mandatory Outflows
            </span>
            <div className="p-1 sm:p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-2xl font-bold font-mono text-foreground tracking-tight">
              {formatCurrency(monthlyCommitments, currency)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
              Living costs & commitments
            </p>
          </div>
        </div>

        {/* Available for Goals */}
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 sm:p-5 space-y-1.5 sm:space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-primary">
            <span className="text-[11px] sm:text-xs font-semibold text-primary truncate">
              Available for Goals
            </span>
            <div className="p-1 sm:p-1.5 rounded-lg bg-primary/15 text-primary shrink-0">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-2xl font-bold font-mono text-primary tracking-tight">
              {formatCurrency(availableForGoals, currency)}
            </div>
            <p className="text-[10px] sm:text-xs text-primary/80 mt-0.5 sm:mt-1 truncate">
              Dedicated goal cash flow
            </p>
          </div>
        </div>

        {/* Current Savings */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-5 space-y-1.5 sm:space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
              Liquid Reserves
            </span>
            <div className="p-1 sm:p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-2xl font-bold font-mono text-foreground tracking-tight">
              {formatCurrency(currentSavings, currency)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
              Checking & cash buffer
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
