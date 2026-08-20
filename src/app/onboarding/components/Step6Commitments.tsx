"use client";

import React from "react";
import { OnboardingCommitmentItem } from "@/lib/onboarding/onboarding-types";
import { CurrencyCode } from "@/lib/types/finance";
import { MoneyInput } from "@/components/design-system/MoneyInput";
import { formatCurrency } from "@/lib/utils/currency";
import { normalizeToMonthly } from "@/lib/onboarding/onboarding-calculator";
import { Plus, Trash2, ArrowLeft, ArrowRight, Calendar, AlertCircle } from "lucide-react";

interface Step6CommitmentsProps {
  commitments: OnboardingCommitmentItem[];
  currency: CurrencyCode;
  onChange: (updated: OnboardingCommitmentItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step6Commitments({
  commitments,
  currency,
  onChange,
  onNext,
  onBack,
}: Step6CommitmentsProps) {
  const handleAddCommitment = () => {
    const newCommitment: OnboardingCommitmentItem = {
      id: crypto.randomUUID(),
      title: "Annual Health / Car Insurance",
      amount: 45000,
      frequency: "ANNUAL",
      nextDueDate: "2026-11-30",
      category: "INSURANCE",
    };
    onChange([...commitments, newCommitment]);
  };

  const handleUpdate = (id: string, partial: Partial<OnboardingCommitmentItem>) => {
    onChange(commitments.map((item) => (item.id === id ? { ...item, ...partial } : item)));
  };

  const handleRemove = (id: string) => {
    onChange(commitments.filter((item) => item.id !== id));
  };

  const totalMonthlyAmortized = commitments.reduce(
    (sum, item) => sum + normalizeToMonthly(item.amount, item.frequency),
    0
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
          <Calendar className="w-3.5 h-3.5" />
          <span>Step 6: Periodic Commitments</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight leading-tight">
          Upcoming commitments & lump sums.
        </h2>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
          School fees, annual insurance renewals, or planned family events occur periodically. Useaimly amortizes them into a monthly allowance so they never disrupt your primary destination.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-elevation-1">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
              Periodic Obligations
            </span>
            <div className="text-sm font-bold font-editorial text-foreground">
              Monthly Provision Needed:{" "}
              <span className="text-amber-600 dark:text-amber-400 font-financial font-bold">
                {formatCurrency(totalMonthlyAmortized, currency)}/mo
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCommitment}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Commitment</span>
          </button>
        </div>

        {commitments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              No periodic obligations added. If you have annual insurance, school fees, or travel planned, add them here.
            </p>
            <button
              type="button"
              onClick={handleAddCommitment}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add an upcoming commitment</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {commitments.map((item, idx) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-background p-4 sm:p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    Commitment #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">
                      Obligation Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdate(item.id, { title: e.target.value })}
                      placeholder="e.g. Term 1 School Fees, Comprehensive Car Insurance"
                      className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <MoneyInput
                    label="Obligation Amount"
                    value={item.amount}
                    onChange={(amt) => handleUpdate(item.id, { amount: amt })}
                    currency={currency}
                    stepPresets={[30000, 60000, 100000, 200000]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">
                      Frequency
                    </label>
                    <select
                      value={item.frequency}
                      onChange={(e) => handleUpdate(item.id, { frequency: e.target.value as any })}
                      className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                      <option value="ANNUAL">Annual (Once per year)</option>
                      <option value="TERM">Termly (3 times per year)</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="ONE_OFF">One-Off Specific Date</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">
                      Next Due Date
                    </label>
                    <input
                      type="date"
                      value={item.nextDueDate}
                      onChange={(e) => handleUpdate(item.id, { nextDueDate: e.target.value })}
                      className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
            onClick={onNext}
            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-sm transition-all"
          >
            <span>Reveal Your Path</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
