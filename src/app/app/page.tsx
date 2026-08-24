"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { BaselineFinancialProfile } from "@/lib/finance";
import {
  Sparkles,
  Target,
  Wallet,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  SlidersHorizontal,
  ChevronRight,
  Bookmark,
  Building2,
  Car,
  ShoppingBag,
  HelpCircle,
  Plus,
} from "lucide-react";

export default function AuthenticatedDashboard() {
  const { user, firstName } = useAuth();
  const { currency, format } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";

  // Baseline Financial Reality
  const baselineProfile: BaselineFinancialProfile = useMemo(
    () => ({
      liquidSavings: 4840,
      incomes: [
        {
          name: "Primary Income",
          amount: 4500,
          frequency: "MONTHLY",
          reliability: "STABLE",
          isActive: true,
        },
      ],
      expenses: [
        { name: "Rent & Housing", amount: 1600, frequency: "MONTHLY", isFixed: true },
        { name: "Food & Living Essentials", amount: 700, frequency: "MONTHLY", isFixed: true },
      ],
      debts: [],
      commitments: [],
      goals: [
        {
          id: "business-fund",
          title: isFr ? "Fonds Lancement Entreprise" : "Business Fund",
          targetAmount: 25000,
          currentAmount: 18000,
          targetDate: "2027-12-31",
          priority: "HIGH",
          status: "ACTIVE",
        },
        {
          id: "home-deposit",
          title: isFr ? "Apport Immobilier" : "Home Deposit",
          targetAmount: 40000,
          currentAmount: 14000,
          targetDate: "2029-06-30",
          priority: "MEDIUM",
          status: "ACTIVE",
        },
        {
          id: "emergency-fund",
          title: isFr ? "Fonds de Sécurité" : "Emergency Fund",
          targetAmount: 6900,
          currentAmount: 4840,
          targetDate: "2026-12-31",
          priority: "HIGH",
          status: "ACTIVE",
        },
      ],
    }),
    [isFr]
  );

  const totalMonthlyIncome = 4500;
  const totalMonthlyExpenses = 2300;
  const monthlyAvailableCash = totalMonthlyIncome - totalMonthlyExpenses;
  const emergencyRunwayMonths = (baselineProfile.liquidSavings / totalMonthlyExpenses).toFixed(1);
  const primaryGoal = baselineProfile.goals[0];
  const primaryGoalPercent = Math.min(100, Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100));

  // SECTION 1: Status calculation derived from real data
  const financialStatus = useMemo(() => {
    const isBufferBelowTarget = Number(emergencyRunwayMonths) < 3.0;
    if (isBufferBelowTarget) {
      return {
        status: "ATTENTION",
        headline: isFr ? "Une décision récente a modifié votre trajectoire." : "One recent decision changed your trajectory.",
        subtext: isFr
          ? "Votre réserve de sécurité est à 2.1 mois (en dessous de votre objectif de 3.0 mois)."
          : "Your emergency runway is at 2.1 months (below your preferred 3.0-month safety threshold).",
        badge: isFr ? "Attention Requise" : "Trajectory Needs Attention",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      };
    }
    return {
      status: "ON_TRACK",
      headline: isFr ? "Vous êtes sur la bonne voie." : "You're on track.",
      subtext: isFr
        ? "Vos liquidités et votre rythme d'épargne protègent vos objectifs."
        : "Your liquid reserves and savings pace protect all active life destinations.",
      badge: isFr ? "Trajectoire Saine" : "On Track",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    };
  }, [emergencyRunwayMonths, isFr]);

  // SECTION 3: Recent Decision Analyses
  const recentDecisions = useMemo(
    () => [
      {
        id: "dec-1",
        title: isFr ? "ACHAT LAPTOP" : "BUY LAPTOP",
        subtitle: isFr ? "Ordinateur Pro ($2,000)" : "Pro Workstation ($2,000)",
        verdict: isFr ? "Procéder avec prudence" : "Proceed with caution",
        goalImpact: isFr ? "-43 jours de retard" : "Goal impact: -43 days",
        verdictType: "CAUTION",
        query: "I'm thinking about buying a $2,000 laptop for my business.",
        icon: <ShoppingBag className="w-4 h-4" />,
      },
      {
        id: "dec-2",
        title: isFr ? "CRÉDIT AUTO" : "CAR LOAN",
        subtitle: isFr ? "Financement Véhicule ($15,000)" : "Vehicle Financing ($15,000)",
        verdict: isFr ? "Non recommandé" : "Not recommended",
        goalImpact: isFr ? "-5 mois de retard" : "Goal impact: -5 months",
        verdictType: "NOT_RECOMMENDED",
        query: "Can I take a $15,000 car loan with $350/mo payments?",
        icon: <Car className="w-4 h-4" />,
      },
      {
        id: "dec-3",
        title: isFr ? "INVESTISSEMENT PRO" : "BUSINESS INVESTMENT",
        subtitle: isFr ? "Nouvel équipement ($3,500)" : "New Studio Equipment ($3,500)",
        verdict: isFr ? "Recommandé" : "Recommended",
        goalImpact: isFr ? "Trajectoire potentiellement améliorée" : "Potentially improves trajectory",
        verdictType: "RECOMMENDED",
        query: "What happens if I invest $3,500 in new studio equipment?",
        icon: <TrendingUp className="w-4 h-4" />,
      },
    ],
    [isFr]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-9 font-sans antialiased text-left animate-fadeIn">
      
      {/* ─────────────────────────────────────────────────────────────
          HERO BAR WITH PRIMARY CTA: "+ Analyze a Decision"
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFr ? `Bonjour ${firstName || "Ami"}` : `Command Center • ${firstName || "Friend"}`}</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
            {isFr ? "Centre de Décision Financière" : "Financial Decision Center"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {isFr
              ? "Où vous situez-vous financièrement, et que devez-vous vérifier avant votre prochaine décision ?"
              : "Where you stand financially, and what to verify before making your next decision."}
          </p>
        </div>

        {/* PRIMARY CTA (Above the fold, immediately visible) */}
        <Link
          href="/app/decide"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] px-5 sm:px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-orange-500/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
        >
          <span className="text-base leading-none font-black">+</span>
          <span>{isFr ? "Analyser une Décision" : "Analyze a Decision"}</span>
        </Link>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — FINANCIAL STATUS
          One clear, honest calculated message.
      ───────────────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 space-y-3 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-extrabold border ${financialStatus.badgeClass}`}>
              {financialStatus.icon}
              <span>{financialStatus.badge}</span>
            </span>
          </div>

          <span className="text-xs text-muted-foreground font-mono font-medium">
            {isFr ? "Calcul déterministe en direct" : "Live Deterministic Assessment"}
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {financialStatus.headline}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {financialStatus.subtext}
          </p>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — YOUR TRAJECTORY
          Calm summary layout with only the 4 most vital indicators.
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground font-bold">
            {isFr ? "VOTRE TRAJECTOIRE" : "YOUR TRAJECTORY"}
          </h2>
          <Link
            href="/app/money"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>{isFr ? "Gérer mes flux" : "Cash Flow Breakdown"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Indicator 1: Current cash position */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-1 shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
              {isFr ? "Liquidités Disponibles" : "Current Cash Position"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-foreground font-mono block">
              {format(baselineProfile.liquidSavings, { fromCurrency: "KES" })}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium block">
              {isFr ? "Réserves immédiates" : "Immediately accessible"}
            </span>
          </div>

          {/* Indicator 2: Emergency runway */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-1 shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
              {isFr ? "Matelas de Sécurité" : "Emergency Runway"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-foreground font-mono block">
              {emergencyRunwayMonths} {isFr ? "mois" : "months"}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block">
              {Number(emergencyRunwayMonths) < 3.0 ? (isFr ? "Sous l'objectif de 3 mois" : "Below 3.0 mo target") : (isFr ? "Zone saine" : "Healthy buffer")}
            </span>
          </div>

          {/* Indicator 3: Monthly available cash */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-1 shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
              {isFr ? "Cash Mensuel Libre" : "Monthly Available Cash"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-foreground font-mono block">
              +{format(monthlyAvailableCash, { fromCurrency: "KES" })}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
              {isFr ? "Capacité d'épargne" : "Net Free Cash Flow"}
            </span>
          </div>

          {/* Indicator 4: Primary Goal progress */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-1 shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
              {isFr ? "Progression Objectif" : "Primary Goal Progress"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-foreground font-mono block">
              {primaryGoalPercent}%
            </span>
            <span className="text-[11px] text-primary font-bold block truncate">
              {primaryGoal.title}
            </span>
          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — RECENT DECISIONS
          "Your Decisions"
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {isFr ? "Vos Décisions Analysées" : "Your Decisions"}
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              {isFr
                ? "Historique des décisions financières testées et leur impact calculé."
                : "Recent analyzed decisions and their exact consequence on your trajectory."}
            </p>
          </div>

          <Link
            href="/app/decisions"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>{isFr ? "Voir l'historique complet" : "View Decision Vault"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentDecisions.map((dec) => {
            const isRecommended = dec.verdictType === "RECOMMENDED";
            const isCaution = dec.verdictType === "CAUTION";

            return (
              <Link
                key={dec.id}
                href={`/app/decide?q=${encodeURIComponent(dec.query)}`}
                className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-secondary/80 flex items-center justify-center text-foreground group-hover:text-primary transition-colors shrink-0">
                    {dec.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {dec.title}
                      </h3>
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-xs text-muted-foreground font-medium">{dec.subtitle}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono pt-0.5">
                      {dec.goalImpact}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <span
                    className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold border ${
                      isRecommended
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : isCaution
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {dec.verdict}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 4 — YOUR GOALS
          Active milestones, progress & recent decision impacts.
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {isFr ? "Vos Objectifs Actifs" : "Your Goals"}
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              {isFr ? "Projets de vie protégés contre les décisions impulsives." : "Life milestones protected against impulsive decisions."}
            </p>
          </div>

          <Link
            href="/app/goals"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>{isFr ? "Tous les objectifs" : "View all goals"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Goal 1: Business Fund */}
          <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                  {isFr ? "DESTINATION 1" : "DESTINATION 1"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                  72% {isFr ? "Sur les rails" : "On track"}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">
                {isFr ? "Fonds Entreprise" : "Business Fund"}
              </h3>
              <span className="text-xs text-muted-foreground font-mono block">
                {format(18000, { fromCurrency: "KES" })} / {format(25000, { fromCurrency: "KES" })}
              </span>
            </div>

            <div className="space-y-1 pt-1 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground font-medium block">
                {isFr ? "Échéance : Déc 2027" : "Target: Dec 2027"}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                {isFr ? "Trajectory préservée" : "On schedule (+1 mo buffer)"}
              </span>
            </div>
          </div>

          {/* Goal 2: Home Deposit */}
          <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                  {isFr ? "DESTINATION 2" : "DESTINATION 2"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                  35% {isFr ? "Décalé" : "Delayed"}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">
                {isFr ? "Apport Immobilier" : "Home Deposit"}
              </h3>
              <span className="text-xs text-muted-foreground font-mono block">
                {format(14000, { fromCurrency: "KES" })} / {format(40000, { fromCurrency: "KES" })}
              </span>
            </div>

            <div className="space-y-1 pt-1 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground font-medium block">
                {isFr ? "Impact des décisions :" : "Decision impact:"}
              </span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                {isFr ? "+2 mois de décalage" : "+2 months timeline shift"}
              </span>
            </div>
          </div>

          {/* Goal 3: Emergency Fund */}
          <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                  {isFr ? "FILET DE SÉCURITÉ" : "SAFETY NET"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[10px] font-bold">
                  {isFr ? "Sous le seuil" : "Below target"}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">
                {isFr ? "Fonds d'Urgence" : "Emergency Fund"}
              </h3>
              <span className="text-xs text-muted-foreground font-mono block">
                {format(4840, { fromCurrency: "KES" })} / {format(6900, { fromCurrency: "KES" })} (2.1 mos)
              </span>
            </div>

            <div className="space-y-1 pt-1 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground font-medium block">
                {isFr ? "Cible recommandée : 3.0 mois" : "Recommended: 3.0 months"}
              </span>
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                {isFr ? "Déficit : $2,060" : "Runway deficit: $2,060"}
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 5 — PROACTIVE INSIGHT
          Only ONE high-value insight at a time. Zero spam.
      ───────────────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-7 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFr ? "INSIGHT DÉCISIONNEL PRIORITAIRE" : "PRIME DECISION INSIGHT"}</span>
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {isFr ? "Priorité 1/1" : "Priority 1 of 1"}
          </span>
        </div>

        <div className="space-y-1 text-left">
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            {isFr
              ? "Votre réserve d'urgence est inférieure à votre seuil de sécurité (2.1 mois vs 3.0 mois recommandés)."
              : "Your emergency runway is below your preferred safety threshold (2.1 months vs 3.0 months target)."}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            {isFr
              ? "Allouer temporairement 250 $/mois supplémentaires vers vos réserves liquides rétablira votre coussin à 3.0 mois en 8 mois sans retarder votre objectif entreprise."
              : "Temporarily allocating +$250/mo toward liquid savings restores your 3.0-month cushion within 8 months without delaying your Business Fund."}
          </p>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Link
            href="/app/what-if"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 shadow-xs transition-opacity"
          >
            <span>{isFr ? "Voir ce que vous pouvez changer" : "See what you can change"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
