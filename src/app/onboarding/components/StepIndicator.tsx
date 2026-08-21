import React from "react";
import { Check, Sparkles } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const STEP_LABELS = [
  "Destination",
  "Incomes",
  "Expenses",
  "Debts",
  "Reserves",
  "Commitments",
  "Trajectory",
];

export function StepIndicator({ currentStep, totalSteps, onStepClick }: StepIndicatorProps) {
  return (
    <div className="w-full space-y-3 py-2">
      {/* Mobile & Tablet Segmented Story Progress Bar */}
      <div className="flex items-center gap-1.5 w-full">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <button
              key={stepNum}
              type="button"
              disabled={stepNum > currentStep}
              onClick={() => onStepClick && isCompleted && onStepClick(stepNum)}
              title={`Step ${stepNum}: ${STEP_LABELS[i]}`}
              className={`h-2 flex-1 rounded-full transition-all duration-300 relative overflow-hidden ${
                isCompleted
                  ? "bg-primary cursor-pointer hover:opacity-90 shadow-xs"
                  : isActive
                  ? "bg-primary ring-2 ring-primary/30 shadow-md shadow-orange-500/20"
                  : "bg-secondary/80 border border-border/60 cursor-not-allowed"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Step Info Row */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider border border-primary/20">
            STEP {currentStep} OF {totalSteps}
          </span>
          <span className="text-foreground font-bold text-xs truncate max-w-[150px] sm:max-w-none">
            {STEP_LABELS[currentStep - 1]}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Interactive Onboarding</span>
        </div>
      </div>
    </div>
  );
}
