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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-fadeIn">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Compass className="w-4 h-4" />
            <span>Target Horizons</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
            Your Destinations
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed font-medium">
            The life goals you are actively steering toward. UseAimly balances multi-destination cash flow to keep your plans on track.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-xs transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Destination</span>
        </button>
      </div>

      {/* MULTI-DESTINATION CAPACITY CONFLICT MONITOR */}
      {hasCapacityConflict ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Capital Capacity Over-Allocation Detected</span>
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
            You are currently allocating{" "}
            <strong className="font-bold">
              {formatCurrency(totalAllocated, currency)} / month
            </strong>{" "}
            across active destinations, but your available monthly capacity is{" "}
            <strong className="font-bold text-primary">
              {formatCurrency(availableMonthlyCapacity, currency)} / month
            </strong>
            .
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
            <span>Monthly Shortfall: -{formatCurrency(capacityDelta, currency)} / month</span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground font-medium">
              Allocating{" "}
              <strong className="text-foreground font-bold">
                {formatCurrency(totalAllocated, currency)} / mo
              </strong>{" "}
              of{" "}
              <strong className="text-primary font-bold">
                {formatCurrency(availableMonthlyCapacity, currency)} / mo
              </strong>{" "}
              capacity across active destinations.
            </span>
          </div>
          <span className="text-xs text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full shrink-0 self-start sm:self-auto">
            {formatCurrency(availableMonthlyCapacity - totalAllocated, currency)} / mo Unassigned Buffer
          </span>
        </div>
      )}

      {/* FILTER TABS (Mobile responsive scroll container) */}
      <div className="border-b border-border/60 pb-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {(["ALL", "ACTIVE", "PAUSED", "COMPLETED"] as const).map((tab) => {
            const labels = {
              ALL: `All Destinations (${destinations.length})`,
              ACTIVE: "Active",
              PAUSED: "Paused",
              COMPLETED: "Completed",
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all ${
                  filterTab === tab
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
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
              className="group rounded-xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Status & Priority Row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {dest.priority === "HIGH" ? "High Priority" : dest.priority === "MEDIUM" ? "Medium Priority" : "Low Priority"}
                  </span>
                  <FinancialStatus status={dest.status} variant="badge" />
                </div>

                {/* Title & Amount */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {dest.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-foreground">
                      {formatCurrency(dest.currentAmount, currency)}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
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
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>{progressPercent}% Complete</span>
                    <span>Remaining: {formatCurrency(dest.targetAmount - dest.currentAmount, currency)}</span>
                  </div>
                </div>

                {/* Monthly Pace & Arrival Date */}
                <div className="p-3 rounded-lg border border-border/60 bg-secondary/30 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Monthly Pace:</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(dest.monthlyContribution, currency)} / month
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Projected Arrival:</span>
                    <span className="font-bold text-primary">
                      {formatMonthYear(dest.projectedCompletionDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-xs pt-1.5 border-t border-border/50">
                    <span>Target Date:</span>
                    <span>{formatMonthYear(dest.targetDate)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary group-hover:underline">
                <span>View Trajectory Detail</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* CREATE NEW DESTINATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-lg w-full rounded-2xl border border-border/80 bg-card p-6 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-xl font-bold text-foreground">
                  Define a New Destination
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Give your money a clear target and timeline.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
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
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2.5 text-xs sm:text-sm font-medium text-foreground focus:outline-hidden focus:border-primary"
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
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary"
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
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        newPriority === p
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/80 bg-background text-muted-foreground"
                      }`}
                    >
                      {p === "HIGH" ? "High" : p === "MEDIUM" ? "Medium" : "Low"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-border/80 bg-secondary/50 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-xs transition-opacity"
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
