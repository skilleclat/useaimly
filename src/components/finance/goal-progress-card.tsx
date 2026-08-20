import React from "react";
import { FinancialGoal } from "@/lib/types/goal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";
import { Target, Calendar, Sparkles, TrendingUp } from "lucide-react";

interface GoalProgressCardProps {
  goal: FinancialGoal;
  baselineCompletionDate: string;
  simulatedCompletionDate?: string;
  delayMonths?: number;
}

export function GoalProgressCard({
  goal,
  baselineCompletionDate,
  simulatedCompletionDate,
  delayMonths = 0,
}: GoalProgressCardProps) {
  const progressPercent = Math.min(
    100,
    Math.round((goal.currentAmount / goal.targetAmount) * 100)
  );

  return (
    <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-mono font-semibold">
              Primary Goal
            </span>
            <CardTitle className="text-base text-slate-100 font-bold">
              {goal.title}
            </CardTitle>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Target</div>
          <div className="text-sm font-mono font-bold text-slate-100">
            {formatCurrency(goal.targetAmount, goal.currency)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar & Amounts */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">
              Saved: <strong className="text-slate-200">{formatCurrency(goal.currentAmount, goal.currency)}</strong>
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {progressPercent}%
            </span>
          </div>
          <Progress value={progressPercent} indicatorClassName="bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>

        {/* Milestone Dates Timeline */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Original Plan</span>
            </div>
            <div className="text-sm font-semibold text-slate-100 font-mono">
              {formatMonthYear(baselineCompletionDate)}
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5">
              Target: {formatMonthYear(goal.targetDate)}
            </div>
          </div>

          <div
            className={`rounded-2xl border p-3 transition-colors ${
              delayMonths > 0
                ? "border-amber-500/30 bg-amber-500/5 text-amber-200"
                : "border-slate-800/80 bg-slate-950/60 text-slate-100"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <TrendingUp className={`w-3.5 h-3.5 ${delayMonths > 0 ? "text-amber-400" : "text-emerald-400"}`} />
              <span>With Decision</span>
            </div>
            <div className="text-sm font-semibold font-mono">
              {simulatedCompletionDate
                ? formatMonthYear(simulatedCompletionDate)
                : formatMonthYear(baselineCompletionDate)}
            </div>
            <div className="text-[11px] mt-0.5 font-medium">
              {delayMonths > 0 ? (
                <span className="text-amber-400">+{delayMonths} month delay</span>
              ) : (
                <span className="text-emerald-400">No shift in date</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
