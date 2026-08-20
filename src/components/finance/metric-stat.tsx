import React from "react";
import { cn } from "@/lib/utils/cn";

interface MetricStatProps {
  label: string;
  value: string;
  subValue?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "warning";
  icon?: React.ReactNode;
  className?: string;
}

export function MetricStat({
  label,
  value,
  subValue,
  change,
  changeType = "neutral",
  icon,
  className,
}: MetricStatProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-200 hover:border-slate-700/80",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="mt-2 text-xl font-bold font-mono text-slate-100">{value}</div>

      {(subValue || change) && (
        <div className="mt-1 flex items-center justify-between text-xs">
          {subValue && <span className="text-slate-500">{subValue}</span>}
          {change && (
            <span
              className={cn(
                "font-semibold font-mono",
                changeType === "positive" && "text-emerald-400",
                changeType === "negative" && "text-rose-400",
                changeType === "warning" && "text-amber-400",
                changeType === "neutral" && "text-slate-400"
              )}
            >
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
