"use client";

import React from "react";
import { OnboardingSavingsAccount } from "@/lib/onboarding/onboarding-types";
import { CurrencyCode } from "@/lib/types/finance";
import { MoneyInput } from "@/components/design-system/MoneyInput";
import { formatCurrency } from "@/lib/utils/currency";
import { Plus, Trash2, ArrowLeft, ArrowRight, Wallet, PiggyBank, Landmark, CheckCircle } from "lucide-react";

interface Step5SavingsProps {
  savings: OnboardingSavingsAccount[];
  destinationTitle: string;
  currency: CurrencyCode;
  onChange: (updated: OnboardingSavingsAccount[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step5Savings({
  savings,
  destinationTitle,
  currency,
  onChange,
  onNext,
  onBack,
}: Step5SavingsProps) {
  const handleAddAccount = () => {
    const newAcc: OnboardingSavingsAccount = {
      id: crypto.randomUUID(),
      name: "Money Market Fund (MMF)",
      balance: 100000,
      type: "MMF",
      isAssignedToPrimaryGoal: true,
    };
    onChange([...savings, newAcc]);
  };

  const handleUpdate = (id: string, partial: Partial<OnboardingSavingsAccount>) => {
    onChange(savings.map((acc) => (acc.id === id ? { ...acc, ...partial } : acc)));
  };

  const handleRemove = (id: string) => {
    if (savings.length <= 1) return;
    onChange(savings.filter((acc) => acc.id !== id));
  };

  const totalSavings = savings.reduce((sum, acc) => sum + acc.balance, 0);
  const assignedCapital = savings
    .filter((acc) => acc.isAssignedToPrimaryGoal)
    .reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
          <Wallet className="w-3.5 h-3.5" />
          <span>Step 5: Liquid Reserves & Capital</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight leading-tight">
          Where your reserves currently sit.
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
          Record your checking buffer, M-Pesa balances, and savings or MMF accounts. You can designate which accounts are already earmarked for your primary destination.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-elevation-1">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
              Total Capital Reserves
            </span>
            <div className="text-sm font-bold font-editorial text-foreground">
              Total Liquidity:{" "}
              <span className="text-Useaimly-savings font-financial font-bold">
                {formatCurrency(totalSavings, currency)}
              </span>{" "}
              <span className="text-xs text-muted-foreground font-normal">
                ({formatCurrency(assignedCapital, currency)} assigned to {destinationTitle || "Goal"})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddAccount}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </button>
        </div>

        {/* List of Accounts */}
        <div className="space-y-4">
          {savings.map((acc, idx) => (
            <div
              key={acc.id}
              className="rounded-2xl border border-border bg-background p-4 sm:p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  Account #{idx + 1}
                </span>
                {savings.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(acc.id)}
                    className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={acc.name}
                    onChange={(e) => handleUpdate(acc.id, { name: e.target.value })}
                    placeholder="e.g. Standard Chartered Checking, Sanlam MMF"
                    className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <MoneyInput
                  label="Current Balance"
                  value={acc.balance}
                  onChange={(amt) => handleUpdate(acc.id, { balance: amt })}
                  currency={currency}
                  stepPresets={[20000, 50000, 100000, 250000]}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={acc.isAssignedToPrimaryGoal}
                    onChange={(e) =>
                      handleUpdate(acc.id, { isAssignedToPrimaryGoal: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-primary border-border focus:ring-primary/20"
                  />
                  <span>Earmarked toward {destinationTitle || "Primary Destination"}</span>
                </label>

                <select
                  value={acc.type}
                  onChange={(e) => handleUpdate(acc.id, { type: e.target.value as any })}
                  className="rounded-xl border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground font-mono focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="CHECKING">Checking / M-Pesa</option>
                  <option value="SAVINGS">Savings Account</option>
                  <option value="MMF">Money Market Fund</option>
                  <option value="LOCKED">Fixed Deposit</option>
                </select>
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
            onClick={onNext}
            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-sm transition-all"
          >
            <span>Next: Upcoming Commitments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
