"use client";

import React from "react";
import { OnboardingExpenseItem } from "@/lib/onboarding/onboarding-types";
import { CurrencyCode } from "@/lib/types/finance";
import { MoneyInput } from "@/components/design-system/MoneyInput";
import { formatCurrency } from "@/lib/utils/currency";
import { normalizeToMonthly } from "@/lib/onboarding/onboarding-calculator";
import { Plus, Trash2, ArrowLeft, ArrowRight, ShieldAlert, ShoppingBag, Home, Car, Zap, Wifi, Users, CreditCard } from "lucide-react";

interface Step3ExpensesProps {
  expenses: OnboardingExpenseItem[];
  currency: CurrencyCode;
  onChange: (updated: OnboardingExpenseItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const DEFAULT_CATEGORIES = [
  { name: "Rent & Housing", icon: <Home className="w-4 h-4" /> },
  { name: "Food & Groceries", icon: <ShoppingBag className="w-4 h-4" /> },
  { name: "Transport & Commuting", icon: <Car className="w-4 h-4" /> },
  { name: "Utilities & Electricity", icon: <Zap className="w-4 h-4" /> },
  { name: "Internet & Phone", icon: <Wifi className="w-4 h-4" /> },
  { name: "Family Support & Remittances", icon: <Users className="w-4 h-4" /> },
  { name: "Digital Subscriptions", icon: <CreditCard className="w-4 h-4" /> },
];

export function Step3Expenses({ expenses, currency, onChange, onNext, onBack }: Step3ExpensesProps) {
  const handleUpdate = (id: string, amount: number) => {
    onChange(expenses.map((item) => (item.id === id ? { ...item, amount } : item)));
  };

  const handleAddCustom = () => {
    const newItem: OnboardingExpenseItem = {
      id: crypto.randomUUID(),
      name: "Other Living Expense",
      category: "DISCRETIONARY",
      amount: 10000,
      frequency: "MONTHLY",
      isFixed: true,
    };
    onChange([...expenses, newItem]);
  };

  const handleRemove = (id: string) => {
    onChange(expenses.filter((item) => item.id !== id));
  };

  const totalMonthlyExpenses = expenses.reduce(
    (sum, item) => sum + normalizeToMonthly(item.amount, item.frequency),
    0
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Step 3: Baseline Living Costs</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight leading-tight">
          What you carry each month.
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
          These are the commitments required to maintain your life: rent, food, transport, utilities, family support, and subscriptions.
        </p>
      </div>

      {/* Expenses Form Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-elevation-1">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
              Essential Outflows
            </span>
            <div className="text-sm font-bold font-editorial text-foreground">
              Total Monthly Costs:{" "}
              <span className="text-Useaimly-expense font-financial font-bold">
                {formatCurrency(totalMonthlyExpenses, currency)}/mo
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCustom}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Expenses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {expenses.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-background p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-editorial text-foreground">
                  {item.name}
                </span>
                {expenses.length > 3 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <MoneyInput
                label="Monthly Amount"
                value={item.amount}
                onChange={(amt) => handleUpdate(item.id, amt)}
                currency={currency}
                stepPresets={[5000, 15000, 30000, 60000]}
              />
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
            <span>Next: Debt & Obligations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
