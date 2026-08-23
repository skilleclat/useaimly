"use client";

import React from "react";
import { ShieldCheck, AlertCircle, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { calculateMaxSafePrice, MaxSafePriceResult } from "@/lib/finance/max-safe-price";
import { BaselineFinancialProfile } from "@/lib/finance/types";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";

export interface MaxSafePriceCardProps {
  baselineProfile: BaselineFinancialProfile;
  requestedPrice: number;
  isRecurring?: boolean;
  onApplyComfortablePrice?: (amount: number) => void;
}

export function MaxSafePriceCard({
  baselineProfile,
  requestedPrice,
  isRecurring = false,
  onApplyComfortablePrice,
}: MaxSafePriceCardProps) {
  const { format } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";

  const bounds: MaxSafePriceResult = calculateMaxSafePrice(baselineProfile, requestedPrice, isRecurring);

  const comfortableFormatted = format(bounds.comfortablePrice, { fromCurrency: "KES" });
  const upperFormatted = format(bounds.absoluteUpperPrice, { fromCurrency: "KES" });
  const requestedFormatted = format(requestedPrice, { fromCurrency: "KES" });

  return (
    <div className="rounded-3xl border border-gray-100 dark:border-border bg-white dark:bg-card p-6 sm:p-7 space-y-6 shadow-sm">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-[#00A859] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00A859] font-bold block">
              {isFr ? "Intelligence Budget Sécurisé" : "Budget Safety Intelligence"}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-foreground">
              {isFr ? "PRIX MAXIMUM SÉCURISÉ (MAX SAFE PRICE)" : "MAX SAFE PRICE"}
            </h3>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-[#00A859] text-xs font-mono font-bold">
          {isFr ? "Calcul Déterministe" : "Deterministic Engine"}
        </span>
      </div>

      {/* Main Budget Ranges Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Comfortable Range */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <span className="text-[11px] font-mono uppercase font-bold text-[#00A859] block">
            {isFr ? "Zone Confortable (Matelas 3 mois intact)" : "Comfortable Safety Range"}
          </span>
          <div className="text-xl font-extrabold text-gray-900 dark:text-foreground">
            {comfortableFormatted}
          </div>
          <span className="text-[11px] text-gray-500 font-medium block">
            {isFr ? "Matelas de sécurité préservé" : "Emergency buffer fully protected"}
          </span>
        </div>

        {/* Absolute Upper Range */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/30 space-y-1">
          <span className="text-[11px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400 block">
            {isFr ? "Plafond Absolument Supérieur" : "Absolute Upper Limit"}
          </span>
          <div className="text-xl font-extrabold text-gray-900 dark:text-foreground">
            {upperFormatted}
          </div>
          <span className="text-[11px] text-gray-500 font-medium block">
            {isFr ? "Reserve minimale de 1.5 mois" : "Minimum 1.5-month reserve floor"}
          </span>
        </div>

        {/* Requested Price */}
        <div
          className={`p-4 rounded-2xl border space-y-1 ${
            bounds.verdict === "WITHIN_COMFORTABLE"
              ? "bg-gray-50 dark:bg-secondary/40 border-gray-200 dark:border-border"
              : bounds.verdict === "WITHIN_UPPER"
              ? "bg-amber-500/10 border-amber-500/30"
              : "bg-rose-500/10 border-rose-500/30"
          }`}
        >
          <span className="text-[11px] font-mono uppercase font-bold text-gray-500 block">
            {isFr ? "Achat Demandé" : "Requested Purchase"}
          </span>
          <div className="text-xl font-extrabold text-gray-900 dark:text-foreground">
            {requestedFormatted}
          </div>
          <span className="text-[11px] font-bold block">
            {bounds.verdict === "WITHIN_COMFORTABLE" && (
              <span className="text-[#00A859]">{isFr ? "➔ Dans la zone sûre" : "➔ Fully Affordable"}</span>
            )}
            {bounds.verdict === "WITHIN_UPPER" && (
              <span className="text-amber-600 dark:text-amber-400">
                {isFr ? "➔ Zone d'effort (+ " + bounds.deltaComfortable.toLocaleString() + " KES)" : "➔ Exceeds Comfortable Target"}
              </span>
            )}
            {bounds.verdict === "EXCEEDS_UPPER" && (
              <span className="text-rose-600 dark:text-rose-400">
                {isFr ? "➔ Dépassement risqué" : "➔ Exceeds Absolute Ceiling"}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Explanation Box & Action */}
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-secondary/30 border border-gray-100 dark:border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
          {bounds.explanation}
        </p>

        {bounds.verdict !== "WITHIN_COMFORTABLE" && onApplyComfortablePrice && (
          <button
            type="button"
            onClick={() => onApplyComfortablePrice(bounds.comfortablePrice)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00A859] hover:bg-[#00964F] text-white font-bold px-4 py-2.5 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <span>{isFr ? "Ajuster au prix sûr" : "Apply Max Safe Price"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
