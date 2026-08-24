"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { Container } from "@/components/layout/container";
import { UseaimlyLogo } from "@/components/design-system/UseaimlyLogo";
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
    delayDays: "+43 jours",
    delayFr: "Retarde votre Objectif Entreprise de 43 jours",
    delayEn: "Delays your Business Goal by 43 days",
    recoveryFr: "+125 $/mois pendant 16 mois pour compenser",
    recoveryEn: "+$125/month for 16 months to recover",
    statusTextFr: "PROCÉDER AVEC PRUDENCE",
    statusTextEn: "PROCEED WITH CAUTION",
    statusType: "caution",
    altOptionFr: "Attendez 18 jours et achetez-le sans retarder votre trajectoire.",
    altOptionEn: "Wait 18 days and buy it without changing your arrival date.",
  },
  {
    id: "car",
    labelFr: "🚗 Achat Voiture d'Occasion (8 000 $)",
    labelEn: "🚗 Used Car Purchase ($8,000)",
    queryFr: "Puis-je acheter une voiture à 8 000 $ au comptant ?",
    queryEn: "Can I buy an $8,000 car with cash?",
    amount: "$8,000",
    cashAfter: "$1,120",
    runway: "0.8 mois",
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
  const [activeStrategyTab, setActiveStrategyTab] = useState<"BUY_NOW" | "WAIT" | "SPREAD">("BUY_NOW");

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
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "warning":
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400",
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
      case "caution":
      default:
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
    }
  };

  const statusBadge = getStatusBadge(currentPreset.statusType);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/15 flex flex-col antialiased">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — HERO: WIDESCREEN COMMANDING PRESENCE
          "See Tomorrow Before Deciding Today."
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-8 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-36 border-b border-border/60 overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1920px] h-[550px] bg-gradient-to-b from-primary/8 via-orange-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <Container size="hero">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 2xl:gap-20 3xl:gap-28 items-center">
            
            {/* Left Column: Authoritative Positioning & CTAs (46% width) */}
            <div className="lg:col-span-6 2xl:col-span-5 space-y-7 sm:space-y-9 text-left">
              
              {/* Category Indicator Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-secondary/80 border border-border/80 text-xs font-mono font-bold text-muted-foreground shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5533] animate-pulse" />
                <span>{isFr ? "Moteur de Décision Financière Déterministe" : "Deterministic Financial Decision Engine"}</span>
              </div>

              {/* Dominant Headline with Responsive Limits */}
              <h1 className="text-4xl sm:text-6xl lg:text-6xl 2xl:text-7xl 3xl:text-8xl font-black text-foreground tracking-tight leading-[1.04]">
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

              {/* Primary Subheadline with Controlled Line Length */}
              <p className="text-base sm:text-lg 2xl:text-xl text-muted-foreground font-medium max-w-xl 2xl:max-w-2xl leading-relaxed">
                {isFr
                  ? "Avant de dépenser, d'emprunter ou d'investir, visualisez l'impact mathématique exact sur vos liquidités, vos charges fixes et la date de vos objectifs de vie."
                  : "Before you spend, borrow or invest, see the exact mathematical impact on your cash reserves, debt runway, and future life arrival dates."}
              </p>

              {/* Live Preset Switcher Chips */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                  {isFr ? "💡 Testez un scénario réel en direct :" : "💡 Test a live decision scenario:"}
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
                            ? "bg-[#FF5533] text-white border-[#FF5533] shadow-md shadow-orange-500/25 scale-[1.02] font-bold"
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
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.push(`/app/decide?q=${encodeURIComponent(isFr ? currentPreset.queryFr : currentPreset.queryEn)}`)}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] px-8 py-4.5 2xl:px-10 2xl:py-5 text-sm 2xl:text-base font-extrabold text-white shadow-xl shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>{isFr ? "Analyser ma Décision — Gratuit" : "Analyze a Decision — Free"}</span>
                  <ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("how-it-works")}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border px-7 py-4.5 2xl:px-8 2xl:py-5 text-xs 2xl:text-sm font-bold text-foreground transition-all cursor-pointer"
                >
                  <span>{isFr ? "Voir comment ça marche" : "See How It Works"}</span>
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Trust & Enterprise Assurance Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isFr ? "Sans carte bancaire" : "No credit card required"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{isFr ? "Zéro identifiant bancaire" : "Zero bank login credentials"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF5533] shrink-0" />
                  <span>{isFr ? "100% Déterministe" : "100% Deterministic math"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Commanding, Enlarged Product Simulation Showcase (54% width) */}
            <div className="lg:col-span-6 2xl:col-span-7 flex justify-center w-full">
              <div className="w-full rounded-[2.5rem] 2xl:rounded-[3rem] border border-border/90 bg-card p-6 sm:p-8 2xl:p-10 shadow-2xl space-y-6 text-left transition-all">
                
                {/* Console Header Bar */}
                <div className="flex items-center justify-between border-b border-border/70 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono font-bold text-muted-foreground uppercase ml-2">
                      UseAimly Simulation Console
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isFr ? "Calculateur Déterministe Actif" : "Deterministic Engine Live"}</span>
                  </span>
                </div>

                {/* Simulated Natural Language Query Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground uppercase">
                    <span>{isFr ? "DÉCISION TESTÉE :" : "PROPOSED DECISION:"}</span>
                    <span className="text-primary font-semibold">{currentPreset.amount}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/60 border border-border text-sm sm:text-base font-semibold text-foreground flex items-center justify-between gap-3">
                    <span>&ldquo;{isFr ? currentPreset.queryFr : currentPreset.queryEn}&rdquo;</span>
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg shrink-0">
                      NLP PARSED
                    </span>
                  </div>
                </div>

                {/* Simulated UseAimly Engine Verdict */}
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
                      {isFr ? "VERDICT DÉTERMINISTE USEAIMLY" : "USEAIMLY DETERMINISTIC VERDICT"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase border ${statusBadge.bg}`}>
                      {statusBadge.icon}
                      <span>{isFr ? currentPreset.statusTextFr : currentPreset.statusTextEn}</span>
                    </span>
                  </div>

                  {/* Consequence Headline */}
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80">
                    <p className="text-base sm:text-lg font-bold text-foreground leading-snug">
                      {isFr ? currentPreset.delayFr : currentPreset.delayEn}.
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {isFr ? currentPreset.recoveryFr : currentPreset.recoveryEn}.
                    </p>
                  </div>

                  {/* 4 Real Metric Breakdown Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 2xl:p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
                      <span className="text-[10px] 2xl:text-[11px] font-mono text-muted-foreground uppercase font-bold block">
                        {isFr ? "Cash Restant" : "Cash After"}
                      </span>
                      <span className="text-base 2xl:text-lg font-black text-foreground font-mono block">
                        {currentPreset.cashAfter}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {isFr ? "Liquidités immédiates" : "Immediate buffer"}
                      </span>
                    </div>

                    <div className="p-3.5 2xl:p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
                      <span className="text-[10px] 2xl:text-[11px] font-mono text-muted-foreground uppercase font-bold block">
                        {isFr ? "Matelas Sécurité" : "Runway Cushion"}
                      </span>
                      <span className="text-base 2xl:text-lg font-black text-foreground font-mono block">
                        {currentPreset.runway}
                      </span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                        {isFr ? "Min requis: 3.0 m" : "Target: 3.0 mos"}
                      </span>
                    </div>

                    <div className="p-3.5 2xl:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-1">
                      <span className="text-[10px] 2xl:text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase font-bold block">
                        {isFr ? "Décalage Objectif" : "Goal Delay"}
                      </span>
                      <span className="text-base 2xl:text-lg font-black text-rose-600 dark:text-rose-400 font-mono block">
                        {currentPreset.delayDays}
                      </span>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-medium">
                        {isFr ? "Date reculée" : "Timeline pushed"}
                      </span>
                    </div>

                    <div className="p-3.5 2xl:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                      <span className="text-[10px] 2xl:text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
                        {isFr ? "Recouvrement" : "Catch-up Plan"}
                      </span>
                      <span className="text-base 2xl:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                        +$125/m
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                        {isFr ? "Plan d'action" : "Actionable path"}
                      </span>
                    </div>
                  </div>

                  {/* Best Actionable Alternative Card */}
                  <div className="p-4 2xl:p-4.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{isFr ? "MEILLEURE ALTERNATIVE DÉTECTÉE" : "OPTIMAL ALTERNATIVE DETECTED"}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                        {isFr ? "0 RETARD" : "0 DELAY"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">
                      {isFr ? currentPreset.altOptionFr : currentPreset.altOptionEn}
                    </p>
                  </div>

                  {/* Direct Test Action Button */}
                  <button
                    type="button"
                    onClick={() => router.push(`/app/decide?q=${encodeURIComponent(isFr ? currentPreset.queryFr : currentPreset.queryEn)}`)}
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-foreground text-background hover:opacity-90 py-3.5 2xl:py-4 text-xs sm:text-sm font-bold transition-opacity cursor-pointer shadow-md"
                  >
                    <span>{isFr ? "Simuler ce scénario dans le Studio" : "Simulate this scenario in Decision Studio"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </Container>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — SCALE THE PROBLEM: 4-COLUMN WIDESCREEN GRID
          "You're not bad with money. You're making decisions without seeing the full consequences."
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 lg:py-36 border-b border-border/60 bg-secondary/20">
        <Container size="wide" className="text-center space-y-14 sm:space-y-18">
          
          {/* Section Header */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
              {isFr ? "Vous n'êtes pas mauvais avec l'argent." : "You're not bad with money."}
            </span>
            <h2 className="text-3xl sm:text-5xl 2xl:text-6xl font-black text-foreground tracking-tight leading-tight">
              {isFr
                ? "Vous prenez des décisions sans en voir toutes les conséquences."
                : "You're making decisions without seeing the full consequences."}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              {isFr
                ? "Chaque choix financier modifie immédiatement 4 dimensions invisibles à l'œil nu."
                : "Every financial choice instantly alters 4 invisible dimensions that standard budget apps overlook."}
            </p>
          </div>

          {/* 4 Consequence Cards: Widescreen 4-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 text-left">
            
            {/* Card 01 */}
            <div className="p-7 2xl:p-9 rounded-3xl 2xl:rounded-4xl bg-card border border-border/80 space-y-4 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-mono font-bold text-xs">
                    01
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded">
                    Liquidité
                  </span>
                </div>
                <h3 className="text-lg 2xl:text-xl font-bold text-foreground leading-snug">
                  {isFr ? "Acheter modifie vos liquidités disponibles." : "Buying something shrinks your cash."}
                </h3>
                <p className="text-xs 2xl:text-sm text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Une sortie immédiate réduit votre marge de manœuvre en cas de coup dur imprévu et compresse votre matelas."
                    : "An immediate cash outflow instantly compresses your liquid reserve cushion when unexpected life shocks hit."}
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">{isFr ? "Impact type :" : "Typical impact:"}</span>
                <span className="text-rose-500 font-bold">-25% à -50% cash</span>
              </div>
            </div>

            {/* Card 02 */}
            <div className="p-7 2xl:p-9 rounded-3xl 2xl:rounded-4xl bg-card border border-border/80 space-y-4 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-mono font-bold text-xs">
                    02
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase bg-purple-500/10 px-2 py-0.5 rounded">
                    Cash-Flow
                  </span>
                </div>
                <h3 className="text-lg 2xl:text-xl font-bold text-foreground leading-snug">
                  {isFr ? "Un prêt modifie votre liberté mensuelle." : "A loan binds your monthly freedom."}
                </h3>
                <p className="text-xs 2xl:text-sm text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Chaque mensualité engagée bloque du cash-flow récurrent qui aurait pu alimenter vos projets futurs."
                    : "Every recurring commitment quietly locks up cash flow that could have funded future life investments."}
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">{isFr ? "Impact type :" : "Typical impact:"}</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">-$300/m engagé</span>
              </div>
            </div>

            {/* Card 03 */}
            <div className="p-7 2xl:p-9 rounded-3xl 2xl:rounded-4xl bg-card border border-border/80 space-y-4 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
                    03
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                    Échéances
                  </span>
                </div>
                <h3 className="text-lg 2xl:text-xl font-bold text-foreground leading-snug">
                  {isFr ? "Une dépense repousse un autre objectif." : "A purchase delays another goal."}
                </h3>
                <p className="text-xs 2xl:text-sm text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Allouer des fonds à une envie immédiate recule l'achat d'un bien ou le lancement de votre entreprise."
                    : "Allocating money to an impulse purchase quietly pushes back your home deposit or business launch date."}
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">{isFr ? "Impact type :" : "Typical impact:"}</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">+45 à +90 jours</span>
              </div>
            </div>

            {/* Card 04 */}
            <div className="p-7 2xl:p-9 rounded-3xl 2xl:rounded-4xl bg-card border border-border/80 space-y-4 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-mono font-bold text-xs">
                    04
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase bg-rose-500/10 px-2 py-0.5 rounded">
                    Résilience
                  </span>
                </div>
                <h3 className="text-lg 2xl:text-xl font-bold text-foreground leading-snug">
                  {isFr ? "Votre filet de sécurité s'érode sans bruit." : "Your safety runway erodes silently."}
                </h3>
                <p className="text-xs 2xl:text-sm text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Sans modélisation prédictive, votre réserve de survie passe sous le seuil critique des 3 mois."
                    : "Without predictive modeling, your emergency runway quietly falls below the critical 3-month survival threshold."}
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">{isFr ? "Impact type :" : "Typical impact:"}</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">&lt; 2 mois runway</span>
              </div>
            </div>

          </div>

          {/* Impact Statement */}
          <div className="pt-4 max-w-2xl mx-auto">
            <p className="text-lg sm:text-2xl font-bold text-foreground">
              {isFr
                ? "UseAimly calcule précisément ce qui change avant que vous ne vous engagiez."
                : "UseAimly shows you what changes before you commit."}
            </p>
          </div>

        </Container>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — HOW IT WORKS: 3 CLARITY STEPS
          Step 1: Tell us your decision
          Step 2: See the financial impact
          Step 3: Compare better options
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 sm:py-28 lg:py-36 border-b border-border/60">
        <Container size="wide" className="space-y-16 lg:space-y-20">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
              {isFr ? "Comment ça marche" : "How It Works"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              {isFr ? "Trois étapes claires avant d'agir." : "Three simple steps before you commit."}
            </h2>
            <p className="text-base text-muted-foreground font-medium">
              {isFr
                ? "Un instrument prédictif conçu pour vous donner le contrôle absolu sur votre avenir."
                : "A predictive instrument designed to give you clarity and confidence before any financial commitment."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* STEP 1 */}
            <div className="p-8 2xl:p-10 rounded-3xl 2xl:rounded-4xl border border-border/80 bg-card space-y-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">
                    {isFr ? "ÉTAPE 01" : "STEP 01"}
                  </span>
                  <Compass className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl 2xl:text-2xl font-bold text-foreground">
                  {isFr ? "Indiquez votre décision" : "State your decision"}
                </h3>
                <p className="text-xs 2xl:text-sm text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Tapez une simple phrase en langage naturel ou entrez le montant exact de la dépense ou du prêt envisagé."
                    : "Type a natural language phrase, input a proposed price, or upload a quote."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/60 border border-border/60 text-xs font-mono text-foreground font-medium space-y-1">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">{isFr ? "Exemple" : "Example"}:</span>
                <p>&ldquo;{isFr ? "Je veux acheter une voiture à 8 000 $." : "I want to buy a car for $8,000."}&rdquo;</p>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="p-8 2xl:p-10 rounded-3xl 2xl:rounded-4xl border border-border/80 bg-card space-y-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">
                    {isFr ? "ÉTAPE 02" : "STEP 02"}
                  </span>
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl 2xl:text-2xl font-bold text-foreground">
                  {isFr ? "Voyez l'impact financier" : "See the exact consequence"}
                </h3>
                <p className="text-xs 2xl:text-sm text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Le moteur calcule déterministement l'impact sur vos 3 Piliers : liquidités, charges fixes et date d'arrivée de vos projets."
                    : "The deterministic engine computes the consequence across 3 Pillars: liquidity, fixed commitments, and goal timelines."}
                </p>
              </div>

              <ul className="space-y-2 text-xs 2xl:text-sm text-foreground font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{isFr ? "Liquidités restantes & matelas" : "Cash buffer & emergency runway"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{isFr ? "Charges fixes mensuelles" : "Monthly fixed obligations"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{isFr ? "Date de vos objectifs (retard en jours)" : "Life goals arrival delay in days"}</span>
                </li>
              </ul>
            </div>

            {/* STEP 3 */}
            <div className="p-8 2xl:p-10 rounded-3xl 2xl:rounded-4xl border border-border/80 bg-card space-y-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">
                    {isFr ? "ÉTAPE 03" : "STEP 03"}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-xl 2xl:text-2xl font-bold text-foreground">
                  {isFr ? "Comparez de meilleures options" : "Compare optimal pathways"}
                </h3>
                <p className="text-xs 2xl:text-sm text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Comparez 3 stratégies concrètes pour exécuter votre envie sans faire dérailler vos grands projets de vie."
                    : "Review 3 actionable paths to execute safely without compromising your primary destination."}
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex justify-between items-center">
                  <span className="font-bold text-foreground">{isFr ? "ACHETER DE SUITE" : "BUY NOW"}</span>
                  <span className="text-rose-500 font-bold">{isFr ? "+43 jours" : "+43 days"}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{isFr ? "ATTENDRE 18 JOURS" : "WAIT 18 DAYS"}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isFr ? "0 retard" : "0 delay"}</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex justify-between items-center">
                  <span className="font-bold text-foreground">{isFr ? "ÉCHELONNER 3 MOIS" : "SPREAD 3 MOS"}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{isFr ? "+9 jours" : "+9 days"}</span>
                </div>
              </div>
            </div>

          </div>

        </Container>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 4 — THE WOW MOMENT: OBSIDIAN WIDESCREEN CONSOLE
          "That $2,000 purchase may cost more than $2,000."
          "Every financial decision has a future cost."
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 lg:py-36 border-b border-border/60 bg-[#0C0C10] text-white">
        <Container size="wide" className="space-y-14 lg:space-y-18 text-center">
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold">
              {isFr ? "Le Coût Réel Futur" : "The True Future Cost"}
            </span>
            <h2 className="text-3xl sm:text-5xl 2xl:text-6xl font-black tracking-tight text-white leading-tight">
              {isFr
                ? "Cet achat de 2 000 $ peut coûter bien plus que 2 000 $."
                : "That $2,000 purchase may cost more than $2,000."}
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 font-medium max-w-xl mx-auto">
              {isFr
                ? "Chaque décision financière a un coût direct sur la date d'arrivée de votre avenir."
                : "Every present spending decision silently steals days from your future freedom."}
            </p>
          </div>

          {/* High-Impact Widescreen Obsidian Console */}
          <div className="rounded-[2.5rem] 2xl:rounded-[3.5rem] border border-white/10 bg-white/5 p-8 sm:p-12 2xl:p-16 space-y-10 text-left max-w-5xl mx-auto shadow-2xl backdrop-blur-xl">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-white/10 pb-8">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  {isFr ? "DÉPENSE AUJOURD'HUI" : "PURCHASE TODAY"}
                </span>
                <span className="text-3xl sm:text-5xl font-black text-white font-mono">
                  $2,000
                </span>
              </div>

              <div className="space-y-1 md:text-right">
                <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold block">
                  {isFr ? "DÉCALAGE TRAJECTOIRE" : "TRAJECTORY DISPLACEMENT"}
                </span>
                <span className="text-3xl sm:text-5xl font-black text-[#FF5533] font-mono">
                  +43 {isFr ? "Jours" : "Days"}
                </span>
              </div>
            </div>

            {/* 3 Real Future Cost Pillars */}
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold block">
                {isFr ? "VÉRITABLE IMPACT MULTIDIMENSIONNEL :" : "REAL MULTI-DIMENSIONAL CONSEQUENCE:"}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">
                    {isFr ? "Apport Immobilier" : "Home Goal Arrival"}
                  </span>
                  <span className="text-2xl font-black text-[#FF5533] font-mono block">
                    +43 {isFr ? "jours" : "days"}
                  </span>
                  <p className="text-xs text-zinc-400">
                    {isFr ? "Date reculée du 12 Oct au 24 Nov" : "Arrival pushed Oct 12 → Nov 24"}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">
                    {isFr ? "Matelas de Secours" : "Emergency Runway"}
                  </span>
                  <span className="text-2xl font-black text-amber-400 font-mono block">
                    -18% (-0.8 m)
                  </span>
                  <p className="text-xs text-zinc-400">
                    {isFr ? "Passe de 2.9 à 2.1 mois de charges" : "Drops from 2.9 to 2.1 mos buffer"}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">
                    {isFr ? "Capacité Entreprise" : "Business Launch"}
                  </span>
                  <span className="text-2xl font-black text-zinc-200 font-mono block">
                    -$2,640
                  </span>
                  <p className="text-xs text-zinc-400">
                    {isFr ? "Coût d'opportunité cumulé" : "Compounded opportunity cost"}
                  </p>
                </div>
              </div>
            </div>

            {/* Emotional Punchline */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <p className="text-sm text-zinc-400 font-medium">
                  {isFr ? "Cet achat ne vous coûte pas seulement 2 000 $." : "This purchase doesn't just cost you $2,000."}
                </p>
                <p className="text-2xl sm:text-4xl font-black text-white">
                  {isFr ? "Il vous coûte 43 jours de vie." : "It costs you 43 days of life."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/app/decide")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF5533] text-white px-7 py-4 text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all shrink-0 cursor-pointer"
              >
                <span>{isFr ? "Calculer mes 43 jours" : "Calculate My Future Cost"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </Container>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 5 — DIFFERENTIATION: GENERIC AI VS DETERMINISTIC ENGINE
          "Advice is not the same as consequences."
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 lg:py-36 border-b border-border/60">
        <Container size="wide" className="space-y-14 lg:space-y-18 text-center">
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
              {isFr ? "La Différence UseAimly" : "The Core Distinction"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
              {isFr
                ? "Un conseil n'est pas la même chose qu'une conséquence."
                : "Advice is not the same as consequences."}
            </h2>
            <p className="text-base text-muted-foreground font-medium">
              {isFr
                ? "Pourquoi les chatbots d'IA génériques échouent là où UseAimly apporte une certitude mathématique absolue."
                : "Why generic conversational AI falls short while UseAimly delivers mathematical certainty."}
            </p>
          </div>

          {/* Side-by-Side Widescreen Architectural Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-5xl mx-auto">
            
            {/* Generic AI Box */}
            <div className="p-8 2xl:p-10 rounded-3xl 2xl:rounded-4xl border border-border/70 bg-secondary/30 space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    {isFr ? "IA GÉNÉRIQUE & CHATBOTS" : "GENERIC AI & CHATBOTS"}
                  </span>
                  <span className="text-[10px] font-mono bg-secondary border border-border px-2 py-0.5 rounded text-muted-foreground font-bold">
                    SUBJECTIF
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {isFr ? "Discute vaguement de votre décision." : "Discusses your decision subjectively."}
                </h3>
              </div>

              <div className="space-y-3 pt-3 border-t border-border/60 text-xs sm:text-sm text-muted-foreground font-medium">
                <p>
                  {isFr
                    ? "Génère des conseils génériques, des formules de politesse et des platitudes sans calculer de calendrier réel."
                    : "Generates general, text-based advice without running deterministic calculations on your real dates."}
                </p>
                <div className="p-4 rounded-2xl bg-secondary/60 border border-border/60 italic text-muted-foreground text-xs">
                  &ldquo;{isFr
                    ? "Il est généralement sage d'équilibrer vos dépenses et d'économiser pour vos projets futurs..."
                    : "It is generally wise to maintain a balanced budget and save for future endeavors..."}&rdquo;
                </div>
              </div>

              <div className="text-xs text-rose-500 font-mono font-bold flex items-center gap-1.5">
                <span>✕ Zéro calcul de date exacte • Zéro certitude</span>
              </div>
            </div>

            {/* UseAimly Box */}
            <div className="p-8 2xl:p-10 rounded-3xl 2xl:rounded-4xl border-2 border-[#FF5533]/50 bg-[#FF5533]/5 space-y-6 relative overflow-hidden flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold">
                    USEAIMLY DECISION ENGINE
                  </span>
                  <span className="text-[10px] font-mono bg-[#FF5533]/20 border border-[#FF5533]/40 px-2 py-0.5 rounded text-[#FF5533] font-extrabold">
                    100% DÉTERMINISTE
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {isFr ? "Calcule au jour près ce qui change." : "Calculates the exact change down to the day."}
                </h3>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#FF5533]/20 text-xs sm:text-sm text-foreground/90 font-medium">
                <p>
                  {isFr
                    ? "Alimente vos dates cibles, vos liquidités et vos flux dans un moteur déterministe certifié sans hallucination."
                    : "Passes your target deadlines, liquidity reserves, and cash flows into a deterministic invariant engine."}
                </p>
                <div className="p-4 rounded-2xl bg-[#FF5533]/10 border border-[#FF5533]/30 font-mono text-xs space-y-1">
                  <p className="font-bold text-[#FF5533]">
                    {isFr ? "➔ Retard exact : +43 jours" : "➔ Exact delay: +43 days"}
                  </p>
                  <p className="text-muted-foreground">
                    {isFr ? "➔ Liquidités restantes : 2.1 mois" : "➔ Runway after decision: 2.1 months"}
                  </p>
                </div>
              </div>

              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{isFr ? "Certitude mathématique garantie • 0 hallucination" : "Mathematical certainty • 0 hallucinations"}</span>
              </div>
            </div>

          </div>

          {/* Differentiation Punchline */}
          <div className="space-y-2 max-w-2xl mx-auto pt-4">
            <p className="text-base text-muted-foreground font-medium">
              {isFr ? "Ne demandez pas seulement ce que vous devriez faire." : "Don't just ask what you should do."}
            </p>
            <p className="text-2xl sm:text-4xl font-black text-foreground">
              {isFr ? "Voyez ce qui se passe quand vous le faites." : "See what happens when you do it."}
            </p>
          </div>

        </Container>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 6 — FINAL CTA: WIDESCREEN FINALE
          "Your next financial decision is coming."
          "See what it does to your future before you make it."
      ───────────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 lg:py-40 bg-gradient-to-b from-background via-secondary/20 to-background border-b border-border/60">
        <Container size="wide" className="text-center space-y-10 max-w-4xl mx-auto">
          
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-tight">
              {isFr
                ? "Votre prochaine décision financière arrive."
                : "Your next financial decision is coming."}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
              {isFr
                ? "Voyez ce qu'elle fait à votre avenir avant de vous engager."
                : "See what it does to your future before you make it."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/app/decide")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] px-10 py-5 text-sm sm:text-base font-extrabold text-white shadow-xl shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>{isFr ? "Analyser ma Décision — Gratuit" : "Analyze My Decision — Free"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Reassurance Grid */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>{isFr ? "Prise en main immédiate en 2 min" : "2-minute instant setup"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>{isFr ? "Sans carte bancaire" : "No credit card required"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>{isFr ? "100% Mathématique Déterministe" : "100% Deterministic Engine"}</span>
            </div>
          </div>

        </Container>
      </section>

    </div>
  );
}
