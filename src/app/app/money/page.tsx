"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear, addMonths } from "@/lib/utils/date";
import { CurrencyCode } from "@/lib/types/finance";
import { MoneyInput } from "@/components/design-system/MoneyInput";
import {
  Wallet,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ShieldCheck,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

type TabType = "OVERVIEW" | "INCOME" | "EXPENSES" | "SAVINGS" | "DEBT" | "COMMITMENTS";

interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  isRecurring: boolean;
  frequency: "MONTHLY" | "BIWEEKLY" | "WEEKLY" | "ONE_TIME";
  expectedDate?: string;
  reliability: "STABLE" | "VARIABLE" | "OCCASIONAL";
}

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  isRecurring: boolean;
  category: "HOUSING" | "FOOD" | "TRANSPORT" | "UTILITIES" | "FAMILY" | "DIGITAL" | "LIFESTYLE";
  isFixed: boolean;
}

interface SavingsItem {
  id: string;
  accountName: string;
  balance: number;
  destinationAssignment: string;
}

interface DebtItem {
  id: string;
  name: string;
  balance: number;
  monthlyPayment: number;
  interestRate: number;
  dueDate: string;
}

interface CommitmentItem {
  id: string;
  name: string;
  amount: number;
  frequency: "ANNUAL" | "SEMI_ANNUAL" | "QUARTERLY" | "MONTHLY";
  startDate: string;
  endDate: string;
  category: "INSURANCE" | "EDUCATION" | "TAXES" | "FAMILY_OBLIGATION";
}

