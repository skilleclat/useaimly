"use client";

import React, { useState } from "react";
import { CurrencyCode } from "@/lib/types/finance";
import { cn } from "@/lib/utils/cn";

export interface MoneyInputProps {
  value: number;
  onChange: (val: number) => void;
  currency?: CurrencyCode;
  label?: string;
  stepPresets?: number[];
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function MoneyInput({
  value,
  onChange,
  currency = "KES",
  label,
  stepPresets = [5000, 10000, 25000, 50000],
  min = 0,
  max,
  disabled = false,
  className,
}: MoneyInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const formattedDisplay = isFocused
    ? value ? String(value) : ""
    : value ? value.toLocaleString() : "";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const parsed = parseInt(raw, 10);
    const finalVal = isNaN(parsed) ? 0 : Math.max(min, max ? Math.min(max, parsed) : parsed);
    onChange(finalVal);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-xs font-semibold text-muted-foreground block tracking-tight">
          {label}
        </label>
      )}

      {/* Input box */}
      <div
        className={cn(
          "relative flex items-center rounded-2xl border bg-card/90 px-4 py-3 shadow-xs transition-all",
          isFocused
            ? "border-primary ring-4 ring-primary/15 bg-background"
            : "border-border/80 hover:border-primary/40"
        )}
      >
        <span className="pr-2 text-xs font-mono font-bold text-primary select-none shrink-0">
          {currency}
        </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formattedDisplay}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-full bg-transparent text-base sm:text-lg font-bold font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 min-h-[28px]"
          placeholder="0"
        />
      </div>

      {/* Quick Denomination Step Chips (Horizontal Scrollable Touch Bar) */}
      {stepPresets && stepPresets.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
          {stepPresets.map((step) => {
            const isSelected = value === step;
            const stepLabel = step >= 1000000 
              ? `${(step / 1000000).toFixed(0)}M` 
              : step >= 1000 
              ? `${(step / 1000).toFixed(0)}k` 
              : step;

            return (
              <button
                key={step}
                type="button"
                onClick={() => onChange(step)}
                disabled={disabled}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-mono font-semibold border transition-all shrink-0 cursor-pointer min-h-[36px]",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground font-bold shadow-sm"
                    : "border-border/80 bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                +{currency} {stepLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
