"use client";

import React, { useState } from "react";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { PricingPlan } from "@/lib/types/pricing";
import { useAuth } from "@/lib/auth/auth-context";
import { upgradePlanAction, submitMpesaPaymentAction } from "@/lib/auth/actions";
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
  const { t, language } = useI18n();

  const [paymentMethod, setPaymentMethod] = useState<"PAYPAL" | "MPESA">("MPESA");
  const [modalState, setModalState] = useState<"checkout" | "redirected" | "mpesa_verifying" | "success">("checkout");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mpesaCode, setMpesaCode] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !plan) return null;

  const isLoggedIn = Boolean(user || (profile && profile.id !== "demo-user-id"));

  // Calculate Base USD amount
  const baseUSD = isYearly
    ? (plan.totalYearlyUSD || plan.priceYearlyUSD * 12)
    : plan.priceMonthlyUSD;

  // Calculate KES amount
  const amountKES = plan.id === "premium"
    ? (isYearly ? MPESA_CONFIG.premiumYearlyKES : MPESA_CONFIG.premiumMonthlyKES)
    : (isYearly ? MPESA_CONFIG.proYearlyKES : MPESA_CONFIG.proMonthlyKES);

  const formattedPriceUSD = format(baseUSD, { fromCurrency: "USD", showDecimals: true });
  const formattedPriceKES = `KES ${amountKES.toLocaleString()}`;

  const billingCycleLabel = isYearly
    ? (language === "fr" ? "Facturation Annuelle (-20% de réduction)" : "Annual Billing (-20% discount)")
    : (language === "fr" ? "Facturation Mensuelle" : "Monthly Billing");

  const merchantEmail = "herimaliyabwana@gmail.com";

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

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

    setModalState("mpesa_verifying");
    setErrorMessage(null);

    try {
      const res = await upgradePlanAction(plan.id);
      if (res.success) {
        setSuccessMessage(res.message || "Essai gratuit de 14 jours activé avec succès !");
        setModalState("success");
        await refreshProfile();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message || "Impossible d'activer l'essai gratuit.");
        setModalState("checkout");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Une erreur inattendue est survenue.");
      setModalState("checkout");
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
        language === "fr"
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
      <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl z-10 space-y-6 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Lock className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold font-editorial text-foreground tracking-tight">
                {language === "fr" ? "Souscription Sécurisée UseAimly" : "Secure UseAimly Subscription"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "fr"
                ? "Choisissez votre moyen de paiement sécurisé (M-Pesa Paybill ou PayPal)."
                : "Choose your payment method (M-Pesa Paybill or PayPal)."}
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
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl border border-border/80 bg-secondary/30">
            <button
              type="button"
              onClick={() => setPaymentMethod("MPESA")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === "MPESA"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Lipa na M-Pesa</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("PAYPAL")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === "PAYPAL"
                  ? "bg-[#003087] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>PayPal / Card</span>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: CHECKOUT OPTIONS */}
        {modalState === "checkout" && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. M-PESA PAYBILL MODE */}
            {paymentMethod === "MPESA" ? (
              <div className="space-y-5">
                {/* M-Pesa Order Summary Box */}
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
                    {/* Business Number (Paybill) */}
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
                          title="Copy Paybill Number"
                        >
                          {copiedField === "biz" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === "biz" ? "Copié" : "Copier"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Account Number */}
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
                          title="Copy Account Number"
                        >
                          {copiedField === "acc" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === "acc" ? "Copié" : "Copier"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step by step guide */}
                  <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-1 text-xs text-muted-foreground font-medium">
                    <div className="font-bold text-foreground text-xs pb-1">Instructions de paiement M-Pesa :</div>
                    <p>1. Allez sur <strong>M-Pesa</strong> &gt; <strong>Lipa na M-Pesa</strong> &gt; <strong>Pay Bill</strong>.</p>
                    <p>2. Entrez le Business No. : <strong className="text-foreground">{MPESA_CONFIG.businessNumber}</strong>.</p>
                    <p>3. Entrez l&apos;Account No. : <strong className="text-foreground">{MPESA_CONFIG.accountNumber}</strong>.</p>
                    <p>4. Entrez le montant exact : <strong className="text-emerald-600 dark:text-emerald-400">{formattedPriceKES}</strong> et votre code PIN.</p>
                  </div>
                </div>

                {/* Form to submit M-Pesa Transaction Code */}
                <form onSubmit={handleVerifyMpesa} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-foreground flex items-center justify-between">
                      <span>Code de confirmation SMS M-Pesa</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Ex: QJH789LK02</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={mpesaCode}
                        onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                        placeholder="Ex: QJH789LK02"
                        required
                        className="w-full rounded-2xl border-2 border-emerald-500/40 bg-background px-4 py-3 text-sm font-mono font-bold text-foreground uppercase tracking-widest placeholder:normal-case placeholder:font-normal placeholder:tracking-normal focus:border-emerald-500 focus:outline-none transition-colors min-h-[46px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-4 px-6 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider mon paiement M-Pesa &amp; Activer {plan.name}</span>
                  </button>
                </form>

                {/* Or Trial Option */}
                <div className="pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={handleActivateTrial}
                    className="w-full rounded-2xl border border-border/80 bg-secondary/40 hover:bg-secondary text-foreground font-bold text-xs py-3 px-6 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Ou Démarrer l&apos;Essai Gratuit de 14 Jours sans débit</span>
                  </button>
                </div>
              </div>
            ) : (
              /* 2. PAYPAL MODE */
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
                        {formattedPriceUSD}
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
                      <span>{language === "fr" ? "Bénéficiaire PayPal :" : "PayPal Merchant Payee:"}</span>
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
                      {language === "fr" ? `Payer avec PayPal (${formattedPriceUSD})` : `Checkout with PayPal (${formattedPriceUSD})`}
                    </span>
                    <ExternalLink className="w-4 h-4 text-[#003087] group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* 2. Instant 14-Day Free Trial Option */}
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
              </div>
            )}

            {/* Security Badge Footnote */}
            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-muted-foreground pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                {language === "fr"
                  ? "Transaction Sécurisée SSL 256 bits • Reçu Immédiat"
                  : "256-Bit SSL Secure Payment • Instant Receipt"}
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

            <div className="p-4 rounded-2xl border border-border/80 bg-secondary/30 text-xs font-mono text-foreground space-y-1">
              <div>Plan : <strong>{plan.name} ({billingCycleLabel})</strong></div>
              <div>Montant : <strong>{formattedPriceUSD}</strong></div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleActivateTrial}
                className="w-full sm:w-auto rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmer mon accès UseAimly</span>
              </button>
              <button
                type="button"
                onClick={() => setModalState("checkout")}
                className="w-full sm:w-auto rounded-2xl border border-border bg-card px-5 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Retour aux options
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: VERIFYING / ACTIVATING */}
        {modalState === "mpesa_verifying" && (
          <div className="py-12 space-y-6 text-center animate-fadeIn">
            <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
            <div className="space-y-2">
              <h4 className="text-base font-bold text-foreground">
                Validation de votre souscription en cours...
              </h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Synchronisation sécurisée avec vos accès UseAimly.
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
              <h4 className="text-xl font-bold font-editorial text-foreground">
                Souscription Confirmée !
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {successMessage || `Votre formule ${plan.name} est désormais active sur votre compte UseAimly.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono text-emerald-600 dark:text-emerald-400 space-y-1">
              <div>Niveau de Plan : <strong>{plan.name.toUpperCase()}</strong></div>
              <div>Statut : <strong>ACTIF &bull; ACCÈS COMPLET</strong></div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleResetModal();
                router.push("/app");
              }}
              className="w-full rounded-2xl bg-primary text-primary-foreground font-black text-xs py-3.5 px-6 shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Accéder à mon Espace UseAimly</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
