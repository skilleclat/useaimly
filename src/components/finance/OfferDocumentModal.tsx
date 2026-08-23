"use client";

import React, { useState } from "react";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileSearch,
} from "lucide-react";
import { parseOfferDocument, ExtractedOfferDetails } from "@/lib/nlp/document-offer-parser";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";

export interface OfferDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOffer: (details: ExtractedOfferDetails) => void;
}

export function OfferDocumentModal({ isOpen, onClose, onConfirmOffer }: OfferDocumentModalProps) {
  const { format } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";

  const [documentText, setDocumentText] = useState("");
  const [extractedDetails, setExtractedDetails] = useState<ExtractedOfferDetails | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Editable Form Fields (Human Confirmation Step)
  const [editedPrice, setEditedPrice] = useState(500000);
  const [editedDownPayment, setEditedDownPayment] = useState(100000);
  const [editedMonthly, setEditedMonthly] = useState(18500);
  const [editedTerm, setEditedTerm] = useState(36);

  if (!isOpen) return null;

  const handleScanText = () => {
    if (!documentText.trim()) return;
    setIsScanning(true);

    setTimeout(() => {
      const details = parseOfferDocument(documentText);
      setExtractedDetails(details);
      setEditedPrice(details.totalPrice);
      setEditedDownPayment(details.downPayment);
      setEditedMonthly(details.monthlyPayment);
      setEditedTerm(details.termMonths);
      setIsScanning(false);
    }, 600);
  };

  const handleSamplePaste = (type: "car" | "mortgage" | "loan") => {
    let sample = "";
    if (type === "car") {
      sample = "VEHICLE FINANCING OFFER\nVehicle Price: KES 500,000\nDeposit Required: KES 100,000\nFinanced Amount: KES 400,000\nMonthly Installment: KES 18,500\nDuration: 36 Months\nInterest Rate: 12.5% p.a.";
    } else if (type === "mortgage") {
      sample = "MORTGAGE OFFER LETTER\nProperty Purchase Price: KES 4,500,000\nDown Payment (20%): KES 900,000\nLoan Principal: KES 3,600,000\nMonthly Payment: KES 48,000\nTerm: 180 Months (15 Years)\nInterest: 11.8%";
    } else {
      sample = "PERSONAL LOAN QUOTE\nLoan Amount: KES 250,000\nMonthly Repayment: KES 12,200\nTenure: 24 Months\nProcessing Fee: KES 5,000";
    }
    setDocumentText(sample);
  };

  const handleFinalConfirm = () => {
    if (!extractedDetails) return;
    const finalDetails: ExtractedOfferDetails = {
      ...extractedDetails,
      totalPrice: editedPrice,
      downPayment: editedDownPayment,
      financedAmount: Math.max(0, editedPrice - editedDownPayment),
      monthlyPayment: editedMonthly,
      termMonths: editedTerm,
    };
    onConfirmOffer(finalDetails);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-foreground">
                {isFr ? "Scanner un Document / Offre Financière" : "Scan Offer or Financial Quote"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">
                {isFr ? "Extraction intelligente avec confirmation humaine obligée" : "Extract key terms with human verification before analyzing"}
              </p>
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

        {/* Step 1: Input / Paste Offer Text */}
        {!extractedDetails ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 dark:text-foreground block">
                {isFr ? "Collez le texte du devis ou du contrat d'offre :" : "Paste offer letter, quote, or financing contract text:"}
              </label>

              <textarea
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                rows={5}
                placeholder={
                  isFr
                    ? "Collez ici les conditions du devis automobile, de l'emprunt bancaire ou de l'offre d'achat..."
                    : "Paste vehicle quote, bank loan offer, or purchase quotation terms here..."
                }
                className="w-full rounded-2xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background p-4 text-xs font-mono text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/30"
              />
            </div>

            {/* Quick Sample Paste Actions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase text-gray-400 font-bold block">
                {isFr ? "Ou essayez un exemple d'offre :" : "Or try a sample offer text:"}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSamplePaste("car")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-border hover:border-[#00A859] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-gray-700 dark:text-foreground transition-all"
                >
                  {isFr ? "Devis Voiture 500k" : "Car Offer (500k)"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSamplePaste("mortgage")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-border hover:border-[#00A859] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-gray-700 dark:text-foreground transition-all"
                >
                  {isFr ? "Offre Crédit Immo 4.5M" : "Mortgage Offer (4.5M)"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSamplePaste("loan")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-border hover:border-[#00A859] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-gray-700 dark:text-foreground transition-all"
                >
                  {isFr ? "Prêt Personnel 250k" : "Personal Loan (250k)"}
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={!documentText.trim() || isScanning}
              onClick={handleScanText}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00A859] hover:bg-[#00964F] disabled:opacity-50 text-white font-bold py-3.5 px-6 shadow-md transition-all cursor-pointer"
            >
              {isScanning ? (
                <span>{isFr ? "Analyse du document..." : "Scanning Document..."}</span>
              ) : (
                <>
                  <span>{isFr ? "Extraire les Conditions de l'Offre" : "Extract Offer Terms"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Step 2: Human Confirmation & Verification Form */
          <div className="space-y-5 animate-fadeIn">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-700 dark:text-amber-300 font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
              <span>
                {isFr
                  ? "Vérification requise : Veuillez confirmer ces montants avant de lancer la simulation."
                  : "Verification step: Confirm extracted offer terms before calculating financial decision impact."}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    {isFr ? "Prix Total de l'Achat (KES)" : "Total Purchase Price (KES)"}
                  </label>
                  <input
                    type="number"
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-border p-3 text-sm font-bold text-gray-900 dark:text-foreground bg-gray-50 dark:bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    {isFr ? "Apport Initial / Dépôt (KES)" : "Down Payment / Deposit (KES)"}
                  </label>
                  <input
                    type="number"
                    value={editedDownPayment}
                    onChange={(e) => setEditedDownPayment(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-border p-3 text-sm font-bold text-gray-900 dark:text-foreground bg-gray-50 dark:bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    {isFr ? "Mensualité Proposée (KES/mois)" : "Proposed Monthly Payment (KES/mo)"}
                  </label>
                  <input
                    type="number"
                    value={editedMonthly}
                    onChange={(e) => setEditedMonthly(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-border p-3 text-sm font-bold text-gray-900 dark:text-foreground bg-gray-50 dark:bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    {isFr ? "Durée de l'Engagement (Mois)" : "Term Duration (Months)"}
                  </label>
                  <input
                    type="number"
                    value={editedTerm}
                    onChange={(e) => setEditedTerm(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-border p-3 text-sm font-bold text-gray-900 dark:text-foreground bg-gray-50 dark:bg-background"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExtractedDetails(null)}
                className="w-1/3 rounded-2xl border border-gray-200 dark:border-border font-bold text-xs py-3.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary transition-all"
              >
                {isFr ? "Recommencer" : "Scan Again"}
              </button>

              <button
                type="button"
                onClick={handleFinalConfirm}
                className="w-2/3 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00A859] hover:bg-[#00964F] text-white font-bold text-xs py-3.5 shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isFr ? "Valider & Lancer la Simulation" : "Confirm Terms & Analyze"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
