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

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Monthly Income */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium text-muted-foreground">
              Monthly Inflow
            </span>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(monthlyIncome, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active income & consulting
            </p>
          </div>
        </div>

        {/* Monthly Commitments */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium text-muted-foreground">
              Mandatory Outflows
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(monthlyCommitments, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Living costs & commitments
            </p>
          </div>
        </div>

        {/* Available for Goals */}
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-primary">
            <span className="text-xs font-semibold text-primary">
              Available for Goals
            </span>
            <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(availableForGoals, currency)}
            </div>
            <p className="text-xs text-primary/80 mt-1">
              Dedicated goal cash flow
            </p>
          </div>
        </div>

        {/* Current Savings */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium text-muted-foreground">
              Liquid Reserves
            </span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(currentSavings, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Checking & cash buffer
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
