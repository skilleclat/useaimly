"use client";

import React, { useState, useMemo } from "react";
import { VerifiedDecisionData, runAimlyCoherenceCheck } from "@/lib/decision-engine/decision-validator";
import { generateVerifiedDecisionReportPDF } from "@/lib/decision-engine/verified-report-generator";
import { saveDecisionReportToVault, getReportsForDecision } from "@/lib/decision-engine/report-vault";
import { formatCurrency } from "@/lib/utils/currency";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  ShieldCheck,
  CheckCircle2,
  FileDown,
  Bookmark,
  Sparkles,
  Layers,
  ArrowRight,
  Clock,
  Printer,
  History,
  X,
} from "lucide-react";

interface VerifiedDecisionReportModalProps {
  data: VerifiedDecisionData;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function VerifiedDecisionReportModal({
  data,
  isOpen,
  onClose,
  onSaved,
}: VerifiedDecisionReportModalProps) {
  const { language } = useI18n();
  const isFr = language === "fr";
  const isSw = language === "sw";

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"PREVIEW" | "CHECKS" | "HISTORY">("PREVIEW");

  // Run the Aimly Coherence Check
  const verification = useMemo(() => {
    return runAimlyCoherenceCheck(data);
  }, [data]);

  // Existing report versions
  const reportHistory = useMemo(() => {
    return getReportsForDecision(data.decisionTitle);
  }, [data.decisionTitle, isSaved]);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      const doc = generateVerifiedDecisionReportPDF(data, verification, language as any);
      doc.save(`UseAimly_Verified_Report_${data.decisionTitle.replace(/\s+/g, "_")}_${data.reportId}.pdf`);
      // Auto-save to vault upon download
      saveDecisionReportToVault(data, verification);
      setIsSaved(true);
      if (onSaved) onSaved();
    } catch (e) {
      console.error("PDF generation error:", e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToVault = () => {
    saveDecisionReportToVault(data, verification);
    setIsSaved(true);
    if (onSaved) onSaved();
  };

  const fmt = (val: number) => formatCurrency(val, data.currency);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn font-sans">
      <div className="w-full max-w-4xl rounded-t-3xl sm:rounded-3xl bg-card border border-border/90 p-5 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto text-left">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {verification.status}
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs text-muted-foreground font-mono">
                  ID: {data.reportId}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-foreground">
                {isFr ? "Rapport d'Analyse Décisionnelle Vérifiée" : isSw ? "Ripoti Iliyothibitishwa ya Maamuzi" : "Verified Financial Decision Report"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("PREVIEW")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "PREVIEW"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {isFr ? "Aperçu du Rapport" : isSw ? "Muhtasari wa Ripoti" : "Report Preview"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CHECKS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "CHECKS"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isFr ? "Contrôles de Cohérence (6/6)" : "Coherence Checks (6/6)"}</span>
          </button>

          {reportHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("HISTORY")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "HISTORY"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{isFr ? `Versions (${reportHistory.length})` : `History (v${data.version})`}</span>
            </button>
          )}
        </div>

        {/* TAB 1: REPORT PREVIEW */}
        {activeTab === "PREVIEW" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Executive Verdict Box */}
            <div className="p-5 rounded-2xl bg-secondary/40 border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                  {isFr ? "VERDICT EXÉCUTIF VÉRIFIÉ" : "VERIFIED EXECUTIVE VERDICT"}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  Aimly Coherence Score: {verification.overallScore}/100
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-foreground">
                {data.calculatedImpact.verdictHeadline}
              </h3>
              <p className="text-xs text-muted-foreground">
                {data.calculatedImpact.primaryReason}
              </p>
            </div>

            {/* Financial Impact Comparison Matrix */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase font-bold text-muted-foreground block">
                {isFr ? "Tableau d'Impact Avant / Après" : "Financial Impact Matrix (Before vs After)"}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                  <span className="text-[10px] font-mono text-muted-foreground block">LIQUID RESERVES</span>
                  <span className="text-base font-black font-mono block">{fmt(data.calculatedImpact.postDecisionCash)}</span>
                  <span className="text-[10px] text-muted-foreground block">-{fmt(data.amount)} outlay</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                  <span className="text-[10px] font-mono text-muted-foreground block">LIVING BUFFER</span>
                  <span className="text-base font-black font-mono block">{data.calculatedImpact.postDecisionRunway} mos</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold">
                    {data.calculatedImpact.postDecisionRunway < 3.0 ? "Below 3.0 target" : "Safe zone"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                  <span className="text-[10px] font-mono text-muted-foreground block">GOAL DELAY</span>
                  <span className="text-base font-black font-mono text-rose-500 block">+{data.calculatedImpact.goalDelayDays}d</span>
                  <span className="text-[10px] text-muted-foreground block truncate">{data.baseline.primaryGoalTitle}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                  <span className="text-[10px] font-mono text-muted-foreground block">MONTHLY PRESSURE</span>
                  <span className="text-base font-black font-mono block">+{data.calculatedImpact.monthlyPressurePercent}%</span>
                  <span className="text-[10px] text-emerald-600 block font-bold">+{fmt(data.baseline.netFreeCashFlow)}/mo FCF</span>
                </div>
              </div>
            </div>

            {/* Grounded Narrative Summary */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-2 text-xs">
              <span className="font-mono uppercase font-bold text-primary block">
                {isFr ? "Synthèse de l'Analyse Stratégique" : "Grounded Strategic Synthesis"}
              </span>
              <p className="text-muted-foreground leading-relaxed">
                {data.narrative.executiveSummary ||
                  `Executing this purchase of ${fmt(data.amount)} leaves ${fmt(data.calculatedImpact.postDecisionCash)} in liquid reserves (${data.calculatedImpact.postDecisionRunway} months of fixed living buffer). It shifts your primary goal "${data.baseline.primaryGoalTitle}" by approximately +${data.calculatedImpact.goalDelayDays} days.`}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: COHERENCE CHECKS (6/6) */}
        {activeTab === "CHECKS" && (
          <div className="space-y-3 animate-fadeIn">
            <span className="text-xs font-mono uppercase font-bold text-muted-foreground block">
              {isFr ? "Résultats de l'Audit Déterministe d'Aimly" : "Aimly Coherence & Validation Audit"}
            </span>

            <div className="space-y-2.5">
              {verification.checks.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-secondary/40 border border-border/70 flex items-start gap-3 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold text-foreground">
                      {isFr ? c.nameFr : c.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {isFr ? c.notesFr : c.notes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REPORT HISTORY */}
        {activeTab === "HISTORY" && (
          <div className="space-y-3 animate-fadeIn">
            <span className="text-xs font-mono uppercase font-bold text-muted-foreground block">
              {isFr ? "Versions Archivées du Rapport" : "Stored Decision Report Versions"}
            </span>

            <div className="space-y-2">
              {reportHistory.map((rpt) => (
                <div
                  key={rpt.id}
                  className="p-3.5 rounded-2xl bg-secondary/40 border border-border/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">v{rpt.version}</span>
                      <span className="font-bold text-foreground">{rpt.decisionTitle}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{fmt(rpt.amount)}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(rpt.createdAt).toLocaleString(isFr ? "fr-FR" : "en-US")} • Status: {rpt.status}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const doc = generateVerifiedDecisionReportPDF(rpt.data, rpt.verification, language as any);
                      doc.save(`UseAimly_Report_${rpt.decisionTitle}_v${rpt.version}.pdf`);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download v{rpt.version}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToVault}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                isSaved
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-secondary hover:bg-secondary/80 border-border text-foreground"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-emerald-500 text-emerald-500" : ""}`} />
              <span>{isSaved ? (isFr ? "Enregistré dans le Coffre (v" + data.version + ")" : "Saved to Vault (v" + data.version + ")") : (isFr ? "Enregistrer la Version" : "Save Report Version")}</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isDownloading}
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
          >
            <FileDown className="w-4 h-4" />
            <span>{isDownloading ? (isFr ? "Génération en cours..." : "Generating PDF...") : (isFr ? "Télécharger le Rapport Vérifié (PDF)" : "Download Verified Report (PDF)")}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
