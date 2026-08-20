import React from "react";
import { cn } from "@/lib/utils/cn";

export interface LoadingStateProps {
  message?: string;
  variant?: "pulse" | "skeleton" | "inline";
  className?: string;
}

export function LoadingState({
  message = "Calculating trajectory...",
  variant = "pulse",
  className,
}: LoadingStateProps) {
  if (variant === "inline") {
    return (
      <div className={cn("inline-flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
        <span>{message}</span>
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4 rounded-3xl border border-border bg-card p-6", className)}>
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-secondary rounded-lg animate-pulse" />
          <div className="h-5 w-20 bg-secondary rounded-full animate-pulse" />
        </div>
        <div className="h-8 w-48 bg-secondary rounded-xl animate-pulse" />
        <div className="h-2 w-full bg-secondary rounded-full animate-pulse" />
      </div>
    );
  }

  // Trajectory Pulse variant
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card/60 p-8 flex flex-col items-center justify-center space-y-4 text-center",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 animate-spin border-t-primary" />
        <div className="absolute w-3 h-3 rounded-full bg-primary" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-editorial font-bold text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground font-mono">
          Evaluating deterministic timeline shifts
        </p>
      </div>
    </div>
  );
}
