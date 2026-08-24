"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { PRICING_PLANS } from "@/lib/types/pricing";
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
  requiredTier?: "pro";
  featureTitle?: string;
  featureTitleFr?: string;
  featureDescription?: string;
  featureDescriptionFr?: string;
  benefits?: string[];
  benefitsFr?: string[];
}

export function PlanUpgradeGate({
  requiredTier = "pro",
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
  const isFr = language === "fr";
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(true);

  const plan = PRICING_PLANS.find((p) => p.id === "pro") || PRICING_PLANS[1];

  const defaultBenefits = [
    "Analyses de décisions illimitées",
    "Objectifs financiers et destinations illimités",
    "Comparaison de scénarios avancés (Comptant vs Échelonné vs Attente)",
    "Analyse de risque d'urgence et mémoire des décisions",
  ];

  const defaultBenefitsEn = [
    "Unlimited Decision Analyses",
    "Unlimited Financial Goals & Destinations",
    "Compare Multiple Options Side-by-Side",
    "Emergency Risk Analysis & Complete Decision History",
  ];

  const activeBenefits = isFr ? benefitsFr || defaultBenefits : benefits || defaultBenefitsEn;

  return (
    <>
      <div className="rounded-3xl border border-primary/40 bg-card p-6 sm:p-10 text-center space-y-6 shadow-2xl max-w-xl mx-auto animate-fadeIn text-left">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
            <Zap className="w-3.5 h-3.5" />
            <span>UseAimly Pro</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                !isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              $4.99/mo
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              $39/yr (-35%)
            </button>
          </div>
        </div>

        {/* Upgrade Message */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            {isFr ? "Vous avez vu ce qu'une décision peut changer." : "You've seen what one decision can change."}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
            {isFr
              ? "Continuez à voir les conséquences avant de vous engager."
              : "Keep seeing the consequences before you commit."}
          </h3>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            {isFr
              ? (featureDescriptionFr || "Débloquez des simulations illimitées, la comparaison de scénarios multi-options et la protection de tous vos objectifs.")
              : (featureDescription || "Unlock unlimited decisions, multi-option scenario comparisons, and continuous trajectory protection.")}
          </p>
        </div>

        {/* Benefits List */}
        <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4 space-y-2 text-xs">
          {activeBenefits.map((b, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-foreground font-medium">{b}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] py-4 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>{isFr ? "Continuer avec UseAimly Pro" : "Continue with UseAimly Pro"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isFr ? "Activation instantanée • Annulable à tout moment" : "Instant Activation • Cancel Anytime"}</span>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <PayPalCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          plan={plan}
          isYearly={isYearly}
          onSuccess={() => setIsCheckoutOpen(false)}
        />
      )}
    </>
  );
}
