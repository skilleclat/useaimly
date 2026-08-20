import React from "react";
import { FinancialDecision, DecisionType } from "@/lib/types/decision";
import { MoneyAmount } from "./MoneyAmount";
import { cn } from "@/lib/utils/cn";
import { HelpCircle, ArrowRight, Tag, Zap } from "lucide-react";

export interface DecisionCardProps {
  decision: FinancialDecision;
  onSimulate?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function DecisionCard({
  decision,
  onSimulate,
  isLoading = false,
  className,
}: DecisionCardProps) {
  const typeLabels: Record<DecisionType, string> = {
    ONE_OFF_PURCHASE: "One-Off Purchase",
    RECURRING_EXPENSE: "Recurring Expense",
    INCOME_CHANGE: "Income Adjustment",
    WINDFALL: "Lump-Sum Windfall",
    DEBT_ACCELERATION: "Debt Acceleration",
    GOAL_CONTRIBUTION_CHANGE: "Goal Allocation Shift",
  };

  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-elevation-1 space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-secondary text-primary">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            {typeLabels[decision.type]}
          </span>
        </div>

        <MoneyAmount amount={decision.amount} currency={decision.currency} size="lg" intent="expense" />
      </div>

      <div>
        <h4 className="text-base font-bold font-editorial text-foreground">
          {decision.title}
        </h4>
        {decision.notes && (
          <p className="text-xs text-muted-foreground mt-0.5">{decision.notes}</p>
        )}
      </div>

      {onSimulate && (
        <button
          onClick={onSimulate}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-sm transition-all disabled:opacity-50"
        >
          <span>Calculate Impact on Destinations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
