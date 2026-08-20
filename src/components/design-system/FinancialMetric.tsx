import React from "react";
import { cn } from "@/lib/utils/cn";

export interface FinancialMetricProps {
  label: string;
  value: React.ReactNode;
  subValue?: string;
  delta?: string;
  deltaType?: "positive" | "negative" | "warning" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function FinancialMetric({
  label,
  value,
  subValue,
  delta,
  deltaType = "neutral",
  icon,
  className,
}: FinancialMetricProps) {
  const deltaColors = {
    positive: "text-Useaimly-income",
    negative: "text-Useaimly-expense",
    warning: "text-amber-600 dark:text-amber-300",
    neutral: "text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-elevation-1 space-y-1.5 transition-all duration-200 hover:border-foreground/20",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>

      <div className="text-xl font-bold font-financial text-foreground tracking-tight">
        {value}
      </div>

      {(subValue || delta) && (
        <div className="flex items-baseline justify-between text-xs pt-0.5">
          {subValue && <span className="text-muted-foreground text-[11px]">{subValue}</span>}
          {delta && (
            <span className={cn("font-financial font-semibold text-[11px]", deltaColors[deltaType])}>
              {delta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
