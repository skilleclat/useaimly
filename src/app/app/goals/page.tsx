"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { INITIAL_DESTINATIONS, DestinationItem } from "@/lib/destinations/destinations-data";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";
import { CurrencyCode } from "@/lib/types/finance";
import { FinancialStatus } from "@/components/design-system/FinancialStatus";
import { GoalProgress } from "@/components/design-system/GoalProgress";
import { MoneyInput } from "@/components/design-system/MoneyInput";
import {
  Target,
  Plus,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  TrendingUp,
  X,
  Filter,
} from "lucide-react";

export default function GoalsPage() {
  const { profile } = useAuth();
  const currency = (profile?.preferred_currency || "KES") as CurrencyCode;

  const [destinations, setDestinations] = useState<DestinationItem[]>(INITIAL_DESTINATIONS);
  const [filterTab, setFilterTab] = useState<"ALL" | "ACTIVE" | "PAUSED" | "COMPLETED">("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Destination Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("SAVINGS");
  const [newTargetAmount, setNewTargetAmount] = useState<number>(300000);
  const [newCurrentAmount, setNewCurrentAmount] = useState<number>(50000);
  const [newTargetDate, setNewTargetDate] = useState("2028-06-30");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [newMonthlyContribution, setNewMonthlyContribution] = useState<number>(15000);

  // Available Monthly Capacity (Free Cash Flow)
  const availableMonthlyCapacity = 68000;

  // Calculate Total Active Allocations
  const totalAllocated = useMemo(() => {
    return destinations
      .filter((d) => !d.isPaused && !d.isArchived && d.status !== "COMPLETED")
      .reduce((acc, d) => acc + d.monthlyContribution, 0);
  }, [destinations]);

  const hasCapacityConflict = totalAllocated > availableMonthlyCapacity;
  const capacityDelta = totalAllocated - availableMonthlyCapacity;

  // Filtered Destinations
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
            <Compass className="w-4 h-4" />
            <span>Target Horizons</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
            Your destinations
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            The financial horizons you are actively steering toward. Useaimly balances multi-destination cash flow to ensure you remain on track.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Destination</span>
        </button>
      </div>

      {/* MULTI-DESTINATION CAPACITY CONFLICT MONITOR */}
      {hasCapacityConflict ? (
        <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-5 sm:p-6 space-y-3 shadow-elevation-1 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold font-editorial text-base">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Capital Capacity Over-Allocation Detected</span>
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
            You are currently allocating{" "}
            <strong className="font-financial font-bold">
              {formatCurrency(totalAllocated, currency)}/month
            </strong>{" "}
            across active destinations, but your available monthly capacity is{" "}
            <strong className="font-financial font-bold">
              {formatCurrency(availableMonthlyCapacity, currency)}/month
            </strong>
            . Lower-priority destinations will experience timeline delays or require adjusting your contribution split.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono">
            <span className="text-amber-700 dark:text-amber-300 font-bold">
              Monthly Shortfall: -{formatCurrency(capacityDelta, currency)}/mo
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              Allocating{" "}
              <strong className="text-foreground font-financial">
                {formatCurrency(totalAllocated, currency)}/mo
              </strong>{" "}
              of{" "}
              <strong className="text-primary font-financial">
                {formatCurrency(availableMonthlyCapacity, currency)}/mo
              </strong>{" "}
              capacity across active destinations.
            </span>
          </div>
          <span className="font-mono text-[11px] text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full">
            {formatCurrency(availableMonthlyCapacity - totalAllocated, currency)}/mo Unassigned Buffer
          </span>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(["ALL", "ACTIVE", "PAUSED", "COMPLETED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                filterTab === tab
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ALL" ? `All Destinations (${destinations.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* DESTINATIONS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((dest) => {
          const progressPercent = Math.min(100, Math.round((dest.currentAmount / dest.targetAmount) * 100));

          return (
            <Link
              key={dest.id}
              href={`/app/goals/${dest.id}`}
              className="group rounded-3xl border border-border bg-card p-6 space-y-5 shadow-elevation-1 hover:border-primary/40 hover:shadow-elevation-2 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Status & Priority Row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground uppercase">
                    {dest.priority} Priority
                  </span>
                  <FinancialStatus status={dest.status} variant="badge" />
                </div>

                {/* Title & Goal Cap */}
                <div>
                  <h3 className="text-xl font-bold font-editorial text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {dest.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold font-financial text-foreground">
                      {formatCurrency(dest.currentAmount, currency)}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      of {formatCurrency(dest.targetAmount, currency)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                    <span>{progressPercent}% Complete</span>
                    <span>Remaining: {formatCurrency(dest.targetAmount - dest.currentAmount, currency)}</span>
                  </div>
                </div>

                {/* Monthly Pace & Projected Date */}
                <div className="p-3.5 rounded-2xl border border-border/80 bg-background/60 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Pace:</span>
                    <span className="font-financial font-bold text-foreground">
                      {formatCurrency(dest.monthlyContribution, currency)}/mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Projected Arrival:</span>
                    <span className="font-bold text-foreground">
                      {formatMonthYear(dest.projectedCompletionDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px] pt-1 border-t border-border/60">
                    <span>Target Horizon:</span>
                    <span>{formatMonthYear(dest.targetDate)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary group-hover:underline">
                <span>View Trajectory & Ledger</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* CREATE NEW DESTINATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-lg w-full rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-elevation-2 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-xl font-bold font-editorial text-foreground">
                  Define a New Destination
                </h3>
                <p className="text-xs text-muted-foreground">
                  Give your money a clear target and timeline.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDestination} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Destination Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Buy a Home Deposit"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MoneyInput
                  label="Target Amount"
                  value={newTargetAmount}
                  onChange={(val) => setNewTargetAmount(val)}
                  currency={currency}
                />

                <MoneyInput
                  label="Initial Capital"
                  value={newCurrentAmount}
                  onChange={(val) => setNewCurrentAmount(val)}
                  currency={currency}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MoneyInput
                  label="Monthly Contribution"
                  value={newMonthlyContribution}
                  onChange={(val) => setNewMonthlyContribution(val)}
                  currency={currency}
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["HIGH", "MEDIUM", "LOW"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                        newPriority === p
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-2xl border border-border bg-secondary py-3 text-xs font-bold text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-sm"
                >
                  Create Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
