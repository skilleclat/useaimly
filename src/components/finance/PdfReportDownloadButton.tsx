"use client";

import React, { useState } from "react";
import { Download, FileText, Check, Sparkles } from "lucide-react";
import { PDFReportData, downloadPDFReport } from "@/lib/utils/pdf-report-generator";

interface PdfReportDownloadButtonProps {
  data: PDFReportData;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  label?: string;
}

export function PdfReportDownloadButton({
  data,
  className = "",
  variant = "primary",
  label = "Download Executive PDF Dossier",
}: PdfReportDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      downloadPDFReport(data);
      setHasDownloaded(true);
      setTimeout(() => setHasDownloaded(false), 4000);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const variantStyles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20"
      : variant === "secondary"
      ? "bg-card border border-border/80 text-foreground hover:bg-secondary/70 shadow-xs"
      : "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20";

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition-all cursor-pointer ${variantStyles} ${className}`}
      title="Download complete PDF Executive Financial Analysis"
    >
      {hasDownloaded ? (
        <>
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>PDF Dossier Saved!</span>
        </>
      ) : isGenerating ? (
        <>
          <Sparkles className="w-4 h-4 animate-spin shrink-0" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 shrink-0" />
          <span>{label}</span>
          <Download className="w-3.5 h-3.5 opacity-70 shrink-0" />
        </>
      )}
    </button>
  );
}
