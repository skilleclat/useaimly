"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { INITIAL_DESTINATIONS, DestinationItem } from "@/lib/destinations/destinations-data";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";
import { CurrencyCode } from "@/lib/types/finance";
import { FinancialStatus } from "@/components/design-system/FinancialStatus";
import { MoneyInput } from "@/components/design-system/MoneyInput";
import { GoalVelocityBooster } from "@/components/dashboard/GoalVelocityBooster";
import { InteractiveGoalCreationWizard } from "@/components/dashboard/InteractiveGoalCreationWizard";
import { GoalCountdownAlertCard } from "@/components/dashboard/GoalCountdownAlertCard";
import { GoalNotificationSettingsModal } from "@/components/goals/GoalNotificationSettingsModal";
import { canAccessMultipleGoals } from "@/lib/auth/plan-permissions";
import { PlanUpgradeGate } from "@/components/finance/PlanUpgradeGate";
import {
  Target,
  Plus,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Sparkles,
  X,
  Clock,
} from "lucide-react";

import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function GoalsPage() {
  const { user, profile } = useAuth();
  const { currency } = useCurrency();
  const { t } = useI18n();

  const [destinations, setDestinations] = useState<DestinationItem[]>(INITIAL_DESTINATIONS);
  const [filterTab, setFilterTab] = useState<"ALL" | "ACTIVE" | "PAUSED" | "COMPLETED">("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showUpgradeGateModal, setShowUpgradeGateModal] = useState(false);

  const hasMultiGoalAccess = canAccessMultipleGoals(profile?.plan_tier, user?.email);

  const handleOpenCreateGoal = (isWizard: boolean) => {
    if (!hasMultiGoalAccess && destinations.length >= 1) {
      setShowUpgradeGateModal(true);
      return;
    }
    if (isWizard) {
      setShowWizardModal(true);
    } else {
      setShowAddModal(true);
    }
  };

  // New Destination Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("SAVINGS");
  const [newTargetAmount, setNewTargetAmount] = useState<number>(300000);
  const [newCurrentAmount, setNewCurrentAmount] = useState<number>(50000);
  const [newTargetDate, setNewTargetDate] = useState("2028-06-30");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [newMonthlyContribution, setNewMonthlyContribution] = useState<number>(15000);

  const availableMonthlyCapacity = 68000;

  const totalAllocated = useMemo(() => {
    return destinations
      .filter((d) => !d.isPaused && !d.isArchived && d.status !== "COMPLETED")
      .reduce((acc, d) => acc + d.monthlyContribution, 0);
  }, [destinations]);

  const hasCapacityConflict = totalAllocated > availableMonthlyCapacity;
  const capacityDelta = totalAllocated - availableMonthlyCapacity;

  const filteredDestinations = useMemo(() => {
    return destinations.filter((d) => {
      if (filterTab === "ACTIVE") return !d.isPaused && !d.isArchived && d.status !== "COMPLETED";
      if (filterTab === "PAUSED") return d.isPaused && !d.isArchived;
      if (filterTab === "COMPLETED") return d.status === "COMPLETED";
      return !d.isArchived;
    });
  }, [destinations, filterTab]);

  const handleCreateDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDest: DestinationItem = {
      id: `dest-${Date.now()}`,
      name: newTitle.trim(),
      category: newCategory,
      targetAmount: newTargetAmount,
      currentAmount: newCurrentAmount,
      targetDate: newTargetDate,
      priority: newPriority,
      monthlyContribution: newMonthlyContribution,
      projectedCompletionDate: "2028-04-15",
      status: "ON_TRACK",
      notes: "Newly created destination.",
      decisionsAffecting: [],
      upcomingRisks: [],
      contributionHistory: [
        {
          id: `c-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          amount: newCurrentAmount,
          source: "Initial Seed Balance",
          balanceAfter: newCurrentAmount,
        },
      ],
    };

    setDestinations([...destinations, newDest]);
    setShowAddModal(false);
    setNewTitle("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight">
            Your Goals & Destinations
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Where your money is taking you. Clear arrival timelines for what matters.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleOpenCreateGoal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Interactive Goal Wizard</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreateGoal(false)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/80 px-4 py-2.5 text-xs font-semibold text-foreground transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Goal</span>
          </button>
        </div>
      </div>

      {showWizardModal && (
        <InteractiveGoalCreationWizard
          currency={currency}
          monthlyGrossIncome={180000}
          onClose={() => setShowWizardModal(false)}
          onGoalCreated={(newG) => {
            const created: DestinationItem = {
              id: `dest-${Date.now()}`,
              name: newG.title,
              category: newG.category.toUpperCase(),
              targetAmount: newG.targetAmount,
              currentAmount: newG.currentAmount,
              targetDate: "2028-06-30",
              priority: "HIGH",
              monthlyContribution: newG.monthlyContribution,
              projectedCompletionDate: "2028-04-15",
              status: "ON_TRACK",
              notes: "Created via step wizard.",
              decisionsAffecting: [],
              upcomingRisks: [],
              contributionHistory: [],
            };
            setDestinations((prev) => [...prev, created]);
          }}
        />
      )}

      {/* Capacity Monitor Bar */}
      {hasCapacityConflict ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Allocation Capacity Warning</span>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed font-medium">
            Allocating {formatCurrency(totalAllocated, currency)} / mo across goals, exceeding capacity by -{formatCurrency(capacityDelta, currency)} / mo.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              Allocating <strong className="text-foreground">{formatCurrency(totalAllocated, currency)} / mo</strong> of <strong className="text-primary">{formatCurrency(availableMonthlyCapacity, currency)} / mo</strong> monthly capacity.
            </span>
          </div>
          <span className="text-xs text-primary font-bold bg-primary/10 px-3 py-1 rounded-full shrink-0">
            {formatCurrency(availableMonthlyCapacity - totalAllocated, currency)} / mo Free Buffer
          </span>
        </div>
      )}

      {/* GAME CHANGER #4: GOAL VELOCITY ACCELERATOR */}
      <GoalVelocityBooster goalTitle={destinations[0]?.name || "Start my business"} currency={currency} />

      {/* GOAL DEADLINE PROACTIVE COUNTDOWN ALERT ENGINE */}
      <GoalCountdownAlertCard
        goalTitle={destinations[0]?.name || "Start my business"}
        targetDateStr={destinations[0]?.targetDate || "2027-12-31"}
        currentAmount={destinations[0]?.currentAmount || 260000}
        targetAmount={destinations[0]?.targetAmount || 500000}
        currency={currency}
        onOpenSettings={() => setShowNotificationModal(true)}
      />

      {showNotificationModal && (
        <GoalNotificationSettingsModal
          goalId={destinations[0]?.id || "dest-1"}
          goalTitle={destinations[0]?.name || "Start my business"}
          targetDate={destinations[0]?.targetDate || "2027-12-31"}
          onClose={() => setShowNotificationModal(false)}
        />
      )}

      {/* Filter Segmented Pills */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50 border border-border/60 w-fit max-w-full overflow-x-auto no-scrollbar">
        {(["ALL", "ACTIVE", "PAUSED", "COMPLETED"] as const).map((tab) => {
          const isActive = filterTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ALL" ? `All (${destinations.length})` : tab}
            </button>
          );
        })}
      </div>

      {/* DESTINATION CARDS GRID — DESTINATION-FIRST HIERARCHY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((dest) => {
          const progressPercent = Math.min(100, Math.round((dest.currentAmount / dest.targetAmount) * 100));

          return (
            <Link
              key={dest.id}
              href={`/app/goals/${dest.id}`}
              className="group rounded-3xl border border-border/80 bg-card p-6 space-y-6 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    Destination
                  </span>
                  <FinancialStatus status={dest.status} variant="badge" />
                </div>

                {/* 1. Destination Name */}
                <div>
                  <h3 className="text-xl font-bold font-editorial text-foreground group-hover:text-primary transition-colors">
                    {dest.name}
                  </h3>

                  {/* 2. Progress & Amounts */}
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-foreground">
                      {formatCurrency(dest.currentAmount, currency)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      of {formatCurrency(dest.targetAmount, currency)}
                    </span>
                  </div>

                  <div className="mt-2 w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="mt-1 flex justify-between text-xs text-muted-foreground font-medium">
                    <span>{progressPercent}% Complete</span>
                    <span>Pace: {formatCurrency(dest.monthlyContribution, currency)} / mo</span>
                  </div>
                </div>

                {/* 3. Arrival Date in TIME */}
                <div className="p-3.5 rounded-2xl border border-primary/20 bg-primary/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Projected Arrival:</span>
                    <div className="flex items-center gap-1 text-primary font-bold font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatMonthYear(dest.projectedCompletionDate)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Original Target:</span>
                    <span>{formatMonthYear(dest.targetDate)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary group-hover:underline">
                <span>Explore Trajectory</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* CREATE NEW DESTINATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-5 sm:p-7 space-y-4 shadow-2xl my-auto max-h-[92dvh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 shrink-0">
              <h3 className="text-lg sm:text-xl font-bold font-editorial text-foreground">
                Define New Goal Destination
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl border border-border/80 bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDestination} className="space-y-4 overflow-y-auto flex-1 pr-1 overscroll-contain">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Launch my business"
                  className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <MoneyInput
                  label="Target Amount"
                  value={newTargetAmount}
                  onChange={(val) => setNewTargetAmount(val)}
                  currency={currency}
                />

                <MoneyInput
                  label="Current Saved"
                  value={newCurrentAmount}
                  onChange={(val) => setNewCurrentAmount(val)}
                  currency={currency}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <MoneyInput
                  label="Monthly Contribution"
                  value={newMonthlyContribution}
                  onChange={(val) => setNewMonthlyContribution(val)}
                  currency={currency}
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-border/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-border/80 bg-secondary/50 py-3 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-xs transition-opacity cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRO PLAN UPGRADE GATE MODAL (FREE TIER LIMITED TO 1 GOAL) */}
      {showUpgradeGateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl my-auto">
            <button
              type="button"
              onClick={() => setShowUpgradeGateModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <PlanUpgradeGate
              requiredTier="pro"
              featureTitle="Unlock Unlimited Financial Destinations"
              featureTitleFr="Débloquez des Objectifs & Destinations Illimités"
              featureDescription="The Free plan includes 1 primary anchor goal. Upgrade to Aimly Pro to manage multiple life goals with automatic priority conflict resolution."
              featureDescriptionFr="La formule Gratuite inclut 1 objectif principal. Passez à Aimly Pro pour planifier plusieurs projets de vie simultanés avec arbitrage automatique des priorités."
            />
          </div>
        </div>
      )}
    </div>
  );
}
