"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PRICING_PLANS } from "@/lib/types/pricing";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  CreditCard,
  Sparkles,
  ArrowLeft,
  Zap,
  Globe,
} from "lucide-react";
import { PayPalCheckoutModal } from "@/components/finance/PayPalCheckoutModal";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const rawPlan = searchParams.get("plan");
  const planId = rawPlan === "premium" ? "premium" : "pro";
  const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[1];

  const [isYearly, setIsYearly] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currency, format } = useCurrency();
  const { language } = useI18n();

  const baseUSD = isYearly ? plan.totalYearlyUSD : plan.priceMonthlyUSD;
  const formattedPrice = format(baseUSD, { fromCurrency: "USD", showDecimals: true });

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === "fr" ? "Retour aux tarifs" : "Back to pricing"}</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-500">
            <Lock className="w-3.5 h-3.5" />
            <span>{language === "fr" ? "Paiement Sécurisé SSL" : "256-Bit SSL Secure"}</span>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-mono font-bold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guichet de Souscription Officiel PayPal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-editorial tracking-tight text-foreground">
            Activer votre formule {plan.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Accédez immédiatement au moteur déterministe et au studio de décision prédictif.
          </p>
        </div>

        {/* Checkout Container */}
        <div className="rounded-[2.5rem] border border-border/80 bg-card p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Billing Cycle Selector */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-secondary/50 border border-border/60">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isYearly
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Facturation Mensuelle
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isYearly
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Facturation Annuelle</span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] px-2 py-0.5 font-extrabold uppercase">
                -20%
              </span>
            </button>
          </div>

          {/* Plan Summary Card */}
          <div className="rounded-3xl border border-border/80 bg-secondary/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span>{plan.name} Plan</span>
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {isYearly ? "Facturation Annuelle (-20% de réduction)" : "Facturation Mensuelle sans engagement"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black font-editorial text-foreground">
                  {formattedPrice}
                </div>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">
                  {isYearly ? "Facturé en 1 fois" : "Résiliable à tout moment"}
                </span>
              </div>
            </div>

            {/* Merchant Details */}
            <div className="pt-4 border-t border-border/60 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Accès Moteur Déterministe 10 Ans</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Studio 3-Stratégies & Alertes IA Proactives</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between pt-2 text-foreground font-bold text-xs">
                <span>Compte Bénéficiaire PayPal :</span>
                <span className="text-primary font-mono font-extrabold">herimaliyabwana@gmail.com</span>
              </div>
            </div>
          </div>

          {/* PayPal Payment Buttons */}
          <div className="space-y-4 pt-2">
            <label className="text-xs font-mono font-bold uppercase text-muted-foreground block text-center">
              Paiement Sécurisé via PayPal
            </label>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full rounded-2xl bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-black text-sm py-4 px-6 shadow-lg shadow-yellow-500/20 transition-all cursor-pointer flex items-center justify-center gap-3 group min-h-[52px]"
            >
              <span className="italic font-serif font-black text-2xl text-[#003087]">PayPal</span>
              <span className="font-extrabold text-sm text-[#003087]">
                Payer {plan.name} avec PayPal ({formattedPrice})
              </span>
              <ArrowRight className="w-4 h-4 text-[#003087] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full rounded-2xl bg-[#2C2E2F] hover:bg-[#202223] text-white font-bold text-xs py-4 px-6 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border border-zinc-700 min-h-[48px]"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Payer par Carte de Débit ou Crédit via PayPal</span>
            </button>
          </div>

          {/* Guarantee Footnote */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground pt-4 border-t border-border/60">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Garantie de Remboursement 14 Jours • Transaction Sécurisée PayPal</span>
          </div>
        </div>
      </div>

      {/* Embedded PayPal Modal */}
      <PayPalCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={plan}
        isYearly={isYearly}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-mono text-muted-foreground">Chargement du guichet PayPal...</div>}>
      <CheckoutContent />
    </React.Suspense>
  );
}
