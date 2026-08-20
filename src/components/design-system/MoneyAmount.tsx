import React from "react";
import { CurrencyCode } from "@/lib/types/finance";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

export interface MoneyAmountProps {
  amount: number;
  currency?: CurrencyCode;
  intent?: "neutral" | "income" | "expense" | "savings" | "debt" | "goal";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "display";
  compact?: boolean;
  showDecimals?: boolean;
  showSign?: boolean;
  className?: string;
}

export function MoneyAmount({
  amount,
  currency = "KES",
  intent = "neutral",
  size = "md",
  compact = false,
  showDecimals = false,
  showSign = false,
  className,
}: MoneyAmountProps) {
  const formatted = formatCurrency(Math.abs(amount), currency, {
    compact,
    showDecimals,
  });

  const sign = showSign && amount !== 0 ? (amount > 0 ? "+" : "-") : "";

  const sizeClasses = {
    xs: "text-xs font-semibold",
    sm: "text-sm font-semibold",
    md: "text-base font-bold",
    lg: "text-xl font-bold tracking-tight",
    xl: "text-2xl font-bold tracking-tight",
    display: "text-3xl sm:text-4xl font-extrabold tracking-tight",
  };

  const intentClasses = {
    neutral: "text-foreground",
    income: "text-Useaimly-income",
    expense: "text-Useaimly-expense",
    savings: "text-Useaimly-savings",
    debt: "text-Useaimly-debt",
    goal: "text-Useaimly-goal",
  };

  return (
    <span
      className={cn(
        "font-financial inline-flex items-baseline gap-0.5",
        sizeClasses[size],
        intentClasses[intent],
        className
      )}
    >
      {sign && <span className="mr-0.5 opacity-80">{sign}</span>}
      <span>{formatted}</span>
    </span>
  );
}
