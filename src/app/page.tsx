"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useCurrency } from "@/lib/currency/currency-context";
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
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const { currency, format } = useCurrency();
  const { language } = useI18n();
  const router = useRouter();
  const isFr = language === "fr";

  // Interactive Hero Preview state
  const [heroDecisionQuery, setHeroDecisionQuery] = useState(
    isFr
      ? "J'envisage d'acheter un ordinateur à 2 000 $."
      : "I'm thinking about buying a $2,000 laptop."
  );

  const [activeStepTab, setActiveStepTab] = useState<"BUY_NOW" | "WAIT" | "CHEAPER">("BUY_NOW");

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/15 flex flex-col antialiased">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — HERO
          "See Tomorrow Before Deciding Today."
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-border/50 overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/5 via-orange-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Prop & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Category Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border/80 text-xs font-mono font-semibold text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-[#FF5533]" />
                <span>{isFr ? "Moteur de Décision Financière" : "The Financial Decision Engine"}</span>
              </div>

              {/* Primary Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.08]">
                {isFr ? (
                  <>
                    Voyez <span className="text-[#FF5533] italic">demain</span>
                    <br />
                    avant de décider aujourd&apos;hui.
                  </>
                ) : (
                  <>
                    See <span className="text-[#FF5533] italic">Tomorrow</span>
                    <br />
                    Before Deciding Today.
                  </>
                )}
              </h1>

              {/* Primary Subheadline */}
              <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-xl leading-relaxed">
                {isFr
                  ? "Avant de dépenser, d'emprunter ou d'investir, voyez exactement ce que cette décision fait à votre avenir financier."
                  : "Before you spend, borrow or invest, see exactly what that decision does to your financial future."}
              </p>

              {/* Actions & CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => router.push(`/app/decide?q=${encodeURIComponent(heroDecisionQuery)}`)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] px-7 py-4 text-sm font-extrabold text-white shadow-lg shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>{isFr ? "Analyser une Décision — Gratuit" : "Analyze a Decision — Free"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("how-it-works")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border px-6 py-4 text-xs font-bold text-foreground transition-all cursor-pointer"
                >
                  <span>{isFr ? "Voir comment ça marche" : "See How It Works"}</span>
                  <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Trust Microcopy */}
              <div className="pt-1 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {isFr
                    ? "Sans carte bancaire. Sans feuilles de calcul complexes."
                    : "No credit card. No complicated spreadsheets."}
                </span>
              </div>
            </div>

            {/* Right Column: High-Fidelity Product Preview Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md rounded-3xl border border-border/90 bg-card p-6 shadow-2xl space-y-4 text-left transition-all">
                
                {/* Simulated User Input */}
                <div className="space-y-1.5 pb-3 border-b border-border/60">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-muted-foreground uppercase">
                    <span>{isFr ? "UTILISATEUR" : "USER"}</span>
                    <span className="text-primary font-semibold">{isFr ? "Simulation en direct" : "Live Simulation"}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-secondary/50 border border-border/70 text-xs sm:text-sm font-medium text-foreground">
                    &ldquo;{heroDecisionQuery}&rdquo;
                  </div>
                </div>

                {/* Simulated UseAimly Result */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase">
                      {isFr ? "RÉSULTAT USEAIMLY" : "USEAIMLY RESULT"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-mono font-extrabold uppercase">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{isFr ? "PROCÉDER AVEC PRUDENCE" : "PROCEED WITH CAUTION"}</span>
                    </span>
                  </div>

                  {/* Impact Summary Line */}
                  <p className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                    {isFr
                      ? "Acheter ceci aujourd'hui retardera votre Objectif Entreprise de 43 jours."
                      : "Buying this today will delay your Business Goal by 43 days."}
                  </p>

                  {/* 3 Real Metric Breakdown Cards */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/60 space-y-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">
                        {isFr ? "Cash restant" : "Cash after"}
                      </span>
                      <span className="text-sm font-extrabold text-foreground font-mono block">
                        $2,840
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/60 space-y-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">
                        {isFr ? "Matelas secours" : "Runway"}
                      </span>
                      <span className="text-sm font-extrabold text-foreground font-mono block">
                        2.1 {isFr ? "mois" : "mos"}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-0.5">
                      <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 uppercase font-bold block">
                        {isFr ? "Objectif" : "Goal Delay"}
                      </span>
                      <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono block">
                        +43 {isFr ? "jours" : "days"}
                      </span>
                    </div>
                  </div>

                  {/* Best Alternative Box */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isFr ? "MEILLEURE ALTERNATIVE" : "BEST ALTERNATIVE"}</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      {isFr
                        ? "Attendez 18 jours et achetez-le sans changer votre trajectoire financière."
                        : "Wait 18 days and buy it without changing your financial trajectory."}
                    </p>
                  </div>

                  {/* Direct Test Action */}
                  <button
                    type="button"
                    onClick={() => router.push(`/app/decide?q=${encodeURIComponent(heroDecisionQuery)}`)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-foreground text-background hover:opacity-90 py-3 text-xs font-bold transition-opacity cursor-pointer"
                  >
                    <span>{isFr ? "Analyser ma décision" : "Analyze this decision"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — THE PROBLEM
          "You're not bad with money. You're making decisions without seeing the full consequences."
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-b border-border/50 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
              {isFr ? "Vous n'êtes pas mauvais avec l'argent." : "You're not bad with money."}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight max-w-3xl mx-auto leading-tight">
              {isFr
                ? "Vous prenez des décisions sans en voir toutes les conséquences."
                : "You're making decisions without seeing the full consequences."}
            </h2>
          </div>

          {/* 4 Clear Visual Statements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-2 shadow-2xs">
              <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-mono font-bold text-xs">
                01
              </div>
              <h3 className="text-base font-bold text-foreground">
                {isFr ? "Acheter quelque chose modifie vos liquidités." : "Buying something changes your cash."}
              </h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {isFr
                  ? "Une sortie immédiate réduit votre marge de manœuvre en cas de coup dur imprévu."
                  : "An immediate outflow instantly shrinks your liquidity cushion when unexpected events happen."}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-2 shadow-2xs">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-mono font-bold text-xs">
                02
              </div>
              <h3 className="text-base font-bold text-foreground">
                {isFr ? "Un prêt modifie votre liberté mensuelle." : "A loan changes your monthly freedom."}
              </h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {isFr
                  ? "Chaque mensualité engagée réduit votre capacité d'épargne pour les prochaines années."
                  : "Every ongoing commitment ties up cash flow that could have fueled your future projects."}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-2 shadow-2xs">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
                03
              </div>
              <h3 className="text-base font-bold text-foreground">
                {isFr ? "Un investissement peut retarder un autre objectif." : "An investment can delay another goal."}
              </h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {isFr
                  ? "Allouer des fonds à une opportunité peut repousser l'achat d'une maison ou le lancement d'une activité."
                  : "Allocating funds to one asset can quietly push back your home deposit or business launch date."}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-2 shadow-2xs">
              <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-mono font-bold text-xs">
                04
              </div>
              <h3 className="text-base font-bold text-foreground">
                {isFr ? "Une nouvelle dépense affaiblit votre filet de sécurité." : "A new expense can weaken your financial safety net."}
              </h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {isFr
                  ? "Sans simulation préalable, votre matelas d'urgence peut passer sous le seuil critique."
                  : "Without prior modeling, your emergency runway can drop below safe resilience thresholds."}
              </p>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="pt-4">
            <p className="text-lg sm:text-xl font-bold text-foreground">
              {isFr
                ? "UseAimly vous montre ce qui change avant que vous ne vous engagiez."
                : "UseAimly shows you what changes before you commit."}
            </p>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — HOW IT WORKS
          Step 1: Tell us your decision
          Step 2: See the financial impact
          Step 3: Compare better options
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 sm:py-28 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
              {isFr ? "Comment ça marche" : "How It Works"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {isFr ? "Trois étapes claires avant d'agir." : "Three simple steps before you commit."}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* STEP 1 */}
            <div className="p-7 rounded-3xl border border-border/80 bg-card space-y-4 flex flex-col justify-between shadow-2xs">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                  {isFr ? "ÉTAPE 1" : "STEP 1"}
                </span>
                <h3 className="text-xl font-bold text-foreground">
                  {isFr ? "Indiquez votre décision" : "Tell us your decision"}
                </h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Tapez une simple phrase ou entrez le montant exact de la dépense ou du prêt."
                    : "Type a short phrase, enter a proposed price, or drop a financing contract."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/60 border border-border/60 text-xs font-mono text-foreground font-medium">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">{isFr ? "Exemple" : "Example"}:</span>
                &ldquo;{isFr ? "Je veux acheter une voiture à 8 000 $." : "I want to buy a car for $8,000."}&rdquo;
              </div>
            </div>

            {/* STEP 2 */}
            <div className="p-7 rounded-3xl border border-border/80 bg-card space-y-4 flex flex-col justify-between shadow-2xs">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                  {isFr ? "ÉTAPE 2" : "STEP 2"}
                </span>
                <h3 className="text-xl font-bold text-foreground">
                  {isFr ? "Voyez l'impact financier" : "See the financial impact"}
                </h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "UseAimly analyse l'impact déterministe sur vos piliers vitaux :"
                    : "UseAimly calculates the exact consequences across your finances:"}
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-foreground font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{isFr ? "Liquidités restantes" : "Cash & Liquid Reserves"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{isFr ? "Matelas de sécurité" : "Emergency runway"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{isFr ? "Endettement" : "Debt & obligations"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{isFr ? "Cash-flow mensuel" : "Monthly cash flow"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{isFr ? "Objectifs de vie (décalage en jours)" : "Financial goals (arrival delay)"}</span>
                </li>
              </ul>
            </div>

            {/* STEP 3 */}
            <div className="p-7 rounded-3xl border border-border/80 bg-card space-y-4 flex flex-col justify-between shadow-2xs">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                  {isFr ? "ÉTAPE 3" : "STEP 3"}
                </span>
                <h3 className="text-xl font-bold text-foreground">
                  {isFr ? "Comparez de meilleures options" : "Compare better options"}
                </h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {isFr
                    ? "Comparez 3 stratégies concrètes pour préserver votre trajectoire :"
                    : "Review 3 actionable paths to execute safely without regret:"}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/50 flex justify-between items-center">
                  <span className="font-bold text-foreground">{isFr ? "ACHETER DE SUITE" : "BUY NOW"}</span>
                  <span className="text-rose-500 font-mono font-bold text-[11px]">{isFr ? "+5 mois de retard" : "Goal delayed: 5 mos"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">{isFr ? "ATTENDRE 2 MOIS" : "WAIT 2 MONTHS"}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">{isFr ? "Objectif préservé" : "Stays on track"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/50 flex justify-between items-center">
                  <span className="font-bold text-foreground">{isFr ? "OPTION MOINS CHÈRE" : "BUY CHEAPER"}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-[11px]">{isFr ? "+6 semaines" : "Delayed: 6 weeks"}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 4 — THE WOW MOMENT
          "That $2,000 purchase may cost more than $2,000."
          "Every financial decision has a future cost."
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-b border-border/50 bg-[#0C0C10] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold">
              {isFr ? "Le Coût Réel Futur" : "The True Future Cost"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-2xl mx-auto leading-tight">
              {isFr
                ? "Cet achat de 2 000 $ peut coûter bien plus que 2 000 $."
                : "That $2,000 purchase may cost more than $2,000."}
            </h2>
            <p className="text-base text-gray-400 font-medium">
              {isFr
                ? "Chaque décision financière a un coût sur votre avenir."
                : "Every financial decision has a future cost."}
            </p>
          </div>

          {/* High-Impact Comparison Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 space-y-8 text-left max-w-2xl mx-auto shadow-2xl">
            <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold">
                {isFr ? "Achat aujourd'hui" : "Purchase Today"}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                $2,000
              </span>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold block">
                {isFr ? "VÉRITABLE IMPACT FUTUR :" : "REAL FUTURE IMPACT:"}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                    {isFr ? "Apport Maison" : "Home Goal"}
                  </span>
                  <span className="text-xl font-extrabold text-[#FF5533] font-mono block">
                    +43 {isFr ? "jours" : "days"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                    {isFr ? "Fonds d'urgence" : "Emergency Fund"}
                  </span>
                  <span className="text-xl font-extrabold text-amber-400 font-mono block">
                    -18%
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                    {isFr ? "Capacité Entreprise" : "Business Capacity"}
                  </span>
                  <span className="text-xl font-extrabold text-gray-200 font-mono block">
                    -$2,640
                  </span>
                </div>
              </div>
            </div>

            {/* Emotional Punchline */}
            <div className="pt-4 border-t border-white/10 space-y-1 text-center sm:text-left">
              <p className="text-sm text-gray-300 font-medium">
                {isFr ? "Cet achat ne vous coûte pas seulement 2 000 $." : "This purchase doesn't just cost you $2,000."}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {isFr ? "Il vous coûte 43 jours." : "It costs you 43 days."}
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 5 — DIFFERENTIATION
          "Advice is not the same as consequences."
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
              {isFr ? "La Différence UseAimly" : "The Core Distinction"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              {isFr
                ? "Un conseil n'est pas la même chose qu'une conséquence."
                : "Advice is not the same as consequences."}
            </h2>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Generic AI Box */}
            <div className="p-8 rounded-3xl border border-border/70 bg-secondary/30 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                  {isFr ? "IA GÉNÉRIQUE & CHATBOTS" : "GENERIC AI"}
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {isFr ? "Discute de votre décision." : "Discusses your decision."}
                </h3>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/50 text-xs text-muted-foreground font-medium">
                <p>
                  {isFr
                    ? "Donne des conseils généraux, vagues et déconnectés de vos vraies échéances."
                    : "Gives general, subjective advice without running deterministic calculations."}
                </p>
                <p className="italic">
                  &ldquo;{isFr ? "Il est important de garder un budget équilibré..." : "It is generally wise to maintain a balanced budget..."}&rdquo;
                </p>
              </div>
            </div>

            {/* UseAimly Box */}
            <div className="p-8 rounded-3xl border border-[#FF5533]/40 bg-[#FF5533]/5 space-y-6 relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#FF5533] font-bold">
                  USEAIMLY
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {isFr ? "Calcule ce que votre décision change." : "Calculates what your decision changes."}
                </h3>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#FF5533]/20 text-xs text-foreground/90 font-medium">
                <p>
                  {isFr
                    ? "Utilise votre réalité financière, vos objectifs, vos dates cibles et vos flux pour calculer l'impact au jour près."
                    : "Uses your real financial picture, goals, timelines, and deterministic scenario engine."}
                </p>
                <p className="font-bold text-[#FF5533]">
                  {isFr ? "➔ Retard exact : +43 jours. Liquidités restantes : 2,1 mois." : "➔ Exact impact: +43 days. Runway after purchase: 2.1 months."}
                </p>
              </div>
            </div>

          </div>

          {/* Final Differentiation Statement */}
          <div className="space-y-1 max-w-xl mx-auto pt-2">
            <p className="text-base text-muted-foreground font-medium">
              {isFr ? "Ne demandez pas seulement ce que vous devriez faire." : "Don't just ask what you should do."}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {isFr ? "Voyez ce qui se passe quand vous le faites." : "See what happens when you do it."}
            </p>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          SECTION 6 — FINAL CTA
          "Your next financial decision is coming."
          "See what it does to your future before you make it."
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-background to-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
              {isFr
                ? "Votre prochaine décision financière arrive."
                : "Your next financial decision is coming."}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-lg mx-auto">
              {isFr
                ? "Voyez ce qu'elle fait à votre avenir avant de la prendre."
                : "See what it does to your future before you make it."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/app/decide")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] px-9 py-4 text-sm font-extrabold text-white shadow-xl shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>{isFr ? "Analyser ma Décision — Gratuit" : "Analyze My Decision — Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground font-medium">
            {isFr
              ? "Prise en main immédiate • Sans carte bancaire • 100% Déterministe"
              : "Instant setup • No credit card required • 100% Deterministic"}
          </p>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          MINIMAL FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-card/40 py-8 text-center text-xs text-muted-foreground font-medium">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <UseaimlyLogo size="sm" showTagline={false} />
            <span>© {new Date().getFullYear()} UseAimly. {isFr ? "Le Moteur de Décision Financière." : "The Financial Decision Engine."}</span>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              {isFr ? "Tarifs" : "Pricing"}
            </Link>
            <Link href="/app/decide" className="hover:text-foreground transition-colors">
              {isFr ? "Studio de Décision" : "Decision Studio"}
            </Link>
            <Link href="/app/goals" className="hover:text-foreground transition-colors">
              {isFr ? "Objectifs" : "Goals"}
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              {isFr ? "Connexion" : "Sign In"}
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
