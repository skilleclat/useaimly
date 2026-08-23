"use client";

import React from "react";
import { Sparkles, CheckCircle2, ShieldCheck, Zap, X, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

export interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTier?: (tierId: string) => void;
}

export function ProUpgradeModal({ isOpen, onClose, onSelectTier }: ProUpgradeModalProps) {
  const { language } = useI18n();
  const isFr = language === "fr";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00A859] text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#00A859] font-bold block">
                {isFr ? "Monétisation Équitable" : "Fair Value Pricing"}
              </span>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-foreground">
                {isFr ? "Débloquez les Analyses Décisionnelles Pro" : "Unlock Full Decision Intelligence"}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Value Proposition */}
        <p className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground font-medium leading-relaxed">
          {isFr
            ? "Préservez des milliers de dollars d'erreurs financières impulsives. Choisissez l'accès illimité ou une analyse à l'acte."
            : "UseAimly helps you avoid expensive money mistakes before you commit. Choose unlimited access or a single-decision pass."}
        </p>

        {/* Pricing Tier Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Decision Pass */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-border bg-gray-50/70 dark:bg-secondary/30 space-y-4 flex flex-col justify-between hover:border-[#00A859] transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-gray-500 block">
                {isFr ? "Accès Ponctuel" : "Single Decision Pass"}
              </span>
              <div className="text-2xl font-black text-gray-900 dark:text-foreground">
                $4.99 <span className="text-xs text-gray-500 font-normal">/ {isFr ? "analyse" : "decision"}</span>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                  <span>{isFr ? "1 analyse de décision complète" : "1 deep decision simulation"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                  <span>{isFr ? "Calculateur Max Safe Price" : "Max Safe Price calculation"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                  <span>{isFr ? "Rapport PDF téléchargeable" : "Downloadable PDF report"}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectTier?.("DECISION_PASS");
                onClose();
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-card border border-gray-300 dark:border-border hover:border-[#00A859] text-gray-900 dark:text-foreground font-bold text-xs py-3 shadow-xs transition-all cursor-pointer"
            >
              <span>{isFr ? "Acheter 1 Pass ($4.99)" : "Get Decision Pass ($4.99)"}</span>
            </button>
          </div>

          {/* Option 2: UseAimly Pro (Recommended) */}
          <div className="p-5 rounded-2xl border-2 border-[#00A859] bg-[#062317] text-white space-y-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-[#00A859] bg-[#00A859]/20 px-2 py-0.5 rounded-full">
                  {isFr ? "Recommandé" : "Best Value"}
                </span>
              </div>

              <div className="text-2xl font-black text-white">
                $9 <span className="text-xs text-gray-300 font-normal">/ {isFr ? "mois" : "month"}</span>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-gray-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                  <span>{isFr ? "Simulations Decision Twin Illimitées" : "Unlimited Decision Twin simulations"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                  <span>{isFr ? "Scanner de Devis / Offres OCR" : "Document & offer intelligence"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                  <span>{isFr ? "Test de Résistance 5 Scénarios" : "5-scenario stress testing"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                  <span>{isFr ? "Mémoire & Suivi des Décisions" : "Decision Memory & tracking"}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectTier?.("PRO_MONTHLY");
                onClose();
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A859] hover:bg-[#00964F] text-white font-bold text-xs py-3 shadow-md transition-all cursor-pointer"
            >
              <span>{isFr ? "Rejoindre UseAimly Pro ($9/mo)" : "Start UseAimly Pro ($9/mo)"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
