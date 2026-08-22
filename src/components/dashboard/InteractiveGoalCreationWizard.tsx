"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { MoneyInput } from "@/components/design-system/MoneyInput";
import {
  Home,
  Briefcase,
  ShieldAlert,
  Plane,
  GraduationCap,
  Car,
  Flag,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
  defaultTarget: number;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: "cat-home",
    name: "Buy a home",
    desc: "Down payment, closing costs, moving expenses",
    icon: <Home className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    iconBg: "bg-amber-500/10",
    defaultTarget: 500000,
  },
  {
    id: "cat-business",
    name: "Start a business",
    desc: "Startup capital, equipment, initial inventory",
    icon: <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    iconBg: "bg-emerald-500/10",
    defaultTarget: 300000,
  },
  {
    id: "cat-emergency",
    name: "Emergency fund",
    desc: "3-6 months of expenses for security",
    icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
    iconBg: "bg-rose-500/10",
    defaultTarget: 150000,
  },
  {
    id: "cat-trip",
    name: "Dream trip",
    desc: "Vacation, honeymoon, adventure travel",
    icon: <Plane className="w-5 h-5 text-blue-500" />,
    iconBg: "bg-blue-500/10",
    defaultTarget: 100000,
  },
  {
    id: "cat-edu",
    name: "Education",
    desc: "Degree, certification, skills training",
    icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
    iconBg: "bg-purple-500/10",
    defaultTarget: 200000,
  },
  {
    id: "cat-car",
    name: "Buy a car",
    desc: "Vehicle purchase or deposit",
    icon: <Car className="w-5 h-5 text-indigo-500" />,
    iconBg: "bg-indigo-500/10",
    defaultTarget: 250000,
  },
  {
    id: "cat-other",
    name: "Other goal",
    desc: "Custom life target or reserve",
    icon: <Flag className="w-5 h-5 text-emerald-600" />,
    iconBg: "bg-emerald-500/10",
    defaultTarget: 100000,
  },
];

interface InteractiveGoalCreationWizardProps {
  currency?: CurrencyCode;
  monthlyGrossIncome?: number;
  onClose: () => void;
  onGoalCreated: (goalData: {
    title: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    monthsToGoal: number;
  }) => void;
}

export function InteractiveGoalCreationWizard({
  currency = "KES",
  monthlyGrossIncome = 180000,
  onClose,
  onGoalCreated,
}: InteractiveGoalCreationWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>(CATEGORIES[0]);
  const [goalName, setGoalName] = useState(CATEGORIES[0].name);
  const [targetAmount, setTargetAmount] = useState<number>(500000);
  const [currentAmount, setCurrentAmount] = useState<number>(50000);
  const [monthsToGoal, setMonthsToGoal] = useState<number>(42);

  // Calculations for Step 4 Summary
  const remainingNeeded = Math.max(0, targetAmount - currentAmount);
  const monthlySavingsNeeded = Math.round(remainingNeeded / (monthsToGoal || 1));
  const shareOfIncomePercent = monthlyGrossIncome > 0 ? Math.round((monthlySavingsNeeded / monthlyGrossIncome) * 100 * 10) / 10 : 0;

  function handleSelectCategory(cat: CategoryOption) {
    setSelectedCategory(cat);
    setGoalName(cat.name);
    setTargetAmount(cat.defaultTarget);
    setStep(2);
  }

  function handleSubmit() {
    onGoalCreated({
      title: goalName,
      category: selectedCategory.id,
      targetAmount,
      currentAmount,
      monthlyContribution: monthlySavingsNeeded,
      monthsToGoal,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-[2.5rem] border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-2xl my-auto">
        {/* Header & Step Progress Line Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => (step > 1 ? setStep((s) => (s - 1) as any) : onClose())}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-foreground">Create a Goal</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-4" />
            </button>
          </div>

          {/* 4 Step Segmented Bar */}
          <div className="space-y-1">
            <div className="text-xs font-mono font-semibold text-muted-foreground">
              Step {step} of 4
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i <= step ? "bg-emerald-700 dark:bg-emerald-500" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-extrabold text-foreground">What&apos;s your goal?</h2>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="w-full p-4 rounded-2xl border border-border/70 bg-card hover:border-emerald-600/50 hover:bg-secondary/30 transition-all flex items-center justify-between text-left group shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-3 rounded-2xl ${cat.iconBg} shrink-0`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{cat.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: NAME & TARGET AMOUNT */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-extrabold text-foreground">Goal Details</h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Goal Title</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary/40 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <MoneyInput
                label="Target Amount"
                value={targetAmount}
                onChange={(val) => setTargetAmount(val)}
                currency={currency}
              />

              <MoneyInput
                label="Current Amount Saved"
                value={currentAmount}
                onChange={(val) => setCurrentAmount(val)}
                currency={currency}
              />
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-xs"
            >
              Continue to Step 3
            </button>
          </div>
        )}

        {/* STEP 3: TIMELINE & MONTHS */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-extrabold text-foreground">Timeline &amp; Pace</h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">
                  Target Months to Goal
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={monthsToGoal}
                  onChange={(e) => setMonthsToGoal(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary/40 text-sm font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  required
                />
                <span className="text-[11px] text-muted-foreground block font-mono">
                  Approx. {(monthsToGoal / 12).toFixed(1)} years timeline
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-xs"
            >
              Review Goal Summary
            </button>
          </div>
        )}

        {/* STEP 4: GOAL SUMMARY & CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Goal Preview Header */}
            <div className="p-4 rounded-2xl border border-border/80 bg-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${selectedCategory.iconBg} shrink-0`}>
                  {selectedCategory.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{goalName}</h4>
                  <span className="text-xs text-muted-foreground font-mono font-bold">
                    {formatCurrency(targetAmount, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Goal Summary Metrics Card */}
            <div className="p-5 rounded-3xl border border-border bg-card space-y-4 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Goal summary
              </h3>

              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-sans">Monthly savings needed</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-base">
                    {formatCurrency(monthlySavingsNeeded, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-sans">Months to goal</span>
                  <span className="font-bold text-foreground">{monthsToGoal}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-sans">Share of monthly income</span>
                  <span className="font-bold text-foreground">{shareOfIncomePercent}%</span>
                </div>
              </div>
            </div>

            {/* Large Forest Green Create Goal Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-extrabold transition-all shadow-md active:scale-95"
            >
              Create Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
