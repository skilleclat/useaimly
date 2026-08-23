"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { PlanTier, PRICING_PLANS } from "@/lib/types/pricing";
import { PayPalCheckoutModal } from "@/components/finance/PayPalCheckoutModal";
import {
  Lock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface PlanUpgradeGateProps {
  requiredTier: "pro" | "premium";
  featureTitle: string;
  featureTitleFr: string;
  featureDescription: string;
  featureDescriptionFr: string;
  benefits?: string[];
  benefitsFr?: string[];
}

export function PlanUpgradeGate({
  requiredTier,
  featureTitle,
  featureTitleFr,
  featureDescription,
  featureDescriptionFr,
  benefits,
  benefitsFr,
}: PlanUpgradeGateProps) {
  const { profile } = useAuth();
  const { format } = useCurrency();
  const { language } = useI18n();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const plan = PRICING_PLANS.find((p) => p.id === requiredTier) || PRICING_PLANS[1];
  const priceUSD = format(plan.priceMonthlyUSD, { fromCurrency: "USD", showDecimals: true });

  const defaultBenefits =
    requiredTier === "premium"
      ? [
          "Conseiller Financier IA Interactif & Déterministe (Gemini / GPT-4)",
          "Laboratoire Sandbox de Scénarios 'Et Si ?' Illimités",
          "Gestion Multi-Objectifs et Stratégies d'Élimination des Dettes",
          "Support VIP Prioritaire 24/7",
        ]
      : [
          "Objectifs et Destinations Financières Illimités",
          "Studio Décisionnel 3-Stratégies (Comptant, Échelonner, Reporter)",
          "Moteur de 6 Règles d'Alertes et Prévisions Proactives (Foresight 60 jours)",
          "Bloc-Notes Stratégique IA & Export de Données (CSV/Rapports)",
        ];

  const defaultBenefitsEn =
    requiredTier === "premium"
      ? [
          "Interactive AI Financial Advisor & Deterministic Chat (Gemini / GPT-4)",
          "Unlimited 'What-If' Scenario Simulation Sandbox",
          "Custom Debt Elimination Strategies & Multi-Currency Aggregation",
          "24/7 VIP Priority Support",
        ]
      : [
          "Unlimited Financial Destinations & Goal Tracking",
          "3-Strategy Decision Studio (Cash, 3-Month Spread, Postpone)",
          "6 Proactive Foresight Insight Alert Rules",
          "AI Financial Notepad & Data Export (CSV & Custom Reports)",
        ];

  const activeBenefits =
    language === "fr"
      ? benefitsFr || defaultBenefits
      : benefits || defaultBenefitsEn;

  return (
    <>
      <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-card via-card to-primary/5 p-6 sm:p-10 text-center space-y-6 shadow-xl max-w-2xl mx-auto animate-fadeIn">
        {/* Lock & Glow Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
          <Lock className="w-8 h-8" />
        </div>

        {/* Feature Lock Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {language === "fr"
                ? `Fonctionnalité Réservée aux Membres ${plan.name}`
                : `Exclusive Feature for ${plan.name} Members`}
            </span>
          </div>

          <h3 className="text-xl sm:text-3xl font-bold font-editorial text-foreground tracking-tight">
            {language === "fr" ? featureTitleFr : featureTitle}
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {language === "fr" ? featureDescriptionFr : featureDescription}
          </p>
        </div>

        {/* Plan Pricing Pill */}
        <div className="p-4 rounded-2xl border border-border/80 bg-secondary/30 max-w-md mx-auto flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-foreground">Formule {plan.name} :</span>
          <span className="text-lg font-black text-primary">
            {priceUSD} <span className="text-xs text-muted-foreground font-normal">/ mois</span>
          </span>
        </div>

        {/* Included Benefits List */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 text-left space-y-2.5 max-w-md mx-auto text-xs text-muted-foreground">
          <span className="text-[10px] font-mono uppercase font-bold text-foreground block tracking-wider">
            {language === "fr" ? "Inclus dans cette formule :" : "Included in this plan:"}
          </span>
          {activeBenefits.map((b, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-foreground/90 font-medium">{b}</span>
            </div>
          ))}
        </div>

        {/* CTA Upgrade Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 px-8 py-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>
              {language === "fr"
                ? `Débloquer avec ${plan.name} (${priceUSD}) →`
                : `Unlock with ${plan.name} (${priceUSD}) →`}
            </span>
          </button>

          <Link
            href="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-6 py-4 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{language === "fr" ? "Comparer tous les forfaits" : "Compare all plans"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-muted-foreground pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>
            {language === "fr"
              ? "Activation immédiate • Annulable à tout moment"
              : "Instant Activation • Cancel Anytime"}
          </span>
        </div>
      </div>

      {/* Checkout Modal Trigger */}
      {isCheckoutOpen && (
        <PayPalCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          plan={plan}
          isYearly={false}
          onSuccess={() => setIsCheckoutOpen(false)}
        />
      )}
    </>
  );
}
