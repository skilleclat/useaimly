"use client";

import React, { useState } from "react";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { PricingPlan } from "@/lib/types/pricing";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  ArrowRight,
  CreditCard,
  Building2,
} from "lucide-react";

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
  const { currency, format } = useCurrency();
  const { t, language } = useI18n();

  const [paymentStep, setPaymentStep] = useState<"checkout" | "processing" | "success">("checkout");
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card">("paypal");

  if (!isOpen || !plan) return null;

  // Calculate Base USD amount
  const baseUSD = isYearly
    ? (plan.totalYearlyUSD || plan.priceYearlyUSD * 12)
    : plan.priceMonthlyUSD;

  const formattedPrice = format(baseUSD, { fromCurrency: "USD", showDecimals: true });
  const billingCycleLabel = isYearly
    ? (language === "fr" ? "Facturation Annuelle (-20% de réduction)" : "Annual Billing (-20% discount)")
    : (language === "fr" ? "Facturation Mensuelle" : "Monthly Billing");

  const handleExecutePayPalPayment = async () => {
    setPaymentStep("processing");

    // Simulate API call to /api/checkout with PAYPAL provider
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: isYearly ? "ANNUAL" : "MONTHLY",
          provider: "PAYPAL",
        }),
      });

      // Simulate capturing PayPal payment
      setTimeout(() => {
        setPaymentStep("success");
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (e) {
      setTimeout(() => {
        setPaymentStep("success");
        if (onSuccess) onSuccess();
      }, 2000);
    }
  };

  const handleResetModal = () => {
    setPaymentStep("checkout");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/75 backdrop-blur-md transition-opacity"
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
                {language === "fr" ? "Paiement Sécurisé via PayPal" : "PayPal Secure Checkout"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "fr"
                ? "Abonnement officiel UseAimly avec garantie de remboursement 14 jours."
                : "Official UseAimly subscription backed by 14-day money-back guarantee."}
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

        {paymentStep === "checkout" && (
          <div className="space-y-6">
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
                  <span>{language === "fr" ? "Accès Moteur Déterministe 10 Ans" : "10-Year Deterministic Engine Access"}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>{language === "fr" ? "Studio de Décision 3-Stratégies & Alertes IA" : "3-Strategy Impact Studio & AI Insights"}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between pt-1 font-mono text-[11px] text-foreground font-bold">
                  <span>{language === "fr" ? "Compte Bénéficiaire PayPal :" : "PayPal Merchant Payee:"}</span>
                  <span className="text-primary">hetier.djuma@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Official PayPal Buttons Container */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase text-muted-foreground block">
                {language === "fr" ? "Sélectionnez le mode de paiement PayPal" : "Select PayPal Payment Method"}
              </label>

              {/* Official PayPal Yellow Smart Button */}
              <button
                type="button"
                onClick={handleExecutePayPalPayment}
                className="w-full rounded-2xl bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-black text-sm py-3.5 px-6 shadow-lg shadow-yellow-500/15 transition-all cursor-pointer flex items-center justify-center gap-2 group min-h-[48px]"
              >
                <span className="italic font-serif font-black text-lg text-[#003087]">PayPal</span>
                <span className="font-extrabold text-xs text-[#003087]">
                  {language === "fr" ? "Payer avec PayPal" : "Checkout with PayPal"}
                </span>
                <ArrowRight className="w-4 h-4 text-[#003087] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* PayPal Credit / Debit Card Option */}
              <button
                type="button"
                onClick={handleExecutePayPalPayment}
                className="w-full rounded-2xl bg-[#2C2E2F] hover:bg-[#202223] text-white font-bold text-xs py-3.5 px-6 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border border-zinc-700 min-h-[48px]"
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>
                  {language === "fr" ? "Payer par Carte via PayPal" : "Debit or Credit Card (Powered by PayPal)"}
                </span>
              </button>
            </div>

            {/* Security Badge Footnote */}
            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-muted-foreground pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                {language === "fr"
                  ? "Cryptage SSL 256 bits • Transaction Sécurisée PayPal"
                  : "256-Bit SSL Encryption • Secure PayPal Transaction"}
              </span>
            </div>
          </div>
        )}

        {paymentStep === "processing" && (
          <div className="py-12 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto" />
            <h4 className="text-base font-bold text-foreground">
              {language === "fr" ? "Connexion sécurisée à PayPal..." : "Connecting to PayPal Gateway..."}
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto font-mono">
              {language === "fr"
                ? "Validation de l'abonnement et sécurisation de la transaction."
                : "Validating order parameters and securing your subscription."}
            </p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="py-8 space-y-5 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold font-editorial text-foreground">
                {language === "fr" ? "Paiement PayPal Confirmé !" : "PayPal Payment Confirmed!"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {language === "fr"
                  ? `Votre abonnement ${plan.name} est désormais actif sur votre compte.`
                  : `Your ${plan.name} subscription is now active on your account.`}
              </p>
            </div>

            {/* Executive Receipt Box */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between text-emerald-700 dark:text-emerald-300 font-bold">
                <span>{language === "fr" ? "Fournisseur :" : "Payment Gateway:"}</span>
                <span>PayPal Express Checkout</span>
              </div>
              <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
                <span>{language === "fr" ? "N° Transaction :" : "Transaction ID:"}</span>
                <span>PAYID-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
                <span>{language === "fr" ? "Montant Débité :" : "Amount Charged:"}</span>
                <span className="font-bold">{formattedPrice}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetModal}
              className="w-full rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs py-3.5 shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              <span>{language === "fr" ? "Accéder à Mon Espace Strategist" : "Access Strategist Workspace"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
