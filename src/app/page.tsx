"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MinimalistDecisionEngine } from "@/components/design-system/MinimalistDecisionEngine";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { PRICING_PLANS, PricingPlan } from "@/lib/types/pricing";
import { PricingCard } from "@/components/finance/PricingCard";
import { PayPalCheckoutModal } from "@/components/finance/PayPalCheckoutModal";
import { UseaimlyLogo } from "@/components/design-system/UseaimlyLogo";
import {
  Zap,
  ArrowRight,
  Star,
  Compass,
  TrendingUp,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function LandingPage() {
  const { profile } = useAuth();
  const { currency } = useCurrency();
  const { t, language } = useI18n();
  const router = useRouter();
  const [landingYearly, setLandingYearly] = useState(true);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PricingPlan | null>(null);
  const [heroQuery, setHeroQuery] = useState("Can I spend $ 230 on a phone?");

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/15 flex flex-col">
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-12 sm:space-y-20">
        {/* 1. HERO SECTION (MATCHING SCREENSHOTS 1 & 2 PIXEL PERFECT) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Column: Title, Subtitle, CTA & Social Proof (Screenshot 1) */}
          <div className="md:col-span-7 space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5533]/10 border border-[#FF5533]/30 text-[#FF5533] text-xs font-mono font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-[#FF5533]" />
              <span>{language === "fr" ? "Intelligence Décisionnelle d'Objectif" : "Goal-Aware Decision Intelligence"}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground tracking-tight leading-[1.06]">
              {language === "fr" ? (
                <>
                  Voyez <span className="italic text-[#FF5533]">demain</span>
                  <br />
                  avant de décider
                  <br />
                  aujourd&apos;hui.
                </>
              ) : (
                <>
                  See <span className="italic text-[#FF5533]">tomorrow</span>
                  <br />
                  before deciding
                  <br />
                  today.
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-lg leading-relaxed">
              {language === "fr"
                ? "UseAimly vous montre l'impact de vos décisions financières d'aujourd'hui sur vos objectifs futurs."
                : "UseAimly shows you how your financial decisions today impact your future goals."}
            </p>

            {/* Main CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push(`/onboarding?q=${encodeURIComponent(heroQuery)}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-orange-500/25 hover:opacity-95 transition-all cursor-pointer"
              >
                <span>{language === "fr" ? "Essayer une Vraie Décision (aucun compte requis)" : "Try a Real Decision (No account needed)"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Social Proof Footer Row */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1A100B] border border-[#FF5533]/40 text-[10px] font-bold font-mono text-[#FF5533]">
                  GW
                </div>
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1A100B] border border-[#FF5533]/40 text-[10px] font-bold font-mono text-[#FF5533]">
                  DM
                </div>
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1A100B] border border-[#FF5533]/40 text-[10px] font-bold font-mono text-[#FF5533]">
                  AK
                </div>
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1A100B] border border-[#FF5533]/40 text-[10px] font-bold font-mono text-[#FF5533]">
                  JS
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <div className="flex text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <span className="font-bold text-foreground">5.0</span>
                <span>•</span>
                <span>{language === "fr" ? "Approuvé par plus de 1 000 décideurs avisés" : "Trusted by 1,000+ smart decision makers"}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Demo Simulator Card (Screenshot 2) */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111116] p-6 space-y-4 shadow-2xl relative overflow-hidden text-left">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-[#FF5533]" />
                  <span>{language === "fr" ? "ESSAYEZ DE PRENDRE UNE VRAIE DÉCISION" : "TRY A REAL DECISION"}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF5533]/15 border border-[#FF5533]/30 text-[#FF5533] text-[10px] font-mono font-bold uppercase">
                  {language === "fr" ? "DÉMO EN DIRECT" : "LIVE DEMO"}
                </span>
              </div>

              {/* Input Box */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
                <span className="text-[11px] font-mono text-gray-400 font-medium block">
                  {language === "fr" ? "Requête de décision" : "Decision Query"}
                </span>
                <input
                  type="text"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none placeholder:text-gray-500"
                  placeholder="Can I spend $ 230 on a phone?"
                />
              </div>

              {/* Sub-card 1: Immediate Impact */}
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  <span>{language === "fr" ? "IMPACT IMMÉDIAT" : "IMMEDIATE IMPACT"}</span>
                </div>
                <p className="text-xs font-bold text-gray-200">
                  {language === "fr" ? "Votre réserve d'urgence diminue de " : "Your emergency cushion decreases by "}
                  <span className="text-blue-400 font-extrabold">8%</span>
                </p>
              </div>

              {/* Sub-card 2: Future Consequence */}
              <div className="rounded-2xl border border-[#FF5533]/30 bg-[#FF5533]/5 p-4 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#FF5533] uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-[#FF5533]" />
                  <span>{language === "fr" ? "CONSÉQUENCES FUTURES" : "FUTURE CONSEQUENCE"}</span>
                </div>
                <p className="text-xs font-bold text-gray-200">
                  {language === "fr" ? "Votre objectif commercial se déplace de " : "Your Business Goal moves "}
                  <span className="text-[#FF5533] font-extrabold">31 {language === "fr" ? "jours." : "days later"}</span>
                </p>
              </div>

              {/* Sub-card 3: Stay on Track */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === "fr" ? "RESTEZ SUR LA BONNE VOIE" : "STAY ON TRACK"}</span>
                </div>
                <p className="text-xs font-bold text-gray-200">
                  {language === "fr" ? "Économisez " : "Save an additional "}
                  <span className="text-emerald-400 font-extrabold">14 $ {language === "fr" ? "supplémentaires par mois" : "/ month"}</span>
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => router.push(`/app/decide?q=${encodeURIComponent(heroQuery)}`)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] py-3.5 text-xs font-bold text-white hover:opacity-95 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <span>{language === "fr" ? "Voir l'analyse complète" : "See Full Analysis"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>





        {/* 2. MINIMALIST DECISION ENGINE */}
        <section className="w-full">
          <MinimalistDecisionEngine showQuickActions={true} />
        </section>

        {/* 3. WHY USEAIMLY? (ROMAIN BOUVET ANTI-BUDGET STORYTELLING) */}
        <section className="rounded-3xl border border-gray-100 dark:border-border bg-card p-8 sm:p-12 space-y-8 text-center shadow-xs">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00A859] font-bold">
              {t("whyTitleTag")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-foreground">
              {t("whyMainTitle")}
              <br />
              <span className="text-[#00A859]">{t("whyMainTitleLine2")}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 text-left">
            <div className="p-6 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-secondary/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-foreground">{t("whyCard1Title")}</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed font-medium">
                {t("whyCard1Desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-secondary/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-foreground">{t("whyCard2Title")}</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed font-medium">
                {t("whyCard2Desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-secondary/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-foreground">{t("whyCard3Title")}</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed font-medium">
                {t("whyCard3Desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-secondary/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-foreground">{t("whyCard4Title")}</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed font-medium">
                {t("whyCard4Desc")}
              </p>
            </div>
          </div>
        </section>

        {/* 4. PRICING PREVIEW */}
        <section className="space-y-8 text-center">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground tracking-tight">
              {t("pricingSectionTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-muted-foreground font-medium">
              {t("pricingSectionSubtitle")}
            </p>

            <div className="pt-2 flex items-center justify-center gap-3 text-xs font-bold">
              <span className={!landingYearly ? "text-gray-900 dark:text-foreground" : "text-gray-400"}>
                {t("monthlyBilling")}
              </span>
              <button
                type="button"
                onClick={() => setLandingYearly(!landingYearly)}
                className="relative w-12 h-6 rounded-full bg-[#00A859]/20 border border-[#00A859]/40 p-0.5 transition-colors cursor-pointer"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#00A859] transition-transform ${
                    landingYearly ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={landingYearly ? "text-gray-900 dark:text-foreground" : "text-gray-400"}>
                {t("annualBilling")} <span className="text-[#00A859] font-mono text-[10px]">({t("discountBadge")})</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {PRICING_PLANS.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isYearly={landingYearly}
                currency={currency}
                isCurrentPlan={profile?.plan_tier === plan.id}
                onSelectPlan={(p) => setSelectedPlanForCheckout(p)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 dark:border-border bg-white dark:bg-card/50 py-8 text-center text-xs text-gray-500 font-medium">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <UseaimlyLogo size="sm" showTagline={false} />
            <span>© {new Date().getFullYear()} UseAimly. {t("rightsReserved")}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-gray-900 transition-colors">
              {t("navPricing")}
            </Link>
            <Link href="/app/settings" className="hover:text-gray-900 transition-colors">
              {t("navSettings")}
            </Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">
              {t("navSignIn")}
            </Link>
          </div>
        </div>
      </footer>

      {/* PayPal Modal */}
      {selectedPlanForCheckout && (
        <PayPalCheckoutModal
          plan={selectedPlanForCheckout}
          isYearly={landingYearly}
          currency={currency}
          isOpen={!!selectedPlanForCheckout}
          onClose={() => setSelectedPlanForCheckout(null)}
        />
      )}
    </div>
  );
}
