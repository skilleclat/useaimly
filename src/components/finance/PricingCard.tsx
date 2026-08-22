"use client";

import React from "react";
import Link from "next/link";
import { PricingPlan } from "@/lib/types/pricing";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { CurrencyCode } from "@/lib/types/finance";
import { Check, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";

interface PricingCardProps {
  plan: PricingPlan;
  isYearly: boolean;
  currency?: CurrencyCode;
  currentPlanId?: string;
  onSelectPlan?: (planId: string) => void;
}

export function PricingCard({
  plan,
  isYearly,
  currency: propCurrency,
  currentPlanId,
  onSelectPlan,
}: PricingCardProps) {
  const { currency: globalCurrency, format, convert } = useCurrency();
  const { t, language } = useI18n();

  const activeCurrency = propCurrency || globalCurrency;

  // Determine base USD amount for monthly vs yearly
  const basePriceUSD = isYearly
    ? (plan.totalYearlyUSD || plan.priceYearlyUSD * 12)
    : plan.priceMonthlyUSD;

  const shouldShowDecimals = activeCurrency === "USD" || activeCurrency === "EUR" || activeCurrency === "GBP" || activeCurrency === "CAD";

  // Format main display price
  const formattedPrice = basePriceUSD === 0
    ? t("freePriceLabel")
    : format(basePriceUSD, { fromCurrency: "USD", showDecimals: shouldShowDecimals });

  // Monthly equivalent for annual billing
  const monthlyEquivUSD = isYearly ? (plan.priceYearlyUSD) : plan.priceMonthlyUSD;
  const formattedMonthlyEquiv = format(monthlyEquivUSD, { fromCurrency: "USD", showDecimals: shouldShowDecimals });

  const isCurrentPlan = currentPlanId === plan.id;
  const periodLabel = isYearly ? t("perYear") : t("perMonth");

  // Localized Taglines & Badges
  const planTagline = language === "fr"
    ? (plan.id === "free" ? t("planFreeTagline") : plan.id === "pro" ? t("planProTagline") : t("planPremiumTagline"))
    : plan.tagline;

  const planBadge = plan.badge
    ? (language === "fr"
        ? (plan.id === "pro" ? t("planProBadge") : t("planPremiumBadge"))
        : plan.badge)
    : undefined;

  const ctaText = language === "fr"
    ? (plan.id === "free" ? t("planFreeCta") : plan.id === "pro" ? t("planProCta") : t("planPremiumCta"))
    : plan.ctaText;

  // Localized features in French when language === "fr"
  const localizedFeatures = plan.features.map((feat, idx) => {
    if (language !== "fr") return feat;
    // Map feature text to French
    const frMap: Record<string, string> = {
      "1 Primary Financial Destination": "1 Destination Financière Principale",
      "Monthly Cashflow & Free Balance Calculator": "Calculateur de Cash-Flow & Solde Libre Mensuel",
      "Basic Purchase Decision Simulation": "Simulation de Décision d'Achat de Base",
      "Interactive Sandbox & Demo Data Mode": "Mode Bac à Sable Interactif & Données Démo",
      "3-Strategy Decision Impact Studio (Spread, Postpone)": "Studio Décisionnel 3-Stratégies (Échelonner, Reporter)",
      "6 Proactive Insight Alert Rules": "6 Règles d'Alerte & Prévisions Proactives",
      "Dedicated AI Financial Advisor (Gemini / GPT-4)": "Conseiller Financier IA Dédié (Gemini / GPT-4)",
      "Unlimited 'What-If' Scenario Laboratory": "Laboratoire de Scénarios 'Et si ?' Illimité",
      "Financial Data Export (CSV & PDF)": "Exportation des Données Financières (CSV & PDF)",
      "Unlimited Financial Destinations": "Destinations Financières Illimitées",
      "3-Strategy Impact Studio (Cash, Spread, Postpone)": "Studio Décisionnel 3-Stratégies (Comptant, Échelonner, Reporter)",
      "6 Proactive Insight Rules (60-Day Foresight)": "6 Règles Proactives (Anticipation à 60 jours)",
      "AI Financial Notepad & Strategic Context Sync": "Bloc-Notes IA & Synchronisation de Contexte",
      "Full 6 Financial Cash Flow Management": "Gestion Complète des 6 Flux Financiers",
      "Data Export (CSV & Custom Reports)": "Exportation des Données (CSV & Rapports Sur Mesure)",
      "Priority Email Support": "Support Email Prioritaire",
      "Everything included in Aimly Pro": "Tout ce qui est inclus dans Aimly Pro",
      "Interactive AI Financial Advisor (Gemini / GPT-4)": "Conseiller IA Financier Interactif (Gemini / GPT-4)",
      "AI Financial Notepad & Unlimited Rules Engine": "Bloc-Notes IA & Moteur de Règles Illimité",
      "Custom Debt Elimination Strategies": "Stratégies Sur Mesure d'Élimination des Dettes",
      "Multi-Account & Currency Aggregation": "Agrégation Multi-Comptes & Multi-Devises",
      "1-on-1 VIP Strategy Orientation Session": "Session Individuelle de Stratégie VIP 1-sur-1",
      "24/7 Priority WhatsApp & Email Support": "Support Prioritaire 24/7 WhatsApp & Email",
    };
    return {
      ...feat,
      text: frMap[feat.text] || feat.text,
    };
  });

  return (
    <div
      className={`relative flex flex-col justify-between rounded-[2.5rem] p-6 sm:p-8 transition-all duration-300 ${
        plan.isPopular
          ? "border-2 border-primary bg-gradient-to-b from-primary/10 via-card to-card shadow-2xl shadow-primary/10 scale-102 z-10"
          : "border border-border/80 bg-card hover:border-primary/40 hover:shadow-xl"
      }`}
    >
      {/* Popular Badge */}
      {planBadge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-orange-500 px-4 py-1 text-[11px] font-bold tracking-wider text-primary-foreground uppercase shadow-md">
          <Sparkles className="w-3 h-3" />
          <span>{planBadge}</span>
        </div>
      )}

      {/* Plan Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-foreground tracking-tight">{plan.name}</h3>
          {plan.id === "pro" && <Zap className="w-5 h-5 text-primary" />}
          {plan.id === "premium" && <Shield className="w-5 h-5 text-amber-500" />}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px]">
          {planTagline}
        </p>

        {/* Pricing Display */}
        <div className="pt-2 pb-4 border-b border-border/60">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-foreground font-editorial">
              {formattedPrice}
            </span>
            {basePriceUSD > 0 && (
              <span className="text-xs font-mono font-bold text-muted-foreground">{periodLabel}</span>
            )}
          </div>
          {isYearly && basePriceUSD > 0 && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {t("billedAnnuallyEquiv").replace("{price}", formattedMonthlyEquiv)}
            </p>
          )}
        </div>

        {/* Feature List */}
        <div className="space-y-3 pt-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            {t("includedFeatures")}
          </span>
          <ul className="space-y-2.5">
            {localizedFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs">
                <div
                  className={`mt-0.5 rounded-full p-0.5 shrink-0 ${
                    feat.included
                      ? feat.highlight
                        ? "bg-primary text-primary-foreground"
                        : "bg-emerald-500/15 text-emerald-500"
                      : "bg-muted text-muted-foreground opacity-40"
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
                <span
                  className={`${
                    feat.included
                      ? feat.highlight
                        ? "font-bold text-foreground"
                        : "text-foreground/90"
                      : "text-muted-foreground line-through opacity-60"
                  }`}
                >
                  {feat.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-8">
        {isCurrentPlan ? (
          <div className="w-full rounded-2xl bg-secondary py-3 text-center text-xs font-bold text-muted-foreground border border-border">
            {t("currentPlanLabel")}
          </div>
        ) : onSelectPlan ? (
          <button
            onClick={() => onSelectPlan(plan.id)}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-extrabold shadow-md transition-all ${
              plan.isPopular
                ? "bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white hover:opacity-95 shadow-orange-500/20 hover:scale-[1.02]"
                : "bg-primary text-primary-foreground hover:opacity-95"
            }`}
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            href={plan.ctaHref}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-extrabold shadow-md transition-all ${
              plan.isPopular
                ? "bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white hover:opacity-95 shadow-orange-500/20 hover:scale-[1.02]"
                : "bg-primary text-primary-foreground hover:opacity-95"
            }`}
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

