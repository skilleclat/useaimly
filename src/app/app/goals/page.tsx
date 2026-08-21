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

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-xs transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

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

      {/* Filter Segmented Pills */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50 border border-border/60 w-fit">
        {(["ALL", "ACTIVE", "PAUSED", "COMPLETED"] as const).map((tab) => {
          const isActive = filterTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-xl font-bold font-editorial text-foreground">
                Define New Goal Destination
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl border border-border/80 bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDestination} className="space-y-4">
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
                  className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm font-medium text-foreground focus:outline-hidden focus:border-primary"
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
                  label="Current Saved"
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

              <div className="flex items-center gap-3 pt-3 border-t border-border/60">
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
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
