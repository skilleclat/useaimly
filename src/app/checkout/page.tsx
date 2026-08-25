"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PRICING_PLANS } from "@/lib/types/pricing";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAuth } from "@/lib/auth/auth-context";
import { MPESA_CONFIG } from "@/lib/payments/mpesa-service";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Zap,
  Smartphone,
  Copy,
  Check,
  CreditCard,
  Loader2,
} from "lucide-react";
import { PayPalCheckoutModal } from "@/components/finance/PayPalCheckoutModal";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = PRICING_PLANS.find((p) => p.id === "pro") || PRICING_PLANS[1];

  const [isYearly, setIsYearly] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { user } = useAuth();
  const { format } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";

  const baseUSD = isYearly ? 39.00 : 4.99;
  const amountKES = isYearly ? 5000 : 650;

  const formattedPriceUSD = typeof format === "function" ? format(baseUSD, { fromCurrency: "USD", showDecimals: true }) : `$${baseUSD.toFixed(2)}`;
  const formattedPriceKES = `KES ${amountKES.toLocaleString()}`;

  const handleCopy = (text: string, fieldKey: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleStripeCheckout = async () => {
    setIsStripeLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "pro",
          billingCycle: isYearly ? "ANNUAL" : "MONTHLY",
          provider: "STRIPE",
          customerEmail: user?.email,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Failed to initialize Stripe checkout");
        setIsStripeLoading(false);
      }
    } catch (err: any) {
      console.error("Stripe checkout initiation error:", err);
      setIsStripeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-left">
      <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isFr ? "Retour aux tarifs" : "Back to pricing"}</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            <span>{isFr ? "Paiement Sécurisé SSL" : "256-Bit SSL Secure"}</span>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-mono font-bold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFr ? "Guichet de Souscription Sécurisé" : "Secure Checkout Gate"}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            {isFr ? "Activer UseAimly Pro" : "Activate UseAimly Pro"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto font-medium">
            {isFr
              ? "Accédez immédiatement au moteur déterministe complet et aux simulations illimitées."
              : "Unlock continuous access to the personalized decision engine with unlimited analyses."}
          </p>
        </div>

        {/* Checkout Container */}
        <div className="rounded-[2.5rem] border border-border/80 bg-card p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Billing Cycle Selector */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-secondary/50 border border-border/60">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isYearly
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isFr ? "Facturation Mensuelle ($4.99/m)" : "Monthly ($4.99/mo)"}
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isYearly
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{isFr ? "Facturation Annuelle ($39/an)" : "Annual ($39/yr)"}</span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 font-black uppercase">
                {isFr ? "-35% ÉCONOMIE" : "SAVE 35%"}
              </span>
            </button>
          </div>

          {/* Plan Summary Card */}
          <div className="rounded-3xl border border-border/80 bg-secondary/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span>UseAimly Pro</span>
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {isYearly
                    ? (isFr ? "Facturation Annuelle (3.25 $/mois équiv.)" : "Annual Billing ($3.25/mo equiv.)")
                    : (isFr ? "Facturation Mensuelle sans engagement" : "Monthly Billing, cancel anytime")}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-foreground font-mono">
                  {formattedPriceUSD}
                </div>
                <span className="text-[11px] font-mono text-muted-foreground block">
                  ≈ {formattedPriceKES}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {isYearly ? (isFr ? "Facturé en 1 fois ($39)" : "Billed once annually ($39)") : (isFr ? "Résiliable à tout moment" : "Cancel anytime")}
                </span>
              </div>
            </div>

            {/* Inclusions */}
            <div className="pt-4 border-t border-border/60 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{isFr ? "Analyses de décisions illimitées" : "Unlimited Decision Analyses"}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{isFr ? "Objectifs financiers illimités" : "Unlimited Financial Goals & Destinations"}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{isFr ? "Studio 3-stratégies & alternatives calculées" : "3-Strategy Studio & Calculated Alternatives"}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{isFr ? "Analyse de risque d'urgence & trajectoires" : "Emergency Risk Analysis & Trajectories"}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Payment Actions */}
          <div className="space-y-4 pt-2">
            <label className="text-xs font-mono font-bold uppercase text-muted-foreground block text-center">
              {isFr ? "Choisissez votre méthode de paiement" : "Choose your payment method"}
            </label>

            {/* 1. Official Stripe Card Checkout Button (Primary) */}
            <button
              type="button"
              disabled={isStripeLoading}
              onClick={handleStripeCheckout}
              className="w-full rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] hover:opacity-95 text-white font-extrabold text-sm py-4 px-6 shadow-xl shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-3 group min-h-[52px] disabled:opacity-50"
            >
              {isStripeLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
              <span>
                {isStripeLoading
                  ? (isFr ? "Connexion sécurisée à Stripe..." : "Connecting to Stripe...")
                  : (isFr ? `Payer par Carte Bancaire / Stripe (${formattedPriceUSD})` : `Pay with Card via Stripe (${formattedPriceUSD})`)}
              </span>
              {!isStripeLoading && (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 2. Official PayPal Checkout Button */}
              <a
                href={`https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(
                  "herimaliyabwana@gmail.com"
                )}&item_name=${encodeURIComponent(`UseAimly Pro (${isYearly ? "Annual" : "Monthly"})`)}&amount=${baseUSD.toFixed(2)}&currency_code=USD`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsModalOpen(true)}
                className="w-full rounded-2xl bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-black text-xs py-3 px-4 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 group min-h-[44px] text-center"
              >
                <span className="italic font-serif font-black text-base text-[#003087]">PayPal</span>
                <span className="font-extrabold text-xs text-[#003087]">
                  {isFr ? `PayPal (${formattedPriceUSD})` : `PayPal (${formattedPriceUSD})`}
                </span>
              </a>

              {/* 3. M-Pesa Paybill / Validation Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 px-4 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 group min-h-[44px]"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isFr ? `M-Pesa (${formattedPriceKES})` : `M-Pesa (${formattedPriceKES})`}</span>
              </button>
            </div>
          </div>

          {/* Guarantee Footnote */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground pt-4 border-t border-border/60">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{isFr ? "Garantie Tranquillité & Clarté Totale • Stripe, M-Pesa & PayPal Sécurisés" : "14-Day Money-Back Guarantee • SSL 256-Bit Encrypted"}</span>
          </div>
        </div>
      </div>

      {/* Embedded Checkout / Subscription Modal */}
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
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-mono text-muted-foreground">Loading checkout...</div>}>
      <CheckoutContent />
    </React.Suspense>
  );
}
