"use client";

import React, { useState } from "react";
import { CurrencyCode } from "@/lib/types/finance";
import { downloadTrajectoryCSV, downloadTrajectoryExcel } from "@/lib/utils/multi-format-exporter";
import { generateExecutiveBriefingPDF } from "@/lib/utils/pdf-report-generator";
import { BaselineFinancialProfile } from "@/lib/finance";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface ExportTrajectoryCardProps {
  currency?: CurrencyCode;
}

export function ExportTrajectoryCard({ currency = "KES" }: ExportTrajectoryCardProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const mockBaseline: BaselineFinancialProfile = {
    liquidSavings: 180000,
    incomes: [{ name: "Salary", amount: 180000, frequency: "MONTHLY", reliability: "STABLE", isActive: true }],
    expenses: [{ name: "Housing", amount: 45000, frequency: "MONTHLY", isFixed: true }],
    debts: [],
    commitments: [],
    goals: [{ id: "g1", title: "Start a business", targetAmount: 500000, currentAmount: 260000, targetDate: "2027-12-31", priority: "HIGH", status: "ACTIVE" }],
  };

  function handleExportPDF() {
    setDownloadingFormat("PDF");
    generateExecutiveBriefingPDF(mockBaseline, null, currency);
    setTimeout(() => setDownloadingFormat(null), 2500);
  }

  function handleExportExcel() {
    setDownloadingFormat("EXCEL");
    downloadTrajectoryExcel(currency);
    setTimeout(() => setDownloadingFormat(null), 2000);
  }

  function handleExportCSV() {
    setDownloadingFormat("CSV");
    downloadTrajectoryCSV(currency);
    setTimeout(() => setDownloadingFormat(null), 2000);
  }

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-sm font-sans animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Download className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-extrabold text-foreground tracking-tight">
              Export 5-to-10 Year Trajectory Forecast
            </h3>
            <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-0.5 border border-emerald-500/20 uppercase">
              Multi-Format Ready
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Download your deterministic financial trajectory, goal milestones, and cashflow projections in executive formats.
          </p>
        </div>
      </div>

      {/* Export Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* PDF HD Button */}
        <button
          onClick={handleExportPDF}
          className="p-5 rounded-2xl border border-border/80 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60 transition-all flex flex-col items-start gap-3 group text-left shadow-xs"
        >
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
              <span>Executive PDF HD</span>
              {downloadingFormat === "PDF" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              2-Page Executive Briefing report with curves &amp; strategy summary.
            </p>
          </div>
        </button>

        {/* Excel Button */}
        <button
          onClick={handleExportExcel}
          className="p-5 rounded-2xl border border-border/80 bg-secondary/30 hover:border-emerald-600/50 hover:bg-secondary/60 transition-all flex flex-col items-start gap-3 group text-left shadow-xs"
        >
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <span>Microsoft Excel (.tsv)</span>
              {downloadingFormat === "EXCEL" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Structured spreadsheet formatted for Excel data tables &amp; charts.
            </p>
          </div>
        </button>

        {/* CSV Button */}
        <button
          onClick={handleExportCSV}
          className="p-5 rounded-2xl border border-border/80 bg-secondary/30 hover:border-amber-500/50 hover:bg-secondary/60 transition-all flex flex-col items-start gap-3 group text-left shadow-xs"
        >
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0 group-hover:scale-105 transition-transform">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground group-hover:text-amber-500 transition-colors flex items-center gap-1.5">
              <span>Raw CSV Data (.csv)</span>
              {downloadingFormat === "CSV" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Raw comma-separated dataset for custom financial modeling.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
