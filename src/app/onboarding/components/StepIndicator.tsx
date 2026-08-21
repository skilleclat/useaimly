import React from "react";
import { Check } from "lucide-react";

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
    <div className="w-full py-4 space-y-3">
      {/* Mobile step label */}
      <div className="flex items-center justify-between sm:hidden text-xs">
        <span className="text-primary font-semibold">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-foreground font-bold">
          {STEP_LABELS[currentStep - 1]}
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative flex items-center justify-between">
        {/* Continuous background bar */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-border/80 z-0" />
        
        {/* Filled active bar */}
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-primary transition-all duration-300 z-0"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {/* Step Nodes */}
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
              className={`relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border text-xs font-semibold transition-all ${
                isCompleted
                  ? "border-primary bg-primary text-primary-foreground cursor-pointer hover:opacity-90"
                  : isActive
                  ? "border-primary bg-card text-primary ring-4 ring-primary/15 font-bold"
                  : "border-border/80 bg-card text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
            </button>
          );
        })}
      </div>

      {/* Desktop Labels */}
      <div className="hidden sm:grid grid-cols-7 gap-1 text-center text-[11px]">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div
              key={label}
              className={`truncate font-medium transition-colors ${
                isActive
                  ? "text-primary font-bold"
                  : isCompleted
                  ? "text-foreground"
                  : "text-muted-foreground/70"
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
