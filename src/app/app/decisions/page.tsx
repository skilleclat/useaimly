"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  History,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Calendar,
  DollarSign,
  Plus,
} from "lucide-react";
import {
  getSavedDecisions,
  reevaluateDecision,
  FinancialDecisionRecord,
  BaselineFinancialProfile,
} from "@/lib/finance";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function DecisionMemoryPage() {
  const { format } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";

  const [records, setRecords] = useState<FinancialDecisionRecord[]>([]);
  const [reanalysisMessage, setReanalysisMessage] = useState<string | null>(null);

  // Baseline Financial Profile
  const currentBaseline: BaselineFinancialProfile = useMemo(
    () => ({
      liquidSavings: 220000, // Updated baseline savings
      incomes: [
        { name: "Primary Income", amount: 195000, frequency: "MONTHLY", reliability: "STABLE", isActive: true },
      ],
      expenses: [
        { name: "Essential Living", amount: 110000, frequency: "MONTHLY", isFixed: true },
      ],
      debts: [],
      commitments: [
        { title: "Motor Insurance", amount: 45000, frequency: "ANNUAL", category: "INSURANCE" },
      ],
      goals: [
        {
          id: "primary-goal",
          title: "Buy a home deposit",
          targetAmount: 500000,
          currentAmount: 220000,
          targetDate: "2027-12-31",
          priority: "HIGH",
          status: "ACTIVE",
        },
      ],
    }),
    []
  );

  useEffect(() => {
    const loaded = getSavedDecisions();
    if (loaded.length === 0) {
      // Provide demo seed decisions if empty
      const demoRecord: FinancialDecisionRecord = {
        id: "demo-car-1",
        title: "Toyota Vehicle Purchase",
        amount: 500000,
        currency: "KES",
        isRecurring: false,
        verdict: "MANAGEABLE",
        executiveDecision: "ADJUST",
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        lastAnalyzedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        baselineSnapshot: {
          liquidSavings: 180000,
          monthlyFreeCashFlow: 68000,
        },
        simulationResult: {} as any,
      };
      setRecords([demoRecord]);
    } else {
      setRecords(loaded);
    }
  }, []);

  const handleReevaluate = (record: FinancialDecisionRecord) => {
    const result = reevaluateDecision(record, currentBaseline);
    setReanalysisMessage(result.statusShiftText);
    setRecords((prev) =>
      prev.map((r) => (r.id === record.id ? result.updatedRecord : r))
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[#00A859] text-xs font-mono font-bold uppercase tracking-wider">
            <History className="w-3.5 h-3.5" />
            <span>{isFr ? "Mémoire des Décisions" : "Decision Memory & Tracking"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {isFr ? "Historique des Décisions" : "Your Decision Vault"}
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            {isFr
              ? "Suivez l'évolution de vos décisions financières et réévaluez leur pertinence."
              : "Track past analyzed financial decisions and re-evaluate them as your income and savings grow."}
          </p>
        </div>

        <Link
          href="/app/decide"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00A859] hover:bg-[#00964F] text-white font-bold text-xs py-3 px-5 shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isFr ? "Nouvelle Décision" : "Analyze New Decision"}</span>
        </Link>
      </div>

      {/* Re-analysis Status Notification Banner */}
      {reanalysisMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-700 dark:text-emerald-300 font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00A859] shrink-0" />
            <span>{reanalysisMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setReanalysisMessage(null)}
            className="text-gray-400 hover:text-foreground text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Decision Vault List */}
      <div className="space-y-4">
        {records.map((record) => {
          const formattedAmount = format(record.amount, { fromCurrency: "KES" });
          const formattedDate = new Date(record.createdAt).toLocaleDateString(
            language === "fr" ? "fr-FR" : "en-US",
            { month: "short", day: "numeric", year: "numeric" }
          );

          return (
            <div
              key={record.id}
              className="p-6 rounded-3xl border border-border/80 bg-card space-y-4 shadow-sm hover:border-[#00A859]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                      {formattedDate}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-[11px] font-mono font-bold text-primary">
                      {record.isRecurring ? (isFr ? "Engagement Mensuel" : "Recurring Obligation") : (isFr ? "Achat Ponctuel" : "One-off Outlay")}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground">
                    {record.title} — {formattedAmount}
                  </h3>
                </div>

                {/* Verdict Badge */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3.5 py-1.5 rounded-full font-extrabold text-xs tracking-wide flex items-center gap-1.5 border ${
                      record.executiveDecision === "GO"
                        ? "bg-emerald-500/10 text-[#00A859] border-emerald-500/30"
                        : record.executiveDecision === "ADJUST"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {record.executiveDecision === "GO" && <CheckCircle2 className="w-4 h-4" />}
                    {record.executiveDecision === "ADJUST" && <AlertTriangle className="w-4 h-4" />}
                    {record.executiveDecision === "WAIT" && <XCircle className="w-4 h-4" />}
                    <span>{record.executiveDecision}</span>
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-4 text-xs">
                <span className="text-muted-foreground font-medium">
                  {isFr ? "Est-ce toujours une bonne décision ?" : "Is this still a good decision?"}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleReevaluate(record)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#00A859]" />
                    <span>{isFr ? "Ré-analyser" : "Re-Analyze"}</span>
                  </button>

                  <Link
                    href={`/app/decide?q=${encodeURIComponent(record.title + " " + record.amount)}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
                  >
                    <span>{isFr ? "Ouvrir" : "Open"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
