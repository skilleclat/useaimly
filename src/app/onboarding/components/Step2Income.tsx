"use client";

import React from "react";
import { OnboardingIncomeItem } from "@/lib/onboarding/onboarding-types";
import { CurrencyCode } from "@/lib/types/finance";
import { MoneyInput } from "@/components/design-system/MoneyInput";
import { formatCurrency } from "@/lib/utils/currency";
import { normalizeToMonthly } from "@/lib/onboarding/onboarding-calculator";
import { Plus, Trash2, ArrowLeft, ArrowRight, TrendingUp, Sparkles } from "lucide-react";

interface Step2IncomeProps {
  income: OnboardingIncomeItem[];
  currency: CurrencyCode;
  onChange: (updated: OnboardingIncomeItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Income({ income, currency, onChange, onNext, onBack }: Step2IncomeProps) {
  const handleAddStream = () => {
    const newItem: OnboardingIncomeItem = {
      id: crypto.randomUUID(),
      name: "Side Consulting / Freelance",
      amount: 40000,
      frequency: "MONTHLY",
      reliability: "VARIABLE",
    };
    onChange([...income, newItem]);
  };

  const handleUpdate = (id: string, partial: Partial<OnboardingIncomeItem>) => {
    onChange(income.map((item) => (item.id === id ? { ...item, ...partial } : item)));
  };

  const handleRemove = (id: string) => {
    if (income.length <= 1) return;
    onChange(income.filter((item) => item.id !== id));
  };

  const totalMonthlyGross = income.reduce(
    (sum, item) => sum + normalizeToMonthly(item.amount, item.frequency),
    0
  );

  const isValid = income.some((item) => item.amount > 0 && item.name.trim().length > 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Step 2: Income & Starting Velocity</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight leading-tight">
          Where you are today.
        </h2>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Tell Useaimly what flows in. You can record a primary salary, freelance projects, business profits, or multiple active income streams.
        </p>
      </div>

      {/* Income Streams Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-elevation-1">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
              Active Income Sources
            </span>
            <div className="text-sm font-bold font-editorial text-foreground">
              Total Monthly Inflow:{" "}
              <span className="text-primary font-financial font-bold">
                {formatCurrency(totalMonthlyGross, currency)}/mo
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddStream}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Income Stream</span>
          </button>
        </div>

        {/* List of Income Items */}
        <div className="space-y-4">
          {income.map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-background p-4 sm:p-5 space-y-4 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  Source #{index + 1}
                </span>
                {income.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Source Name
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdate(item.id, { name: e.target.value })}
                    placeholder="e.g. Primary Tech Salary, Consultancy"
                    className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <MoneyInput
                  label="Inflow Amount"
                  value={item.amount}
                  onChange={(amt) => handleUpdate(item.id, { amount: amt })}
                  currency={currency}
                  stepPresets={[50000, 100000, 180000, 300000]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Payment Frequency
                  </label>
                  <select
                    value={item.frequency}
                    onChange={(e) => handleUpdate(item.id, { frequency: e.target.value as any })}
                    className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="BI_WEEKLY">Every 2 Weeks</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="ANNUAL">Annual</option>
                    <option value="IRREGULAR">Variable / Irregular</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Reliability Tier
                  </label>
                  <select
                    value={item.reliability}
                    onChange={(e) => handleUpdate(item.id, { reliability: e.target.value as any })}
                    className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="STABLE">Stable (e.g. Regular Contract/Salary)</option>
                    <option value="VARIABLE">Variable (e.g. Commissions/Freelance)</option>
                    <option value="ONE_OFF">One-Off Anticipated</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 flex items-center justify-between border-t border-border/70">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            disabled={!isValid}
            onClick={onNext}
            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-sm transition-all disabled:opacity-50"
          >
            <span>Next: What You Carry</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
