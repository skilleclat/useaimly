import React from "react";
import { AIExplanationResult } from "@/lib/types/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Brain, Lightbulb, ShieldCheck, ArrowRight } from "lucide-react";

interface AiExplanationPanelProps {
  explanation: AIExplanationResult | null;
  isLoading: boolean;
  onGenerate: () => void;
}

export function AiExplanationPanel({
  explanation,
  isLoading,
  onGenerate,
}: AiExplanationPanelProps) {
  if (isLoading) {
    return (
      <Card className="border-emerald-500/30 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden">
        <div className="animate-pulse space-y-4 p-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20" />
            <div className="h-4 bg-slate-800 rounded w-1/3" />
          </div>
          <div className="h-6 bg-slate-800 rounded w-3/4" />
          <div className="h-20 bg-slate-800/60 rounded-2xl" />
        </div>
      </Card>
    );
  }

  if (!explanation) {
    return (
      <Card className="border-slate-800/80 bg-slate-900/40 p-6 text-center backdrop-blur-md">
        <div className="mx-auto w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200">
          Generate Natural Language Intelligence
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Useaimly synthesizes deterministic financial trajectories into plain English advice.
        </p>
        <button
          onClick={onGenerate}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-glow-emerald transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask Useaimly to Explain
        </button>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-500/30 bg-slate-900/90 backdrop-blur-2xl shadow-glow-emerald relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Brain className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
              Useaimly Decision Intelligence
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2.5 py-0.5 rounded-full border border-slate-700">
            Provider: {explanation.providerUsed}
          </span>
        </div>

        <CardTitle className="text-lg text-slate-100 font-bold mt-2">
          {explanation.headline}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 text-sm">
        {/* Core Direct Answer */}
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-2">
          <p className="text-slate-100 font-medium leading-relaxed">
            {explanation.directAnswer}
          </p>
          <p className="text-slate-300 leading-relaxed text-xs">
            {explanation.planAffordabilityVerdict}
          </p>
        </div>

        {/* Tradeoff & Recovery Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Opportunity Cost / Tradeoff</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {explanation.tradeoffAnalysis}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>To Keep Target Date</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {explanation.actionableRecommendation}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
