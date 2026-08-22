"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { BudgetTarget, BudgetSummary } from "@/lib/types/budget";
import {
  fetchBudgetTargets,
  saveBudgetTarget,
  deleteBudgetTarget,
  computeBudgetSummary,
} from "@/lib/budget/budget-service";
import {
  PieChart,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingDown,
  X,
  Target,
} from "lucide-react";

export function SmartBudgetCard({ currency = "KES" }: { currency?: CurrencyCode }) {
  const [budgets, setBudgets] = useState<BudgetTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [categoryName, setCategoryName] = useState("");
  const [monthlyTarget, setMonthlyTarget] = useState<number>(20000);
  const [currentActual, setCurrentActual] = useState<number>(12000);

  useEffect(() => {
    async function load() {
      const data = await fetchBudgetTargets();
      setBudgets(data);
      setLoading(false);
    }
    load();
  }, []);

  const summary = computeBudgetSummary(budgets);

  async function handleAddBudget(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryName.trim() || monthlyTarget <= 0) return;

    const created = await saveBudgetTarget({
      category_name: categoryName.trim(),
      monthly_target: monthlyTarget,
      current_actual: currentActual,
    });

    setBudgets((prev) => [created, ...prev.filter((b) => b.category_name !== created.category_name)]);
    setShowAddModal(false);
    setCategoryName("");
  }

  async function handleDelete(id: string) {
    await deleteBudgetTarget(id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }

  const statusBadge =
    summary.goalProtectionStatus === "ALIGNED"
      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
      : summary.goalProtectionStatus === "WARNING"
      ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
      : "bg-rose-500/10 text-rose-500 border-rose-500/30";

  return (
    <div className="rounded-3xl border border-primary/30 bg-card p-6 sm:p-8 space-y-6 shadow-sm font-sans animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <PieChart className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-extrabold text-foreground tracking-tight">
              Goal-Aware Smart Budget Manager
            </h3>
            <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-primary/20 text-primary text-[10px] font-extrabold px-2.5 py-0.5 border border-primary/30 uppercase tracking-wider">
              Flex-Guardrails
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Link category spending caps directly to your Net Free Cash Flow and Goal Arrival Targets.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:opacity-95 flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget Cap</span>
        </button>
      </div>

      {/* Summary Scorecard & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Monthly Cap */}
        <div className="p-4 rounded-2xl border border-border/80 bg-secondary/30 space-y-1">
          <span className="text-[11px] font-mono text-muted-foreground font-bold uppercase tracking-wider block">
            Total Monthly Cap
          </span>
          <div className="text-xl font-extrabold font-mono text-foreground">
            {formatCurrency(summary.totalTarget, currency)}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono block">
            Across {budgets.length} categories
          </span>
        </div>

        {/* Total Actual Spending */}
        <div className="p-4 rounded-2xl border border-border/80 bg-secondary/30 space-y-1">
          <span className="text-[11px] font-mono text-muted-foreground font-bold uppercase tracking-wider block">
            Actual Spent (This Month)
          </span>
          <div className="text-xl font-extrabold font-mono text-primary">
            {formatCurrency(summary.totalActual, currency)}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono block">
            {summary.overallPercent}% of total monthly cap consumed
          </span>
        </div>

        {/* Goal Protection Status */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${statusBadge}`}>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            Goal Protection Guardrail
          </span>
          <div className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>
              {summary.goalProtectionStatus === "ALIGNED"
                ? "100% Goal Aligned"
                : summary.goalProtectionStatus === "WARNING"
                ? "Approaching Cap Limit"
                : "Budget Cap Breached"}
            </span>
          </div>
          <span className="text-[10px] font-mono">
            {formatCurrency(summary.totalRemaining, currency)} remaining free cap buffer
          </span>
        </div>
      </div>

      {/* Guidance Banner */}
      <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground flex items-center gap-2.5">
        <div className="p-1 rounded-full bg-primary/10 text-primary shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <p className="leading-relaxed">
          <strong>At a Glance</strong>: Staying under your monthly budget cap of{" "}
          <strong>{formatCurrency(summary.totalTarget, currency)}</strong> preserves your target free cash flow and keeps your life goals arriving on schedule!
        </p>
      </div>

      {/* Categories Progress Grid */}
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
          Active Category Caps &amp; Progress
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const percent = b.monthly_target > 0 ? Math.round((b.current_actual / b.monthly_target) * 100) : 0;
            const isOver = b.current_actual > b.monthly_target;
            const barColor = isOver
              ? "bg-rose-500"
              : percent > 85
              ? "bg-amber-500"
              : "bg-emerald-500";

            return (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-border/80 bg-secondary/30 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground">{b.category_name}</span>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      Spent {formatCurrency(b.current_actual, currency)} of{" "}
                      <strong className="text-foreground">{formatCurrency(b.monthly_target, currency)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full border ${
                        isOver
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                          : percent > 85
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      }`}
                    >
                      {percent}%
                    </span>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete Budget Target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden border border-border/50 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border border-border/80 bg-card p-6 space-y-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h4 className="text-base font-bold text-foreground">Set Category Budget Cap</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBudget} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dining Out & Leisure"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-secondary/50 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Monthly Target Cap ({currency})</label>
                <input
                  type="number"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-secondary/50 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Current Spent This Month ({currency})</label>
                <input
                  type="number"
                  value={currentActual}
                  onChange={(e) => setCurrentActual(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-secondary/50 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2.5 rounded-xl border border-border bg-secondary/50 text-xs font-semibold text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-xs"
                >
                  Save Budget Cap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
