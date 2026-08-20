import React from "react";
import { formatMonthYear } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { CheckCircle2, Circle, Clock, Target } from "lucide-react";

export interface TimelineStep {
  id: string;
  title: string;
  date: string;
  amount?: string;
  status: "completed" | "current" | "upcoming" | "shifted";
  description?: string;
}

export interface GoalTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function GoalTimeline({ steps, className }: GoalTimelineProps) {
  return (
    <div className={cn("relative space-y-6 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border", className)}>
      {steps.map((step, idx) => {
        const isCurrent = step.status === "current";
        const isCompleted = step.status === "completed";
        const isShifted = step.status === "shifted";

        return (
          <div key={step.id || idx} className="relative group">
            {/* Timeline node icon */}
            <div
              className={cn(
                "absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background ring-4 ring-background transition-colors",
                isCompleted && "text-primary",
                isCurrent && "text-primary ring-primary/20",
                isShifted && "text-amber-500 ring-amber-500/20",
                step.status === "upcoming" && "text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 fill-primary text-background" />
              ) : isShifted ? (
                <Clock className="w-4 h-4 text-amber-500" />
              ) : isCurrent ? (
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-border" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-baseline justify-between text-xs">
                <span
                  className={cn(
                    "font-bold font-editorial",
                    isCurrent ? "text-primary text-sm" : isShifted ? "text-amber-600 dark:text-amber-300" : "text-foreground"
                  )}
                >
                  {step.title}
                </span>
                <span className="font-mono text-muted-foreground font-medium text-[11px]">
                  {formatMonthYear(step.date)}
                </span>
              </div>

              {step.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              )}

              {step.amount && (
                <div className="font-financial font-semibold text-xs text-foreground pt-0.5">
                  {step.amount}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
