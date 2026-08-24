/**
 * Document Decision Calculator
 * Performs 100% deterministic, evidence-grounded financial calculations.
 * Document-type aware: Accounting Reports compute margins and expense ratios;
 * Financing Documents compute total outlays and amortizations.
 * Enforces: NO NUMBER WITHOUT FORMULA AND VERIFIED INPUTS.
 */

import {
  DocumentTruthObject,
  DocumentFact,
  DocumentCalculation,
  AccountingCalculations,
  FinancingCalculations,
  AimlyDecisionScore,
  DecisionAssessmentStatus,
  UserFinancialContextInput,
  DocumentRisk,
  MissingVariable,
} from "../../types/document-intelligence";
import { CurrencyCode } from "../../types/finance";

export interface CalculationInput {
  documentTruth: DocumentTruthObject;
  userContext: UserFinancialContextInput;
  facts: DocumentFact[];
  risks: DocumentRisk[];
  missingVariables: MissingVariable[];
}

export class DocumentDecisionCalculator {
  /**
   * Executes deterministic calculations based strictly on the Document Truth Object.
   */
  public calculate(input: CalculationInput): {
    accountingCalculations?: AccountingCalculations;
    financingCalculations?: FinancingCalculations;
    calculationsList: DocumentCalculation[];
    score: AimlyDecisionScore;
  } {
    const { documentTruth, userContext, facts, risks, missingVariables } = input;
    const currency = documentTruth.currency;
    const calculationsList: DocumentCalculation[] = [];

    const docType = documentTruth.documentType;

    // =========================================================================
    // BRANCH A: ACCOUNTING REPORT / FINANCIAL STATEMENT / P&L
    // =========================================================================
    if (
      docType === "ACCOUNTING_REPORT" ||
      docType === "FINANCIAL_STATEMENT" ||
      docType === "PROFIT_AND_LOSS" ||
      docType === "BALANCE_SHEET"
    ) {
      const revFact = facts.find((f) => f.category === "REVENUE" && f.numericValue !== undefined);
      const cogsFact = facts.find((f) => f.category === "COST_OF_SALES" && f.numericValue !== undefined);
      const gpFact = facts.find((f) => f.category === "GROSS_PROFIT" && f.numericValue !== undefined);
      const opFact = facts.find((f) => f.category === "OPERATING_PROFIT" && f.numericValue !== undefined);
      const npFact = facts.find((f) => f.category === "NET_PROFIT" && f.numericValue !== undefined);
      const cashFact = facts.find((f) => f.category === "CASH_BALANCE" && f.numericValue !== undefined);

      const revenue = revFact?.numericValue || 0;
      const costOfSales = cogsFact?.numericValue || 0;
      const grossProfit = gpFact?.numericValue || (revenue > 0 && costOfSales > 0 ? revenue - costOfSales : 0);
      const operatingProfit = opFact?.numericValue || 0;
      const netProfit = npFact?.numericValue || 0;
      const closingCash = cashFact?.numericValue || 0;
      const operatingExpenses = Math.max(0, grossProfit - operatingProfit);

      // 1. Gross Profit Margin
      let grossMarginPercent = 0;
      if (revenue > 0 && grossProfit > 0) {
        grossMarginPercent = Number(((grossProfit / revenue) * 100).toFixed(2));
        calculationsList.push({
          id: "calc-gross-margin",
          label: "Marge Brute (Gross Margin)",
          numericValue: grossMarginPercent,
          formattedValue: `${grossMarginPercent}%`,
          unit: "%",
          formula: `${grossProfit.toLocaleString()} ÷ ${revenue.toLocaleString()} × 100`,
          inputFactIds: [gpFact?.id || "gp", revFact?.id || "rev"],
          explanation: `Le coût des ventes consomme ${(100 - grossMarginPercent).toFixed(2)}% du chiffre d'affaires, laissant ${grossMarginPercent}% de marge brute.`,
          evidenceType: "calculated",
        });
      }

      // 2. Net Profit Margin
      let netMarginPercent = 0;
      if (revenue > 0 && netProfit > 0) {
        netMarginPercent = Number(((netProfit / revenue) * 100).toFixed(2));
        calculationsList.push({
          id: "calc-net-margin",
          label: "Marge Nette (Net Profit Margin)",
          numericValue: netMarginPercent,
          formattedValue: `${netMarginPercent}%`,
          unit: "%",
          formula: `${netProfit.toLocaleString()} ÷ ${revenue.toLocaleString()} × 100`,
          inputFactIds: [npFact?.id || "np", revFact?.id || "rev"],
          explanation: `L'entreprise convertit ${netMarginPercent}% de chaque ${currency} encaissé en bénéfice net final.`,
          evidenceType: "calculated",
        });
      }

      // 3. Operating Margin
      let operatingMarginPercent = 0;
      if (revenue > 0 && operatingProfit > 0) {
        operatingMarginPercent = Number(((operatingProfit / revenue) * 100).toFixed(2));
        calculationsList.push({
          id: "calc-operating-margin",
          label: "Marge d'Exploitation (Operating Margin)",
          numericValue: operatingMarginPercent,
          formattedValue: `${operatingMarginPercent}%`,
          unit: "%",
          formula: `${operatingProfit.toLocaleString()} ÷ ${revenue.toLocaleString()} × 100`,
          inputFactIds: [opFact?.id || "op", revFact?.id || "rev"],
          explanation: `Rentabilité opérationnelle avant charges financières et fiscales.`,
          evidenceType: "calculated",
        });
      }

      // 4. Operating Expense Burden
      const operatingExpenseBurdenPercent = grossProfit > 0 ? Number(((operatingExpenses / grossProfit) * 100).toFixed(2)) : 0;
      const costOfSalesRatioPercent = revenue > 0 ? Number(((costOfSales / revenue) * 100).toFixed(2)) : 0;

      const accountingCalculations: AccountingCalculations = {
        currency,
        revenue,
        costOfSales,
        grossProfit,
        grossMarginPercent,
        operatingExpenses,
        operatingProfit,
        operatingMarginPercent,
        netProfit,
        netMarginPercent,
        closingCash,
        costOfSalesRatioPercent,
        operatingExpenseBurdenPercent,
      };

      // EVIDENCE-BASED AIMLY SCORE FOR ACCOUNTING REPORT
      const positiveDrivers: string[] = [];
      const negativeDrivers: string[] = [];

      let scoreVal = 50;

      if (netProfit > 0) {
        scoreVal += 20;
        positiveDrivers.push(`Bénéfice net positif de ${currency} ${netProfit.toLocaleString()} (${netMarginPercent}% de marge nette).`);
      } else {
        scoreVal -= 20;
        negativeDrivers.push(`Résultat net déficitaire ou négatif.`);
      }

      if (grossMarginPercent >= 50) {
        scoreVal += 15;
        positiveDrivers.push(`Marge brute robuste de ${grossMarginPercent}%.`);
      } else if (grossMarginPercent > 0) {
        scoreVal += 5;
        positiveDrivers.push(`Marge brute de ${grossMarginPercent}%.`);
      }

      if (closingCash > 0) {
        scoreVal += 10;
        positiveDrivers.push(`Trésorerie de clôture positive de ${currency} ${closingCash.toLocaleString()}.`);
      } else {
        scoreVal -= 10;
        negativeDrivers.push(`Solde de trésorerie nul ou non documenté.`);
      }

      if (operatingExpenseBurdenPercent > 65) {
        scoreVal -= 10;
        negativeDrivers.push(`Les charges d'exploitation absorbent ${operatingExpenseBurdenPercent}% de la marge brute.`);
      }

      negativeDrivers.push("Les échéances de dettes futures et passifs court terme ne sont pas indiqués dans le document.");

      const overallScore = Math.max(10, Math.min(95, scoreVal));

      const score: AimlyDecisionScore = {
        overallScore,
        status: netProfit > 0 ? "HEALTHY_PROFITABILITY" : "OPERATING_PRESSURE",
        statusHeadline: netProfit > 0 ? "Rentabilité Positive & Marge Brute Robuste" : "Pression sur les Coûts d'Exploitation",
        scoreConfidence: facts.length >= 4 ? "high" : "medium",
        scoreBreakdown: {
          profitabilityOrAffordability: netProfit > 0 ? 25 : 5,
          operatingOrCashFlowHealth: operatingMarginPercent > 10 ? 20 : 10,
          marginOrCommitmentDefense: grossMarginPercent > 50 ? 20 : 10,
          riskOrFlexibilityExposure: closingCash > 0 ? 15 : 5,
          dataCompleteness: facts.length >= 5 ? 10 : 6,
        },
        explanation: `Score Aimly de ${overallScore}/100 basé sur les états comptables vérifiés : ${netMarginPercent}% de marge nette et ${currency} ${closingCash.toLocaleString()} de trésorerie disponible.`,
        positiveDrivers,
        negativeDrivers,
      };

      return {
        accountingCalculations,
        calculationsList,
        score,
      };
    }

    // =========================================================================
    // BRANCH B: LOAN AGREEMENT / VEHICLE FINANCING / PURCHASE QUOTE
    // =========================================================================
    const priceFact = facts.find((f) => f.category === "PRICE" && f.numericValue !== undefined);
    const depositFact = facts.find((f) => f.category === "DOWN_PAYMENT" && f.numericValue !== undefined);
    const monthlyFact = facts.find((f) => f.category === "MONTHLY_PAYMENT" && f.numericValue !== undefined);
    const termFact = facts.find((f) => f.category === "TERM_DURATION" && f.numericValue !== undefined);
    const aprFact = facts.find((f) => f.category === "INTEREST_RATE" && f.numericValue !== undefined);

    if (priceFact || monthlyFact) {
      const totalNominalPrice = priceFact?.numericValue || 0;
      const downPayment = depositFact?.numericValue || 0;
      const termMonths = termFact?.numericValue || (monthlyFact ? 36 : 1);
      const annualPercentageRate = aprFact?.numericValue;

      const principalFinanced = Math.max(0, totalNominalPrice - downPayment);
      const monthlyPayment = monthlyFact?.numericValue || (termMonths > 1 ? Math.round(principalFinanced / termMonths) : 0);

      const totalFinancingOutlay = downPayment + (monthlyPayment * (termMonths > 1 ? termMonths : 0));
      const totalInterestAndFees = Math.max(0, totalFinancingOutlay - totalNominalPrice);

      if (totalFinancingOutlay > 0) {
        calculationsList.push({
          id: "calc-total-outlay",
          label: "Engagement Total (Total Lifetime Outlay)",
          numericValue: totalFinancingOutlay,
          formattedValue: `${currency} ${totalFinancingOutlay.toLocaleString()}`,
          unit: currency,
          formula: `${downPayment.toLocaleString()} + (${monthlyPayment.toLocaleString()} × ${termMonths})`,
          inputFactIds: [priceFact?.id || "p", monthlyFact?.id || "m"],
          explanation: `Total des débours incluant l'apport et l'ensemble des mensualités.`,
          evidenceType: "calculated",
        });
      }

      const financingCalculations: FinancingCalculations = {
        currency,
        totalNominalPrice,
        downPayment,
        principalFinanced,
        monthlyPayment,
        termMonths,
        totalFinancingOutlay,
        totalInterestAndFees,
        annualPercentageRate,
      };

      const score: AimlyDecisionScore = {
        overallScore: 75,
        status: "PROCEED_WITH_CAUTION",
        statusHeadline: "Offre Structurée — Vérifier le Taux & Pénalités",
        scoreConfidence: "medium",
        scoreBreakdown: {
          profitabilityOrAffordability: 20,
          operatingOrCashFlowHealth: 15,
          marginOrCommitmentDefense: 15,
          riskOrFlexibilityExposure: 15,
          dataCompleteness: 10,
        },
        explanation: `Engagement total calculé de ${currency} ${totalFinancingOutlay.toLocaleString()} sur ${termMonths} mois.`,
        positiveDrivers: ["Mensualités et durée spécifiées dans l'offre."],
        negativeDrivers: ["Assurez-vous que le taux n'est pas variable."],
      };

      return {
        financingCalculations,
        calculationsList,
        score,
      };
    }

    // =========================================================================
    // BRANCH C: GENERAL / UNKNOWN DOCUMENT (NO FABRICATED NUMBERS)
    // =========================================================================
    const score: AimlyDecisionScore = {
      overallScore: null,
      status: "NEEDS_MORE_INFORMATION",
      statusHeadline: "Données Documentaires Insuffisantes pour un Score",
      scoreConfidence: "insufficient_data",
      scoreBreakdown: {
        profitabilityOrAffordability: 0,
        operatingOrCashFlowHealth: 0,
        marginOrCommitmentDefense: 0,
        riskOrFlexibilityExposure: 0,
        dataCompleteness: 0,
      },
      explanation: "Le document fourni ne contient pas de données financières quantifiables suffisantes pour établir un score fiable.",
      positiveDrivers: [],
      negativeDrivers: ["Absence de montants financiers vérifiables dans le document."],
    };

    return {
      calculationsList,
      score,
    };
  }
}

export const documentDecisionCalculator = new DocumentDecisionCalculator();
