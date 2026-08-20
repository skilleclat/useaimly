import React from "react";
import { cn } from "@/lib/utils/cn";
import { TrajectoryState } from "./FinancialStatus";

export interface GoalProgressProps {
  currentAmount: number;
  targetAmount: number;
  trajectoryState?: TrajectoryState | string;
  showLabels?: boolean;
  milestones?: { percent: number; label?: string }[];
  className?: string;
}

export function GoalProgress({
  currentAmount,
  targetAmount,
  trajectoryState = "ON_TRACK",
  showLabels = true,
  milestones = [
    { percent: 25, label: "Q1" },
    { percent: 50, label: "Halfway" },
    { percent: 75, label: "Final Stretch" },
  ],
  className,
}: GoalProgressProps) {
  const percent = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 100;

  const trajectoryColors: Record<string, string> = {
    ON_TRACK: "bg-primary",
    SAFE: "bg-emerald-600 dark:bg-emerald-500",
    MANAGEABLE: "bg-amber-600 dark:bg-amber-500",
    HIGH_IMPACT: "bg-orange-600 dark:bg-orange-500",
    AT_RISK: "bg-amber-600 dark:bg-amber-500",
    OFF_TRACK: "bg-Useaimly-clay",
    AHEAD: "bg-teal-600 dark:bg-teal-400",
    COMPLETED: "bg-primary",
    OVERDUE: "bg-destructive",
  };

  const activeColor = trajectoryColors[trajectoryState] || "bg-primary";

  return (
    <div className={cn("w-full space-y-2", className)}>
      {showLabels && (
        <div className="flex justify-between items-baseline text-xs">
          <span className="text-muted-foreground font-medium">Trajectory Progress</span>
          <span className="font-financial font-bold text-foreground">{percent}%</span>
        </div>
      )}

      {/* Progress Track with hairline architectural ticks */}
      <div className="relative h-2.5 w-full rounded-full bg-secondary overflow-hidden">
        {/* Fill Indicator */}
        <div
          className={cn("h-full transition-all duration-700 ease-out rounded-full", activeColor)}
          style={{ width: `${percent}%` }}
        />

        {/* Milestone Marks */}
        {milestones.map((m) => (
          <div
            key={m.percent}
            className="absolute top-0 bottom-0 w-[1.5px] bg-background/60"
            style={{ left: `${m.percent}%` }}
          />
        ))}
      </div>

      {milestones.length > 0 && showLabels && (
        <div className="relative w-full text-[10px] text-muted-foreground font-mono">
          <div className="flex justify-between">
            <span>0%</span>
            <span>Target (100%)</span>
          </div>
        </div>
      )}
    </div>
  );
}
