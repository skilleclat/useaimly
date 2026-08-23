"use client";

import React, { useState } from "react";
import { Zap, ShieldCheck, AlertTriangle, XCircle, Activity, CheckCircle2 } from "lucide-react";
import { runDecisionStressTest, DecisionStressTestResult } from "@/lib/finance/stress-test";
import { BaselineFinancialProfile } from "@/lib/finance/types";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";

export interface DecisionStressTestCardProps {
  baselineProfile: BaselineFinancialProfile;
  decisionAmount: number;
  decisionTitle: string;
  isRecurring?: boolean;
}

export function DecisionStressTestCard({
  baselineProfile,
  decisionAmount,
  decisionTitle,
  isRecurring = false,
}: DecisionStressTestCardProps) {
  const { format } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";

  const stressTest: DecisionStressTestResult = runDecisionStressTest(
    baselineProfile,
    decisionAmount,
    decisionTitle,
    isRecurring
  );

  const [activeScenarioId, setActiveScenarioId] = useState<string>("BASE");

  const selectedScenario = stressTest.scenarios.find((s) => s.scenarioId === activeScenarioId) || stressTest.scenarios[0];

  return (
    <div className="rounded-3xl border border-gray-100 dark:border-border bg-white dark:bg-card p-6 sm:p-7 space-y-6 shadow-sm">
      {/* Title & Resilience Score HUD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-border pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>{isFr ? "Test de Résistance Financière" : "Decision Stress Test"}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-foreground">
            {isFr ? "Résilience aux Imprévus de la Vie" : "Stress Test Under Adverse Conditions"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">
            {isFr
              ? "Testez si cette décision reste soutenable si la vie ne se passe pas parfaitement."
              : "See if this decision stays sustainable if life doesn't go exactly as planned."}
          </p>
        </div>

        {/* Overall Resilience HUD */}
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center shrink-0 min-w-[170px] space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
            {isFr ? "Score de Résilience Total" : "Resilience Score"}
          </span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {stressTest.overallResilienceScore} / 100
          </div>
          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block">
            {stressTest.overallVerdict === "STRENGTH_PROVEN" && (isFr ? "Solide & Résistant" : "Strong & Resilient")}
            {stressTest.overallVerdict === "MODERATE_RISK" && (isFr ? "Risque Modéré" : "Moderate Risk")}
            {stressTest.overallVerdict === "HIGH_VULNERABILITY" && (isFr ? "Haute Vulnérabilité" : "High Vulnerability")}
          </span>
        </div>
      </div>

      {/* 5 Scenario Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {stressTest.scenarios.map((scen) => {
          const isActive = activeScenarioId === scen.scenarioId;
          return (
            <button
              key={scen.scenarioId}
              type="button"
              onClick={() => setActiveScenarioId(scen.scenarioId)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                  : "bg-gray-50 dark:bg-secondary/40 text-gray-700 dark:text-foreground border-gray-100 dark:border-border hover:border-purple-400"
              }`}
            >
              {scen.verdict === "SAFE" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {scen.verdict === "WARNING" && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              {scen.verdict === "CRITICAL" && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              <span>{scen.title}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Details */}
      <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-secondary/30 border border-gray-100 dark:border-border/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-foreground">
              {selectedScenario.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">
              {selectedScenario.description}
            </p>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              selectedScenario.verdict === "SAFE"
                ? "bg-emerald-500/10 border-emerald-500/30 text-[#00A859]"
                : selectedScenario.verdict === "WARNING"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                : "bg-rose-500/10 border-rose-500/30 text-rose-600"
            }`}
          >
            {selectedScenario.verdict}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-gray-100 dark:border-border space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
              {isFr ? "Réserves Restantes" : "Reserve Buffer"}
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-foreground block">
              {selectedScenario.liquidBufferMonths} {isFr ? "Mois" : "Months"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-gray-100 dark:border-border space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
              {isFr ? "Flux Mensuel Libre" : "Free Cash Flow"}
            </span>
            <span className={`text-sm font-bold block ${selectedScenario.monthlyFreeCashFlow >= 0 ? "text-[#00A859]" : "text-rose-600"}`}>
              {format(selectedScenario.monthlyFreeCashFlow, { fromCurrency: "KES" })} / mo
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-gray-100 dark:border-border space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
              {isFr ? "Décalage d'Objectif" : "Goal Delay"}
            </span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400 block">
              +{selectedScenario.goalDelayDays} {isFr ? "jours" : "days"}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed pt-1">
          ➔ {selectedScenario.explanation}
        </p>
      </div>
    </div>
  );
}
