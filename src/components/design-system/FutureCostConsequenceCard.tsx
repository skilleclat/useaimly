"use client";

import React from "react";
import { ArrowDown, Calendar, ShieldAlert, Sparkles, TrendingDown, DollarSign } from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";

export interface FutureCostConsequenceCardProps {
  amount: number;
  monthlyPayment: number;
  termMonths?: number;
  goalDelayDays: number;
  reserveMonthsAfter: number;
  decisionTitle: string;
}

export function FutureCostConsequenceCard({
  amount,
  monthlyPayment,
  termMonths = 36,
  goalDelayDays,
  reserveMonthsAfter,
  decisionTitle,
}: FutureCostConsequenceCardProps) {
  const { format } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";

  const annualOutflow = monthlyPayment > 0 ? monthlyPayment * 12 : amount;

  return (
    <div className="rounded-3xl border border-gray-100 dark:border-border bg-[#071F15] p-6 sm:p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
      {/* Glow */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-[#00A859]/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono uppercase tracking-wider text-[#00A859] font-bold block">
          {isFr ? "Impact sur Votre Avenir" : "Future Consequence Intelligence"}
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {isFr ? "CE QUE CETTE DÉCISION COÛTE À VOTRE FUTUR" : "WHAT WILL THIS COST MY FUTURE?"}
        </h3>
        <p className="text-xs text-gray-300 font-medium">
          {isFr
            ? "Ne vous arrêtez pas au prix de départ. Voici l'engagement réel sur plusieurs années."
            : "Look beyond the initial price tag. See how this decision reverberates through your life goals."}
        </p>
      </div>

      {/* Consequence Flow Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
        {/* Step 1: Monthly Obligation */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
          <span className="text-[10px] font-mono text-gray-300 font-bold block uppercase">
            {isFr ? "Étape 1 : Mensualité" : "1. Monthly Outflow"}
          </span>
          <div className="text-lg font-black text-white">
            {monthlyPayment > 0 ? `${format(monthlyPayment, { fromCurrency: "KES" })}` : format(amount, { fromCurrency: "KES" })}
          </div>
          <span className="text-[11px] text-[#00A859] font-bold block">
            {monthlyPayment > 0 ? `${isFr ? "par mois pendant" : "per month for"} ${termMonths} mo` : isFr ? "Paiement unique" : "One-time cost"}
          </span>
        </div>

        {/* Step 2: Annualized Impact */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
          <span className="text-[10px] font-mono text-gray-300 font-bold block uppercase">
            {isFr ? "Étape 2 : Coût Annuel" : "2. Annualized Cost"}
          </span>
          <div className="text-lg font-black text-amber-300">
            {format(annualOutflow, { fromCurrency: "KES" })}
          </div>
          <span className="text-[11px] text-gray-300 font-medium block">
            {isFr ? "prélevés chaque année" : "drained per year"}
          </span>
        </div>

        {/* Step 3: Goal Timeline Shift */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
          <span className="text-[10px] font-mono text-gray-300 font-bold block uppercase">
            {isFr ? "Étape 3 : Retard Objectif" : "3. Life Goal Delay"}
          </span>
          <div className="text-lg font-black text-amber-400">
            +{goalDelayDays} {isFr ? "jours" : "days"}
          </div>
          <span className="text-[11px] text-gray-300 font-medium block">
            {isFr ? "de décalage sur votre projet" : "shifted into future"}
          </span>
        </div>

        {/* Step 4: Emergency Reserve Cushion */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
          <span className="text-[10px] font-mono text-gray-300 font-bold block uppercase">
            {isFr ? "Étape 4 : Matelas Restant" : "4. Reserve Safety"}
          </span>
          <div className="text-lg font-black text-emerald-400">
            {reserveMonthsAfter} {isFr ? "mois" : "months"}
          </div>
          <span className="text-[11px] text-gray-300 font-medium block">
            {isFr ? "de résilience préservés" : "living buffer saved"}
          </span>
        </div>
      </div>

      {/* Core Insight Callout */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 text-xs text-gray-200">
        <Sparkles className="w-5 h-5 text-[#00A859] shrink-0" />
        <p className="font-medium leading-relaxed">
          {monthlyPayment > 0
            ? isFr
              ? `Ce n'est pas seulement une dépense de ${format(amount, { fromCurrency: "KES" })}. C'est un engagement de ${format(monthlyPayment, { fromCurrency: "KES" })}/mois pendant ${termMonths} mois, soit ${format(monthlyPayment * termMonths, { fromCurrency: "KES" })} au total.`
              : `This isn't just a ${format(amount, { fromCurrency: "KES" })} purchase. It's a commitment of ${format(monthlyPayment, { fromCurrency: "KES" })}/month for ${termMonths} months, totaling ${format(monthlyPayment * termMonths, { fromCurrency: "KES" })}.`
            : isFr
            ? `Cet achat ponctuel de ${format(amount, { fromCurrency: "KES" })} réduit votre flexibilité immédiate et décale votre objectif de +${goalDelayDays} jours.`
            : `This one-time outlay of ${format(amount, { fromCurrency: "KES" })} reduces immediate liquidity and delays your goal arrival by +${goalDelayDays} days.`}
        </p>
      </div>
    </div>
  );
}
