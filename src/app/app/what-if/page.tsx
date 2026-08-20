"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear, addMonths, formatDateToISO } from "@/lib/utils/date";
import { CurrencyCode } from "@/lib/types/finance";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Check,
  AlertCircle,
  Plus,
  RefreshCw,
  Sliders,
  DollarSign,
  Wallet,
  CheckCircle2,
  Heart,
  Edit3,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowLeft,
  Info,
} from "lucide-react";

type ScenarioType =
  | "SAVE_MORE"
  | "SAVE_LESS"
  | "EARN_MORE"
  | "EARN_LESS"
  | "SPEND_MORE"
  | "SPEND_LESS"
  | "TAKE_LOAN"
  | "REPAY_DEBT";

interface PresetScenario {
  id: string;
  name: string;
  type: ScenarioType;
  monthlyDelta: number;
  oneTimeDelta: number;
  badge: string;
  desc: string;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "sc-1",
    name: "Épargner +10 000 KES / mois",
    type: "SAVE_MORE",
    monthlyDelta: 10000,
    oneTimeDelta: 0,
    badge: "+4 mois d'avance",
    desc: "Allouez 10 000 KES de plus chaque mois directement vers votre destination principale.",
  },
  {
    id: "sc-2",
    name: "Consulting d'appoint (+25k/mo)",
    type: "EARN_MORE",
    monthlyDelta: 25000,
    oneTimeDelta: 0,
    badge: "+8 mois d'avance",
    desc: "Générez un revenu complémentaire et injectez 100% du net dans vos économies.",
  },
  {
    id: "sc-3",
    name: "Réduire les abonnements (-12k/mo)",
    type: "SPEND_LESS",
    monthlyDelta: 12000,
    oneTimeDelta: 0,
    badge: "+5 mois d'avance",
    desc: "Optimisez vos charges fixes pour libérer du flux de trésorerie disponible.",
  },
];

