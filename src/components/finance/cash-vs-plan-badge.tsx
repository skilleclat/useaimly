import React from "react";
import { PlanAffordabilityStatus } from "@/lib/types/decision";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

interface CashVsPlanBadgeProps {
  cashAffordable: boolean;
  planStatus: PlanAffordabilityStatus;
  delayMonths: number;
}

export function CashVsPlanBadge({
  cashAffordable,
  planStatus,
  delayMonths,
}: CashVsPlanBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Cash Affordability Status */}
      <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md bg-slate-900/80 border-slate-800">
        <span className="text-slate-400">Cash Today:</span>
        {cashAffordable ? (
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Affordable
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Deficit
          </span>
        )}
      </div>

      {/* Plan Affordability Status (The core Useaimly distinction) */}
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md ${
          delayMonths === 0
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : delayMonths <= 2
            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
            : "bg-rose-500/10 border-rose-500/30 text-rose-300"
        }`}
      >
        <span className="text-slate-400">Plan Impact:</span>
        {delayMonths === 0 ? (
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            On Track (0 Delay)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            +{delayMonths} Mo Delay
          </span>
        )}
      </div>
    </div>
  );
}