export default function MoneyPage() {
  const { profile } = useAuth();
  const currency = (profile?.preferred_currency || "KES") as CurrencyCode;

  const [activeTab, setActiveTab] = useState<TabType>("OVERVIEW");

  // Incomes State
  const [incomes, setIncomes] = useState<IncomeItem[]>([
    { id: "inc-1", name: "Primary Tech Retainer & Salary", amount: 140000, isRecurring: true, frequency: "MONTHLY", expectedDate: "28th of every month", reliability: "STABLE" },
    { id: "inc-2", name: "Architecture Consulting", amount: 40000, isRecurring: true, frequency: "MONTHLY", expectedDate: "15th of every month", reliability: "VARIABLE" },
  ]);

  // Expenses State
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: "exp-1", name: "Rent & Housing", amount: 45000, isRecurring: true, category: "HOUSING", isFixed: true },
    { id: "exp-2", name: "Food & Household Groceries", amount: 25000, isRecurring: true, category: "FOOD", isFixed: true },
    { id: "exp-3", name: "Fuel & Regional Transport", amount: 15000, isRecurring: true, category: "TRANSPORT", isFixed: false },
    { id: "exp-4", name: "High-Speed Fiber & Utilities", amount: 8000, isRecurring: true, category: "UTILITIES", isFixed: true },
    { id: "exp-5", name: "Family Support Allowance", amount: 10000, isRecurring: true, category: "FAMILY", isFixed: true },
    { id: "exp-6", name: "Digital Cloud Subscriptions", amount: 4000, isRecurring: true, category: "DIGITAL", isFixed: true },
  ]);

  // Savings Accounts State
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsItem[]>([
    { id: "sav-1", accountName: "Commercial Bank Operating Checking", balance: 50000, destinationAssignment: "Immediate Living Buffer" },
    { id: "sav-2", accountName: "M-Pesa Working Liquidity", balance: 20000, destinationAssignment: "Daily Contingency" },
    { id: "sav-3", accountName: "High-Yield Money Market Fund (MMF)", balance: 170000, destinationAssignment: "Start my business" },
  ]);

  // Debts State
  const [debts, setDebts] = useState<DebtItem[]>([
    { id: "dbt-1", name: "SACCO Asset Development Loan", balance: 120000, monthlyPayment: 10000, interestRate: 12, dueDate: "15th of month" },
  ]);

  // Periodic Commitments State
  const [commitments, setCommitments] = useState<CommitmentItem[]>([
    { id: "com-1", name: "Comprehensive Motor Insurance", amount: 45000, frequency: "ANNUAL", startDate: "2026-10-05", endDate: "2027-10-05", category: "INSURANCE" },
  ]);

  // Planned Goal Allocation
  const [monthlyGoalAllocation, setMonthlyGoalAllocation] = useState<number>(53000);

  // Modals / New Item Form States
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [newIncName, setNewIncName] = useState("");
  const [newIncAmount, setNewIncAmount] = useState(20000);
  const [newIncReliability, setNewIncReliability] = useState<"STABLE" | "VARIABLE" | "OCCASIONAL">("STABLE");

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpName, setNewExpName] = useState("");
  const [newExpAmount, setNewExpAmount] = useState(10000);
  const [newExpCategory, setNewExpCategory] = useState<ExpenseItem["category"]>("LIFESTYLE");
  const [newExpFixed, setNewExpFixed] = useState(false);

  // Dynamic Financial Calculations
  const totalMonthlyIncome = useMemo(() => {
    return incomes.reduce((sum, item) => {
      if (item.frequency === "MONTHLY") return sum + item.amount;
      if (item.frequency === "BIWEEKLY") return sum + (item.amount * 26) / 12;
      if (item.frequency === "WEEKLY") return sum + (item.amount * 52) / 12;
      return sum;
    }, 0);
  }, [incomes]);

  const totalMonthlyLivingExpenses = useMemo(() => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const totalMonthlyDebtService = useMemo(() => {
    return debts.reduce((sum, item) => sum + item.monthlyPayment, 0);
  }, [debts]);

  const totalMonthlyCommitmentsAmortized = useMemo(() => {
    return commitments.reduce((sum, item) => {
      if (item.frequency === "ANNUAL") return sum + item.amount / 12;
      if (item.frequency === "SEMI_ANNUAL") return sum + item.amount / 6;
      if (item.frequency === "QUARTERLY") return sum + item.amount / 3;
      return sum + item.amount;
    }, 0);
  }, [commitments]);

  const totalLivingAndObligations =
    totalMonthlyLivingExpenses + totalMonthlyDebtService + totalMonthlyCommitmentsAmortized;

  const monthlyFreeCashFlow = Math.max(0, totalMonthlyIncome - totalLivingAndObligations);
  const availableUnassignedBuffer = Math.max(0, monthlyFreeCashFlow - monthlyGoalAllocation);

  const totalLiquidSavings = useMemo(() => {
    return savingsAccounts.reduce((sum, item) => sum + item.balance, 0);
  }, [savingsAccounts]);

  const totalDebtBalance = useMemo(() => {
    return debts.reduce((sum, item) => sum + item.balance, 0);
  }, [debts]);

  // Projected Goal Completion (Based on KES 500,000 target and KES 170,000 current savings)
  const projectedMonthsToGoal = Math.ceil((500000 - 170000) / (monthlyGoalAllocation || 1));
  const projectedArrivalDateFormatted = formatMonthYear(addMonths(new Date("2026-08-20T00:00:00Z"), projectedMonthsToGoal));

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncName.trim()) return;
    setIncomes([
      ...incomes,
      {
        id: `inc-${Date.now()}`,
        name: newIncName.trim(),
        amount: newIncAmount,
        isRecurring: true,
        frequency: "MONTHLY",
        reliability: newIncReliability,
        expectedDate: "Monthly Inflow",
      },
    ]);
    setShowAddIncome(false);
    setNewIncName("");
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpName.trim()) return;
    setExpenses([
      ...expenses,
      {
        id: `exp-${Date.now()}`,
        name: newExpName.trim(),
        amount: newExpAmount,
        isRecurring: true,
        category: newExpCategory,
        isFixed: newExpFixed,
      },
    ]);
    setShowAddExpense(false);
    setNewExpName("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
          <Layers className="w-4 h-4" />
          <span>Raw Financial Material</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
          Money & Cash Flow
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Manage the active income streams, commitments, debts, and liquid reserves that power Useaimly&apos;s deterministic intelligence.
        </p>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border/70 pb-4">
        {(
          [
            { key: "OVERVIEW", label: "Overview & Waterfall", icon: <Layers className="w-3.5 h-3.5" /> },
            { key: "INCOME", label: `Income (${incomes.length})`, icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { key: "EXPENSES", label: `Expenses (${expenses.length})`, icon: <ShoppingBag className="w-3.5 h-3.5" /> },
            { key: "SAVINGS", label: `Savings (${savingsAccounts.length})`, icon: <Wallet className="w-3.5 h-3.5" /> },
            { key: "DEBT", label: `Debt (${debts.length})`, icon: <CreditCard className="w-3.5 h-3.5" /> },
            { key: "COMMITMENTS", label: `Commitments (${commitments.length})`, icon: <Calendar className="w-3.5 h-3.5" /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW & CASH FLOW WATERFALL TAB */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-8 animate-fadeIn">
          {/* 4 TOP LEVEL CAPACITY METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-border bg-card p-5 space-y-1 shadow-elevation-1">
              <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                Total Monthly Inflow
              </span>
              <div className="text-2xl font-bold font-financial text-foreground">
                {formatCurrency(totalMonthlyIncome, currency)}
              </div>
              <span className="text-[10px] text-primary font-mono block">
                {incomes.length} active income sources
              </span>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 space-y-1 shadow-elevation-1">
              <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                Living Outflows & Debt
              </span>
              <div className="text-2xl font-bold font-financial text-foreground">
                {formatCurrency(totalLivingAndObligations, currency)}
              </div>
              <span className="text-[10px] text-muted-foreground font-mono block">
                Fixed costs, debt & insurance
              </span>
            </div>

            <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5 space-y-1 shadow-elevation-1">
              <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-wider block">
                Monthly Free Cash Flow
              </span>
              <div className="text-2xl font-bold font-financial text-primary">
                {formatCurrency(monthlyFreeCashFlow, currency)}
              </div>
              <span className="text-[10px] text-primary/80 font-mono block">
                Available for goal acceleration
              </span>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 space-y-1 shadow-elevation-1">
              <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                Total Liquid Reserves
              </span>
              <div className="text-2xl font-bold font-financial text-foreground">
                {formatCurrency(totalLiquidSavings, currency)}
              </div>
              <span className="text-[10px] text-muted-foreground font-mono block">
                Across {savingsAccounts.length} accounts & MMF
              </span>
            </div>
          </div>

          {/* THE FINANCIAL TIMELINE WATERFALL */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-elevation-1">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  Cash Flow Waterfall Timeline
                </span>
                <h3 className="text-lg font-bold font-editorial text-foreground">
                  Monthly Capital Cascade
                </h3>
              </div>
              <div className="text-xs font-mono bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                Projected Arrival: {projectedArrivalDateFormatted}
              </div>
            </div>

            {/* Waterfall Flow Items */}
            <div className="space-y-3 max-w-3xl">
              {/* STEP 1: INCOME */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block text-[10px]">
                      Gross Monthly Inflow
                    </span>
                    <span className="font-bold text-sm text-foreground">Salary, Consulting & Retainers</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-financial font-bold text-base text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(totalMonthlyIncome, currency)}
                  </span>
                </div>
              </div>

              {/* STEP 2: RENT & LIVING EXPENSES */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-background text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-secondary text-muted-foreground">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-muted-foreground uppercase tracking-wider block text-[10px]">
                      Essential Living Costs
                    </span>
                    <span className="font-bold text-sm text-foreground">Rent, Groceries, Utilities & Family</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-financial font-bold text-base text-rose-600 dark:text-rose-400">
                    -{formatCurrency(totalMonthlyLivingExpenses, currency)}
                  </span>
                </div>
              </div>

              {/* STEP 3: DEBT PAYMENTS */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-background text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-secondary text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-muted-foreground uppercase tracking-wider block text-[10px]">
                      Debt Service Repayment
                    </span>
                    <span className="font-bold text-sm text-foreground">SACCO Loan Amortization</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-financial font-bold text-base text-rose-600 dark:text-rose-400">
                    -{formatCurrency(totalMonthlyDebtService, currency)}
                  </span>
                </div>
              </div>

              {/* STEP 4: PERIODIC COMMITMENTS */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-background text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-secondary text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-muted-foreground uppercase tracking-wider block text-[10px]">
                      Amortized Annual Obligations
                    </span>
                    <span className="font-bold text-sm text-foreground">Motor Insurance Sinking Fund</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-financial font-bold text-base text-amber-600 dark:text-amber-400">
                    -{formatCurrency(totalMonthlyCommitmentsAmortized, currency)}
                  </span>
                </div>
              </div>

              {/* STEP 5: GOAL CONTRIBUTION */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-primary/30 bg-primary/5 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20 text-primary">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-primary uppercase tracking-wider block text-[10px]">
                      Destination Acceleration Allocation
                    </span>
                    <span className="font-bold text-sm text-foreground">Start my business & Emergency MMF</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-financial font-bold text-base text-primary">
                    -{formatCurrency(monthlyGoalAllocation, currency)}
                  </span>
                </div>
              </div>

              {/* STEP 6: AVAILABLE UNASSIGNED BUFFER */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-secondary/60 text-xs font-bold">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-card text-foreground">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <span className="font-mono text-muted-foreground uppercase tracking-wider block text-[10px]">
                      Available Net Buffer
                    </span>
                    <span className="text-sm text-foreground">Unassigned Liquidity Capacity</span>
                  </div>
                </div>
                <div className="text-right font-financial text-lg text-foreground">
                  {formatCurrency(availableUnassignedBuffer, currency)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. INCOME TAB */}
      {activeTab === "INCOME" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-editorial text-foreground">Active Inflow Streams</h3>
            <button
              type="button"
              onClick={() => setShowAddIncome(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Income Source</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomes.map((inc) => (
              <div
                key={inc.id}
                className="rounded-3xl border border-border bg-card p-5 space-y-3 shadow-elevation-1 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        inc.reliability === "STABLE"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {inc.reliability}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIncomes(incomes.filter((i) => i.id !== inc.id))}
                      className="text-muted-foreground hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-foreground text-base">{inc.name}</h4>
                  <div className="text-2xl font-bold font-financial text-foreground mt-1">
                    {formatCurrency(inc.amount, currency)}
                    <span className="text-xs text-muted-foreground font-mono font-normal"> / month</span>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                  {inc.expectedDate || "Expected monthly"}
                </div>
              </div>
            ))}
          </div>

          {/* Add Income Modal */}
          {showAddIncome && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
              <div className="max-w-md w-full rounded-3xl border border-border bg-card p-6 space-y-4 shadow-elevation-2">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <h4 className="font-bold text-foreground">Add Income Stream</h4>
                  <button type="button" onClick={() => setShowAddIncome(false)}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <form onSubmit={handleAddIncome} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground block">Income Name</label>
                    <input
                      type="text"
                      required
                      value={newIncName}
                      onChange={(e) => setNewIncName(e.target.value)}
                      placeholder="e.g. Side Gig / Retainer"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                  <MoneyInput
                    label="Monthly Amount"
                    value={newIncAmount}
                    onChange={(val) => setNewIncAmount(val)}
                    currency={currency}
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddIncome(false)}
                      className="flex-1 rounded-xl border border-border py-2 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground"
                    >
                      Save Income
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. EXPENSES TAB */}
      {activeTab === "EXPENSES" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-editorial text-foreground">Living Expenses & Outflows</h3>
            <button
              type="button"
              onClick={() => setShowAddExpense(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="rounded-3xl border border-border bg-card p-5 space-y-3 shadow-elevation-1 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground uppercase">
                      {exp.category} • {exp.isFixed ? "Fixed" : "Variable"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpenses(expenses.filter((e) => e.id !== exp.id))}
                      className="text-muted-foreground hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-foreground text-sm">{exp.name}</h4>
                  <div className="text-xl font-bold font-financial text-foreground mt-1">
                    {formatCurrency(exp.amount, currency)}
                    <span className="text-xs text-muted-foreground font-mono font-normal"> / mo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Expense Modal */}
          {showAddExpense && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
              <div className="max-w-md w-full rounded-3xl border border-border bg-card p-6 space-y-4 shadow-elevation-2">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <h4 className="font-bold text-foreground">Add Living Expense</h4>
                  <button type="button" onClick={() => setShowAddExpense(false)}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground block">Expense Name</label>
                    <input
                      type="text"
                      required
                      value={newExpName}
                      onChange={(e) => setNewExpName(e.target.value)}
                      placeholder="e.g. Dining & Entertainment"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                  <MoneyInput
                    label="Monthly Amount"
                    value={newExpAmount}
                    onChange={(val) => setNewExpAmount(val)}
                    currency={currency}
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddExpense(false)}
                      className="flex-1 rounded-xl border border-border py-2 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground"
                    >
                      Save Expense
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SAVINGS TAB */}
      {activeTab === "SAVINGS" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-editorial text-foreground">Savings Accounts & Reserves</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savingsAccounts.map((sav) => (
              <div
                key={sav.id}
                className="rounded-3xl border border-border bg-card p-6 space-y-3 shadow-elevation-1"
              >
                <div className="flex items-center justify-between text-muted-foreground text-xs font-mono font-bold">
                  <Wallet className="w-4 h-4 text-teal-500" />
                  <span className="text-[10px] uppercase bg-secondary px-2 py-0.5 rounded-md">
                    {sav.destinationAssignment}
                  </span>
                </div>
                <h4 className="font-bold text-foreground text-base">{sav.accountName}</h4>
                <div className="text-2xl font-bold font-financial text-foreground">
                  {formatCurrency(sav.balance, currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. DEBT TAB */}
      {activeTab === "DEBT" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-editorial text-foreground">Liabilities & Debt Service</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debts.map((dbt) => (
              <div
                key={dbt.id}
                className="rounded-3xl border border-border bg-card p-6 space-y-3 shadow-elevation-1"
              >
                <div className="flex items-center justify-between text-muted-foreground text-xs font-mono font-bold">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    {dbt.interestRate}% APR
                  </span>
                </div>
                <h4 className="font-bold text-foreground text-base">{dbt.name}</h4>
                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="text-xs text-muted-foreground block">Total Balance:</span>
                    <span className="text-2xl font-bold font-financial text-foreground">
                      {formatCurrency(dbt.balance, currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Monthly Payment:</span>
                    <span className="text-lg font-bold font-financial text-rose-600 dark:text-rose-400">
                      {formatCurrency(dbt.monthlyPayment, currency)}/mo
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                  Due: {dbt.dueDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. COMMITMENTS TAB */}
      {activeTab === "COMMITMENTS" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-editorial text-foreground">Amortized Periodic Commitments</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commitments.map((com) => (
              <div
                key={com.id}
                className="rounded-3xl border border-border bg-card p-6 space-y-3 shadow-elevation-1"
              >
                <div className="flex items-center justify-between text-muted-foreground text-xs font-mono font-bold">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase">
                    {com.frequency}
                  </span>
                </div>
                <h4 className="font-bold text-foreground text-base">{com.name}</h4>
                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="text-xs text-muted-foreground block">Total Periodic Cost:</span>
                    <span className="text-2xl font-bold font-financial text-foreground">
                      {formatCurrency(com.amount, currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Amortized Monthly Allowance:</span>
                    <span className="text-lg font-bold font-financial text-primary">
                      {formatCurrency(com.amount / 12, currency)}/mo
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                  Renewal Period: {com.startDate} to {com.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
