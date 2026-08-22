"use client";

import React, { useState } from "react";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { PricingPlan } from "@/lib/types/pricing";
import { useAuth } from "@/lib/auth/auth-context";
import { upgradePlanAction } from "@/lib/auth/actions";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  ArrowRight,
  CreditCard,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PricingPlan | null;
  isYearly: boolean;
  onSuccess?: () => void;
}

export function PayPalCheckoutModal({
  isOpen,
  onClose,
  plan,
  isYearly,
  onSuccess,
}: PayPalCheckoutModalProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { currency, format } = useCurrency();
  const { t, language } = useI18n();

  const [modalState, setModalState] = useState<"checkout" | "redirected" | "trial_activating" | "trial_success">("checkout");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !plan) return null;

  const isLoggedIn = Boolean(user || (profile && profile.id !== "demo-user-id"));

  // Calculate Base USD amount
  const baseUSD = isYearly
    ? (plan.totalYearlyUSD || plan.priceYearlyUSD * 12)
    : plan.priceMonthlyUSD;

  const formattedPrice = format(baseUSD, { fromCurrency: "USD", showDecimals: true });
  const billingCycleLabel = isYearly
    ? (language === "fr" ? "Facturation Annuelle (-20% de réduction)" : "Annual Billing (-20% discount)")
    : (language === "fr" ? "Facturation Mensuelle" : "Monthly Billing");

  const merchantEmail = "herimaliyabwana@gmail.com";

  // Real PayPal Checkout Link Builder
  const getPayPalCheckoutUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://useaimly.com";
    const itemName = encodeURIComponent(`UseAimly ${plan.name} (${isYearly ? "Annual" : "Monthly"})`);
    const returnUrl = encodeURIComponent(`${origin}/app/settings?payment_success=true&plan=${plan.id}`);
    const cancelUrl = encodeURIComponent(`${origin}/pricing`);

    return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(
      merchantEmail
    )}&item_name=${itemName}&amount=${baseUSD.toFixed(2)}&currency_code=USD&return=${returnUrl}&cancel_return=${cancelUrl}`;
  };

  const handleOpenPayPal = () => {
    const payPalUrl = getPayPalCheckoutUrl();
    window.open(payPalUrl, "_blank", "noopener,noreferrer");
    setModalState("redirected");
  };

  const handleActivateTrial = async () => {
    if (!isLoggedIn) {
      onClose();
      router.push(`/signup?plan=${plan.id}&billing=${isYearly ? "annual" : "monthly"}`);
      return;
    }

    setModalState("trial_activating");
    setErrorMessage(null);

    try {
      const res = await upgradePlanAction(plan.id);
      if (res.success) {
        setModalState("trial_success");
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message || "Failed to activate subscription trial.");
        setModalState("checkout");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
      setModalState("checkout");
    }
  };

  const handleResetModal = () => {
    setModalState("checkout");
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md transition-opacity"
        onClick={handleResetModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl z-10 space-y-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Lock className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold font-editorial text-foreground tracking-tight">
                {language === "fr" ? "Souscription Sécurisée UseAimly" : "Secure UseAimly Subscription"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "fr"
                ? "Formule officielle UseAimly avec garantie de remboursement 14 jours."
                : "Official UseAimly plan backed by 14-day money-back guarantee."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetModal}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: CHECKOUT OPTIONS */}
        {modalState === "checkout" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Order Summary Box */}
            <div className="rounded-2xl border border-border/80 bg-secondary/30 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-foreground">
                    {plan.name} Plan
                  </h4>
                  <span className="text-[11px] font-mono text-muted-foreground block">
                    {billingCycleLabel}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-editorial text-foreground">
                    {formattedPrice}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {isYearly ? (language === "fr" ? "Économie de 20%" : "20% Saved") : (language === "fr" ? "Sans engagement" : "Cancel anytime")}
                  </span>
                </div>
              </div>

              {/* Order Items Check */}
              <div className="pt-3 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>{language === "fr" ? "Accès Moteur Déterministe & Trajectoires" : "10-Year Deterministic Engine Access"}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>{language === "fr" ? "Studio de Décision 3-Stratégies & Alertes IA" : "3-Strategy Impact Studio & AI Insights"}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between pt-1 font-mono text-[11px] text-foreground font-bold">
                  <span>{language === "fr" ? "Compte Bénéficiaire PayPal :" : "PayPal Merchant Payee:"}</span>
                  <span className="text-primary">{merchantEmail}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* 1. Official PayPal Checkout Button */}
              <button
                type="button"
                onClick={handleOpenPayPal}
                className="w-full rounded-2xl bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-black text-sm py-3.5 px-6 shadow-lg shadow-yellow-500/15 transition-all cursor-pointer flex items-center justify-center gap-2 group min-h-[48px]"
              >
                <span className="italic font-serif font-black text-lg text-[#003087]">PayPal</span>
                <span className="font-extrabold text-xs text-[#003087]">
                  {language === "fr" ? `Payer avec PayPal (${formattedPrice})` : `Checkout with PayPal (${formattedPrice})`}
                </span>
                <ExternalLink className="w-4 h-4 text-[#003087] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 2. Instant 14-Day Free Trial Option (Zero upfront debit) */}
              <button
                type="button"
                onClick={handleActivateTrial}
                className="w-full rounded-2xl bg-primary text-primary-foreground font-bold text-xs py-3.5 px-6 shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {language === "fr"
                    ? "Démarrer l'Essai Gratuit 14 Jours (Sans prélèvement immédiat)"
                    : "Start 14-Day Free Trial (Zero Upfront Charge)"}
                </span>
              </button>
            </div>

            {/* Security Badge Footnote */}
            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-muted-foreground pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                {language === "fr"
                  ? "Paiement Officiel Sécurisé PayPal • Cryptage SSL 256 bits"
                  : "Official Secure PayPal Payment • 256-Bit SSL Encryption"}
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: REDIRECTED TO PAYPAL */}
        {modalState === "redirected" && (
          <div className="py-6 space-y-6 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto">
              <ExternalLink className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold font-editorial text-foreground">
                {language === "fr" ? "Page de paiement PayPal ouverte" : "PayPal Checkout Window Opened"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {language === "fr"
                  ? `Une page officielle sécurisée PayPal s'est ouverte dans un nouvel onglet pour finaliser votre règlement à ${merchantEmail}.`
                  : `An official secure PayPal window was opened to complete your payment to ${merchantEmail}.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 text-xs font-mono text-muted-foreground space-y-1 text-left">
              <div className="flex justify-between">
                <span>{language === "fr" ? "Formule :" : "Plan:"}</span>
                <span className="font-bold text-foreground">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === "fr" ? "Montant :" : "Amount:"}</span>
                <span className="font-bold text-foreground">{formattedPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === "fr" ? "Bénéficiaire :" : "Payee:"}</span>
                <span className="text-primary">{merchantEmail}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleOpenPayPal}
                className="w-full rounded-2xl bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-black text-xs py-3.5 px-6 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="italic font-serif font-black text-base text-[#003087]">PayPal</span>
                <span>{language === "fr" ? "Rouvrir la fenêtre PayPal" : "Re-open PayPal Window"}</span>
              </button>

              <button
                type="button"
                onClick={handleActivateTrial}
                className="w-full rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs py-3 px-6 transition-colors"
              >
                {language === "fr" ? "Activer l'accès Immédiat (Essai 14 Jours)" : "Activate Instant Access (14-Day Trial)"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRIAL ACTIVATING */}
        {modalState === "trial_activating" && (
          <div className="py-12 space-y-4 text-center">
            <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto" />
            <h4 className="text-base font-bold text-foreground">
              {language === "fr" ? "Activation de votre formule en cours..." : "Activating your subscription..."}
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto font-mono">
              {language === "fr"
                ? "Configuration de votre espace et déblocage des fonctionnalités."
                : "Setting up your workspace and unlocking features."}
            </p>
          </div>
        )}

        {/* STEP 4: TRIAL SUCCESS */}
        {modalState === "trial_success" && (
          <div className="py-6 space-y-5 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold font-editorial text-foreground">
                {language === "fr" ? `Formule ${plan.name} Activée !` : `${plan.name} Plan Activated!`}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {language === "fr"
                  ? `Votre période d'essai de 14 jours pour ${plan.name} est désormais active. Profitez de l'ensemble des fonctionnalités sans restriction.`
                  : `Your 14-day free trial for ${plan.name} is now active. Enjoy full features without restriction.`}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left space-y-1.5 text-xs font-mono text-emerald-700 dark:text-emerald-300">
              <div className="flex justify-between font-bold">
                <span>{language === "fr" ? "Statut de l'accès :" : "Access Status:"}</span>
                <span>{language === "fr" ? "ACTIF (Essai 14 Jours)" : "ACTIVE (14-Day Trial)"}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === "fr" ? "Prélèvement bancaire immédiat :" : "Immediate Debit:"}</span>
                <span>{language === "fr" ? "0,00 € (Aucun débit)" : "$0.00 (No Charge)"}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleResetModal();
                router.push("/app");
              }}
              className="w-full rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs py-3.5 shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{language === "fr" ? "Accéder à Mon Espace Strategist" : "Access Strategist Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

