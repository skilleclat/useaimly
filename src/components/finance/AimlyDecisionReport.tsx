"use client";

import React, { useState } from "react";
import {
  AimlyIntelligenceReport,
  GroundedChatMessage,
} from "@/lib/types/document-intelligence";
import { formatCurrency } from "@/lib/utils/currency";
import { generateAimlyDecisionPDF } from "@/lib/documents/aimly-pdf-generator";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Lock,
  ArrowRight,
  Send,
  MessageSquare,
  FileSearch,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Sliders,
  Scale,
  ShieldAlert,
  Download,
  FileDown,
} from "lucide-react";

export interface AimlyDecisionReportProps {
  report: AimlyIntelligenceReport;
  className?: string;
}

export function AimlyDecisionReport({ report, className = "" }: AimlyDecisionReportProps) {
  const {
    currency,
    whatThisMeansForYou,
    theBigPicture,
    score,
    whatMattersMost,
    financialImpact,
    whatMightIBeMissing,
    scenarios,
    comparison,
    context,
  } = report;

  const [activeTab, setActiveTab] = useState<"overview" | "missing" | "scenarios" | "compare" | "chat">("overview");
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0]?.id || "");
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [chatMessages, setChatMessages] = useState<GroundedChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "aimly",
      text: `Bonjour ! J'ai analysé votre décision "${context.userDecisionText}" ainsi que vos documents. Posez-moi vos questions sur la faisabilité, les clauses cachées, le coût total réel ou les questions à poser avant de signer.`,
      timestamp: "Just now",
      suggestedFollowUps: [
        "Puis-je me le permettre financièrement ?",
        "Quels sont les plus gros risques cachés ?",
        "Combien cela va-t-il me coûter au total ?",
        "Quelles questions poser avant de signer ?",
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const handleDownloadPDF = () => {
    setIsDownloadingPDF(true);
    try {
      const doc = generateAimlyDecisionPDF(report, "fr");
      const filename = `Aimly_Rapport_Decision_${(context.documents[0]?.name || "Analyse").replace(/\.[^/.]+$/, "")}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const selectedScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  const handleSendMessage = async (queryText?: string) => {
    const q = queryText || chatInput;
    if (!q.trim() || isAsking) return;

    const userMsg: GroundedChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: "Just now",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAsking(true);

    try {
      const res = await fetch("/api/decisions/chat-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, report }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, data.message]);
      } else {
        // Fallback local processing
        const fallbackMsg: GroundedChatMessage = {
          id: `aimly-${Date.now()}`,
          sender: "aimly",
          text: `Regarding "${q}": Based on your verified figures, this commitment requires ${formatCurrency(context.calculations.monthlyPayment, currency)}/mo, leaving your liquid reserve cushion at ${context.calculations.reserveFloorMonthsAfter} months. Review the "What might I be missing" section for critical questions to ask before signing.`,
          timestamp: "Just now",
          citations: [
            {
              provenance: "DETERMINISTIC_CALCULATION",
              documentName: context.documents[0]?.name || "Document",
              excerpt: `Monthly payment: ${formatCurrency(context.calculations.monthlyPayment, currency)}`,
            },
          ],
        };
        setChatMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAsking(false);
    }
  };

  // Score Colors
  const scoreBadgeColor =
    score.status === "PROCEED_WITH_CONFIDENCE"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
      : score.status === "PROCEED_WITH_CAUTION"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
      : score.status === "NEEDS_MORE_INFORMATION"
      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";

  return (
    <div className={`space-y-8 font-sans animate-fadeIn ${className}`}>
      {/* 1. INSTANT 5-SECOND ANSWER & VERDICT */}
      <section className="rounded-3xl border-2 border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
              Aimly Decision Intelligence
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00A859] hover:bg-[#00964F] text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingPDF ? "Génération PDF..." : "Télécharger Rapport PDF"}</span>
            </button>

            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold font-mono ${scoreBadgeColor}`}>
              <span>Score: {score.overallScore}/100</span>
              <span>•</span>
              <span>{score.statusHeadline}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
            What this means for you
          </h2>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight leading-snug">
            {whatThisMeansForYou}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
          {theBigPicture}
        </p>
      </section>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/60">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "overview"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card text-muted-foreground hover:text-foreground border border-border/60"
          }`}
        >
          1. What Matters Most &amp; Impact
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("missing")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "missing"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card text-muted-foreground hover:text-foreground border border-border/60"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>🔍 What might I be missing?</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("scenarios")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "scenarios"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card text-muted-foreground hover:text-foreground border border-border/60"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Explore Scenarios (What-If)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("compare")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "compare"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card text-muted-foreground hover:text-foreground border border-border/60"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Compare Options</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "chat"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card text-muted-foreground hover:text-foreground border border-border/60"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask Your Documents</span>
        </button>
      </div>

      {/* TAB 1: WHAT MATTERS MOST & FINANCIAL IMPACT */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-fadeIn">
          {/* What Matters Most Cards Grid */}
          <section className="space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>What Matters Most</span>
              <span className="text-xs font-normal text-muted-foreground font-mono">
                ({whatMattersMost.length} Key Findings)
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {whatMattersMost.map((card) => (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl border border-border/80 bg-card space-y-3 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase">
                        {card.title}
                      </span>
                      {card.badgeText && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-secondary text-foreground border border-border/60">
                          {card.badgeText}
                        </span>
                      )}
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-foreground">
                      {card.value}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {card.subtext}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>Source:</span>
                    <span className="font-semibold text-foreground truncate max-w-[140px]">
                      {card.sourceDocumentName || "Calculated"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Aimly Decision Score™ Explainability Card */}
          <section className="p-6 rounded-3xl border border-border/80 bg-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Aimly Decision Score™ Breakdown</span>
                  <span className="text-xs font-mono font-bold text-primary">
                    {score.overallScore}/100
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {score.explanation}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div className="space-y-1.5 p-3 rounded-xl bg-secondary/30 border border-border/60">
                <div className="flex justify-between text-muted-foreground font-semibold text-[11px]">
                  <span>Affordability</span>
                  <span className="text-foreground font-bold">{score.scoreBreakdown.affordability}/25</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00A859] rounded-full"
                    style={{ width: `${(score.scoreBreakdown.affordability / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-secondary/30 border border-border/60">
                <div className="flex justify-between text-muted-foreground font-semibold text-[11px]">
                  <span>Financial Pressure</span>
                  <span className="text-foreground font-bold">{score.scoreBreakdown.financialPressure}/20</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(score.scoreBreakdown.financialPressure / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-secondary/30 border border-border/60">
                <div className="flex justify-between text-muted-foreground font-semibold text-[11px]">
                  <span>Long-Term Drag</span>
                  <span className="text-foreground font-bold">{score.scoreBreakdown.longTermCommitment}/20</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(score.scoreBreakdown.longTermCommitment / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-secondary/30 border border-border/60">
                <div className="flex justify-between text-muted-foreground font-semibold text-[11px]">
                  <span>Flexibility Cushion</span>
                  <span className="text-foreground font-bold">{score.scoreBreakdown.flexibilityDefense}/15</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(score.scoreBreakdown.flexibilityDefense / 15) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-secondary/30 border border-border/60">
                <div className="flex justify-between text-muted-foreground font-semibold text-[11px]">
                  <span>Risk Exposure</span>
                  <span className="text-foreground font-bold">{score.scoreBreakdown.riskExposure}/10</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${(score.scoreBreakdown.riskExposure / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-secondary/30 border border-border/60">
                <div className="flex justify-between text-muted-foreground font-semibold text-[11px]">
                  <span>Completeness</span>
                  <span className="text-foreground font-bold">{score.scoreBreakdown.informationCompleteness}/10</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(score.scoreBreakdown.informationCompleteness / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Financial Impact Deep Dive Grid */}
          <section className="space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Comprehensive Financial Impact Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-2">
                <span className="text-muted-foreground font-mono font-bold uppercase block text-[10px]">
                  1. Immediate Impact (Day 1)
                </span>
                <div className="text-lg font-bold text-foreground">
                  {formatCurrency(financialImpact.immediateAmount, currency)}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {financialImpact.immediateImpact}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-2">
                <span className="text-muted-foreground font-mono font-bold uppercase block text-[10px]">
                  2. Monthly Cash Flow Drag
                </span>
                <div className="text-lg font-bold text-foreground">
                  {formatCurrency(financialImpact.monthlyAmount, currency)} / mo
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {financialImpact.monthlyImpact}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-2">
                <span className="text-muted-foreground font-mono font-bold uppercase block text-[10px]">
                  3. Total Lifetime Outlay
                </span>
                <div className="text-lg font-bold text-foreground">
                  {formatCurrency(financialImpact.totalCommitmentAmount, currency)}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {financialImpact.longTermImpact}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: WHAT MIGHT I BE MISSING? */}
      {activeTab === "missing" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl border-2 border-amber-500/30 bg-amber-500/5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-extrabold text-foreground">
                {whatMightIBeMissing.headline}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Before you sign or pay, ask these questions to avoid hidden penalties, floating rate increases, or unforeseen prepay fees.
            </p>
          </div>

          <div className="space-y-4">
            {whatMightIBeMissing.questionsToAsk.map((q) => (
              <div
                key={q.number}
                className="p-5 rounded-2xl border border-border/80 bg-card space-y-3 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {q.number}
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">
                      {q.question}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong>Context:</strong> {q.context}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      <strong>Why it matters:</strong> {q.whyItMatters}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {whatMightIBeMissing.hiddenClausesDetected.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/60">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Detected Contractual Risk Clauses</span>
              </h4>

              <div className="space-y-2">
                {whatMightIBeMissing.hiddenClausesDetected.map((risk) => (
                  <div
                    key={risk.id}
                    className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {risk.title}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300">
                        {risk.severity}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{risk.description}</p>
                    {risk.mitigationSuggestion && (
                      <p className="text-foreground font-semibold pt-1">
                        💡 Suggestion: {risk.mitigationSuggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCENARIOS (WHAT-IF) */}
      {activeTab === "scenarios" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Explore Alternative Financial Scenarios
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Test how unexpected income shifts, early repayments, or waiting periods affect your trajectory.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setActiveScenarioId(sc.id)}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                    activeScenarioId === sc.id
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border/80 bg-secondary/20 hover:border-border"
                  }`}
                >
                  <span className="text-xs font-bold text-foreground block">
                    {sc.title}
                  </span>
                  <span className="text-[11px] font-mono text-primary font-semibold block">
                    {sc.parameterName}
                  </span>
                </button>
              ))}
            </div>

            {selectedScenario && (
              <div className="p-5 rounded-2xl border border-border/70 bg-secondary/30 space-y-4 text-xs">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">
                    Scenario Outcome: {selectedScenario.title}
                  </h4>
                  <p className="text-muted-foreground">
                    {selectedScenario.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Monthly Shift</span>
                    <span className="font-bold text-foreground text-sm">
                      {selectedScenario.calculatedOutcome.monthlyPaymentDelta >= 0 ? "+" : ""}
                      {formatCurrency(selectedScenario.calculatedOutcome.monthlyPaymentDelta, currency)}/mo
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Outlay Delta</span>
                    <span className="font-bold text-foreground text-sm">
                      {selectedScenario.calculatedOutcome.totalCommitmentDelta >= 0 ? "+" : ""}
                      {formatCurrency(selectedScenario.calculatedOutcome.totalCommitmentDelta, currency)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Reserve Cushion</span>
                    <span className="font-bold text-foreground text-sm">
                      {selectedScenario.calculatedOutcome.reserveMonthsAfter} Months
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Goal Delay</span>
                    <span className="font-bold text-foreground text-sm">
                      +{selectedScenario.calculatedOutcome.goalDelayDays} Days
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-medium text-foreground">
                  <strong>Aimly Scenario Verdict:</strong> {selectedScenario.calculatedOutcome.verdict}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: COMPARE OPTIONS */}
      {activeTab === "compare" && comparison && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Side-by-Side Offer &amp; Strategy Comparison
              </h3>
              <p className="text-xs text-muted-foreground">
                {comparison.aimlysTake}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparison.options.map((opt) => (
                <div
                  key={opt.id}
                  className="p-5 rounded-2xl border border-border/80 bg-secondary/20 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground">
                        {opt.optionName}
                      </h4>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Score: {opt.aimlyScore}/100
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono border-t border-b border-border/40 py-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Upfront Deposit:</span>
                        <span className="font-bold text-foreground">{formatCurrency(opt.upfrontCost, currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Payment:</span>
                        <span className="font-bold text-foreground">{formatCurrency(opt.monthlyCost, currency)}/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Commitment:</span>
                        <span className="font-bold text-foreground">{formatCurrency(opt.totalCommitment, currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Financing Fees:</span>
                        <span className="font-bold text-foreground">{formatCurrency(opt.fees, currency)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                        ✅ {opt.primaryAdvantage}
                      </p>
                      <p className="text-amber-600 dark:text-amber-400 font-medium">
                        ⚠️ {opt.primaryDrawback}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/80 text-xs text-muted-foreground leading-relaxed">
              <strong>Aimly Trade-off Analysis:</strong> {comparison.tradeoffAnalysis}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ASK YOUR DOCUMENTS (GROUNDED CHAT) */}
      {activeTab === "chat" && (
        <div className="space-y-4 rounded-3xl border border-border/80 bg-card p-6 animate-fadeIn">
          <div className="space-y-1 border-b border-border/60 pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#00A859]" />
              <span>Ask Anything About This Decision &amp; Documents</span>
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Grounded exclusively in your uploaded documents and deterministic calculation models.
            </p>
          </div>

          {/* Chat Messages List */}
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col space-y-1 text-xs ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`p-4 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                      : "bg-secondary/70 border border-border/70 text-foreground rounded-tl-xs"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Grounded Citation Badges */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-border/40 flex flex-wrap gap-1.5 text-[10px] font-mono">
                      {msg.citations.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-background/80 text-muted-foreground border border-border/60"
                        >
                          📄 {c.provenance.replace(/_/g, " ")}: {c.documentName || "Document"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested Follow-up chips */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedFollowUps.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="px-2.5 py-1 rounded-lg bg-card border border-border/80 hover:border-primary/50 text-[11px] text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isAsking && (
              <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-secondary/50 text-xs text-muted-foreground font-mono">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Checking documents and calculating response...</span>
              </div>
            )}
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-2 border-t border-border/60"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything about this quote or decision..."
              className="flex-1 rounded-xl border border-border/80 bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={isAsking || !chatInput.trim()}
              className="px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 disabled:opacity-50 transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
