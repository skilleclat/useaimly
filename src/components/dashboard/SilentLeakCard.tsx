"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import {
  Flame,
  Sparkles,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Scissors,
} from "lucide-react";

interface LeakItem {
  id: string;
  name: string;
  category: string;
  monthlyAmount: number;
  goalDaysLost: number;
  isReclaimed?: boolean;
}

const DEFAULT_LEAKS: LeakItem[] = [
  {
    id: "leak-1",
    name: "Unused Digital Subscriptions & Cloud Add-ons",
    category: "Subscriptions",
    monthlyAmount: 4000,
    goalDaysLost: 32,
  },
  {
    id: "leak-2",
    name: "Excess Dining Out & Impulse Food Delivery",
    category: "Discretionary",
    monthlyAmount: 12000,
    goalDaysLost: 85,
  },
  {
    id: "leak-3",
    name: "Bank Transaction Fees & Out-of-Network Cash Out",
    category: "Banking Fees",
    monthlyAmount: 2500,
    goalDaysLost: 18,
  },
];

export function SilentLeakCard({ currency = "KES" }: { currency?: CurrencyCode }) {
  const [leaks, setLeaks] = useState<LeakItem[]>(DEFAULT_LEAKS);
  const [reclaimedTotal, setReclaimedTotal] = useState(0);

  function handleReclaim(id: string) {
    setLeaks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (!item.isReclaimed) {
            setReclaimedTotal((r) => r + item.monthlyAmount);
          } else {
            setReclaimedTotal((r) => Math.max(0, r - item.monthlyAmount));
          }
          return { ...item, isReclaimed: !item.isReclaimed };
        }
        return item;
      })
    );
  }

  const activeLeaks = leaks.filter((l) => !l.isReclaimed);
  const totalMonthlyLeak = activeLeaks.reduce((sum, l) => sum + l.monthlyAmount, 0);
  const totalAnnualLeak = totalMonthlyLeak * 12;
  const totalGoalDaysLost = activeLeaks.reduce((sum, l) => sum + l.goalDaysLost, 0);

  return (
    <div className="rounded-3xl border border-rose-500/30 bg-card p-6 sm:p-8 space-y-6 shadow-sm font-sans animate-fadeIn">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Scissors className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-extrabold text-foreground tracking-tight">
              Silent Leak &amp; Recurring Drag Exposer
            </h3>
            <span className="rounded-full bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-500 text-[10px] font-extrabold px-2.5 py-0.5 border border-rose-500/30 uppercase tracking-wider">
              Game Changer #3
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Uncover small recurring outlays and micro-leaks translated into actual lifetime days lost on your life destinations.
          </p>
        </div>

        {/* Total Annual Leak Metric */}
        <div className="text-right shrink-0">
          <span className="text-[11px] font-mono text-rose-500 font-bold block uppercase tracking-wider">
            Total Annual Leak Drag
          </span>
          <span className="text-xl font-extrabold text-rose-500 font-mono">
            {formatCurrency(totalAnnualLeak, currency)} / yr
          </span>
          <span className="text-[10px] text-muted-foreground font-mono block">
            -{totalGoalDaysLost} Days Destination Shift
          </span>
        </div>
      </div>

      {/* Leaks List */}
      <div className="space-y-3">
        {leaks.map((leak) => (
          <div
            key={leak.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              leak.isReclaimed
                ? "border-emerald-500/30 bg-emerald-500/5 opacity-75"
                : "border-border/80 bg-secondary/30"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">{leak.name}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-md bg-secondary border border-border/60 text-muted-foreground">
                  {leak.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {formatCurrency(leak.monthlyAmount, currency)}/mo • Forfeits{" "}
                <strong className="text-rose-500">-{leak.goalDaysLost} Days</strong> of goal timeline
              </p>
            </div>

            <button
              onClick={() => handleReclaim(leak.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                leak.isReclaimed
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white hover:scale-105 shadow-xs"
              }`}
            >
              {leak.isReclaimed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Reclaimed (+{leak.goalDaysLost} Days Back)</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Click Reclaim &amp; Boost Goal</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Reclaimed Summary Footer */}
      {reclaimedTotal > 0 && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
            <span>
              You have reclaimed <strong>{formatCurrency(reclaimedTotal, currency)}/month</strong>! That adds{" "}
              <strong>+{formatCurrency(reclaimedTotal * 12, currency)}/year</strong> back to your free cash flow.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
