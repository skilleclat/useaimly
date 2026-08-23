"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Clock, Layers } from "lucide-react";
import { generateBetterAlternatives, AlternativeOption } from "@/lib/finance/better-alternatives";
import { BaselineFinancialProfile } from "@/lib/finance/types";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";

export interface BetterAlternativesCardProps {
  baselineProfile: BaselineFinancialProfile;
  requestedAmount: number;
  decisionTitle: string;
  onSelectAlternative?: (alt: AlternativeOption) => void;
}

export function BetterAlternativesCard({
  baselineProfile,
  requestedAmount,
  decisionTitle,
  onSelectAlternative,
}: BetterAlternativesCardProps) {
  const { format } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";

  const alternatives = generateBetterAlternatives(baselineProfile, requestedAmount, decisionTitle);

  return (
    <div className="rounded-3xl border border-gray-100 dark:border-border bg-white dark:bg-card p-6 sm:p-7 space-y-6 shadow-sm">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[#00A859] text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isFr ? "Recommandations Proactives" : "Better Decision Alternatives"}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-foreground">
          {isFr ? "3 Meilleures Alternatives Sécurisées" : "3 Safer Ways to Execute This Decision"}
        </h3>
        <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">
          {isFr
            ? "Ne vous contentez pas d'un non. Voici comment concrétiser ce projet sans sacrifier votre avenir."
            : "Don't settle for 'No'. Adjust your strategy to buy safely without delaying life goals."}
        </p>
      </div>

      {/* Grid of 3 Alternatives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alternatives.map((alt) => (
          <div
            key={alt.id}
            className="p-5 rounded-2xl border border-gray-100 dark:border-border/80 bg-gray-50/60 dark:bg-secondary/20 space-y-4 flex flex-col justify-between hover:border-[#00A859]/50 transition-all group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#00A859]/10 text-[#00A859]">
                  {alt.safetyRating}
                </span>
                <span className="text-[11px] font-bold text-gray-500">
                  {alt.goalDelayDays === 0
                    ? isFr ? "0 jour de retard" : "0 days delay"
                    : `+${alt.goalDelayDays} ${isFr ? "jours" : "days"}`}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-gray-900 dark:text-foreground group-hover:text-[#00A859] transition-colors">
                {alt.title}
              </h4>

              <p className="text-xs text-gray-600 dark:text-muted-foreground font-medium leading-relaxed">
                {alt.explanation}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-border/40 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">{isFr ? "Impact Mensuel :" : "Monthly Payment:"}</span>
                <span className="font-bold text-gray-900 dark:text-foreground">
                  {alt.monthlyPayment > 0
                    ? `${format(alt.monthlyPayment, { fromCurrency: "KES" })} / mo`
                    : isFr ? "0 KES (comptant)" : "0 KES (Cash)"}
                </span>
              </div>

              {onSelectAlternative && (
                <button
                  type="button"
                  onClick={() => onSelectAlternative(alt)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-card border border-gray-200 dark:border-border hover:border-[#00A859] text-gray-900 dark:text-foreground hover:text-[#00A859] font-bold text-xs py-2.5 shadow-xs transition-all cursor-pointer"
                >
                  <span>{alt.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
