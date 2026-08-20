import React from "react";
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
    onChange(isNaN(parsed) ? 0 : Math.max(min, max ? Math.min(max, parsed) : parsed));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-xs font-semibold text-muted-foreground block">
          {label}
        </label>
      )}

      {/* Input box */}
      <div className="relative flex items-center rounded-2xl border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <span className="pl-4 pr-1 text-xs font-mono font-bold text-muted-foreground select-none">
          {currency}
        </span>
        <input
          type="number"
          value={value || ""}
          onChange={handleInputChange}
          disabled={disabled}
          min={min}
          max={max}
          className="w-full bg-transparent px-2 py-2.5 text-base font-bold font-financial text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          placeholder="0"
        />
      </div>

      {/* Quick Denomination Step Chips */}
      {stepPresets && stepPresets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {stepPresets.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              disabled={disabled}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-financial font-semibold border transition-all",
                value === step
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              +{currency} {step >= 1000 ? `${(step / 1000).toFixed(0)}k` : step}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
