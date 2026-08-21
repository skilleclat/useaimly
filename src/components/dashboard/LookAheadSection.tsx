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
      badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
      description: "Amortized monthly allowance is fully funded in reserves.",
    },
    {
      label: "Next Inflow Velocity",
      title: "Primary Tech Retainer & Salary",
      amount: 180000,
      timing: "Expected in 8 days (Aug 28)",
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
      badge: "Predictable",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      description: "Will replenish monthly free cash flow by +KES 68,000.",
    },
    {
      label: "Upcoming Goal Milestone",
      title: "50% Destination Threshold",
      amount: 250000,
      timing: "On track for May 2027",
      icon: <Flag className="w-4 h-4 text-teal-500" />,
      badge: "Milestone",
      badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
      description: "Crossing KES 250,000 halfway mark to 'Start my business'.",
    },
    {
      label: "Financial Risk Monitor",
      title: "Discretionary Creep Warning",
      amount: 15000,
      timing: "Active risk factor",
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
      badge: "Watchlist",
      badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
      description: "Unplanned monthly dining/subs above KES 15k delays arrival.",
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Foresight & Horizon
          </h3>
          <p className="text-xs text-muted-foreground">
            Clear visibility into upcoming commitments, inflows, and potential friction.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {foresightCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border/80 bg-card p-5 space-y-3 shadow-xs hover:border-primary/30 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {card.label}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground line-clamp-1">
                  {card.title}
                </h4>
                <div className="text-lg font-bold text-foreground mt-0.5">
                  {formatCurrency(card.amount, currency)}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {card.icon}
                <span>{card.timing}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-2.5 border-t border-border/50 leading-relaxed">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
