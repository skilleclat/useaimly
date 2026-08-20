"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface PrimeInsightSectionProps {
  goalTitle: string;
  monthlyFreeCashFlow: number;
  currency: CurrencyCode;
}

export function PrimeInsightSection({
  goalTitle = "Start my business",
  monthlyFreeCashFlow = 68000,
  currency = "KES",
}: PrimeInsightSectionProps) {
  return (
    <section id="insights" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-editorial text-foreground tracking-tight">
            One thing to know
          </h3>
          <p className="text-xs text-muted-foreground">
            The single most consequential insight governing your current trajectory.
          </p>
        </div>
      </div>

      {/* Spacious Editorial Highlight Card */}
      <div className="relative rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10 shadow-elevation-1 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prime Trajectory Insight</span>
          </div>

          <blockquote className="text-lg sm:text-2xl font-bold font-editorial text-foreground leading-snug tracking-tight">
            &ldquo;At your current allocation of{" "}
            <span className="text-primary font-financial">
              {formatCurrency(monthlyFreeCashFlow, currency)}/mo
            </span>
            , you will arrive at{" "}
            <span className="text-foreground underline decoration-primary/40 underline-offset-4">
              {goalTitle}
            </span>{" "}
            in <span className="text-primary font-bold">November 2027</span> — 1 month ahead of your target deadline.&rdquo;
          </blockquote>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your financial velocity is stable. Any single discretionary expense below{" "}
            <strong className="text-foreground font-financial">
              {formatCurrency(42000, currency)}
            </strong>{" "}
            will not delay your arrival past your December 2027 deadline. Before making an expenditure above this threshold, evaluate it with Useaimly first.
          </p>
        </div>
      </div>
    </section>
  );
}
