"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PRICING_PLANS, PRICING_FAQS, PricingPlan } from "@/lib/types/pricing";
import { PricingCard } from "@/components/finance/PricingCard";
import { PayPalCheckoutModal } from "@/components/finance/PayPalCheckoutModal";
import { Container } from "@/components/layout/container";
import { HelpCircle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

function PricingContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const isLoggedIn = Boolean(user || (profile && profile.id !== "demo-user-id"));

  const searchParams = useSearchParams();
  const rawPlan = searchParams.get("plan");

  const [isYearly, setIsYearly] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "KES">("USD");
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PricingPlan | null>(() => {
    if (isLoggedIn && (rawPlan === "pro" || rawPlan === "premium")) {
      return PRICING_PLANS.find((p) => p.id === rawPlan) || null;
    }
    return null;
  });

  React.useEffect(() => {
    if (isLoggedIn && (rawPlan === "pro" || rawPlan === "premium")) {
      const target = PRICING_PLANS.find((p) => p.id === rawPlan);
      if (target) setSelectedPlanForCheckout(target);
    }
  }, [rawPlan, isLoggedIn]);

  const handleSelectPlan = (planId: string) => {
    const targetPlan = PRICING_PLANS.find((p) => p.id === planId);
    if (!targetPlan || targetPlan.id === "free") {
      router.push("/signup?plan=free");
      return;
    }

    // Open checkout modal directly with Lipa na M-Pesa & PayPal tabs
    setSelectedPlanForCheckout(targetPlan);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 space-y-16">
      <Container className="max-w-6xl mx-auto space-y-16">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto animate-fadeIn">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-mono font-bold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Pricing & Zero Commitments</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-editorial tracking-tight text-foreground">
            See tomorrow before deciding today.
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Choose the right plan to protect your liquidity, accelerate your destinations, and simulate spending impact.
          </p>

          {/* Payment Badges Banner (M-Pesa & PayPal) */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2 px-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-xs font-mono">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <span>📱 Lipa na M-Pesa (Paybill: <strong>247247</strong> &bull; Acc: <strong>0743898803</strong>)</span>
            </div>
            <span className="text-muted-foreground hidden sm:inline">&bull;</span>
            <div className="flex items-center gap-1.5 font-bold text-[#003087] dark:text-sky-400">
              <span>💳 PayPal &amp; International Cards</span>
            </div>
          </div>

          {/* Toggles Bar (Billing Cycle + Currency) */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {/* Billing Cycle Toggle */}
            <div className="flex items-center gap-3 rounded-full border border-border/80 bg-card p-1.5 shadow-sm">
              <button
                onClick={() => setIsYearly(false)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  !isYearly
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  isYearly
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 font-extrabold uppercase">
                  -20%
                </span>
              </button>
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center gap-1 rounded-full border border-border/80 bg-card p-1 text-xs font-mono font-bold">
              <button
                onClick={() => setCurrency("USD")}
                className={`rounded-full px-3 py-1.5 transition-all ${
                  currency === "USD" ? "bg-secondary text-foreground font-extrabold" : "text-muted-foreground"
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency("KES")}
                className={`rounded-full px-3 py-1.5 transition-all ${
                  currency === "KES" ? "bg-secondary text-foreground font-extrabold" : "text-muted-foreground"
                }`}
              >
                KES (Shillings)
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
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

        {/* Guarantee Banner */}
        <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-card via-secondary/30 to-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">14-Day Money-Back Guarantee</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Test Pro and Premium features with total peace of mind. Cancel anytime with a single click.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSelectPlan("pro")}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground font-bold text-xs px-6 py-3 shrink-0 shadow-md hover:opacity-90 transition-all cursor-pointer"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* FAQ Section */}
        <div className="space-y-8 pt-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-editorial text-foreground">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs text-muted-foreground">
              Clear answers to common questions about subscriptions and data security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {PRICING_FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-border/80 bg-card p-6 space-y-2 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <h3 className="text-sm font-bold text-foreground">{faq.question}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* PayPal Official Checkout Modal */}
      <PayPalCheckoutModal
        isOpen={Boolean(selectedPlanForCheckout)}
        onClose={() => setSelectedPlanForCheckout(null)}
        plan={selectedPlanForCheckout}
        isYearly={isYearly}
      />
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
