"use client";

import React, { useState, useRef } from "react";
import { Sparkles, CheckCircle2, Zap, X, ArrowRight, CreditCard, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";

export interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTier?: (tierId: string) => void;
}

export function ProUpgradeModal({ isOpen, onClose, onSelectTier }: ProUpgradeModalProps) {
  const { language } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const isFr = language === "fr";
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  if (!isOpen) return null;

  const handleStartStripePro = async () => {
    if (isSubmittingRef.current || isLoading) return;
    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "pro",
          billingCycle: "MONTHLY",
          provider: "STRIPE",
          customerEmail: user?.email,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        router.push("/checkout?plan=pro");
      }
    } catch {
      router.push("/checkout?plan=pro");
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#FF6B4A] to-[#FF3820] text-white flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold block">
                {isFr ? "Accès Complet au Moteur" : "Full Engine Access"}
              </span>
              <h3 className="text-lg font-black text-foreground">
                {isFr ? "Débloquez UseAimly Pro" : "Unlock UseAimly Pro"}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Plan Card */}
        <div className="p-6 rounded-2xl border-2 border-primary bg-primary/5 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              {isFr ? "Recommandé" : "Best Value"}
            </span>
            <div className="text-2xl font-black font-editorial text-foreground">
              $4.99 <span className="text-xs text-muted-foreground font-normal">/ {isFr ? "mois" : "month"}</span>
            </div>
          </div>

          <ul className="space-y-2.5 pt-2 text-xs text-foreground/90">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{isFr ? "Simulations de décisions financières illimitées" : "Unlimited decision simulations"}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{isFr ? "Studio 3-Stratégies & Trajectoires de Vie" : "3-Strategy Studio & Life Trajectories"}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{isFr ? "Scanner OCR de devis & mémorandum PDF" : "OCR Document Intelligence & PDF memorandums"}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{isFr ? "Synchronisation multi-appareils (Chrome, Brave, Mobile)" : "Cross-browser sync (Chrome, Brave, Mobile)"}</span>
            </li>
          </ul>

          <div className="pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleStartStripePro}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm py-3.5 shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              <span>{isLoading ? (isFr ? "Connexion Stripe..." : "Connecting Stripe...") : (isFr ? "Payer par Carte / Stripe ($4.99/m)" : "Subscribe via Stripe ($4.99/mo)")}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/checkout?plan=pro");
            }}
            className="text-xs text-muted-foreground hover:text-foreground font-mono underline cursor-pointer"
          >
            {isFr ? "Voir toutes les méthodes (M-Pesa, PayPal)" : "View all payment methods (M-Pesa, PayPal)"}
          </button>
        </div>
      </div>
    </div>
  );
}
