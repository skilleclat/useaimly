"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MinimalistDecisionEngine, Hero3DGraphic } from "@/components/design-system/MinimalistDecisionEngine";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { PRICING_PLANS, PricingPlan } from "@/lib/types/pricing";
import { PricingCard } from "@/components/finance/PricingCard";
import { PayPalCheckoutModal } from "@/components/finance/PayPalCheckoutModal";
import { UseaimlyLogo } from "@/components/design-system/UseaimlyLogo";

export default function LandingPage() {
  const { profile } = useAuth();
  const { currency } = useCurrency();
  const [landingYearly, setLandingYearly] = useState(true);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PricingPlan | null>(null);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/15 flex flex-col">
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-12 sm:space-y-20">
        {/* 1. HERO SECTION (2-COLUMN MATCHING REFERENCE UI SCREENSHOT) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Column: Title & Subtitle */}
          <div className="md:col-span-7 space-y-4 text-left">
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-foreground tracking-tight leading-[1.1]">
              Before you <br className="hidden sm:inline" />
              spend big, <br />
              ask <span className="text-[#00A859]">UseAimly.</span>
            </h1>

            <p className="text-base sm:text-xl text-gray-500 dark:text-muted-foreground font-medium max-w-md leading-relaxed">
              See what your next money decision could mean for your finances and goals.
            </p>
          </div>

          {/* Right Column: 3D Elevated Graphic Card */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <Hero3DGraphic />
          </div>
        </section>

        {/* 2. MINIMALIST DECISION ENGINE (CARDS + INPUT BOX + PROMPTS + VERDICT) */}
        <section className="w-full">
          <MinimalistDecisionEngine showQuickActions={true} />
        </section>

        {/* 3. PRODUCT POSITIONING & HOW IT WORKS */}
        <section className="rounded-3xl border border-gray-100 dark:border-border bg-card p-8 sm:p-12 space-y-8 text-center shadow-xs">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00A859] font-bold">
              Why UseAimly?
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-foreground">
              Know what your next money decision will cost you.
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-muted-foreground leading-relaxed font-medium">
              Thinking about buying a car, taking a loan, moving, or making a big purchase?
              UseAimly analyzes your finances, simulates the impact, and shows you how the decision could affect your money and goals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
            <div className="p-6 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-secondary/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-foreground">Ask your question</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed font-medium">
                Describe any decision in plain English. No spreadsheets or complex setup required.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-secondary/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-foreground">See your verdict</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed font-medium">
                Get an instant, plain-language verdict (You Can Afford It, Adjust, or Not Yet) with 3 clear reasons.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-secondary/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-foreground">Know what to do next</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed font-medium">
                Follow a step-by-step timeline or adjust your plan to stay on track to reach your goals.
              </p>
            </div>
          </div>
        </section>

        {/* 4. PRICING PREVIEW */}
        <section className="space-y-8 text-center">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-muted-foreground font-medium">
              Start with our free plan. Upgrade anytime for unlimited decision simulations.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3 text-xs font-bold">
              <span className={!landingYearly ? "text-gray-900 dark:text-foreground" : "text-gray-400"}>Monthly</span>
              <button
                type="button"
                onClick={() => setLandingYearly(!landingYearly)}
                className="relative w-12 h-6 rounded-full bg-[#00A859]/20 border border-[#00A859]/40 p-0.5 transition-colors cursor-pointer"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#00A859] transition-transform ${
                    landingYearly ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={landingYearly ? "text-gray-900 dark:text-foreground" : "text-gray-400"}>
                Yearly <span className="text-[#00A859] font-mono text-[10px]">(Save 20%)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {PRICING_PLANS.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isYearly={landingYearly}
                currency={currency}
                isCurrentPlan={profile?.plan_tier === plan.id}
                onSelectPlan={(p) => setSelectedPlanForCheckout(p)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 dark:border-border bg-white dark:bg-card/50 py-8 text-center text-xs text-gray-500 font-medium">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <UseaimlyLogo size="sm" showTagline={false} />
            <span>© {new Date().getFullYear()} UseAimly. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/app/settings" className="hover:text-gray-900 transition-colors">
              Account
            </Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>

      {/* PayPal Modal */}
      {selectedPlanForCheckout && (
        <PayPalCheckoutModal
          plan={selectedPlanForCheckout}
          isYearly={landingYearly}
          currency={currency}
          isOpen={!!selectedPlanForCheckout}
          onClose={() => setSelectedPlanForCheckout(null)}
        />
      )}
    </div>
  );
}
