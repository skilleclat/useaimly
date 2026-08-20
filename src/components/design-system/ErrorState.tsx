import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Trajectory Calculation Paused",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 text-center text-foreground flex flex-col items-center justify-center space-y-3 max-w-md mx-auto",
        className
      )}
    >
      <div className="w-10 h-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
        <AlertTriangle className="w-5 h-5" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold font-editorial text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate Path</span>
        </button>
      )}
    </div>
  );
}
