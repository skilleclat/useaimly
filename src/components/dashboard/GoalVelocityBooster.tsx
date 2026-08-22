"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import {
  Zap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  Target,
  Flame,
} from "lucide-react";

interface BoosterChallenge {
  id: string;
  title: string;
  description: string;
  monthlyBoostAmount: number;
  daysAccelerated: number;
  isExecuted?: boolean;
}

const DEFAULT_BOOSTERS: BoosterChallenge[] = [
  {
    id: "boost-1",
    title: "Weekend Leisure Micro-Trim",
    description: "Reallocate KES 3,500/week from dining out into your primary goal destination.",
    monthlyBoostAmount: 14000,
    daysAccelerated: 38,
  },
  {
    id: "boost-2",
    title: "Side Retainer Surplus Allocation",
    description: "Direct 100% of freelance side-inflow surplus (KES 10,000/mo) into savings.",
    monthlyBoostAmount: 10000,
    daysAccelerated: 27,
  },
  {
    id: "boost-3",
    title: "Micro-Subscription Consolidation",
    description: "Cancel 2 unused digital tools and redirect KES 4,500/mo into goal reserves.",
    monthlyBoostAmount: 4500,
    daysAccelerated: 12,
  },
];

export function GoalVelocityBooster({
  goalTitle = "Start my business",
  currency = "KES",
}: {
  goalTitle?: string;
  currency?: CurrencyCode;
}) {
  const [boosters, setBoosters] = useState<BoosterChallenge[]>(DEFAULT_BOOSTERS);
  const [totalDaysSaved, setTotalDaysSaved] = useState(0);

  function handleExecuteBoost(id: string) {
    setBoosters((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          if (!b.isExecuted) {
            setTotalDaysSaved((d) => d + b.daysAccelerated);
          } else {
            setTotalDaysSaved((d) => Math.max(0, d - b.daysAccelerated));
          }
          return { ...b, isExecuted: !b.isExecuted };
        }
        return b;
      })
    );
  }

  return (
    <div className="rounded-3xl border border-emerald-500/30 bg-card p-6 sm:p-8 space-y-6 shadow-sm font-sans animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Rocket className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-extrabold text-foreground tracking-tight">
              Goal Velocity Accelerator &amp; Micro-Action Engine
            </h3>
            <span className="rounded-full bg-gradient-to-r from-emerald-500/20 to-primary/20 text-emerald-500 text-[10px] font-extrabold px-2.5 py-0.5 border border-emerald-500/30 uppercase tracking-wider">
              Timeline Fast-Track
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Execute real-time micro-actions to shave weeks and months off your arrival date for &ldquo;<strong>{goalTitle}</strong>&rdquo;.
          </p>
        </div>

        {/* Days Saved Counter Badge */}
        <div className="text-right shrink-0 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
          <span className="text-[10px] font-mono text-emerald-500 font-bold block uppercase tracking-wider">
            Total Timeline Accelerated
          </span>
          <span className="text-xl font-extrabold text-emerald-500 font-mono">
            -{totalDaysSaved} Days
          </span>
          <span className="text-[10px] text-muted-foreground font-mono block font-bold">
            {Math.round(totalDaysSaved / 30 * 10) / 10} Months Earlier Target Arrival
          </span>
        </div>
      </div>

      {/* User Guidance Banner */}
      <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground flex items-center gap-2.5">
        <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <p className="leading-relaxed">
          <strong>At a Glance</strong>: Click &ldquo;<strong>Execute Micro-Boost</strong>&rdquo; on any challenge below to instantly reallocate small monthly savings and watch your goal deadline pull forward!
        </p>
      </div>

      {/* Boosters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {boosters.map((b) => (
          <div
            key={b.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              b.isExecuted
                ? "border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-card shadow-sm ring-1 ring-emerald-500/20"
                : "border-border/80 bg-secondary/30 hover:border-border"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                  +{formatCurrency(b.monthlyBoostAmount, currency)}/mo
                </span>
                <span className="text-xs font-bold text-emerald-500 font-mono">
                  -{b.daysAccelerated} Days Shift
                </span>
              </div>

              <h4 className="text-xs font-bold text-foreground">{b.title}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{b.description}</p>
            </div>

            <button
              onClick={() => handleExecuteBoost(b.id)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                b.isExecuted
                  ? "bg-emerald-500 text-emerald-950 font-extrabold shadow-sm"
                  : "bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white hover:scale-[1.02] shadow-xs"
              }`}
            >
              {b.isExecuted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Boost Active (-{b.daysAccelerated} Days)</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Execute Micro-Boost</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {totalDaysSaved > 0 && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
            <span>
              Congratulations! Your active micro-boosts bring your target arrival for &ldquo;
              <strong>{goalTitle}</strong>&rdquo; forward by <strong>{totalDaysSaved} full days</strong>!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
