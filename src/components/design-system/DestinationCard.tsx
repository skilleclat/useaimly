import React from "react";
import { FinancialGoal } from "@/lib/types/goal";
import { MoneyAmount } from "./MoneyAmount";
import { FinancialStatus, TrajectoryState } from "./FinancialStatus";
import { GoalProgress } from "./GoalProgress";
import { formatMonthYear } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { Compass, Calendar, ArrowUpRight } from "lucide-react";

export interface DestinationCardProps {
  goal: FinancialGoal;
  trajectoryState?: TrajectoryState;
  monthlyAllocation?: number;
  projectedDate?: string;
  onSelect?: () => void;
  className?: string;
}

export function DestinationCard({
  goal,
  trajectoryState = "ON_TRACK",
  monthlyAllocation,
  projectedDate,
  onSelect,
  className,
}: DestinationCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative rounded-3xl border border-border bg-card p-5 sm:p-6 text-card-foreground shadow-elevation-1 transition-all duration-300 hover:border-foreground/20 hover:shadow-elevation-2 cursor-pointer overflow-hidden",
        className
      )}
    >
      {/* Subtle organic corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none transition-opacity group-hover:opacity-100" />

      <div className="flex flex-col space-y-4 relative z-10">
        {/* Top bar: Category + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-secondary text-primary">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
              {goal.category}
            </span>
          </div>

          <FinancialStatus status={trajectoryState} variant="badge" />
        </div>

        {/* Title and Destination Target */}
        <div>
          <h3 className="text-lg font-bold font-editorial tracking-tight text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
            <span>{goal.title}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
          </h3>
          {goal.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {goal.description}
            </p>
          )}
        </div>

        {/* Numbers Row */}
        <div className="flex items-baseline justify-between border-y border-border/60 py-3">
          <div>
            <span className="text-[11px] text-muted-foreground block">Current Capital</span>
            <MoneyAmount amount={goal.currentAmount} currency={goal.currency} size="lg" intent="goal" />
          </div>

          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block">Target Destination</span>
            <MoneyAmount amount={goal.targetAmount} currency={goal.currency} size="lg" />
          </div>
        </div>

        {/* Progress Tracker */}
        <GoalProgress
          currentAmount={goal.currentAmount}
          targetAmount={goal.targetAmount}
          trajectoryState={trajectoryState}
        />

        {/* Timeline Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Target: <strong className="text-foreground">{formatMonthYear(goal.targetDate)}</strong></span>
          </div>

          {monthlyAllocation && monthlyAllocation > 0 && (
            <span className="font-financial font-medium">
              +{goal.currency} {monthlyAllocation.toLocaleString()}/mo
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
