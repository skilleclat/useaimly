"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { parseDecisionQuery, ParsedDecisionIntent } from "@/lib/nlp/decision-query-parser";
import { simulateDecision, BaselineFinancialProfile } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import {
  Compass,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Bookmark,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Calendar,
  MessageSquare,
  Check,
  Plus,
  Edit3,
  Heart,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowLeft,
  Info,
  Layers,
} from "lucide-react";

export default function DecidePage() {
  const { profile } = useAuth();
  const currency = (profile?.preferred_currency || "KES") as CurrencyCode;

  // Active query & input state
  const [queryInput, setQueryInput] = useState("Can I spend KES 30,000 on a new phone?");
  const [title, setTitle] = useState("New Phone Purchase");
  const [amount, setAmount] = useState<number>(30000);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isEditingInputs, setIsEditingInputs] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<"CASH" | "SPREAD" | "POSTPONE">("CASH");
  const [isSaved, setIsSaved] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Baseline Financial Reality
  const baselineProfile: BaselineFinancialProfile = {
    liquidSavings: 180000,
    incomes: [
      { name: "Primary Income", amount: 180000, frequency: "MONTHLY", reliability: "STABLE", isActive: true },
    ],
    expenses: [
      { name: "Essential Living", amount: 112000, frequency: "MONTHLY", isFixed: true },
    ],
    debts: [],
    commitments: [],
    goals: [
      {
        id: "primary-goal",
        title: "Start my business",
        targetAmount: 500000,
        currentAmount: 180000,
        targetDate: "2027-12-31",
        priority: "HIGH",
        status: "ACTIVE",
      },
    ],
  };

  // Deterministic simulation
  const simulation = useMemo(() => {
    return simulateDecision(baselineProfile, {
      decisionTitle: title,
      amount,
      isRecurring,
      recurringFrequency: isRecurring ? "MONTHLY" : undefined,
    });
  }, [title, amount, isRecurring]);

  // Strategy comparison cards calculations
  const strategies = useMemo(() => {
    const cashRemaining = baselineProfile.liquidSavings - amount;
    const spreadMonthly = Math.round(amount / 3);
    const recoveryMonthly = simulation.delta.additionalMonthlyAmountRequired || Math.round(amount / 16);

    return [
      {
        id: "CASH" as const,
        title: "Payer comptant",
        subtitle: "One-off Cash Buffer",
        metric: formatCurrency(Math.max(0, cashRemaining), currency),
        metricLabel: "Buffer résiduel",
        badge: "100% liquidité préservée",
        badgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        delayText: `+${simulation.delta.delayInDays} jours sur l'objectif`,
      },
      {
        id: "SPREAD" as const,
        title: "Échelonner sur 3 mois",
        subtitle: "3-Month Free Cash Flow",
        metric: `${formatCurrency(spreadMonthly, currency)} / mo`,
        metricLabel: "Impact mensuel",
        badge: "Pression lissée",
        badgeStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        delayText: `+${Math.round(simulation.delta.delayInDays * 0.7)} jours sur l'objectif`,
      },
      {
        id: "POSTPONE" as const,
        title: "Reporter de 60 jours",
        subtitle: "Accumuler d'abord",
        metric: formatCurrency(0, currency),
        metricLabel: "Impact immédiat",
        badge: "Trajectoire intacte",
        badgeStyle: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        delayText: "0 jour de décalage",
      },
    ];
  }, [amount, currency, simulation]);

  const handleParseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    const parsed = parseDecisionQuery(queryInput);
    setTitle(parsed.extractedTitle);
    setAmount(parsed.extractedAmount || 30000);
    setIsRecurring(parsed.isRecurring);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Boîte à outils / Simulateur</span>
          </Link>
          <h1 className="text-2xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight">
            Résultat de simulation ({formatCurrency(amount, currency)})
          </h1>
          <p className="text-xs font-mono text-muted-foreground">
            {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} • Décision : {title}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setQueryInput("");
              setIsEditingInputs(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary/70 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>Nouveau</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditingInputs(!isEditingInputs)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary/70 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-foreground" />
            <span>Modifier</span>
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

      {/* Interactive Natural Language Prompt / Edit Drawer */}
      {isEditingInputs && (
        <form onSubmit={handleParseSubmit} className="rounded-3xl border border-primary/30 bg-primary/5 p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Décrivez votre décision en langage naturel</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ex: Je souhaite acheter un ordinateur à 45 000 KES..."
              className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 transition-opacity shrink-0"
            >
              Simuler
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Left Detailed Breakdown + Right Explainer Video & Synthesis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Strategies + Detailed Dotted Line Item Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* 3 Strategy Selector Cards */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              3 stratégies pour réaliser cette décision
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {strategies.map((strat) => {
                const isActive = selectedStrategy === strat.id;
                return (
                  <button
                    key={strat.id}
                    type="button"
                    onClick={() => setSelectedStrategy(strat.id)}
                    className={`rounded-2xl p-5 text-left transition-all border relative flex flex-col justify-between ${
                      isActive
                        ? "border-primary bg-card shadow-sm ring-2 ring-primary/20"
                        : "border-border/80 bg-card hover:border-border"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground">{strat.title}</div>
                      <div className="text-xl sm:text-2xl font-bold font-financial text-foreground">
                        {strat.metric}
                      </div>
                    </div>
                    <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-muted-foreground">{strat.metricLabel}</span>
                      <span className="text-primary font-bold">{strat.delayText}</span>
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
                  <span>
                    {selectedStrategy === "CASH"
                      ? "Payer au comptant depuis votre buffer"
                      : selectedStrategy === "SPREAD"
                      ? "Lisser sur votre flux de trésorerie"
                      : "Reporter l'achat pour préserver la date"}
                  </span>
                  <span>{selectedStrategy === "CASH" ? "💳" : selectedStrategy === "SPREAD" ? "📅" : "⏳"}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {selectedStrategy === "CASH" ? "100% autofinancé" : selectedStrategy === "SPREAD" ? "3 mensualités" : "0 dette"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Destination liée : <strong>Start my business</strong>
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-[11px] font-mono text-muted-foreground uppercase">
                  Décalage d&apos;arrivée
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-financial text-primary">
                  {selectedStrategy === "CASH"
                    ? `+${simulation.delta.delayInDays} jours`
                    : selectedStrategy === "SPREAD"
                    ? `+${Math.round(simulation.delta.delayInDays * 0.7)} jours`
                    : "0 jour"}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  Horizon : {simulation.delta.newCompletionDate || "Février 2028"}
                </div>
              </div>
            </div>

            {/* Dotted Leader Line Breakdown (Jump Masterpiece Pattern) */}
            <div className="space-y-3.5 text-xs sm:text-sm">
              {/* Row 1 */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <span>Trésorerie disponible avant décision</span>
                </span>
                <span className="flex-1 border-b border-dotted border-muted-foreground/30 mx-2" />
                <span className="font-mono font-bold text-foreground shrink-0">
                  {formatCurrency(baselineProfile.liquidSavings, currency)}
                </span>
              </div>

              {/* Row 2 */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <span>Montant de la dépense simulée</span>
                </span>
                <span className="flex-1 border-b border-dotted border-muted-foreground/30 mx-2" />
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0">
                  -{formatCurrency(amount, currency)}
                </span>
              </div>

              {/* Row 3 */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <span>Trésorerie résiduelle (Buffer de sécurité)</span>
                  <Info className="w-3 h-3 text-muted-foreground/60" />
                </span>
                <span className="flex-1 border-b border-dotted border-muted-foreground/30 mx-2" />
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {formatCurrency(Math.max(0, baselineProfile.liquidSavings - amount), currency)}
                </span>
              </div>

              {/* Notice Banner */}
              <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-[11px] leading-relaxed">
                Conformément à la règle de résilience Useaimly, votre buffer de sécurité reste supérieur au seuil minimal recommandé (2 mois de dépenses fixes).
              </div>

              {/* Row 4 */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <span>Objectif cible (&ldquo;Start my business&rdquo;)</span>
                  <Info className="w-3 h-3 text-muted-foreground/60" />
                </span>
                <span className="flex-1 border-b border-dotted border-muted-foreground/30 mx-2" />
                <span className="font-mono font-bold text-foreground shrink-0">
                  {formatCurrency(500000, currency)}
                </span>
              </div>

              {/* Row 5 */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <span>Effort mensuel pour maintenir décembre 2027</span>
                  <Info className="w-3 h-3 text-muted-foreground/60" />
                </span>
                <span className="flex-1 border-b border-dotted border-muted-foreground/30 mx-2" />
                <span className="font-mono font-bold text-primary shrink-0">
                  +{formatCurrency(simulation.delta.additionalMonthlyAmountRequired || 4200, currency)} / mois
                </span>
              </div>
            </div>
          </div>

          {/* Collapsible Technical Details (Jump Pattern) */}
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
                  <span>Formule de normalisation :</span>
                  <span className="text-foreground font-bold">Amorti sur 16 mois</span>
                </div>
                <div className="flex justify-between">
                  <span>Delta de flux libre :</span>
                  <span className="text-foreground font-bold">-0 KES / mois (Paiement comptant)</span>
                </div>
                <div className="flex justify-between">
                  <span>Impact sur le score de résilience :</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Stable (84/100)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Explainer Video Card + Interactive Slider + Plain Language Takeaway */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-6 shadow-elevation-1">
            <div className="space-y-1">
              <h3 className="text-base font-bold font-editorial text-foreground">
                Useaimly vous explique
              </h3>
              <p className="text-xs text-muted-foreground">
                Synthèse visuelle de l&apos;impact sur votre trajectoire.
              </p>
            </div>

            {/* Video-style Visual Thumbnail Card */}
            <div className="rounded-2xl bg-zinc-950 text-white p-6 relative overflow-hidden aspect-video flex flex-col items-center justify-center text-center space-y-2 shadow-inner">
              <div className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer">
                <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
              </div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300">
                Payer comptant
              </div>
            </div>

            {/* Visual Balance Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Dépense</span>
                <span className="text-primary font-bold">Buffer restant</span>
                <span className="text-muted-foreground">Total</span>
              </div>
              <div className="relative flex items-center">
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "83%" }} />
                </div>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>{formatCurrency(amount, currency)}</span>
                <span className="font-bold text-foreground">{formatCurrency(150000, currency)}</span>
                <span>{formatCurrency(180000, currency)}</span>
              </div>
            </div>

            {/* Plain Language Synthesis (Jump Pattern) */}
            <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/70">
              <strong>La solution recommandée :</strong> financez cet achat via votre buffer liquide sans recourir à un crédit. Vous conservez votre flexibilité et il vous suffira d&apos;épargner <strong>+{formatCurrency(4200, currency)} / mois</strong> pour franchir votre cap en décembre 2027.
            </p>

            <div className="pt-2">
              <Link
                href="/app/what-if"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:opacity-95 transition-all shadow-xs"
              >
                <span>Tester une variante dans What If?</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
