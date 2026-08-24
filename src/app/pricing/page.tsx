"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICING_PLANS, PRICING_FAQS, PricingPlan } from "@/lib/types/pricing";
import { PricingCard } from "@/components/finance/PricingCard";
import { PayPalCheckoutModal } from "@/components/finance/PayPalCheckoutModal";
import { Container } from "@/components/layout/container";
import { HelpCircle, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n-context";

function PricingContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { language } = useI18n();
  const isFr = language === "fr";
  const isLoggedIn = Boolean(user || (profile && profile.id !== "demo-user-id"));

  const searchParams = useSearchParams();
  const rawPlan = searchParams.get("plan");

  const [isYearly, setIsYearly] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "KES">("USD");
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PricingPlan | null>(() => {
    if (isLoggedIn && rawPlan === "pro") {
      return PRICING_PLANS.find((p) => p.id === "pro") || null;
    }
    return null;
  });

  const handleSelectPlan = (planId: string) => {
    const targetPlan = PRICING_PLANS.find((p) => p.id === planId);
    if (!targetPlan || targetPlan.id === "free") {
      router.push("/app/decide");
      return;
    }

    setSelectedPlanForCheckout(targetPlan);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 space-y-16 antialiased">
      <Container className="max-w-5xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto animate-fadeIn">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-mono font-bold text-primary">
            <Zap className="w-3.5 h-3.5" />
            <span>{isFr ? "Accès Continu au Moteur de Décision" : "Continuous Decision Intelligence"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-editorial tracking-tight text-foreground">
            {isFr ? "Tarification Simple & Transparente" : "Simple, Transparent Pricing"}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            {isFr
              ? "Nous ne vous facturons pas un simple chatbot d'IA générique. Vous payez pour un moteur déterministe prédictif connecté à votre avenir financier."
              : "We don't charge for generic AI chat. You pay for a continuous, personalized financial decision engine that calculates exact future consequences before you commit."}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-3 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-border/80 bg-card p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  !isYearly
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isFr ? "Facturation Mensuelle ($4.99/m)" : "Monthly ($4.99/mo)"}
              </button>
              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isYearly
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{isFr ? "Annuel ($39/an)" : "Annual ($39/yr)"}</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 font-black uppercase">
                  {isFr ? "-35% ÉCONOMIE" : "SAVE 35%"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Pricing Grid (Free & Pro Only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl 2xl:max-w-6xl mx-auto pt-2">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isYearly={isYearly}
              currency={currency}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        {/* Value Guarantee / Trust Banner */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm max-w-5xl 2xl:max-w-6xl mx-auto">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-foreground">
                {isFr ? "Garantie Tranquillité & Clarté Totale" : "Risk-Free Decision Clarity"}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {isFr
                  ? "Testez vos premières décisions gratuitement. Annulez ou modifiez votre abonnement à tout moment en 1 clic."
                  : "Experience the magic on your first decisions for free. Cancel or switch anytime with a single click."}
              </p>
            </div>
          </div>

          <Link
            href="/app/decide"
            className="inline-flex items-center gap-2 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground border border-border font-bold text-xs px-5 py-3 shrink-0 shadow-xs transition-all"
          >
            <span>{isFr ? "Tester une Décision" : "Try Decision Free"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="space-y-8 pt-4 max-w-5xl 2xl:max-w-6xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {isFr ? "Questions Fréquentes" : "Frequently Asked Questions"}
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              {isFr ? "Tout ce que vous devez savoir sur notre tarification." : "Everything you need to know about our continuous decision system."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRICING_FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 text-left shadow-2xs">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <h3 className="text-xs font-bold text-foreground">{faq.question}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6 font-medium">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

      </Container>

      {/* PayPal Checkout Modal */}
      {selectedPlanForCheckout && (
        <PayPalCheckoutModal
          isOpen={Boolean(selectedPlanForCheckout)}
          onClose={() => setSelectedPlanForCheckout(null)}
          plan={selectedPlanForCheckout}
          isYearly={isYearly}
        />
      )}
    </div>
  );
}

export default function PricingPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs font-mono text-muted-foreground">Loading pricing...</div>}>
      <PricingContent />
    </React.Suspense>
  );
}