export default function WhatIfPage() {
  const { profile } = useAuth();
  const currency = (profile?.preferred_currency || "KES") as CurrencyCode;

  // Baseline Financial Reality
  const baseline = {
    monthlyGrossIncome: 180000,
    monthlyExpenses: 112000,
    monthlyDebtService: 0,
    monthlyFreeCashFlow: 68000,
    currentAllocatedToGoal: 45000,
    goalTitle: "Start my business",
    targetAmount: 500000,
    currentSaved: 180000,
    remainingAmount: 320000,
    baselineTargetDate: "2027-12-31",
    baselineArrivalDate: "2027-11-15",
  };

  // Selected scenario state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("sc-1");
  const [customMonthlyDelta, setCustomMonthlyDelta] = useState<number>(10000);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasAppliedPlan, setHasAppliedPlan] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const activeScenario = useMemo(() => {
    return PRESET_SCENARIOS.find((s) => s.id === selectedScenarioId) || PRESET_SCENARIOS[0];
  }, [selectedScenarioId]);

  const monthlyDelta = activeScenario.monthlyDelta || customMonthlyDelta;

  // Deterministic simulation
  const simulation = useMemo(() => {
    const newAllocated = Math.max(5000, baseline.currentAllocatedToGoal + monthlyDelta);
    const monthsRequired = Math.ceil(baseline.remainingAmount / newAllocated);
    const monthsSaved = Math.round((monthlyDelta / baseline.currentAllocatedToGoal) * 16);

    const newArrivalDate = addMonths(new Date("2026-08-20"), monthsRequired);
    const baselineArrival = new Date("2027-11-15");

    return {
      newAllocated,
      monthsRequired,
      monthsSaved: Math.max(1, monthsSaved),
      newArrivalDateStr: formatMonthYear(newArrivalDate),
      baselineArrivalStr: formatMonthYear(baselineArrival),
      newMonthlyFreeCashFlow: baseline.monthlyFreeCashFlow + monthlyDelta,
    };
  }, [monthlyDelta, baseline]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Boîte à outils / Simulateur What If?</span>
          </Link>
          <h1 className="text-2xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight">
            Résultat de simulation ({formatCurrency(monthlyDelta > 0 ? monthlyDelta : -monthlyDelta, currency)}/mois)
          </h1>
          <p className="text-xs font-mono text-muted-foreground">
            {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} • Hypothèse : {activeScenario.name}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setShowConfirmation(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-95 transition-opacity shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Adopter ce plan</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-colors ${
              isFavorite
                ? "border-rose-500/30 bg-rose-500/10 text-rose-600"
                : "border-border bg-card text-foreground hover:bg-secondary/70"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-foreground"}`} />
            <span>Favoris</span>
          </button>
        </div>
      </div>

      {hasAppliedPlan && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Ce scénario est désormais votre plan de référence officiel pour &ldquo;{baseline.goalTitle}&rdquo;.</span>
        </div>
      )}

      {/* Main Grid: Left Detailed Breakdown + Right Companion Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Scenarios Selector + Dotted Line Item Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* 3 Strategy Selector Cards */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              3 scénarios pour accélérer votre horizon
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {PRESET_SCENARIOS.map((sc) => {
                const isActive = selectedScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`rounded-2xl p-5 text-left transition-all border relative flex flex-col justify-between ${
                      isActive
                        ? "border-primary bg-card shadow-sm ring-2 ring-primary/20"
                        : "border-border/80 bg-card hover:border-border"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground">{sc.name}</div>
                      <div className="text-xl sm:text-2xl font-bold font-financial text-foreground">
                        {formatCurrency(sc.monthlyDelta, currency)}
                      </div>
                    </div>
                    <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-muted-foreground">Gain horizon</span>
                      <span className="text-primary font-bold">{sc.badge}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deep-Dive Breakdown Container Card (Jump-Style) */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-elevation-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-bold font-editorial text-foreground flex items-center gap-2">
                  <span>Transformation du flux d&apos;épargne</span>
                  <span>✨</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    +{simulation.monthsSaved} mois d&apos;avance
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Destination : <strong>{baseline.goalTitle}</strong>
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-[11px] font-mono text-muted-foreground uppercase">
                  Nouvelle date d&apos;arrivée
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-financial text-primary">
                  {simulation.newArrivalDateStr}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  Initialement : {simulation.baselineArrivalStr}
                </div>
              </div>
            </div>

            {/* Dotted Leader Line Breakdown */}
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <span>Flux de trésorerie libre de base</span>
                </span>
                <span className="flex-1 border-b border-dotted border-muted-foreground/30 mx-2" />
                <span className="font-mono font-bold text-foreground shrink-0">
                  {formatCurrency(baseline.monthlyFreeCashFlow, currency)} / mois
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <span>Variation mensuelle simulée</span>
                </span>
                <span className="flex-1 border-b border-dotted border-muted-foreground/30 mx-2" />
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  +{formatCurrency(monthlyDelta, currency)} / mois
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <span>Nouvelle capacité allouée à l&apos;objectif</span>
                  <Info className="w-3 h-3 text-muted-foreground/60" />
                </span>
                <span className="flex-1 border-b border-dotted border-muted-foreground/30 mx-2" />
                <span className="font-mono font-bold text-primary shrink-0">
                  {formatCurrency(simulation.newAllocated, currency)} / mois
                </span>
              </div>

              {/* Notice Banner */}
              <div className="p-3.5 rounded-2xl border border-primary/20 bg-primary/5 text-primary text-[11px] leading-relaxed">
                Ce rythme d&apos;épargne accéléré préserve l&apos;intégralité de vos dépenses fixes essentielles ({formatCurrency(baseline.monthlyExpenses, currency)}/mois).
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <span>Montant restant à capitaliser</span>
                  <Info className="w-3 h-3 text-muted-foreground/60" />
                </span>
                <span className="flex-1 border-b border-dotted border-muted-foreground/30 mx-2" />
                <span className="font-mono font-bold text-foreground shrink-0">
                  {formatCurrency(baseline.remainingAmount, currency)}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <span>Gain net sur le calendrier</span>
                  <Info className="w-3 h-3 text-muted-foreground/60" />
                </span>
                <span className="flex-1 border-b border-dotted border-muted-foreground/30 mx-2" />
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {simulation.monthsSaved} mois plus tôt
                </span>
              </div>
            </div>
          </div>

          {/* Collapsible Technical Details */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between text-xs font-semibold text-foreground hover:text-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>Détail complet des calculs déterministes</span>
                <span className="text-muted-foreground font-normal">🔎</span>
              </span>
              <span className="flex items-center gap-1 text-primary font-mono text-[11px]">
                <span>{showTechnicalDetails ? "Masquer" : "Voir"}</span>
                {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {showTechnicalDetails && (
              <div className="pt-4 mt-3 border-t border-border/70 space-y-2 text-xs font-mono text-muted-foreground animate-fadeIn">
                <div className="flex justify-between">
                  <span>Mois d&apos;épargne nécessaires :</span>
                  <span className="text-foreground font-bold">{simulation.monthsRequired} mois</span>
                </div>
                <div className="flex justify-between">
                  <span>Taux d&apos;épargne effectif :</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {Math.round((simulation.newAllocated / baseline.monthlyGrossIncome) * 100)}% du brut
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Explainer Video Card + Interactive Slider + Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-6 shadow-elevation-1">
            <div className="space-y-1">
              <h3 className="text-base font-bold font-editorial text-foreground">
                Useaimly vous explique
              </h3>
              <p className="text-xs text-muted-foreground">
                Comparatif visuel entre le plan actuel et le scénario simulé.
              </p>
            </div>

            {/* Video Thumbnail */}
            <div className="rounded-2xl bg-zinc-950 text-white p-6 relative overflow-hidden aspect-video flex flex-col items-center justify-center text-center space-y-2 shadow-inner">
              <div className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer">
                <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
              </div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300">
                Accélérer l&apos;arrivée
              </div>
            </div>

            {/* Visual Horizon Progress Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Plan actuel</span>
                <span className="text-primary font-bold">Nouveau plan</span>
                <span className="text-muted-foreground">Cible</span>
              </div>
              <div className="relative flex items-center">
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "70%" }} />
                </div>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>{simulation.baselineArrivalStr}</span>
                <span className="font-bold text-foreground">{simulation.newArrivalDateStr}</span>
                <span>Déc 2027</span>
              </div>
            </div>

            {/* Plain Language Summary */}
            <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/70">
              <strong>La solution la plus simple :</strong> en augmentant votre épargne de <strong>+{formatCurrency(monthlyDelta, currency)}/mois</strong>, vous atteignez votre destination <strong>{simulation.monthsSaved} mois plus tôt</strong> tout en conservant une réserve de sécurité optimale.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:opacity-95 transition-all shadow-xs"
              >
                <span>Faire de ce scénario mon plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="max-w-md w-full rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-elevation-2">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-editorial text-foreground">
                Confirmer l&apos;adoption du plan
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ce scénario mettra à jour votre allocation mensuelle officielle pour &ldquo;{baseline.goalTitle}&rdquo; à {formatCurrency(simulation.newAllocated, currency)}/mois.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="w-full py-3 rounded-2xl border border-border bg-secondary text-xs font-bold text-foreground hover:bg-secondary/80 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmation(false);
                  setHasAppliedPlan(true);
                }}
                className="w-full py-3 rounded-2xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-95 transition-opacity shadow-xs"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
