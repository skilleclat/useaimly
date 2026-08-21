"use client";

import React from "react";
import Link from "next/link";
import { PricingPlan } from "@/lib/types/pricing";
import { Check, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";

interface PricingCardProps {
  plan: PricingPlan;
  isYearly: boolean;
  currency?: "USD" | "KES";
  currentPlanId?: string;
  onSelectPlan?: (planId: string) => void;
}

export function PricingCard({
  plan,
  isYearly,
  currency = "USD",
  currentPlanId,
  onSelectPlan,
}: PricingCardProps) {
  const isCurrentPlan = currentPlanId === plan.id;
  const isKES = currency === "KES";

  const priceMonthly = isKES ? plan.priceMonthlyKES : plan.priceMonthlyUSD;
  const priceYearly = isKES ? plan.priceYearlyKES : plan.priceYearlyUSD;

  const displayPrice = isYearly ? priceYearly : priceMonthly;
  const currencySymbol = isKES ? "KES " : "$";
  const periodLabel = isYearly ? "/mois (facturé annuellement)" : "/mois";

  return (
    <div
      className={`relative flex flex-col justify-between rounded-[2.5rem] p-6 sm:p-8 transition-all duration-300 ${
        plan.isPopular
          ? "border-2 border-primary bg-gradient-to-b from-primary/10 via-card to-card shadow-2xl shadow-primary/10 scale-102 z-10"
          : "border border-border/80 bg-card hover:border-primary/40 hover:shadow-xl"
      }`}
    >
      {/* Popular Badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-orange-500 px-4 py-1 text-[11px] font-bold tracking-wider text-primary-foreground uppercase shadow-md">
          <Sparkles className="w-3 h-3" />
          <span>{plan.badge}</span>
        </div>
      )}

      {/* Plan Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-foreground tracking-tight">{plan.name}</h3>
          {plan.id === "pro" && <Zap className="w-5 h-5 text-primary" />}
          {plan.id === "premium" && <Shield className="w-5 h-5 text-amber-500" />}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px]">
          {plan.tagline}
        </p>

        {/* Pricing Display */}
        <div className="pt-2 pb-4 border-b border-border/60">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-foreground font-editorial">
              {displayPrice === 0 ? "Gratuit" : `${currencySymbol}${displayPrice.toLocaleString()}`}
            </span>
            {displayPrice > 0 && (
              <span className="text-xs font-mono text-muted-foreground">{periodLabel}</span>
            )}
          </div>
          {isYearly && displayPrice > 0 && (
            <p className="text-[11px] text-emerald-500 font-semibold mt-1">
              Économisez 20% en paiement annuel
            </p>
          )}
        </div>

        {/* Feature List */}
        <div className="space-y-3 pt-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Fonctionnalités incluses :
          </span>
          <ul className="space-y-2.5">
            {plan.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs">
                <div
                  className={`mt-0.5 rounded-full p-0.5 shrink-0 ${
                    feat.included
                      ? feat.highlight
                        ? "bg-primary text-primary-foreground"
                        : "bg-emerald-500/15 text-emerald-500"
                      : "bg-muted text-muted-foreground opacity-40"
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
                <span
                  className={`${
                    feat.included
                      ? feat.highlight
                        ? "font-bold text-foreground"
                        : "text-foreground/90"
                      : "text-muted-foreground line-through opacity-60"
                  }`}
                >
                  {feat.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-8">
        {isCurrentPlan ? (
          <div className="w-full rounded-2xl bg-secondary py-3 text-center text-xs font-bold text-muted-foreground border border-border">
            Plan Actuel
          </div>
        ) : onSelectPlan ? (
          <button
            onClick={() => onSelectPlan(plan.id)}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-extrabold shadow-md transition-all ${
              plan.isPopular
                ? "bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white hover:opacity-95 shadow-orange-500/20 hover:scale-[1.02]"
                : "bg-primary text-primary-foreground hover:opacity-95"
            }`}
          >
            <span>{plan.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            href={plan.ctaHref}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-extrabold shadow-md transition-all ${
              plan.isPopular
                ? "bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white hover:opacity-95 shadow-orange-500/20 hover:scale-[1.02]"
                : "bg-primary text-primary-foreground hover:opacity-95"
            }`}
          >
            <span>{plan.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
