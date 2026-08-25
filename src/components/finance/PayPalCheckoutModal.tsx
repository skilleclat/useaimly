"use client";

import React, { useState } from "react";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { PricingPlan } from "@/lib/types/pricing";
import { useAuth } from "@/lib/auth/auth-context";
import { submitMpesaPaymentAction, submitPayPalPaymentAction } from "@/lib/auth/actions";
import { MPESA_CONFIG } from "@/lib/payments/mpesa-service";
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
  Smartphone,
  Copy,
  Check,
  Loader2,
  Zap,
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
  const { user, profile, refreshProfile } = useAuth();
  const { currency, format } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";

  // Default to STRIPE as the primary payment method
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "MPESA" | "PAYPAL">("STRIPE");
  const [modalState, setModalState] = useState<"checkout" | "redirected" | "mpesa_verifying" | "success">("checkout");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [mpesaCode, setMpesaCode] = useState("");
  const [paypalTxId, setPaypalTxId] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !plan) return null;

  const isLoggedIn = Boolean(user || (profile && profile.id !== "demo-user-id"));

  // Calculate Base USD amount
  const baseUSD = isYearly
    ? (plan?.totalYearlyUSD || 39.00)
    : (plan?.priceMonthlyUSD || 4.99);

  // Calculate KES amount
  const amountKES = isYearly ? (MPESA_CONFIG?.proYearlyKES || 5000) : (MPESA_CONFIG?.proMonthlyKES || 650);

  const formattedPriceUSD = typeof format === "function" ? format(baseUSD, { fromCurrency: "USD", showDecimals: true }) : `$${Number(baseUSD || 0).toFixed(2)}`;
  const formattedPriceKES = `KES ${Number(amountKES || 0).toLocaleString()}`;

  const billingCycleLabel = isYearly
    ? (isFr ? "Facturation Annuelle (-35% d'économie)" : "Annual Billing (-35% Savings)")
    : (isFr ? "Facturation Mensuelle" : "Monthly Billing");

  const merchantEmail = "herimaliyabwana@gmail.com";

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const isSubmittingRef = React.useRef(false);

  // Primary Stripe Checkout Handler (Single-Flight Protected)
  const handleStripeCheckout = async () => {
    if (isSubmittingRef.current || isStripeLoading) {
      return;
    }

    isSubmittingRef.current = true;
    setIsStripeLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: isYearly ? "ANNUAL" : "MONTHLY",
          provider: "STRIPE",
          customerEmail: user?.email,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        setErrorMessage(data.error || (isFr ? "Échec de l'initialisation du paiement Stripe." : "Failed to initialize Stripe checkout"));
        setIsStripeLoading(false);
        isSubmittingRef.current = false;
      }
    } catch (err: any) {
      console.error("Stripe checkout error:", err);
      setErrorMessage(err?.message || (isFr ? "Erreur de connexion à Stripe." : "Error connecting to Stripe"));
      setIsStripeLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Real PayPal Checkout Link Builder
  const getPayPalCheckoutUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://useaimly.com";
    const planName = plan?.name || "Aimly Pro";
    const planId = plan?.id || "pro";
    const itemName = encodeURIComponent(`UseAimly ${planName} (${isYearly ? "Annual" : "Monthly"})`);
    const returnUrl = encodeURIComponent(`${origin}/app/settings?payment_success=true&plan=${planId}`);
    const cancelUrl = encodeURIComponent(`${origin}/pricing`);
    const safeAmount = Number(baseUSD || 5).toFixed(2);

    return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(
      merchantEmail
    )}&item_name=${itemName}&amount=${safeAmount}&currency_code=USD&return=${returnUrl}&cancel_return=${cancelUrl}`;
  };

  const handleVerifyPayPal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onClose();
      router.push(`/signup?plan=${plan.id}&billing=${isYearly ? "annual" : "monthly"}`);
      return;
    }

    const clean = paypalTxId.trim().toUpperCase();
    if (!clean || clean.length < 6) {
      setErrorMessage(
        isFr
          ? "Veuillez entrer un numéro de transaction ou reçu PayPal valide."
          : "Please enter a valid PayPal transaction ID or receipt reference."
      );
      return;
    }

    setModalState("mpesa_verifying");
    setErrorMessage(null);

    try {
      const res = await submitPayPalPaymentAction(clean, plan.id as any, isYearly, baseUSD);
      if (res.success) {
        setSuccessMessage(res.message || `Paiement PayPal (${clean}) validé ! Votre formule ${plan.name} est active.`);
        setModalState("success");
        await refreshProfile();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message || "Identifiant PayPal invalide ou déjà utilisé.");
        setModalState("redirected");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erreur de vérification du paiement PayPal.");
      setModalState("redirected");
    }
  };

  const handleVerifyMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onClose();
      router.push(`/signup?plan=${plan.id}&billing=${isYearly ? "annual" : "monthly"}`);
      return;
    }

    const clean = mpesaCode.trim().toUpperCase();
    if (!clean || clean.length < 8) {
      setErrorMessage(
        isFr
          ? "Veuillez entrer un code de transaction M-Pesa valide (ex: QJH789LK02)."
          : "Please enter a valid M-Pesa transaction code (e.g. QJH789LK02)."
      );
      return;
    }

    setModalState("mpesa_verifying");
    setErrorMessage(null);

    try {
      const res = await submitMpesaPaymentAction(clean, plan.id, isYearly, amountKES);
      if (res.success) {
        setSuccessMessage(res.message || `Paiement M-Pesa (${clean}) validé ! Votre formule ${plan.name} est active.`);
        setModalState("success");
        await refreshProfile();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message || "Code de transaction invalide.");
        setModalState("checkout");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erreur lors de la validation du paiement M-Pesa.");
      setModalState("checkout");
    }
  };

  const handleResetModal = () => {
    setModalState("checkout");
    setErrorMessage(null);
    setSuccessMessage(null);
    setMpesaCode("");
    setIsStripeLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md transition-opacity"
        onClick={handleResetModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl z-10 space-y-6 overflow-hidden max-h-[92vh] overflow-y-auto text-left">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Lock className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                {isFr ? "Souscription Sécurisée UseAimly Pro" : "Secure UseAimly Pro Checkout"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {isFr
                ? "Choisissez votre méthode de paiement (Carte Bancaire / Stripe, M-Pesa ou PayPal)."
                : "Choose your payment method (Card via Stripe, M-Pesa or PayPal)."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetModal}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Method Switcher Tabs */}
        {modalState === "checkout" && (
          <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl border border-border/80 bg-secondary/30">
            {/* 1. Stripe Card (Primary) */}
            <button
              type="button"
              onClick={() => setPaymentMethod("STRIPE")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === "STRIPE"
                  ? "bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white shadow-md shadow-orange-500/20 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isFr ? "Carte / Stripe" : "Card / Stripe"}</span>
            </button>

            {/* 2. Lipa na M-Pesa */}
            <button
              type="button"
              onClick={() => setPaymentMethod("MPESA")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === "MPESA"
                  ? "bg-emerald-600 text-white shadow-sm font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>M-Pesa</span>
            </button>

            {/* 3. PayPal */}
            <button
              type="button"
              onClick={() => setPaymentMethod("PAYPAL")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === "PAYPAL"
                  ? "bg-[#003087] text-white shadow-sm font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <span className="italic font-serif font-black text-xs">P</span>
              <span>PayPal</span>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: CHECKOUT OPTIONS */}
        {modalState === "checkout" && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. STRIPE CARD MODE (PRIMARY / DEFAULT) */}
            {paymentMethod === "STRIPE" && (
              <div className="space-y-5">
                {/* Order Summary Box */}
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-primary" />
                        <span>UseAimly {plan.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/20 text-primary font-bold uppercase">
                          Stripe
                        </span>
                      </h4>
                      <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                        {billingCycleLabel}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black font-editorial text-foreground">
                        {formattedPriceUSD}
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block">
                        {isYearly
                          ? (isFr ? "Facturé annuellement ($39)" : "Billed annually ($39)")
                          : (isFr ? "Sans engagement" : "Cancel anytime")}
                      </span>
                    </div>
                  </div>

                  {/* Included features list */}
                  <div className="pt-3 border-t border-primary/20 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>{isFr ? "Analyses de décisions illimitées" : "Unlimited Decision Analyses"}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{isFr ? "Studio 3-Stratégies & Trajectoires de Vie" : "3-Strategy Studio & Life Trajectories"}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{isFr ? "Synchronisation multi-appareils (Chrome, Brave, Mobile)" : "Cross-Device Sync (Chrome, Brave, Mobile)"}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Primary Action Button: Connect to Stripe Checkout */}
                <button
                  type="button"
                  disabled={isStripeLoading}
                  onClick={handleStripeCheckout}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] hover:opacity-95 text-white font-black text-sm py-4 px-6 shadow-xl shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2.5 group min-h-[50px] disabled:opacity-60"
                >
                  {isStripeLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                  <span>
                    {isStripeLoading
                      ? (isFr ? "Connexion sécurisée à Stripe..." : "Connecting to Stripe...")
                      : (isFr ? `Payer par Carte Bancaire via Stripe (${formattedPriceUSD})` : `Subscribe with Stripe (${formattedPriceUSD})`)}
                  </span>
                  {!isStripeLoading && (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              </div>
            )}

            {/* 2. M-PESA PAYBILL MODE */}
            {paymentMethod === "MPESA" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                        <span>{plan.name} Plan</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                          M-Pesa
                        </span>
                      </h4>
                      <span className="text-[11px] font-mono text-muted-foreground block">
                        {billingCycleLabel}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black font-editorial text-emerald-600 dark:text-emerald-400">
                        {formattedPriceKES}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground block">
                        ≈ {formattedPriceUSD}
                      </span>
                    </div>
                  </div>

                  {/* Paybill Reference Details (Copyable) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-emerald-500/20">
                    <div className="p-3 rounded-xl border border-border/80 bg-card/80 space-y-1">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">
                        Business No. (Paybill)
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-lg text-foreground tracking-wider">
                          {MPESA_CONFIG.businessNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(MPESA_CONFIG.businessNumber, "biz")}
                          className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-[10px] font-mono flex items-center gap-1"
                        >
                          {copiedField === "biz" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === "biz" ? "Copié" : "Copier"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-border/80 bg-card/80 space-y-1">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">
                        Account No.
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-lg text-foreground tracking-wider">
                          {MPESA_CONFIG.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(MPESA_CONFIG.accountNumber, "acc")}
                          className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-[10px] font-mono flex items-center gap-1"
                        >
                          {copiedField === "acc" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === "acc" ? "Copié" : "Copier"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleVerifyMpesa} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-foreground flex items-center justify-between">
                      <span>Code de confirmation SMS M-Pesa</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Ex: QJH789LK02</span>
                    </label>
                    <input
                      type="text"
                      value={mpesaCode}
                      onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                      placeholder="Ex: QJH789LK02"
                      required
                      className="w-full rounded-2xl border-2 border-emerald-500/40 bg-background px-4 py-3 text-sm font-mono font-bold text-foreground uppercase tracking-widest focus:border-emerald-500 focus:outline-none min-h-[46px]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-4 px-6 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider mon paiement M-Pesa &amp; Activer {plan.name}</span>
                  </button>
                </form>
              </div>
            )}

            {/* 3. PAYPAL MODE */}
            {paymentMethod === "PAYPAL" && (
              <div className="space-y-6">
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
                        {formattedPriceUSD}
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {isYearly ? (isFr ? "Économie de 35%" : "35% Saved") : (isFr ? "Sans engagement" : "Cancel anytime")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href={getPayPalCheckoutUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-2xl bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-black text-sm py-3.5 px-6 shadow-lg shadow-yellow-500/15 transition-all cursor-pointer flex items-center justify-center gap-2 group min-h-[48px] text-center"
                  >
                    <span className="italic font-serif font-black text-lg text-[#003087]">PayPal</span>
                    <span className="font-extrabold text-xs text-[#003087]">
                      {isFr ? `Payer avec PayPal (${formattedPriceUSD}) →` : `Checkout with PayPal (${formattedPriceUSD}) →`}
                    </span>
                    <ExternalLink className="w-4 h-4 text-[#003087] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </a>
                </div>

                <form onSubmit={handleVerifyPayPal} className="space-y-3 pt-2 border-t border-border/60">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-foreground flex items-center justify-between">
                      <span>Numéro de Transaction / Reçu PayPal</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Ex: 9XY12345Z</span>
                    </label>
                    <input
                      type="text"
                      value={paypalTxId}
                      onChange={(e) => setPaypalTxId(e.target.value.toUpperCase())}
                      placeholder="Ex: 9XY1234567 ou PAYID-XXXXX"
                      required
                      className="w-full rounded-2xl border-2 border-primary/40 bg-background px-4 py-3 text-sm font-mono font-bold text-foreground uppercase tracking-wider focus:border-primary focus:outline-none min-h-[46px]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-4 px-6 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider mon Reçu PayPal &amp; Activer {plan.name}</span>
                  </button>
                </form>
              </div>
            )}

            {/* Security Badge Footnote */}
            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-muted-foreground pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                {isFr
                  ? "Transaction Sécurisée SSL 256 bits • Stripe, M-Pesa & PayPal"
                  : "256-Bit SSL Secure • Stripe, M-Pesa & PayPal Protected"}
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: REDIRECTED TO PAYPAL */}
        {modalState === "redirected" && (
          <div className="py-4 space-y-5 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-foreground">
                {isFr ? "Valider votre Transaction PayPal" : "Validate your PayPal Transaction"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {isFr
                  ? `Une fois votre règlement de ${formattedPriceUSD} finalisé sur PayPal, saisissez votre numéro de reçu / Transaction ID PayPal ci-dessous.`
                  : `Once you have completed your ${formattedPriceUSD} payment on PayPal, enter your PayPal Transaction ID or receipt number below.`}
              </p>
            </div>

            <form onSubmit={handleVerifyPayPal} className="space-y-3 pt-1 text-left">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-foreground flex items-center justify-between">
                  <span>Numéro de Transaction / Reçu PayPal</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Ex: 9XY12345Z</span>
                </label>
                <input
                  type="text"
                  value={paypalTxId}
                  onChange={(e) => setPaypalTxId(e.target.value.toUpperCase())}
                  placeholder="Ex: 9XY1234567 ou PAYID-XXXXX"
                  required
                  className="w-full rounded-2xl border-2 border-primary/40 bg-background px-4 py-3 text-xs font-mono font-bold text-foreground uppercase tracking-wider focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-6 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider mon Reçu PayPal &amp; Activer {plan.name}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalState("checkout")}
                  className="w-full sm:w-auto rounded-2xl border border-border bg-card px-4 py-3.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Retour
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: VERIFYING / ACTIVATING */}
        {modalState === "mpesa_verifying" && (
          <div className="py-12 space-y-6 text-center animate-fadeIn">
            <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
            <div className="space-y-2">
              <h4 className="text-base font-bold text-foreground">
                {isFr ? "Validation de votre souscription en cours..." : "Validating your subscription..."}
              </h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {isFr ? "Synchronisation sécurisée avec vos accès UseAimly." : "Securely syncing with your UseAimly account."}
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS STATE */}
        {modalState === "success" && (
          <div className="py-6 space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-bold text-foreground">
                {isFr ? "Souscription Confirmée !" : "Subscription Confirmed!"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {successMessage || (isFr ? `Votre formule ${plan.name} est désormais active sur votre compte UseAimly.` : `Your ${plan.name} plan is now active on your UseAimly account.`)}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono text-emerald-600 dark:text-emerald-400 space-y-1">
              <div>Plan : <strong>{plan.name.toUpperCase()}</strong></div>
              <div>Statut : <strong>{isFr ? "ACTIF • ACCÈS COMPLET" : "ACTIVE • FULL ACCESS"}</strong></div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleResetModal();
                router.push("/app");
              }}
              className="w-full rounded-2xl bg-primary text-primary-foreground font-black text-xs py-3.5 px-6 shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isFr ? "Accéder à mon Espace UseAimly" : "Go to UseAimly Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
