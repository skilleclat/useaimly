"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { INITIAL_DESTINATIONS, DestinationItem } from "@/lib/destinations/destinations-data";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";
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
  ShieldAlert,
  Briefcase,
  Home,
  Car,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function GoalsPage() {
  const { user, profile, firstName } = useAuth();
  const { currency, format } = useCurrency();
  const { t, language } = useI18n();
  const isFr = language === "fr";

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

  // Form State for Quick Goal Creation
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("SAVINGS");
  const [newTargetAmount, setNewTargetAmount] = useState<number>(300000);
  const [newCurrentAmount, setNewCurrentAmount] = useState<number>(50000);
  const [newTargetDate, setNewTargetDate] = useState("2028-06-30");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [newMonthlyContribution, setNewMonthlyContribution] = useState<number>(15000);

  // Totals for Donut Summary
  const totalSaved = useMemo(() => {
    return destinations.reduce((acc, d) => acc + d.currentAmount, 0);
  }, [destinations]);

  const totalTarget = useMemo(() => {
    return destinations.reduce((acc, d) => acc + d.targetAmount, 0);
  }, [destinations]);

  const overallPercent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  // Donut SVG circumference calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercent / 100) * circumference;

  // Filtered goals
  const filteredDestinations = useMemo(() => {
    return destinations.filter((d) => {
      if (filterTab === "ACTIVE") return !d.isPaused && !d.isArchived && d.status !== "COMPLETED";
      if (filterTab === "PAUSED") return d.isPaused && !d.isArchived;
      if (filterTab === "COMPLETED") return d.status === "COMPLETED";
      return !d.isArchived;
    });
  }, [destinations, filterTab]);

  const activeGoalsCount = destinations.filter((d) => !d.isPaused && !d.isArchived && d.status !== "COMPLETED").length;

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

  const getCategoryIcon = (category: string, name: string) => {
    const cat = category.toUpperCase();
    const nm = name.toLowerCase();

    if (cat.includes("EMERGENCY") || nm.includes("emergency") || nm.includes("urgence") || nm.includes("sécurité")) {
      return {
        icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
        bg: "bg-rose-500/10",
      };
    }
    if (cat.includes("BUSINESS") || nm.includes("business") || nm.includes("entreprise")) {
      return {
        icon: <Briefcase className="w-5 h-5 text-emerald-500" />,
        bg: "bg-emerald-500/10",
      };
    }
    if (cat.includes("HOME") || nm.includes("home") || nm.includes("house") || nm.includes("maison") || nm.includes("immobilier")) {
      return {
        icon: <Home className="w-5 h-5 text-amber-500" />,
        bg: "bg-amber-500/10",
      };
    }
    if (cat.includes("CAR") || cat.includes("VEHICLE") || nm.includes("car") || nm.includes("voiture")) {
      return {
        icon: <Car className="w-5 h-5 text-blue-500" />,
        bg: "bg-blue-500/10",
      };
    }
    return {
      icon: <Target className="w-5 h-5 text-[#FF5533]" />,
      bg: "bg-primary/10",
    };
  };

  return (
    <div className="max-w-7xl 2xl:max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn font-sans pb-12 sm:pb-8">
      
      {/* ─────────────────────────────────────────────────────────────
          MASTER CARD: EXACT SIGNATURE GOALS HERO
          - Greeting: "Hello Pros 👋"
          - Subtitle: "Every dollar saved is one step closer to your dreams."
          - "+ Create Goal" button (Emerald)
          - Circular Donut Progress (53% PROGRESS)
          - Total Saved & Total Target Goals
          - "View All Goals (3) >"
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-[2.5rem] border border-border/80 bg-card p-6 sm:p-8 2xl:p-10 space-y-6 shadow-sm">
        
        {/* Top Greeting & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <span>{isFr ? `Bonjour ${firstName || "Pros"}` : `Hello ${firstName || "Pros"}`}</span>
              <span>👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {isFr
                ? "Chaque somme épargnée vous rapproche un peu plus de vos rêves."
                : "Every dollar saved is one step closer to your dreams."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleOpenCreateGoal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isFr ? "+ Créer un Objectif" : "+ Create Goal"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCreateGoal(false)}
              className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border px-4 py-3 text-xs font-bold text-foreground transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{isFr ? "Rapide" : "Quick"}</span>
            </button>
          </div>
        </div>

        {/* Circular Progress & Totals Summary Box */}
        <div className="rounded-3xl border border-border/80 bg-secondary/40 p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 sm:gap-8">
            
            {/* Donut Progress Ring */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-secondary stroke-current opacity-80"
                  strokeWidth="9"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-emerald-500 stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl sm:text-2xl font-black font-mono text-foreground leading-none">
                  {overallPercent}%
                </span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mt-1">
                  {isFr ? "PROGRESSION" : "PROGRESS"}
                </span>
              </div>
            </div>

            {/* Total Saved & Total Target Values */}
            <div className="space-y-3 text-left">
              <div>
                <span className="text-[11px] font-mono text-muted-foreground font-bold uppercase tracking-wider block">
                  {isFr ? "TOTAL ÉPARGNÉ" : "TOTAL SAVED"}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
                  {currency} {formatCurrency(totalSaved, currency).replace(/[^0-9,.\s]/g, "").trim()}
                </div>
              </div>

              <div>
                <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground font-bold uppercase tracking-wider block">
                  {isFr ? "TOTAL OBJECTIFS VISÉS" : "TOTAL TARGET GOALS"}
                </span>
                <div className="text-sm sm:text-base font-bold font-mono text-muted-foreground">
                  {currency} {formatCurrency(totalTarget, currency).replace(/[^0-9,.\s]/g, "").trim()}
                </div>
              </div>
            </div>

          </div>

          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border/80 text-xs font-bold text-foreground hover:bg-secondary transition-colors cursor-pointer shadow-2xs self-stretch sm:self-auto justify-center"
          >
            <span>{isFr ? `Tous les Objectifs (${destinations.length})` : `View All Goals (${destinations.length})`}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

      </div>


      {/* ─────────────────────────────────────────────────────────────
          SECTION: MY ACTIVE GOALS LIST & CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4 text-left">
        
        {/* Section Header & Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground">
            {isFr ? `MES OBJECTIFS ACTIFS (${activeGoalsCount})` : `MY ACTIVE GOALS (${activeGoalsCount})`}
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50 border border-border/60 w-fit max-w-full overflow-x-auto no-scrollbar">
            {(["ALL", "ACTIVE", "PAUSED", "COMPLETED"] as const).map((tab) => {
              const isActive = filterTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "ALL" ? (isFr ? `Tous (${destinations.length})` : `All (${destinations.length})`) : tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Goals Cards Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
          {filteredDestinations.map((dest) => {
            const pct = dest.targetAmount > 0 ? Math.min(100, Math.round((dest.currentAmount / dest.targetAmount) * 100)) : 0;
            const catVisual = getCategoryIcon(dest.category, dest.name);
            const isOnTrack = dest.status === "ON_TRACK";
            const isCompleted = dest.status === "COMPLETED";

            return (
              <Link
                key={dest.id}
                href={`/app/goals/${dest.id}`}
                className="p-5 sm:p-6 rounded-3xl border border-border/80 bg-card hover:border-emerald-500/50 transition-all space-y-4 shadow-sm group cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  
                  {/* Top Row: Icon + Name + Status Badge + Percentage */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${catVisual.bg} shrink-0`}>
                        {catVisual.icon}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {dest.name}
                        </h3>
                        <span className="text-xs text-muted-foreground font-mono">
                          {currency} {formatCurrency(dest.currentAmount, currency).replace(/[^0-9,.\s]/g, "").trim()} of {currency} {formatCurrency(dest.targetAmount, currency).replace(/[^0-9,.\s]/g, "").trim()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isCompleted
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                            : isOnTrack
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {isCompleted ? (isFr ? "Terminé" : "Completed") : isOnTrack ? (isFr ? "Sur les rails" : "On track") : (isFr ? "À surveiller" : "Attention")}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-foreground">{pct}%</span>
                    </div>
                  </div>

                  {/* Sleek Horizontal Progress Bar with Glowing Emerald Tone */}
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden border border-border/40 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? "bg-blue-500"
                          : isOnTrack
                          ? "bg-[#00A859]"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                </div>

                {/* Bottom Timeline & Details */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{isFr ? "Échéance :" : "Target:"} {formatMonthYear(dest.targetDate)}</span>
                  </div>

                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono group-hover:underline flex items-center gap-1">
                    <span>{isFr ? "Détails" : "Explore"}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

              </Link>
            );
          })}
        </div>

      </div>


      {/* ─────────────────────────────────────────────────────────────
          SUPPORTING TOOLS: VELOCITY ACCELERATOR & COUNTDOWN ALERTS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <GoalVelocityBooster goalTitle={destinations[0]?.name || "Business Fund"} currency={currency} />
        
        <GoalCountdownAlertCard
          goalTitle={destinations[0]?.name || "Emergency Fund"}
          targetDateStr={destinations[0]?.targetDate || "2027-12-31"}
          currentAmount={destinations[0]?.currentAmount || 18000}
          targetAmount={destinations[0]?.targetAmount || 20000}
          currency={currency}
          onOpenSettings={() => setShowNotificationModal(true)}
        />
      </div>

      {showNotificationModal && (
        <GoalNotificationSettingsModal
          goalId={destinations[0]?.id || "dest-1"}
          goalTitle={destinations[0]?.name || "Emergency Fund"}
          targetDate={destinations[0]?.targetDate || "2027-12-31"}
          onClose={() => setShowNotificationModal(false)}
        />
      )}

      {/* INTERACTIVE WIZARD MODAL */}
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

      {/* QUICK GOAL CREATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-14 sm:pt-20 pb-8 px-3 sm:px-6 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-5 sm:p-7 space-y-4 shadow-2xl max-h-[92dvh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 shrink-0">
              <h3 className="text-lg sm:text-xl font-bold font-editorial text-foreground">
                {isFr ? "Définir un Nouvel Objectif" : "Define New Goal Destination"}
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
                  {isFr ? "Nom de l'Objectif" : "Goal Name"}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isFr ? "ex: Lancer mon entreprise" : "e.g. Launch my business"}
                  className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <MoneyInput
                  label={isFr ? "Montant Cible" : "Target Amount"}
                  value={newTargetAmount}
                  onChange={(val) => setNewTargetAmount(val)}
                  currency={currency}
                />

                <MoneyInput
                  label={isFr ? "Déjà Épargné" : "Current Saved"}
                  value={newCurrentAmount}
                  onChange={(val) => setNewCurrentAmount(val)}
                  currency={currency}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <MoneyInput
                  label={isFr ? "Épargne Mensuelle" : "Monthly Contribution"}
                  value={newMonthlyContribution}
                  onChange={(val) => setNewMonthlyContribution(val)}
                  currency={currency}
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    {isFr ? "Date Cible" : "Target Date"}
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
                  {isFr ? "Annuler" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white hover:opacity-95 shadow-xs transition-opacity cursor-pointer"
                >
                  {isFr ? "Créer l'Objectif" : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRO PLAN UPGRADE GATE MODAL */}
      {showUpgradeGateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-14 sm:pt-20 pb-8 px-3 sm:px-6 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl">
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
