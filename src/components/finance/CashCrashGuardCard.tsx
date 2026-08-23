"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertOctagon, ShieldAlert, CheckCircle2, ArrowRight, Lock, Zap, RefreshCw } from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { CashCrashAlert } from "@/lib/finance/simulations/cash-crash-guard";

export function CashCrashGuardCard({
  alert,
  isProUser = false,
}: {
  alert: CashCrashAlert;
  isProUser?: boolean;
}) {
  const { format } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";
  const [unlocked, setUnlocked] = useState(isProUser);

  if (!alert.hasCrashRisk) {
    return (
      <div className="p-5 sm:p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#00A859] text-white flex items-center justify-center shrink-0 shadow-md">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-foreground">
              {isFr ? "Radar Anti-Crash 365 Jours : Zéro Risque Détecté" : "365-Day Crash Radar: Zero Deficit Risk"}
            </h4>
            <p className="text-xs text-gray-600 dark:text-muted-foreground font-medium">
              {isFr
                ? "Vos trésoreries couvrent vos engagements sur les 12 prochains mois."
                : "Your cash flow covers all planned commitments for the next 12 months."}
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-[#00A859]/20 text-[#00A859] text-xs font-mono font-bold">
          100% PROTECTED
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-card to-card p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Top Warning Ribbon */}
      <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/30 animate-pulse">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-500 block">
              {isFr ? "Alerte Radar Anti-Crash 365 Jours" : "365-Day Cash Crash Alert"}
            </span>
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-foreground">
              {isFr ? "Risque de découver / déficit prévu" : "Predicted Liquidity Deficit Risk"}
            </h3>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs">
          {alert.daysUntilCrash > 0
            ? isFr
              ? `Dans ${alert.daysUntilCrash} jours`
              : `In ${alert.daysUntilCrash} days`
            : alert.formattedLowestLiquidityDate}
        </div>
      </div>

      {/* Crash Details Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">
            {isFr ? "Date estimée de la baisse" : "Estimated Deficit Date"}
          </span>
          <span className="text-lg font-black text-gray-900 dark:text-foreground">
            {alert.formattedLowestLiquidityDate}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">
            {isFr ? "Niveau de solde le plus bas" : "Lowest Predicted Balance"}
          </span>
          <span className="text-lg font-black text-rose-600 dark:text-rose-400">
            {format(alert.lowestLiquidityAmount, { fromCurrency: "KES" })}
          </span>
        </div>
      </div>

      {/* Cause description */}
      <p className="text-xs text-gray-600 dark:text-muted-foreground font-medium leading-relaxed bg-gray-50 dark:bg-secondary/40 p-3.5 rounded-2xl border border-gray-100 dark:border-border">
        <strong>{isFr ? "Cause identifiée : " : "Identified cause: "}</strong>
        {alert.crashCause}
      </p>

      {/* AUTOMATED RESCUE PLAN (PRO UNLOCK TRIGGER) */}
      <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-border">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>{isFr ? "Plan de Sauvetage Automatique" : "Automated Rescue Recipe"}</span>
          </h4>

          <span className="text-xs font-mono font-bold text-[#00A859]">
            +{format(alert.rescuePlan.totalSavingsOpportunity, { fromCurrency: "KES" })} {isFr ? "sauvegardés" : "saved"}
          </span>
        </div>

        {unlocked ? (
          <div className="space-y-2.5 animate-fadeIn">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-gray-900 dark:text-foreground font-medium">
              <div className="w-5 h-5 rounded-full bg-[#00A859] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                1
              </div>
              <span>{alert.rescuePlan.step1}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-gray-900 dark:text-foreground font-medium">
              <div className="w-5 h-5 rounded-full bg-[#00A859] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                2
              </div>
              <span>{alert.rescuePlan.step2}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-gray-900 dark:text-foreground font-medium">
              <div className="w-5 h-5 rounded-full bg-[#00A859] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                3
              </div>
              <span>{alert.rescuePlan.step3}</span>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-gray-900 text-white space-y-4 text-center relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur-xl" />

            <div className="relative space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-sm text-white">
                {isFr ? "Débloquer le Plan de Sauvetage Anti-Crash" : "Unlock Automated Rescue Recipe"}
              </h5>
              <p className="text-xs text-gray-300 font-medium max-w-sm mx-auto">
                {isFr
                  ? "Passez à Aimly Pro pour débloquer les 3 actions précises qui neutralisent ce risque et protègent vos liquidités."
                  : "Upgrade to Aimly Pro to unlock the exact 3-step recipe neutralizing this deficit and protecting your cash reserves."}
              </p>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00A859] to-teal-500 text-white font-extrabold text-xs px-6 py-3 shadow-lg hover:opacity-95 transition-all"
              >
                <span>{isFr ? "Débloquer Aimly Pro (9 $/mois)" : "Unlock Aimly Pro ($9/mo)"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setUnlocked(true)}
                className="text-xs text-gray-400 hover:text-white underline cursor-pointer py-1"
              >
                {isFr ? "Tester la Démo Débloquée" : "Test Unlocked Demo"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
