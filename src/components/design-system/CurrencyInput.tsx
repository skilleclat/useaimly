import React from "react";
import { CurrencyCode } from "@/lib/types/finance";
import { cn } from "@/lib/utils/cn";

export interface CurrencyInputProps {
  amount: number;
  currency: CurrencyCode;
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
  currencies?: CurrencyCode[];
  label?: string;
  className?: string;
}

export function CurrencyInput({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  currencies = ["KES", "USD", "EUR", "GBP", "UGX", "TZS", "RWF"],
  label,
  className,
}: CurrencyInputProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-xs font-semibold text-muted-foreground block">
          {label}
        </label>
      )}

      <div className="flex rounded-2xl border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden transition-all">
        {/* Currency selector */}
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
          className="border-r border-border bg-secondary/50 px-3 text-xs font-mono font-bold text-foreground focus:outline-none cursor-pointer"
        >
          {currencies.map((c) => (
            <option key={c} value={c} className="bg-popover text-popover-foreground">
              {c}
            </option>
          ))}
        </select>

        {/* Amount field */}
        <input
          type="number"
          value={amount || ""}
          onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent px-3 py-2.5 text-base font-bold font-financial text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="0"
        />
      </div>
    </div>
  );
}
