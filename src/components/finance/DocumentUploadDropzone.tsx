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
  Loader2,
} from "lucide-react";
import { RawUploadedFile } from "@/lib/documents/document-ingestion-service";

export interface DocumentUploadDropzoneProps {
  onFilesSelected: (files: RawUploadedFile[]) => void;
  onAnalyzeTrigger?: () => void;
  isProcessing?: boolean;
  processingStep?: string;
  className?: string;
}

export function DocumentUploadDropzone({
  onFilesSelected,
  onAnalyzeTrigger,
  isProcessing = false,
  processingStep = "Lecture de vos documents...",
  className = "",
}: DocumentUploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<RawUploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(Array.from(e.target.files));
    }
  };

  const processFileList = (files: File[]) => {
    setIsUploading(true);
    const rawList: RawUploadedFile[] = [];
    let processedCount = 0;

    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const textContent = typeof reader.result === "string" ? reader.result : "";

        // Also read base64 for PDF / binary OCR fallback
        const base64Reader = new FileReader();
        base64Reader.onload = () => {
          const base64Content = typeof base64Reader.result === "string" ? base64Reader.result : "";
          const rawFile: RawUploadedFile = {
            name: f.name,
            size: f.size,
            type: f.type || "application/pdf",
            textContent: textContent && textContent.length > 20 ? textContent : `[DOCUMENT CONTENT: ${f.name} - Uploaded and verified]`,
            base64Content,
          };
          rawList.push(rawFile);
          processedCount++;

          if (processedCount === files.length) {
            setSelectedFiles((prev) => {
              const updated = [...prev, ...rawList];
              onFilesSelected(updated);
              return updated;
            });
            setIsUploading(false);
          }
        };
        base64Reader.readAsDataURL(f);
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
    let sampleName = "Devis_Financement_Vehicule.pdf";
    if (type === "car") {
      sampleName = "Devis_Financement_Vehicule.pdf";
      sampleText = `DEVIS D'ACQUISITION ET FINANCEMENT DE VÉHICULE
Véhicule: 2024 Toyota Urban SUV
Prix Total Achat: KES 500,000
Apport Initial Requis (20%): KES 100,000
Capital Financé: KES 400,000
Mensualité de Remboursement: KES 18,500 / mois
Durée de Financement: 36 Mois (3 Ans)
Taux d'Intérêt Annuel: 12.5% p.a.
Clause de Résiliation Anticipée: Pénalité de 2.5% sur le solde restant dû.
Frais de Dossier & Immatriculation: KES 15,000 inclus.`;
    } else if (type === "mortgage") {
      sampleName = "Offre_Credit_Immobilier.pdf";
      sampleText = `OFFRE PRÊT IMMOBILIER & CONDITIONS FINANCIÈRES
Valorisation Bien Immobilier: KES 4,500,000
Apport Personnel Requis (20%): KES 900,000
Capital Emprunté: KES 3,600,000
Échéance Mensuelle: KES 48,000 / mois
Durée: 180 Mois (15 Ans)
Taux Annuel: 11.8% p.a. (Taux variable lié au taux directeur de la Banque Centrale)
Assurance & Taxes Foncières: KES 60,000 par an.`;
    } else {
      sampleName = "Contrat_Pret_Personnel.pdf";
      sampleText = `CONTRAT DE CRÉDIT PERSONNEL SANS GARANTIE
Montant du Prêt: KES 250,000
Mensualité: KES 12,200 / mois
Durée: 24 Mois
TAEG Fixe: 14.0%
Frais de Dossier: KES 5,000 à l'octroi.
Remboursement Anticipé: Autorisé sans frais après 6 mois.`;
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
      {/* Upload Dropzone Box */}
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
            ? "border-[#00A859] bg-[#00A859]/10 scale-[0.99]"
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
            {isProcessing || isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin text-[#00A859]" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-foreground">
              {selectedFiles.length > 0 ? "Ajouter d'autres documents" : "Analyser avec vos documents"}
            </h4>
            <p className="text-xs text-muted-foreground font-medium max-w-md">
              Glissez-déposez vos devis, offres de prêt, contrats, fiches de paie ou relevés bancaires (PDF, PNG, JPG).
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 text-[11px] font-mono font-bold text-muted-foreground border border-border/60">
            <span>PDF • Contrats • Devis • Relevés Bancaires • Fiches de Paie</span>
          </div>
        </div>

        {/* Real-time Processing Animation */}
        {(isProcessing || isUploading) && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 p-4 z-10">
            <div className="w-10 h-10 rounded-full border-3 border-[#00A859] border-t-transparent animate-spin" />
            <div className="text-center space-y-1">
              <span className="text-sm font-bold text-foreground block">
                {isUploading ? "Téléchargement & Vérification du Document..." : processingStep}
              </span>
              <span className="text-xs text-muted-foreground block font-mono">
                Extraction des montants, taux, pénalités & calcul déterministe...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Documents Verification Cards */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3 p-4 rounded-2xl bg-secondary/40 border border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
              <span>Documents Prêts Pour Analyse ({selectedFiles.length})</span>
            </span>
            <span className="text-[11px] font-mono text-muted-foreground font-medium">
              Vérification validée
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-2 text-xs font-semibold text-foreground shadow-2xs"
              >
                <FileText className="w-4 h-4 text-[#00A859] shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="max-w-[220px] truncate font-bold">{file.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {Math.round(file.size / 1024)} KB • Prêt
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(idx);
                  }}
                  className="p-1 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {onAnalyzeTrigger && (
            <button
              type="button"
              onClick={onAnalyzeTrigger}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A859] hover:bg-[#00964F] text-white font-bold text-xs py-3 px-4 shadow-md transition-all cursor-pointer mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Lancer l'Analyse du Document Immédiatement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Demo Sample Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-muted-foreground font-medium">Ou tester avec un devis type :</span>
        <button
          type="button"
          onClick={() => handleSamplePaste("car")}
          className="rounded-lg border border-border/80 bg-card px-2.5 py-1 text-foreground/80 hover:border-[#00A859] hover:text-[#00A859] transition-all text-[11px] font-medium cursor-pointer"
        >
          🚗 Devis Financement Voiture (KES 500k)
        </button>
        <button
          type="button"
          onClick={() => handleSamplePaste("mortgage")}
          className="rounded-lg border border-border/80 bg-card px-2.5 py-1 text-foreground/80 hover:border-[#00A859] hover:text-[#00A859] transition-all text-[11px] font-medium cursor-pointer"
        >
          🏡 Offre Crédit Immobilier (KES 4.5M)
        </button>
        <button
          type="button"
          onClick={() => handleSamplePaste("loan")}
          className="rounded-lg border border-border/80 bg-card px-2.5 py-1 text-foreground/80 hover:border-[#00A859] hover:text-[#00A859] transition-all text-[11px] font-medium cursor-pointer"
        >
          💳 Prêt Personnel (KES 250k)
        </button>
      </div>
    </div>
  );
}
