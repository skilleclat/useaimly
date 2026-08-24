"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  FileSearch,
  CheckCircle2,
  X,
  Sparkles,
  AlertCircle,
  Camera,
  Shield,
  Layers,
  ArrowRight,
} from "lucide-react";
import { RawUploadedFile } from "@/lib/documents/document-ingestion-service";

export interface DocumentUploadDropzoneProps {
  onFilesSelected: (files: RawUploadedFile[]) => void;
  isProcessing?: boolean;
  processingStep?: string;
  className?: string;
}

export function DocumentUploadDropzone({
  onFilesSelected,
  isProcessing = false,
  processingStep = "Reading your documents...",
  className = "",
}: DocumentUploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<RawUploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(Array.from(e.target.files));
    }
  };

  const processFileList = (files: File[]) => {
    const rawList: RawUploadedFile[] = [];

    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const textContent = typeof reader.result === "string" ? reader.result : "";
        const rawFile: RawUploadedFile = {
          name: f.name,
          size: f.size,
          type: f.type,
          textContent,
        };
        rawList.push(rawFile);
        if (rawList.length === files.length) {
          setSelectedFiles((prev) => [...prev, ...rawList]);
          onFilesSelected([...selectedFiles, ...rawList]);
        }
      };
      reader.readAsText(f);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesSelected(updated);
  };

  const handleSamplePaste = (type: "car" | "mortgage" | "loan") => {
    let sampleText = "";
    let sampleName = "Vehicle_Financing_Quote.pdf";
    if (type === "car") {
      sampleName = "Vehicle_Financing_Quote.pdf";
      sampleText = `VEHICLE FINANCING & PURCHASE QUOTATION
Asset: 2024 Hybrid Crossover
Total Purchase Price: KES 500,000
Required Down Payment: KES 100,000
Financed Principal: KES 400,000
Monthly Installment: KES 18,500
Term Duration: 36 Months
Annual Interest Rate: 12.5% p.a.
Early Termination Penalty: 2.5% settlement fee applies on early exit.
Taxes & Preparation: KES 15,000 processing charges included.`;
    } else if (type === "mortgage") {
      sampleName = "Property_Mortgage_Offer.pdf";
      sampleText = `MORTGAGE OFFER LETTER & FINANCING TERMS
Property Valuation: KES 4,500,000
Down Payment (20%): KES 900,000
Principal Financed: KES 3,600,000
Monthly Payment: KES 48,000
Tenure: 180 Months (15 Years)
Interest Rate: 11.8% p.a. (Variable subject to Central Bank base rate)
Insurance & Property Tax: KES 60,000 annual obligation.`;
    } else {
      sampleName = "Personal_Loan_Agreement.pdf";
      sampleText = `PERSONAL UNSECURED LOAN CONTRACT
Principal Borrowed: KES 250,000
Monthly Repayment: KES 12,200
Tenure: 24 Months
APR: 14.0%
Processing Fee: KES 5,000 upfront.
Early Payoff: Permitted after 6 months with zero penalty fee.`;
    }

    const sampleFile: RawUploadedFile = {
      name: sampleName,
      size: sampleText.length * 2,
      type: "application/pdf",
      textContent: sampleText,
    };
    setSelectedFiles([sampleFile]);
    onFilesSelected([sampleFile]);
  };

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      {/* Upload Dropzone Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center transition-all cursor-pointer overflow-hidden ${
          dragOver
            ? "border-[#00A859] bg-[#00A859]/5 scale-[0.99]"
            : "border-border/80 bg-card/60 hover:border-[#00A859]/60 hover:bg-secondary/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#00A859]/10 text-[#00A859] flex items-center justify-center shadow-sm">
            {isProcessing ? (
              <Sparkles className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-foreground">
              Analyze with documents
            </h4>
            <p className="text-xs text-muted-foreground font-medium max-w-md">
              Upload documents that may help Aimly understand your decision.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 text-[11px] font-mono font-bold text-muted-foreground border border-border/60">
            <span>PDF • Contracts • Reports • Statements • Quotes</span>
          </div>
        </div>

        {/* Real-time Processing Animation State */}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 p-4">
            <div className="w-10 h-10 rounded-full border-3 border-[#00A859] border-t-transparent animate-spin" />
            <div className="text-center space-y-1">
              <span className="text-sm font-bold text-foreground block">
                {processingStep}
              </span>
              <span className="text-xs text-muted-foreground block font-mono">
                Extracting numerical terms &amp; checking risk clauses...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Files Chips */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider block">
            Loaded Documents ({selectedFiles.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 rounded-xl bg-secondary/80 border border-border/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-[#00A859]" />
                <span className="max-w-[200px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(idx);
                  }}
                  className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instant Demo Quotation Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-muted-foreground font-medium">Or test with demo quote:</span>
        <button
          type="button"
          onClick={() => handleSamplePaste("car")}
          className="rounded-lg border border-border/80 bg-card px-2.5 py-1 text-foreground/80 hover:border-[#00A859] hover:text-[#00A859] transition-all text-[11px] font-medium"
        >
          🚗 Vehicle Financing Quote (KES 500k)
        </button>
        <button
          type="button"
          onClick={() => handleSamplePaste("mortgage")}
          className="rounded-lg border border-border/80 bg-card px-2.5 py-1 text-foreground/80 hover:border-[#00A859] hover:text-[#00A859] transition-all text-[11px] font-medium"
        >
          🏡 Mortgage Offer (KES 4.5M)
        </button>
        <button
          type="button"
          onClick={() => handleSamplePaste("loan")}
          className="rounded-lg border border-border/80 bg-card px-2.5 py-1 text-foreground/80 hover:border-[#00A859] hover:text-[#00A859] transition-all text-[11px] font-medium"
        >
          💳 Personal Loan (KES 250k)
        </button>
      </div>
    </div>
  );
}
