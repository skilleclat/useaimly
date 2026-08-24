"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { BaselineFinancialProfile } from "@/lib/finance";
import { AimlyDecisionEngine } from "@/components/decision-engine/AimlyDecisionEngine";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function DecideStudioPage() {
  const { user } = useAuth();
  const { language } = useI18n();
  const isFr = language === "fr";
  const searchParams = useSearchParams();
  const initialQuery =
    searchParams.get("q") ||
    (isFr
      ? "J'envisage d'acheter un ordinateur à 2 000 € pour mon activité."
      : "I'm thinking about buying a $2,000 laptop for my business.");

  // Baseline Financial Profile
  const baselineProfile: BaselineFinancialProfile = useMemo(
    () => ({
      liquidSavings: 4840,
      incomes: [
        { name: "Primary Income", amount: 4500, frequency: "MONTHLY", reliability: "STABLE", isActive: true },
      ],
      expenses: [
        { name: "Essential Living", amount: 2300, frequency: "MONTHLY", isFixed: true },
      ],
      debts: [],
      commitments: [],
      goals: [
        {
          id: "business-goal",
          title: isFr ? "Objectif Lancement Entreprise" : "Business Launch Goal",
          targetAmount: 25000,
          currentAmount: 12000,
          targetDate: "2027-12-31",
          priority: "HIGH",
          status: "ACTIVE",
        },
      ],
    }),
    [isFr]
  );

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8 animate-fadeIn font-sans pb-12 sm:pb-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border/60 pb-4 sm:pb-5 text-left">
        <div className="space-y-1">
          <Link
            href="/app"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isFr ? "Retour à l'Accueil" : "Return Home"}</span>
          </Link>
          <h1 className="text-xl sm:text-4xl font-black text-foreground tracking-tight">
            The Aimly Decision Engine
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {isFr
              ? "Avant de vous engager dans une décision financière, voyez ce qui se passe après."
              : "Before you commit to a financial decision, see what happens next."}
          </p>
        </div>

        <div className="flex items-center">
          <Link
            href="/app/decisions"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-border/80 bg-secondary/50 text-foreground hover:bg-secondary transition-all min-h-[38px]"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
            <span>{isFr ? "Mémoire des Décisions" : "Decision Vault"}</span>
          </Link>
        </div>
      </div>

      {/* THE SIGNATURE AIMLY DECISION ENGINE EXPERIENCE */}
      <AimlyDecisionEngine
        baselineProfile={baselineProfile}
        initialQuery={initialQuery}
      />
    </div>
  );
}
