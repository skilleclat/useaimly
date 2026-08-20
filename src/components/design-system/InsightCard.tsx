import React from "react";
import { Sparkles, Brain, Lightbulb, Compass } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface InsightCardProps {
  title: string;
  directVerdict: string;
  planExplanation: string;
  tradeoffNarrative?: string;
  recoveryAction?: string;
  source?: "deterministic" | "ai-synthesis";
  className?: string;
}

export function InsightCard({
  title,
  directVerdict,
  planExplanation,
  tradeoffNarrative,
  recoveryAction,
  source = "deterministic",
  className,
}: InsightCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-primary/25 bg-card p-6 text-card-foreground shadow-elevation-1 space-y-4 relative overflow-hidden",
        className
      )}
    >
      {/* Subtle organic warmth */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Brain className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-primary">
            Decision Intelligence Insight
          </span>
        </div>

        <span className="text-[11px] font-mono text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border">
          {source === "ai-synthesis" ? "Useaimly Synthesis" : "Deterministic Engine"}
        </span>
      </div>

      <div>
        <h4 className="text-lg font-bold font-editorial text-foreground leading-snug">
          {title}
        </h4>
      </div>

      {/* Core Verdict Statement */}
      <div className="rounded-2xl border border-border bg-secondary/50 p-4 space-y-1.5">
        <p className="text-sm font-semibold text-foreground leading-relaxed">
          {directVerdict}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
          {planExplanation}
        </p>
      </div>

      {/* Tradeoff & Recovery Pillars */}
      {(tradeoffNarrative || recoveryAction) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {tradeoffNarrative && (
            <div className="rounded-2xl border border-border bg-card p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-muted-foreground">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Opportunity Cost</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tradeoffNarrative}
              </p>
            </div>
          )}

          {recoveryAction && (
            <div className="rounded-2xl border border-border bg-card p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-primary">
                <Compass className="w-3.5 h-3.5" />
                <span>To Stay On Plan</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {recoveryAction}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
