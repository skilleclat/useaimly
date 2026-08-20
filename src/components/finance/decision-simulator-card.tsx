import React from "react";
import { FinancialDecision, DecisionSimulationResult } from "@/lib/types/decision";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CashVsPlanBadge } from "./cash-vs-plan-badge";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";
import { Sparkles, HelpCircle, ArrowRight, DollarSign, RefreshCw, Zap } from "lucide-react";

interface DecisionSimulatorCardProps {
  decision: FinancialDecision;
  userQuery: string;
  simulationResult: DecisionSimulationResult;
  isExplaining: boolean;
  onQueryChange: (query: string) => void;
  onAmountChange: (amount: number) => void;
  onTypeChange: (type: FinancialDecision["type"]) => void;
  onTitleChange: (title: string) => void;
  onRunExplanation: () => void;
}

export function DecisionSimulatorCard({
  decision,
  userQuery,
  simulationResult,
  isExplaining,
  onQueryChange,
  onAmountChange,
  onTypeChange,
  onTitleChange,
  onRunExplanation,
}: DecisionSimulatorCardProps) {
  const primary = simulationResult.primaryGoalImpact;

  const quickPresets = [
    { label: "New Phone (KES 30k)", amount: 30000, title: "New Phone Purchase", type: "ONE_OFF_PURCHASE" as const },
    { label: "Weekend Trip (KES 45k)", amount: 45000, title: "Weekend Trip", type: "ONE_OFF_PURCHASE" as const },
    { label: "Gym & Stream Sub (KES 6k/mo)", amount: 6000, title: "Gym & Streaming", type: "RECURRING_EXPENSE" as const },
    { label: "Side Project Bonus (+KES 80k)", amount: 80000, title: "Consulting Bonus", type: "WINDFALL" as const },
  ];

  return (
    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-800/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Decision Intelligence Simulator
              </span>
              <CardTitle className="text-base text-slate-100 font-bold">
                What Are You Considering?
              </CardTitle>
            </div>
          </div>

          <CashVsPlanBadge
            cashAffordable={simulationResult.cashAffordable}
            planStatus={simulationResult.planAffordabilityStatus}
            delayMonths={primary.delayInMonths}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-4">
        {/* Decision Query & Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Natural Question or Decision Description</span>
            <span className="text-[11px] text-slate-500">Instant Deterministic Simulation</span>
          </label>
          <div className="relative">
            <Input
              value={userQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="e.g., Can I spend KES 30,000 on a new phone?"
              className="pr-10 text-slate-100 font-medium"
            />
            <HelpCircle className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5">
          {quickPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                onAmountChange(preset.amount);
                onTitleChange(preset.title);
                onTypeChange(preset.type);
                onQueryChange(`Can I spend ${formatCurrency(preset.amount, "KES")} on ${preset.title}?`);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-all ${
                decision.amount === preset.amount && decision.type === preset.type
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Amount & Type Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Amount (KES)
            </label>
            <div className="relative">
              <Input
                type="number"
                value={decision.amount}
                onChange={(e) => onAmountChange(Number(e.target.value))}
                className="font-mono text-base font-bold text-slate-100 pl-8"
              />
              <span className="absolute left-3 top-3 text-xs font-mono text-slate-500">
                KES
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Decision Category
            </label>
            <select
              value={decision.type}
              onChange={(e) => onTypeChange(e.target.value as any)}
              className="w-full h-11 rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="ONE_OFF_PURCHASE">One-Off Purchase</option>
              <option value="RECURRING_EXPENSE">Recurring Monthly Expense</option>
              <option value="WINDFALL">One-Time Income / Windfall</option>
              <option value="INCOME_CHANGE">Recurring Income Change</option>
            </select>
          </div>
        </div>

        {/* Deterministic Outcome Summary Box */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Deterministic Impact Summary
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="border-l-2 border-emerald-500/60 pl-2.5">
              <div className="text-slate-400">Liquid Cash Remaining</div>
              <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                {formatCurrency(simulationResult.availableCashAfter, "KES")}
              </div>
              <div className="text-[11px] text-slate-500">
                from {formatCurrency(simulationResult.availableCashBefore, "KES")}
              </div>
            </div>

            <div className="border-l-2 border-amber-500/60 pl-2.5">
              <div className="text-slate-400">Timeline Impact</div>
              <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
                {primary.delayInMonths > 0 ? `+${primary.delayInMonths} Mo Delay` : "0 Mo Delay"}
              </div>
              <div className="text-[11px] text-slate-500">
                {formatMonthYear(primary.baselineCompletionDate)} → {formatMonthYear(primary.simulatedCompletionDate)}
              </div>
            </div>

            <div className="border-l-2 border-cyan-500/60 pl-2.5">
              <div className="text-slate-400">To Keep Original Date</div>
              <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                +{formatCurrency(primary.additionalMonthlySavingsRequired, "KES")}/mo
              </div>
              <div className="text-[11px] text-slate-500">
                extra savings needed
              </div>
            </div>
          </div>
        </div>

        {/* Action Button to explain */}
        <Button
          onClick={onRunExplanation}
          disabled={isExplaining}
          variant="Useaimly"
          className="w-full h-12 text-sm font-bold"
        >
          {isExplaining ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Synthesizing Decision Intelligence...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Explain Consequences with Useaimly AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
