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
          <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Key Financial Insight
          </h3>
          <p className="text-xs text-muted-foreground">
            The primary observation governing your current trajectory.
          </p>
        </div>
      </div>

      {/* Clean Insight Highlight Card */}
      <div className="relative rounded-xl border border-primary/25 bg-primary/5 p-6 sm:p-8 shadow-xs overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Primary Trajectory Observation</span>
          </div>

          <blockquote className="text-lg sm:text-xl font-bold text-foreground leading-snug tracking-tight">
            &ldquo;At your current allocation of{" "}
            <span className="text-primary font-bold">
              {formatCurrency(monthlyFreeCashFlow, currency)} / month
            </span>
            , you will arrive at &ldquo;
            <span className="text-foreground font-bold">
              {goalTitle}
            </span>
            &rdquo; in <span className="text-primary font-bold">November 2027</span> — 1 month ahead of your target deadline.&rdquo;
          </blockquote>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your financial pace is healthy and stable. Any single purchase below{" "}
            <strong className="text-foreground font-semibold">
              {formatCurrency(42000, currency)}
            </strong>{" "}
            will not push your arrival past your December 2027 target date.
          </p>
        </div>
      </div>
    </section>
  );
}
