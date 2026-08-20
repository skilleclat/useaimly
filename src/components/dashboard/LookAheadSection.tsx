"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { Calendar, TrendingUp, Flag, AlertTriangle, ArrowRight } from "lucide-react";

interface LookAheadSectionProps {
  currency: CurrencyCode;
}

export function LookAheadSection({ currency = "KES" }: LookAheadSectionProps) {
  const foresightCards = [
    {
      label: "Next Major Commitment",
      title: "Comprehensive Motor Insurance",
      amount: 45000,
      timing: "Due in 45 days (Oct 5)",
      icon: <Calendar className="w-4 h-4 text-amber-500" />,
      badge: "Scheduled",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      description: "Amortized monthly allowance is fully funded in reserves.",
    },
    {
      label: "Next Inflow Velocity",
      title: "Primary Tech Retainer & Salary",
      amount: 180000,
      timing: "Expected in 8 days (Aug 28)",
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
      badge: "Predictable",
      badgeColor: "bg-primary/10 text-primary",
      description: "Will replenish monthly free cash flow by +KES 68,000.",
    },
    {
      label: "Upcoming Goal Milestone",
      title: "50% Destination Threshold",
      amount: 250000,
      timing: "On track for May 2027",
      icon: <Flag className="w-4 h-4 text-teal-500" />,
      badge: "Milestone",
      badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
      description: "Crossing KES 250,000 halfway mark to 'Start my business'.",
    },
    {
      label: "Financial Risk Monitor",
      title: "Discretionary Creep Warning",
      amount: 15000,
      timing: "Active risk factor",
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
      badge: "Watchlist",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      description: "Unplanned monthly dining/subs above KES 15k delays arrival.",
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-editorial text-foreground tracking-tight">
            Look ahead
          </h3>
          <p className="text-xs text-muted-foreground">
            Clear visibility into upcoming commitments, inflows, and risks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {foresightCards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-border bg-card p-5 space-y-3 shadow-elevation-1 hover:border-primary/30 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {card.label}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold font-editorial text-foreground line-clamp-1">
                  {card.title}
                </h4>
                <div className="text-lg font-bold font-financial text-foreground mt-0.5">
                  {formatCurrency(card.amount, currency)}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {card.icon}
                <span>{card.timing}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground pt-2 border-t border-border/60 leading-relaxed">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
