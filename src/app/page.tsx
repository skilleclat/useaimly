"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { Container } from "@/components/layout/container";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Wallet,
  Target,
  ArrowDown,
  Layers,
  HelpCircle,
  Zap,
  Lock,
  Calendar,
  DollarSign,
  TrendingDown,
  BarChart3,
  Check,
  Compass,
  ArrowUpRight,
  Sliders,
  Scale,
  RefreshCw,
  Activity,
  Cpu,
} from "lucide-react";

interface DecisionPreset {
  id: string;
  labelFr: string;
  labelEn: string;
  queryFr: string;
  queryEn: string;
  amount: string;
  cashAfter: string;
  runway: string;
  runwayDelta: string;
  delayDays: string;
  delayFr: string;
  delayEn: string;
  recoveryFr: string;
  recoveryEn: string;
  statusTextFr: string;
  statusTextEn: string;
  statusType: "warning" | "safe" | "caution";
  altOptionFr: string;
  altOptionEn: string;
  // Strategy Alternatives
  buyNowDelay: string;
  waitDays: string;
  waitDelay: string;
  spreadTerm: string;
  spreadDelay: string;
}

const PRESETS: DecisionPreset[] = [
  {
    id: "laptop",
    labelFr: "💻 Ordinateur Portable (2 000 $)",
    labelEn: "💻 Laptop Purchase ($2,000)",
    queryFr: "J'envisage d'acheter un ordinateur à 2 000 $.",
    queryEn: "I'm thinking about buying a $2,000 laptop.",
    amount: "$2,000",
    cashAfter: "$2,840",
    runway: "2.1 mois",
    runwayDelta: "-0.8 mois",
    delayDays: "+43 jours",
    delayFr: "Retarde votre Objectif Entreprise de 43 jours",
    delayEn: "Delays your Business Goal by 43 days",
    recoveryFr: "+125 $/mois pendant 16 mois pour compenser",
    recoveryEn: "+$125/month for 16 months to recover",
    statusTextFr: "PROCÉDER AVEC PRUDENCE",
    statusTextEn: "PROCEED WITH CAUTION",
    statusType: "caution",
    altOptionFr: "Attendez 18 jours et achetez-le sans retarder votre date d'arrivée.",
    altOptionEn: "Wait 18 days and buy it without moving your arrival date.",
    buyNowDelay: "+43 jours",
    waitDays: "18 jours",
    waitDelay: "0 retard (0 jour)",
    spreadTerm: "3 mois (667 $/m)",
    spreadDelay: "+9 jours",
  },
  {
    id: "car",
    labelFr: "🚗 Voiture d'Occasion (8 000 $)",
    labelEn: "🚗 Used Car ($8,000)",
    queryFr: "Puis-je acheter une voiture à 8 000 $ au comptant ?",
    queryEn: "Can I buy an $8,000 car with cash?",
    amount: "$8,000",
    cashAfter: "$1,120",
    runway: "0.8 mois",
    runwayDelta: "-2.2 mois",
    delayDays: "+5.2 mois",
    delayFr: "Retarde votre Apport Immobilier de 5.2 mois",
    delayEn: "Delays your Home Deposit by 5.2 months",
    recoveryFr: "+280 $/mois requis pour maintenir l'échéance",
    recoveryEn: "+$280/month required to hold target date",
    statusTextFr: "IMPACT TRÉSORERIE ÉLEVÉ",
    statusTextEn: "HIGH LIQUIDITY IMPACT",
    statusType: "warning",
    altOptionFr: "Financer à 30% d'apport préserve 3.4 mois de matelas d'urgence.",
    altOptionEn: "Financing at 30% down preserves 3.4 months of runway cushion.",
    buyNowDelay: "+156 jours",
    waitDays: "45 jours",
    waitDelay: "+28 jours",
    spreadTerm: "12 mois (690 $/m)",
    spreadDelay: "+35 jours",
  },
  {
    id: "remodel",
    labelFr: "🏡 Rénovation Cuisine (15 000 $)",
    labelEn: "🏡 Kitchen Remodel ($15,000)",
    queryFr: "Engager 15 000 $ dans des travaux le mois prochain.",
    queryEn: "Commit $15,000 to kitchen renovation next month.",
    amount: "$15,000",
    cashAfter: "$4,600",
    runway: "3.2 mois",
    runwayDelta: "-1.4 mois",
    delayDays: "+94 jours",
    delayFr: "Repousse l'Indépendance Financière de 94 jours",
    delayEn: "Pushes Financial Independence back by 94 days",
    recoveryFr: "+410 $/mois pendant 18 mois pour rester dans les temps",
    recoveryEn: "+$410/month for 18 months to stay on schedule",
    statusTextFr: "GÉRABLE AVEC RECALIBRAGE",
    statusTextEn: "MANAGEABLE WITH RECALIBRATION",
    statusType: "caution",
    altOptionFr: "Échelonner en 3 tranches de 5 000 $ réduit le retard à 18 jours.",
    altOptionEn: "Staging in 3 phases of $5,000 reduces delay to only 18 days.",
    buyNowDelay: "+94 jours",
    waitDays: "60 jours",
    waitDelay: "+12 jours",
    spreadTerm: "3 tranches de 5k",
    spreadDelay: "+18 jours",
  },
  {
    id: "watch",
    labelFr: "⌚ Montre de Luxe (450 $)",
    labelEn: "⌚ Luxury Watch ($450)",
    queryFr: "Acheter une montre à 450 $ pour mon anniversaire.",
    queryEn: "Buy a $450 luxury watch for my birthday.",
    amount: "$450",
    cashAfter: "$4,390",
    runway: "3.9 mois",
    runwayDelta: "-0.1 mois",
    delayDays: "+4 jours",
    delayFr: "Impact négligeable (+4 jours sur l'objectif)",
    delayEn: "Negligible impact (+4 days on primary goal)",
    recoveryFr: "Entièrement absorbable par le cash-flow libre du mois",
    recoveryEn: "Fully absorbed by this month's free cash flow",
    statusTextFr: "100% SÛR & ABSORBABLE",
    statusTextEn: "100% SAFE & ABSORBABLE",
    statusType: "safe",
    altOptionFr: "Achetez dès aujourd'hui sans compromettre votre matelas de sécurité.",
    altOptionEn: "Buy today without compromising your safety runway.",
    buyNowDelay: "+4 jours",
    waitDays: "Immédiat",
    waitDelay: "0 retard",
    spreadTerm: "Comptant direct",
    spreadDelay: "0 retard",
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { currency, format } = useCurrency();
  const { language } = useI18n();
  const router = useRouter();
  const isFr = language === "fr";

  // Selected Interactive Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>("laptop");
  const [activeStrategy, setActiveStrategy] = useState<"BUY_NOW" | "WAIT" | "SPREAD">("BUY_NOW");

  const currentPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusBadge = (type: DecisionPreset["statusType"]) => {
    switch (type) {
      case "safe":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
          icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />,
        };
      case "warning":
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400",
          icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />,
        };
      case "caution":
      default:
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
          icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />,
        };
    }
  };

  const statusBadge = getStatusBadge(currentPreset.statusType);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-[#FF5533]/20 selection:text-[#FF5533] flex flex-col antialiased">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — HERO: THE PROMISE & LIVE DECISION ENGINE
          "Don't just see what a decision costs. See what it changes."
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-20 lg:pb-32 border-b border-border/70 overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1440px] h-[550px] bg-gradient-to-b from-[#FF5533]/8 via-[#FF5533]/3 to-transparent blur-3xl pointer-events-none -z-10" />

        <Container size="hero">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 2xl:gap-16 items-center">
            
            {/* Left Column: Authoritative Positioning & Action (5 cols) */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8 text-left">
              
              {/* Category Indicator Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-secondary/80 border border-border/80 text-xs font-mono font-medium text-muted-foreground shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#FF5533] animate-pulse" />
                <span>{isFr ? "Intelligence Décisionnelle Financière" : "Financial Decision Intelligence"}</span>
              </div>

              {/* Dominant Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-5xl 2xl:text-6xl font-black text-foreground tracking-tight leading-[1.06]">
                {isFr ? (
                  <>
                    Voyez <span className="font-serif italic font-normal text-[#FF5533]">demain</span>
                    <br />
                    avant de décider aujourd&apos;hui.
                  </>
                ) : (
                  <>
                    See <span className="font-serif italic font-normal text-[#FF5533]">Tomorrow</span>
                    <br />
                    Before Deciding Today.
                  </>
                )}
              </h1>

              {/* Human-Language Subheadline */}
              <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-lg leading-relaxed">
                {isFr
                  ? "Un achat ne coûte pas seulement son prix affiché. Visualisez ce qu'une décision change sur vos liquidités, vos charges fixes et la date exacte de vos projets de vie."
                  : "A purchase doesn't just cost its price tag. Calculate what a financial decision changes across your cash buffer, emergency runway, and life goal arrival dates."}
              </p>

              {/* Live Preset Switcher Chips */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                  {isFr ? "Scénarios réels à tester :" : "Test a real decision scenario:"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => {
                    const isSelected = preset.id === selectedPresetId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`text-xs font-mono px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FF5533] text-white border-[#FF5533] shadow-md shadow-orange-500/20 scale-[1.02] font-bold"
                            : "bg-secondary/60 hover:bg-secondary border-border/80 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isFr ? preset.labelFr : preset.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions & Primary CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => router.push(`/app/decide?q=${encodeURIComponent(isFr ? currentPreset.queryFr : currentPreset.queryEn)}`)}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] px-7 py-4 text-sm font-extrabold text-white shadow-lg shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>{isFr ? "Analyser ma Décision — Gratuit" : "Analyze My Decision — Free"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("future-cost")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border px-6 py-4 text-xs font-bold text-foreground transition-all cursor-pointer"
                >
                  <span>{isFr ? "Comprendre le Coût Futur" : "Explore Future Cost"}</span>
                  <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Honest Trust & Security Indicators */}
              <div className="pt-1 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isFr ? "Sans carte bancaire" : "No credit card required"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{isFr ? "Zéro accès bancaire requis" : "Zero bank login required"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#FF5533] shrink-0" />
                  <span>{isFr ? "Calcul déterministe certifié" : "Calculated from your inputs"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Product Proof Console (7 cols) */}
            <div className="lg:col-span-7 flex justify-center w-full">
              <div className="w-full rounded-[2rem] 2xl:rounded-[2.5rem] border border-border bg-card/90 backdrop-blur-xl p-5 sm:p-7 2xl:p-9 shadow-2xl space-y-5 text-left transition-all">
                
                {/* Console Bar */}
                <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono font-bold text-muted-foreground uppercase ml-2 tracking-wider">
                      USEAIMLY DECISION ENGINE
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isFr ? "MOTEUR DÉCISIONNEL ACTIF" : "ENGINE ACTIVE"}</span>
                  </span>
                </div>

                {/* Simulated Input Query */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground uppercase">
                    <span>{isFr ? "DÉCISION TESTÉE :" : "PROPOSED DECISION:"}</span>
                    <span className="text-[#FF5533] font-bold">{currentPreset.amount}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/60 border border-border text-sm font-semibold text-foreground flex items-center justify-between gap-3">
                    <span>&ldquo;{isFr ? currentPreset.queryFr : currentPreset.queryEn}&rdquo;</span>
                    <span className="text-[10px] font-mono font-bold text-[#FF5533] bg-[#FF5533]/10 px-2 py-0.5 rounded shrink-0">
                      NLP EXTRACTED
                    </span>
                  </div>
                </div>

                {/* Strategy Comparative Selector */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground uppercase">
                    <span>{isFr ? "COMPARATEUR DE STRATÉGIES :" : "STRATEGY COMPARISON:"}</span>
                    <span className="text-[11px] text-muted-foreground lowercase">{isFr ? "3 trajectoires calculées" : "3 modeled paths"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveStrategy("BUY_NOW")}
                      className={`p-2.5 rounded-xl text-xs font-mono border text-center transition-all cursor-pointer ${
                        activeStrategy === "BUY_NOW"
                          ? "bg-secondary border-[#FF5533] text-foreground font-bold shadow-xs"
                          : "bg-secondary/40 border-border/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="block font-bold">{isFr ? "Acheter Comptant" : "Buy Now"}</span>
                      <span className="text-[11px] text-rose-500 block font-mono mt-0.5">{currentPreset.buyNowDelay}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveStrategy("WAIT")}
                      className={`p-2.5 rounded-xl text-xs font-mono border text-center transition-all cursor-pointer ${
                        activeStrategy === "WAIT"
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                          : "bg-secondary/40 border-border/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="block font-bold">{isFr ? "Attendre" : "Wait"}: {currentPreset.waitDays}</span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-mono mt-0.5 font-bold">{currentPreset.waitDelay}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveStrategy("SPREAD")}
                      className={`p-2.5 rounded-xl text-xs font-mono border text-center transition-all cursor-pointer ${
                        activeStrategy === "SPREAD"
                          ? "bg-secondary border-amber-500 text-foreground font-bold shadow-xs"
                          : "bg-secondary/40 border-border/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="block font-bold">{isFr ? "Échelonner" : "Spread"}</span>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 block font-mono mt-0.5">{currentPreset.spreadDelay}</span>
                    </button>
                  </div>
                </div>

                {/* Primary Consequence Box */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
                      {isFr ? "CONQUÉRENCE MESURÉE" : "CALCULATED CONSEQUENCE"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${statusBadge.bg}`}>
                      {statusBadge.icon}
                      <span>{isFr ? currentPreset.statusTextFr : currentPreset.statusTextEn}</span>
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-foreground leading-snug">
                    {activeStrategy === "BUY_NOW" && (isFr ? currentPreset.delayFr : currentPreset.delayEn)}
                    {activeStrategy === "WAIT" && (isFr ? `En attendant ${currentPreset.waitDays}, vous achetez sans déplacer votre échéance.` : `By waiting ${currentPreset.waitDays}, you make this purchase with 0 goal delay.`)}
                    {activeStrategy === "SPREAD" && (isFr ? `Échelonner en ${currentPreset.spreadTerm} ramène le décalage à ${currentPreset.spreadDelay}.` : `Staging across ${currentPreset.spreadTerm} reduces timeline delay to ${currentPreset.spreadDelay}.`)}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {isFr ? currentPreset.recoveryFr : currentPreset.recoveryEn}.
                  </p>
                </div>

                {/* 4 Multi-Dimensional Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-secondary/40 border border-border/70 space-y-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">
                      {isFr ? "Cash Restant" : "Cash After"}
                    </span>
                    <span className="text-base font-black text-foreground font-mono block">
                      {currentPreset.cashAfter}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {isFr ? "Disponible immédiat" : "Liquid balance"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/40 border border-border/70 space-y-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">
                      {isFr ? "Matelas Résilience" : "Runway Cushion"}
                    </span>
                    <span className="text-base font-black text-foreground font-mono block">
                      {currentPreset.runway}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                      {currentPreset.runwayDelta}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-0.5">
                    <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 uppercase font-bold block">
                      {isFr ? "Décalage Objectif" : "Goal Delay"}
                    </span>
                    <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono block">
                      {activeStrategy === "BUY_NOW" ? currentPreset.delayDays : activeStrategy === "WAIT" ? "0 j" : currentPreset.spreadDelay}
                    </span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-medium">
                      {isFr ? "Impact calendrier" : "Calendar shift"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-0.5">
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
                      {isFr ? "Rattrapage" : "Catch-Up Plan"}
                    </span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                      +$125/m
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                      {isFr ? "Effort mensuel" : "Monthly delta"}
                    </span>
                  </div>
                </div>

                {/* Optimal Alternative Callout */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{isFr ? "MEILLEURE OPTION IDENTIFIÉE" : "OPTIMAL ALTERNATIVE DETECTED"}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                      {isFr ? "0 JOUR DE RETARD" : "0 GOAL DELAY"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-relaxed">
                    {isFr ? currentPreset.altOptionFr : currentPreset.altOptionEn}
                  </p>
                </div>

                {/* Action in Studio */}
                <button
                  type="button"
                  onClick={() => router.push(`/app/decide?q=${encodeURIComponent(isFr ? currentPreset.queryFr : currentPreset.queryEn)}`)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground text-background hover:opacity-90 py-3 text-xs sm:text-sm font-bold transition-opacity cursor-pointer shadow-sm"
                >
                  <span>{isFr ? "Tester cette décision dans le Studio" : "Simulate this decision in Studio"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </Container>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — THE PROBLEM: THE 4 HIDDEN DIMENSIONS
          "The price tag is visible. The consequences are hidden."
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-b border-border/70 bg-secondary/15">
        <Container size="wide" className="space-y-12 sm:space-y-16">
          
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
              {isFr ? "Pourquoi les budgets classiques échouent" : "Why Traditional Budgets Fall Short"}
            </span>
            <h2 className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-foreground tracking-tight leading-tight">
              {isFr
                ? "Le prix est visible. Les conséquences sont invisibles."
                : "The price tag is visible. The consequences are hidden."}
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto font-medium">
              {isFr
                ? "Un simple achat de 2 000 $ active simultanément 4 vecteurs financiers silencieux qu'un tableau Excel ne peut pas anticiper."
                : "A single purchase alters 4 silent financial vectors that retrospective budget apps and spreadsheets fail to connect."}
            </p>
          </div>

          {/* 4 Dimension Vector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            
            {/* Dimension 01 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm flex flex-col justify-between hover:border-[#FF5533]/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-mono font-bold text-xs">
                    01
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded">
                    Liquidité
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground leading-snug">
                  {isFr ? "Choc immédiat sur la trésorerie" : "Immediate Cash Buffer Shock"}
                </h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Payer comptant réduit instantanément votre réserve de manœuvre face aux imprévus du quotidien."
                    : "An upfront purchase immediately shrinks your cash reserve buffer when life surprises strike."}
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">{isFr ? "Impact typique :" : "Impact vector:"}</span>
                <span className="text-rose-500 font-bold">-25% à -40% cash</span>
              </div>
            </div>

            {/* Dimension 02 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm flex flex-col justify-between hover:border-[#FF5533]/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-mono font-bold text-xs">
                    02
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase bg-purple-500/10 px-2 py-0.5 rounded">
                    Cash-Flow
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground leading-snug">
                  {isFr ? "Engagements mensuels verrouillés" : "Locked Monthly Commitments"}
                </h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Chaque mensualité de crédit bloque du cash-flow récurrent qui ne pourra plus financer vos futurs projets."
                    : "Every installment plan quietly locks up free monthly cash flow that could fund long-term growth."}
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">{isFr ? "Impact typique :" : "Impact vector:"}</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">-$250/m bloqué</span>
              </div>
            </div>

            {/* Dimension 03 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm flex flex-col justify-between hover:border-[#FF5533]/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
                    03
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                    Échéances
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground leading-snug">
                  {isFr ? "Déplacement de date d'objectif" : "Life Goal Timeline Delay"}
                </h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Dépenser aujourd'hui retarde mathématiquement l'apport d'un logement ou le lancement d'une entreprise."
                    : "Allocating capital to present spending pushes back the target arrival date of your major life goals."}
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">{isFr ? "Impact typique :" : "Impact vector:"}</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">+30 à +90 jours</span>
              </div>
            </div>

            {/* Dimension 04 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm flex flex-col justify-between hover:border-[#FF5533]/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-mono font-bold text-xs">
                    04
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase bg-rose-500/10 px-2 py-0.5 rounded">
                    Résilience
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground leading-snug">
                  {isFr ? "Érosion silencieuse du matelas" : "Safety Runway Compression"}
                </h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Votre autonomie en mois de charges fixes diminue et peut passer sous le seuil critique des 3 mois."
                    : "Your survival runway measured in months of fixed costs drops closer to vulnerable thresholds."}
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">{isFr ? "Impact typique :" : "Impact vector:"}</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">-0.8 à -1.5 mois</span>
              </div>
            </div>

          </div>

        </Container>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — THE UNIQUE INSIGHT: THE FUTURE COST OF A DECISION
          "The price is not the full cost."
      ───────────────────────────────────────────────────────────── */}
      <section id="future-cost" className="py-20 sm:py-28 lg:py-32 border-b border-border/70 bg-[#09090C] text-white">
        <Container size="wide" className="space-y-12 sm:space-y-16 text-center">
          
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold">
              {isFr ? "Le Territoire Fondateur" : "The Core Insight"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {isFr
                ? "Le prix d'un achat n'est pas son véritable coût."
                : "The price of a decision is not its full cost."}
            </h2>
            <p className="text-base text-zinc-400 font-medium max-w-lg mx-auto">
              {isFr
                ? "Une décision à 2 000 $ ne vous retire pas seulement 2 000 $. Elle déplace votre calendrier futur."
                : "A $2,000 purchase doesn't just subtract $2,000. It shifts the arrival timeline of your future."}
            </p>
          </div>

          {/* High-Impact Obsidian Consequence Board */}
          <div className="rounded-[2rem] sm:rounded-[3rem] border border-white/10 bg-white/5 p-6 sm:p-10 lg:p-14 space-y-8 text-left max-w-4xl mx-auto shadow-2xl backdrop-blur-xl">
            
            {/* Header Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-b border-white/10 pb-6">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  {isFr ? "DÉPENSE IMMÉDIATE" : "PRESENT SPENDING"}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                  $2,000
                </span>
                <span className="text-xs text-zinc-400 block font-sans">
                  {isFr ? "Ce que vous voyez sur la facture" : "Visible price on invoice"}
                </span>
              </div>

              <div className="space-y-1 md:text-right">
                <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold block">
                  {isFr ? "DÉPLACEMENT CALCULÉ" : "CALCULATED TIMELINE DISPLACEMENT"}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-[#FF5533] font-mono">
                  +43 {isFr ? "Jours" : "Days"}
                </span>
                <span className="text-xs text-zinc-400 block font-sans">
                  {isFr ? "Ce que cela change sur votre objectif" : "True delay on primary life goal"}
                </span>
              </div>
            </div>

            {/* 3 Grounded Consequence Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">
                  {isFr ? "Objectif Entreprise" : "Business Launch"}
                </span>
                <span className="text-xl font-black text-[#FF5533] font-mono block">
                  +43 {isFr ? "jours" : "days"}
                </span>
                <p className="text-xs text-zinc-400">
                  {isFr ? "Échéance repoussée du 12 Oct au 24 Nov" : "Arrival shifted Oct 12 → Nov 24"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">
                  {isFr ? "Matelas de Sécurité" : "Emergency Runway"}
                </span>
                <span className="text-xl font-black text-amber-400 font-mono block">
                  2.1 {isFr ? "mois (-0.8 m)" : "mos (-0.8 m)"}
                </span>
                <p className="text-xs text-zinc-400">
                  {isFr ? "Descend sous la cible recommandée de 3 mois" : "Drops below recommended 3.0 mos target"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">
                  {isFr ? "Plan de Compensation" : "Recovery Effort"}
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono block">
                  +$125/m
                </span>
                <p className="text-xs text-zinc-400">
                  {isFr ? "Pendant 16 mois pour maintenir l'échéance" : "For 16 months to recover arrival date"}
                </p>
              </div>
            </div>

            {/* Grounded Punchline */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5 text-left">
                <p className="text-xs text-zinc-400 font-medium">
                  {isFr ? "Ne devinez plus l'impact de vos dépenses." : "Stop guessing the impact of your decisions."}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {isFr ? "Visualisez la conséquence avant de vous engager." : "See what happens before it happens."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/app/decide")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5533] text-white px-6 py-3.5 text-xs font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all shrink-0 cursor-pointer"
              >
                <span>{isFr ? "Tester ma propre décision" : "Test My Own Decision"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </Container>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 4 — HOW IT WORKS: 3 CLARITY STEPS
          01 State Decision → 02 See What Changes → 03 Compare Smarter Paths
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-b border-border/70">
        <Container size="wide" className="space-y-12 sm:space-y-16">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold">
              {isFr ? "Fonctionnement" : "How It Works"}
            </span>
            <h2 className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-foreground tracking-tight">
              {isFr ? "Trois étapes claires avant d'agir." : "Three clear steps before you commit."}
            </h2>
            <p className="text-base text-muted-foreground font-medium max-w-lg mx-auto">
              {isFr
                ? "La complexité financière se calcule en coulisse. L'expérience reste limpide et directe."
                : "Sophisticated deterministic calculations occur under the hood. The user experience remains simple."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* STEP 1 */}
            <div className="p-7 rounded-3xl border border-border/80 bg-card space-y-5 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#FF5533] uppercase tracking-wider block">
                    {isFr ? "ÉTAPE 01" : "STEP 01"}
                  </span>
                  <Compass className="w-5 h-5 text-[#FF5533]" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {isFr ? "Formulez votre décision" : "State your decision"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Tapez votre intention en langage naturel ou entrez le montant exact d'un achat, d'un crédit ou d'un devis."
                    : "Type your purchase in natural language, enter a proposed amount, or test a recurring loan."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/60 border border-border/60 text-xs font-mono text-foreground font-medium space-y-1">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">{isFr ? "Exemple" : "Example"}:</span>
                <p>&ldquo;{isFr ? "J'envisage d'acheter un ordinateur à 2 000 $." : "I'm thinking about buying a $2,000 laptop."}&rdquo;</p>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="p-7 rounded-3xl border border-border/80 bg-card space-y-5 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#FF5533] uppercase tracking-wider block">
                    {isFr ? "ÉTAPE 02" : "STEP 02"}
                  </span>
                  <BarChart3 className="w-5 h-5 text-[#FF5533]" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {isFr ? "Voyez ce qui change" : "See what changes"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Le moteur croise vos liquidités, vos charges et vos dates cibles pour calculer les impacts mesurables."
                    : "The calculation engine models cash buffer, fixed charges, and exact goal timeline displacement in days."}
                </p>
              </div>

              <ul className="space-y-2 text-xs text-foreground font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5533]" />
                  <span>{isFr ? "Liquidités restantes & matelas" : "Cash buffer & runway cushion"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5533]" />
                  <span>{isFr ? "Charges fixes engagées" : "Monthly fixed obligations"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5533]" />
                  <span>{isFr ? "Décalage d'objectif (en jours)" : "Goal timeline delay (in days)"}</span>
                </li>
              </ul>
            </div>

            {/* STEP 3 */}
            <div className="p-7 rounded-3xl border border-border/80 bg-card space-y-5 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    {isFr ? "ÉTAPE 03" : "STEP 03"}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {isFr ? "Comparez des voies optimales" : "Compare optimal pathways"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Découvrez des alternatives concrètes (attendre X jours, échelonner) pour acheter sans dévier de votre trajectoire."
                    : "Review alternative pathways (e.g. wait 18 days, stage payments) to execute safely without delay."}
                </p>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60 flex justify-between items-center">
                  <span className="font-bold text-foreground">{isFr ? "COMPTANT" : "BUY NOW"}</span>
                  <span className="text-rose-500 font-bold">{isFr ? "+43 jours" : "+43 days"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{isFr ? "ATTENDRE 18 J" : "WAIT 18 DAYS"}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isFr ? "0 retard" : "0 delay"}</span>
                </div>
              </div>
            </div>

          </div>

        </Container>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 5 — WHY THIS IS DIFFERENT: ADVICE VS CALCULATION
          "Advice is not the same as calculation."
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-b border-border/70 bg-secondary/15">
        <Container size="wide" className="space-y-12 sm:space-y-16 text-center">
          
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold">
              {isFr ? "La Distinction Fondamentale" : "The Core Distinction"}
            </span>
            <h2 className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-foreground tracking-tight leading-tight">
              {isFr
                ? "Un conseil n'est pas la même chose qu'un calcul."
                : "Advice is not the same as calculation."}
            </h2>
            <p className="text-base text-muted-foreground font-medium max-w-lg mx-auto">
              {isFr
                ? "Les chatbots discutent de vos dépenses. UseAimly calcule les conséquences réelles sur votre calendrier de vie."
                : "Conversational chatbots discuss decisions subjectively. UseAimly calculates measurable consequences from your inputs."}
            </p>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            
            {/* Generic Conversational Tools */}
            <div className="p-7 rounded-3xl border border-border/80 bg-card/60 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    {isFr ? "CHATBOTS CONVERSATIONNELS" : "GENERIC AI CHATBOTS"}
                  </span>
                  <span className="text-[10px] font-mono bg-secondary border border-border px-2 py-0.5 rounded text-muted-foreground font-bold">
                    {isFr ? "TEXTUEL" : "TEXT-BASED"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {isFr ? "Discute vaguement de la décision." : "Discusses the decision in general terms."}
                </h3>
              </div>

              <div className="space-y-3 pt-2 border-t border-border/60 text-xs sm:text-sm text-muted-foreground font-medium">
                <p>
                  {isFr
                    ? "Génère des conseils généraux sans modéliser vos dates cibles ni vos charges réelles."
                    : "Produces polite advice and generic financial tips without executing mathematical models on your real timeline."}
                </p>
                <div className="p-3.5 rounded-xl bg-secondary/80 border border-border/60 italic text-muted-foreground text-xs">
                  &ldquo;{isFr
                    ? "Il est généralement recommandé de maintenir une réserve d'urgence et d'évaluer vos priorités..."
                    : "It is generally wise to maintain a balanced budget and carefully consider large expenses..."}&rdquo;
                </div>
              </div>

              <div className="text-xs text-rose-500 font-mono font-medium flex items-center gap-1.5">
                <span>✕ {isFr ? "Zéro calcul de date • Conseils subjectifs" : "No exact date calculations • Subjective advice"}</span>
              </div>
            </div>

            {/* UseAimly Decision Engine */}
            <div className="p-7 rounded-3xl border-2 border-[#FF5533]/40 bg-[#FF5533]/5 space-y-5 relative overflow-hidden flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold">
                    USEAIMLY DECISION ENGINE
                  </span>
                  <span className="text-[10px] font-mono bg-[#FF5533]/20 border border-[#FF5533]/40 px-2 py-0.5 rounded text-[#FF5533] font-bold">
                    {isFr ? "DÉTERMINISTE" : "CALCULATION"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {isFr ? "Modélise les conséquences au jour près." : "Calculates exact consequences down to the day."}
                </h3>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#FF5533]/20 text-xs sm:text-sm text-foreground/90 font-medium">
                <p>
                  {isFr
                    ? "Alimente vos données financières dans un moteur de calcul pur : mêmes données → même calcul → même résultat vérifiable."
                    : "Runs your real financial parameters through pure calculation models: same inputs → same calculation → same result."}
                </p>
                <div className="p-3.5 rounded-xl bg-[#FF5533]/10 border border-[#FF5533]/30 font-mono text-xs space-y-1">
                  <p className="font-bold text-[#FF5533]">
                    {isFr ? "➔ Retard calculé : +43 jours" : "➔ Calculated delay: +43 days"}
                  </p>
                  <p className="text-muted-foreground">
                    {isFr ? "➔ Matelas après achat : 2.1 mois" : "➔ Runway after purchase: 2.1 months"}
                  </p>
                </div>
              </div>

              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{isFr ? "Chiffrage déterministe vérifiable" : "Deterministic calculation & verifiable outputs"}</span>
              </div>
            </div>

          </div>

        </Container>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 6 — FINAL CTA: THE INEVITABLE MOVE
          "Your next financial decision has a future. See it first."
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 lg:py-36 bg-gradient-to-b from-background via-secondary/20 to-background border-b border-border/70">
        <Container size="wide" className="text-center space-y-8 max-w-3xl mx-auto">
          
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold">
              {isFr ? "Prêt à décider en toute lucidité ?" : "Ready to decide with clarity?"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
              {isFr
                ? "Votre prochaine décision financière a un avenir. Voyez-le d'abord."
                : "Your next decision has a future. See it first."}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-md mx-auto">
              {isFr
                ? "Testez un achat en 30 secondes et découvrez son impact réel sur votre trajectoire."
                : "Simulate an upcoming purchase in 30 seconds and see its true consequence on your goals."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/app/decide")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] px-9 py-4.5 text-sm font-extrabold text-white shadow-xl shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>{isFr ? "Analyser ma Décision — Gratuit" : "Analyze My Decision — Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Reassurance Grid */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isFr ? "Configuration en 2 min" : "2-minute setup"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isFr ? "Sans carte bancaire" : "No credit card required"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isFr ? "Vos données restent sous votre contrôle" : "Your data stays under your control"}</span>
            </div>
          </div>

        </Container>
      </section>

    </div>
  );
}
