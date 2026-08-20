"use client";

import React from "react";
import { OnboardingDebtItem } from "@/lib/onboarding/onboarding-types";
import { CurrencyCode } from "@/lib/types/finance";
import { MoneyInput } from "@/components/design-system/MoneyInput";
import { formatCurrency } from "@/lib/utils/currency";
import { Plus, Trash2, ArrowLeft, ArrowRight, ShieldCheck, TrendingDown, CheckCircle2 } from "lucide-react";

interface Step4DebtProps {
  hasDebt: boolean;
  debts: OnboardingDebtItem[];
  currency: CurrencyCode;
  onToggleHasDebt: (hasDebt: boolean) => void;
  onDebtsChange: (updated: OnboardingDebtItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Debt({
  hasDebt,
  debts,
  currency,
  onToggleHasDebt,
  onDebtsChange,
  onNext,
  onBack,
}: Step4DebtProps) {
  const handleAddDebt = () => {
    const newDebt: OnboardingDebtItem = {
      id: crypto.randomUUID(),
      name: "SACCO / Bank Loan",
      originalAmount: 150000,
      currentBalance: 120000,
      monthlyPayment: 12000,
      interestRate: 12,
    };
    onDebtsChange([...debts, newDebt]);
  };

  const handleUpdate = (id: string, partial: Partial<OnboardingDebtItem>) => {
    onDebtsChange(debts.map((item) => (item.id === id ? { ...item, ...partial } : item)));
  };

  const handleRemove = (id: string) => {
    onDebtsChange(debts.filter((item) => item.id !== id));
  };

  const totalMonthlyDebt = hasDebt
    ? debts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0)
    : 0;

  const totalDebtBalance = hasDebt
    ? debts.reduce((sum, d) => sum + (d.currentBalance || 0), 0)
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Step 4: Liabilities & Repayments</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight leading-tight">
          Are there debts or repayments you are currently carrying?
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
          Debt service locks up free cash flow. Recording loans or credit lines accurately ensures your trajectory timeline is 100% realistic.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-elevation-1">
        {/* Toggle Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              onToggleHasDebt(false);
              onDebtsChange([]);
            }}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              !hasDebt
                ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-primary"
                : "border-border bg-background text-foreground hover:border-primary/40"
            }`}
          >
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold font-editorial">I am debt-free</div>
              <div className="text-xs text-muted-foreground">
                No active bank loans, SACCO balances, or monthly repayments.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleHasDebt(true);
              if (debts.length === 0) handleAddDebt();
            }}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              hasDebt
                ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-primary"
                : "border-border bg-background text-foreground hover:border-primary/40"
            }`}
          >
            <TrendingDown className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold font-editorial">I carry active repayments</div>
              <div className="text-xs text-muted-foreground">
                Bank loan, SACCO credit, mobile loan, or vehicle financing.
              </div>
            </div>
          </button>
        </div>

        {/* If Debt Selected: Detail Inputs */}
        {hasDebt && (
          <div className="space-y-4 pt-4 border-t border-border/70">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  Active Loans / Liabilities
                </span>
                <div className="text-sm font-bold font-editorial text-foreground">
                  Monthly Debt Service:{" "}
                  <span className="text-Useaimly-debt font-financial font-bold">
                    {formatCurrency(totalMonthlyDebt, currency)}/mo
                  </span>{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (Total Balance: {formatCurrency(totalDebtBalance, currency)})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddDebt}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Loan</span>
              </button>
            </div>

            <div className="space-y-4">
              {debts.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-background p-4 sm:p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      Liability #{idx + 1}
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
                        Liability / Lender Name
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdate(item.id, { name: e.target.value })}
                        placeholder="e.g. SACCO Development Loan, Car Note"
                        className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <MoneyInput
                      label="Remaining Balance"
                      value={item.currentBalance}
                      onChange={(amt) => handleUpdate(item.id, { currentBalance: amt })}
                      currency={currency}
                      stepPresets={[50000, 100000, 250000, 500000]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <MoneyInput
                      label="Monthly Repayment Amount"
                      value={item.monthlyPayment}
                      onChange={(amt) => handleUpdate(item.id, { monthlyPayment: amt })}
                      currency={currency}
                      stepPresets={[5000, 12000, 25000, 50000]}
                    />

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground block">
                        Annual Interest Rate % (Optional)
                      </label>
                      <input
                        type="number"
                        value={item.interestRate || ""}
                        onChange={(e) =>
                          handleUpdate(item.id, {
                            interestRate: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="e.g. 12"
                        className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <span>Next: Savings & Reserves</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
