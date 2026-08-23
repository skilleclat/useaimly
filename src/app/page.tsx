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
  const { t } = useI18n();
  const [landingYearly, setLandingYearly] = useState(true);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PricingPlan | null>(null);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/15 flex flex-col">
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-12 sm:space-y-20">
        {/* 1. HERO SECTION (ROMAIN BOUVET COPYWRITING STYLE) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Column: Title & Subtitle */}
          <div className="md:col-span-7 space-y-4 text-left">
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-foreground tracking-tight leading-[1.1]">
              {t("heroTitlePrefix")}
              <br className="hidden sm:inline" />
              <span className="text-[#00A859]">{t("heroTitleTomorrow")}</span>
              {t("heroTitleSuffix")}
            </h1>

            <p className="text-base sm:text-xl text-gray-500 dark:text-muted-foreground font-medium max-w-md leading-relaxed">
              {t("heroMainSubtitle")}
            </p>
          </div>

          {/* Right Column: 3D Elevated Graphic Card */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <Hero3DGraphic />
          </div>
        </section>

        {/* 2. MINIMALIST DECISION ENGINE */}
        <section className="w-full">
          <MinimalistDecisionEngine showQuickActions={true} />
        </section>

        {/* 3. WHY USEAIMLY? (ROMAIN BOUVET ANTI-BUDGET STORYTELLING) */}
        <section className="rounded-3xl border border-gray-100 dark:border-border bg-card p-8 sm:p-12 space-y-8 text-center shadow-xs">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00A859] font-bold">
              {t("whyTitleTag")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-foreground">
              {t("whyMainTitle")}
              <br />
              <span className="text-[#00A859]">{t("whyMainTitleLine2")}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 text-left">
            <div className="p-6 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-secondary/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-foreground">{t("whyCard1Title")}</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed font-medium">
                {t("whyCard1Desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-secondary/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-foreground">{t("whyCard2Title")}</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed font-medium">
                {t("whyCard2Desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-secondary/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-foreground">{t("whyCard3Title")}</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed font-medium">
                {t("whyCard3Desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-secondary/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-foreground">{t("whyCard4Title")}</h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed font-medium">
                {t("whyCard4Desc")}
              </p>
            </div>
          </div>
        </section>

        {/* 4. PRICING PREVIEW */}
        <section className="space-y-8 text-center">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground tracking-tight">
              {t("pricingSectionTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-muted-foreground font-medium">
              {t("pricingSectionSubtitle")}
            </p>

            <div className="pt-2 flex items-center justify-center gap-3 text-xs font-bold">
              <span className={!landingYearly ? "text-gray-900 dark:text-foreground" : "text-gray-400"}>
                {t("monthlyBilling")}
              </span>
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
                {t("annualBilling")} <span className="text-[#00A859] font-mono text-[10px]">({t("discountBadge")})</span>
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
            <span>© {new Date().getFullYear()} UseAimly. {t("rightsReserved")}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-gray-900 transition-colors">
              {t("navPricing")}
            </Link>
            <Link href="/app/settings" className="hover:text-gray-900 transition-colors">
              {t("navSettings")}
            </Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">
              {t("navSignIn")}
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
