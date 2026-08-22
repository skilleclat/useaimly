"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import {
  ShoppingBag,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";

interface OpportunityCostMatrixProps {
  decisionTitle: string;
  amount: number;
  currency?: CurrencyCode;
  goalTitle?: string;
  delayInDays?: number;
  monthlyFreeCashFlow?: number;
  currentLiquidSavings?: number;
  monthlyGoalContribution?: number;
}

export function OpportunityCostMatrix({
  decisionTitle,
  amount,
  currency = "KES",
  goalTitle = "Start my business",
  delayInDays = 45,
  monthlyFreeCashFlow = 69250,
  currentLiquidSavings = 240000,
  monthlyGoalContribution = 45000,
}: OpportunityCostMatrixProps) {
  const formattedAmount = formatCurrency(amount, currency);

  // Calculations for trade-off alternatives
  const goalAccelerationDays = Math.round((amount / (monthlyGoalContribution || 45000)) * 30);
  const compoundYield3Years = Math.round(amount * (Math.pow(1.085, 3) - 1));
  const runwayExtensionMonths = (amount / 97000).toFixed(1);

  return (
    <div className="rounded-3xl border border-primary/30 bg-card p-6 sm:p-8 space-y-6 shadow-sm font-sans animate-fadeIn">
      {/* Matrix Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-extrabold text-foreground tracking-tight">
              The Opportunity Cost Matrix
            </h3>
            <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-primary/20 text-primary text-[10px] font-extrabold px-2.5 py-0.5 border border-primary/30 uppercase tracking-wider">
              Game Changer #1
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Compare executing <strong className="text-foreground">{decisionTitle} ({formattedAmount})</strong> against 3 high-impact wealth-building choices.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-mono text-muted-foreground block">Evaluated Capital</span>
          <span className="text-sm font-extrabold text-foreground font-mono">{formattedAmount}</span>
        </div>
      </div>

      {/* 4-Option Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OPTION A: Current Purchase */}
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-500/5 to-card p-5 space-y-4 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 uppercase">
                Option A • Proposed Outflow
              </span>
              <ShoppingBag className="w-4 h-4 text-rose-500" />
            </div>

            <div>
              <h4 className="text-xs font-bold text-foreground">{decisionTitle}</h4>
              <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                -{formattedAmount}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/50 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Goal Impact:</span>
                <span className="font-bold text-rose-500 font-mono">
                  {delayInDays === 0 ? "0 Days Shift" : `+${delayInDays} Days Delay`}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Destination:</span>
                <span className="font-semibold text-foreground truncate max-w-[110px]">{goalTitle}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground bg-secondary/50 p-2.5 rounded-xl border border-border/60">
            Immediate consumption; capital leaves your balance sheet permanently.
          </div>
        </div>

        {/* OPTION B: Reinvest in Primary Goal */}
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-card p-5 space-y-4 flex flex-col justify-between ring-1 ring-emerald-500/20 relative">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase">
                Option B • Goal Accelerator
              </span>
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>

            <div>
              <h4 className="text-xs font-bold text-foreground">Inject into &quot;{goalTitle}&quot;</h4>
              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                -{goalAccelerationDays} Days Off Timeline
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/50 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Arrival Fast-Track:</span>
                <span className="font-bold text-emerald-500 font-mono">-{goalAccelerationDays} Days</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Capital Added:</span>
                <span className="font-bold text-foreground font-mono">+{formattedAmount}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 font-medium">
            🚀 Accelerates your target freedom deadline by over 1.5 months!
          </div>
        </div>

        {/* OPTION C: Compound Wealth Yield */}
        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-500/5 to-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase">
                Option C • Compound Growth
              </span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>

            <div>
              <h4 className="text-xs font-bold text-foreground">3-Year Investment Yield</h4>
              <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                +{formatCurrency(compoundYield3Years, currency)} Gain
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/50 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Annual Return:</span>
                <span className="font-bold text-blue-500 font-mono">8.5% p.a.</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Total 3Yr Value:</span>
                <span className="font-bold text-foreground font-mono">
                  {formatCurrency(amount + compoundYield3Years, currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground bg-secondary/50 p-2.5 rounded-xl border border-border/60">
            Passively compounds into extra wealth without additional effort.
          </div>
        </div>

        {/* OPTION D: Living Buffer Shield */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase">
                Option D • Buffer Shield
              </span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>

            <div>
              <h4 className="text-xs font-bold text-foreground">Reserve Cushion Lock</h4>
              <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                +{runwayExtensionMonths} Mo. Runway
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/50 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Living Cushion:</span>
                <span className="font-bold text-amber-500 font-mono">+{runwayExtensionMonths} Months</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Liquidity Status:</span>
                <span className="font-bold text-foreground">Fortified</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground bg-secondary/50 p-2.5 rounded-xl border border-border/60">
            Protects your peace of mind against unexpected life shocks.
          </div>
        </div>
      </div>
    </div>
  );
}
