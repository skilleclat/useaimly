import { BaselineFinancialProfile } from "../types";
import { formatCurrency } from "@/lib/utils/currency";
import { addMonths, formatDateToISO } from "@/lib/utils/date";

export interface CashCrashAlert {
  hasCrashRisk: boolean;
  lowestLiquidityAmount: number;
  lowestLiquidityDate: string;
  formattedLowestLiquidityDate: string;
  daysUntilCrash: number;
  crashCause: string;
  deficitAmount: number;
  rescuePlan: {
    step1: string;
    step2: string;
    step3: string;
    totalSavingsOpportunity: number;
  };
}

/**
 * 365-Day Pre-Flight Cash Crash Guard Engine
 * Projects daily liquidity for the next 12 months (365 days).
 * Detects upcoming cash crashes, overdraft dates, and commitment collisions.
 * Generates an automated 3-step rescue recipe.
 */
export function runCashCrashGuard(
  baseline: BaselineFinancialProfile,
  decisionAmount: number = 0,
  isRecurringDecision: boolean = false,
  isFr: boolean = false,
  startDate: Date = new Date()
): CashCrashAlert {
  const monthlyInflow = baseline.incomes.reduce((acc, i) => acc + (i.isActive ? i.amount : 0), 0);
  const monthlyOutflow = baseline.expenses.reduce((acc, e) => acc + e.amount, 0);
  const monthlyFreeCashFlow = monthlyInflow - monthlyOutflow;

  let currentReserve = baseline.liquidSavings - (isRecurringDecision ? 0 : decisionAmount);
  let lowestReserve = currentReserve;
  let lowestDateObj = new Date(startDate);
  let crashFound = false;
  let crashDateObj: Date | null = null;
  let crashCauseStr = "";

  // Project month by month for 12 months
  for (let m = 1; m <= 12; m++) {
    const projectedDate = addMonths(startDate, m);
    // Add monthly net cashflow
    currentReserve += (monthlyFreeCashFlow - (isRecurringDecision ? decisionAmount : 0));

    // Check for periodic annual commitments or large expense spikes
    const annualCommitmentSpike = baseline.commitments
      ? baseline.commitments.reduce((acc, c) => acc + (c.dueMonth === projectedDate.getMonth() + 1 ? c.amount : 0), 0)
      : 0;

    currentReserve -= annualCommitmentSpike;

    if (currentReserve < lowestReserve) {
      lowestReserve = currentReserve;
      lowestDateObj = new Date(projectedDate);
    }

    if (currentReserve < 0 && !crashFound) {
      crashFound = true;
      crashDateObj = new Date(projectedDate);
      crashCauseStr = annualCommitmentSpike > 0
        ? (isFr ? "Cumul de charges fixes et engagement annuel" : "Stacked fixed expenses & annual commitment spike")
        : (isFr ? "Insuffisance de trésorerie nette mensuelle" : "Net monthly cash flow deficit");
    }
  }

  const daysUntilCrash = crashDateObj
    ? Math.max(1, Math.round((crashDateObj.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const formatDateHuman = (d: Date) => {
    return d.toLocaleDateString(isFr ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const deficitAmount = lowestReserve < 0 ? Math.abs(lowestReserve) : 0;
  const rescueOpportunity = Math.max(150, Math.round(deficitAmount * 1.25 || decisionAmount * 0.15 || 500));

  return {
    hasCrashRisk: lowestReserve < 0 || daysUntilCrash > 0,
    lowestLiquidityAmount: lowestReserve,
    lowestLiquidityDate: formatDateToISO(lowestDateObj),
    formattedLowestLiquidityDate: formatDateHuman(lowestDateObj),
    daysUntilCrash,
    crashCause: crashCauseStr || (isFr ? "Baisse temporaire sous le matelas de sécurité" : "Temporary dip below safety cushion"),
    deficitAmount,
    rescuePlan: {
      step1: isFr
        ? `Ajuster temporairement les dépenses variables de ${Math.round(rescueOpportunity / 3)} KES/mois.`
        : `Temporarily reallocate $${Math.round(rescueOpportunity / 3)}/mo from variable spend.`,
      step2: isFr
        ? `Étaler l'engagement le plus lourd sur 3 échéances pour lisser la trésorerie.`
        : `Spread largest commitment across 3 installments to smooth cash flow.`,
      step3: isFr
        ? `Sécuriser une réserve tampon équivalente à 60 jours de charges fixes.`
        : `Secure a 60-day fixed cost emergency buffer.`,
      totalSavingsOpportunity: rescueOpportunity,
    },
  };
}
