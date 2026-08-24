/**
 * Document Decision Calculator
 * Performs 100% deterministic financial calculations for document-backed decisions.
 * Computes cash-flow impact, long-term financing interest, goal trajectory delay,
 * opportunity costs, and the explainable Aimly Decision Score™ (0 to 100).
 */

import {
  DeterministicFinancialCalculations,
  AimlyDecisionScore,
  DecisionAssessmentStatus,
  UserFinancialContextInput,
  DocumentFact,
  DocumentObligation,
  DocumentRisk,
  MissingVariable,
} from "../../types/document-intelligence";
import { CurrencyCode } from "../../types/finance";

export interface CalculationInput {
  currency: CurrencyCode;
  userContext: UserFinancialContextInput;
  facts: DocumentFact[];
  obligations: DocumentObligation[];
  risks: DocumentRisk[];
  missingVariables: MissingVariable[];
}

export class DocumentDecisionCalculator {
  /**
   * Executes deterministic financial calculations across baseline and proposed decision.
   */
  public calculate(input: CalculationInput): {
    calculations: DeterministicFinancialCalculations;
    score: AimlyDecisionScore;
  } {
    const { currency, userContext, facts, obligations, risks, missingVariables } = input;

    // 1. Extract or Benchmark Key Numerical Parameters
    const priceFact = facts.find((f) => f.category === "PRICE" && f.numericValue);
    const depositFact = facts.find((f) => f.category === "DOWN_PAYMENT" && f.numericValue);
    const monthlyFact = facts.find((f) => f.category === "MONTHLY_PAYMENT" && f.numericValue);
    const termFact = facts.find((f) => f.category === "TERM_DURATION" && f.numericValue);
    const aprFact = facts.find((f) => f.category === "INTEREST_RATE" && f.numericValue);

    const totalNominalPrice = priceFact?.numericValue || 500000;
    const downPayment = depositFact?.numericValue || 0;
    const termMonths = termFact?.numericValue || 36;
    const annualPercentageRate = aprFact?.numericValue || 12.0;

    let principalFinanced = Math.max(0, totalNominalPrice - downPayment);
    let monthlyPayment = monthlyFact?.numericValue || 0;

    if (monthlyPayment === 0 && principalFinanced > 0) {
      // Standard amortization: M = P * [r(1+r)^n] / [(1+r)^n – 1]
      const monthlyRate = (annualPercentageRate / 100) / 12;
      if (monthlyRate > 0 && termMonths > 0) {
        monthlyPayment = Math.round(
          (principalFinanced * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
            (Math.pow(1 + monthlyRate, termMonths) - 1)
        );
      } else {
        monthlyPayment = Math.round(principalFinanced / Math.max(1, termMonths));
      }
    }

    const totalFinancingOutlay = downPayment + (monthlyPayment * termMonths);
    const totalInterestAndFees = Math.max(0, totalFinancingOutlay - totalNominalPrice);

    // 2. Baseline User Context Metrics
    const monthlyIncome = userContext.monthlyIncome || 180000;
    const monthlyExpenses = userContext.monthlyExpenses || 112000;
    const liquidSavings = userContext.liquidSavings || 180000;
    const existingDebts = userContext.existingDebtsMonthly || 0;
    const monthlyFreeCashFlowBefore = monthlyIncome - (monthlyExpenses + existingDebts);

    // 3. Post-Decision Impact
    const cashReserveBefore = liquidSavings;
    const cashReserveAfter = Math.max(0, cashReserveBefore - downPayment);
    const monthlyFreeCashFlowAfter = monthlyFreeCashFlowBefore - monthlyPayment;

    const monthlyObligationsAfter = monthlyExpenses + existingDebts + monthlyPayment;
    const reserveFloorMonthsAfter =
      monthlyObligationsAfter > 0
        ? Number((cashReserveAfter / monthlyObligationsAfter).toFixed(1))
        : 12;

    const debtToIncomeRatioAfter =
      monthlyIncome > 0
        ? Number((((existingDebts + monthlyPayment) / monthlyIncome) * 100).toFixed(1))
        : 0;

    // 4. Goal Trajectory Delay & Catch-Up
    const goalTarget = userContext.primaryGoalTarget || 500000;
    const goalSaved = userContext.primaryGoalSaved || 180000;
    const remainingGoalGap = Math.max(0, goalTarget - goalSaved);

    let goalDelayDays = 0;
    let goalDelayMonths = 0;
    let recoveryMonthlyAmount = 0;

    if (remainingGoalGap > 0 && monthlyFreeCashFlowBefore > 0) {
      const baselineMonthsToGoal = Math.ceil(remainingGoalGap / monthlyFreeCashFlowBefore);
      if (monthlyFreeCashFlowAfter > 0) {
        const simulatedMonthsToGoal = Math.ceil(remainingGoalGap / monthlyFreeCashFlowAfter);
        goalDelayMonths = Math.max(0, simulatedMonthsToGoal - baselineMonthsToGoal);
        goalDelayDays = goalDelayMonths * 30;
      } else {
        goalDelayMonths = 99;
        goalDelayDays = 999;
      }
      recoveryMonthlyAmount = Math.round(downPayment / Math.max(1, baselineMonthsToGoal)) + monthlyPayment;
    }

    // 5. 10-Year Opportunity Cost Calculation (Compounded at 8% annual return)
    // Formula: Total Outlay * (1 + 0.08)^10
    const opportunityCostInvestment10Yr = Math.round(totalFinancingOutlay * Math.pow(1 + 0.08, 10));

    const calculations: DeterministicFinancialCalculations = {
      currency,
      totalNominalPrice,
      downPayment,
      principalFinanced,
      monthlyPayment,
      termMonths,
      totalFinancingOutlay,
      totalInterestAndFees,
      annualPercentageRate,
      cashReserveBefore,
      cashReserveAfter,
      reserveFloorMonthsAfter,
      monthlyFreeCashFlowBefore,
      monthlyFreeCashFlowAfter,
      debtToIncomeRatioAfter,
      goalDelayDays,
      goalDelayMonths,
      recoveryMonthlyAmount,
      opportunityCostInvestment10Yr,
      breakEvenMonths: termMonths,
    };

    // 6. AIMLY DECISION SCORE™ CALCULATION (0 - 100)
    // Dimension 1: Affordability (25 pts)
    let affordabilityScore = 25;
    if (cashReserveBefore < downPayment) {
      affordabilityScore = 0;
    } else if (monthlyFreeCashFlowAfter < 0) {
      affordabilityScore = 5;
    } else if (monthlyPayment > monthlyIncome * 0.35) {
      affordabilityScore = 12;
    } else if (monthlyPayment > monthlyIncome * 0.2) {
      affordabilityScore = 18;
    }

    // Dimension 2: Financial Pressure & Cash Flow (20 pts)
    let financialPressureScore = 20;
    if (monthlyFreeCashFlowAfter < monthlyIncome * 0.1) {
      financialPressureScore = 8;
    } else if (monthlyFreeCashFlowAfter < monthlyIncome * 0.2) {
      financialPressureScore = 14;
    }

    // Dimension 3: Long-Term Commitment & Interest Drag (20 pts)
    let longTermScore = 20;
    const interestRatio = totalInterestAndFees / Math.max(1, totalNominalPrice);
    if (interestRatio > 0.4) {
      longTermScore = 8;
    } else if (interestRatio > 0.2) {
      longTermScore = 14;
    }

    // Dimension 4: Flexibility Defense (15 pts)
    let flexibilityScore = 15;
    if (reserveFloorMonthsAfter < 1.0) {
      flexibilityScore = 2;
    } else if (reserveFloorMonthsAfter < 3.0) {
      flexibilityScore = 8;
    }

    // Dimension 5: Risk Exposure (10 pts)
    let riskScore = 10;
    const criticalRisks = risks.filter((r) => r.severity === "CRITICAL" || r.severity === "HIGH");
    if (criticalRisks.length >= 2) {
      riskScore = 2;
    } else if (criticalRisks.length === 1) {
      riskScore = 6;
    }

    // Dimension 6: Information Completeness (10 pts)
    let completenessScore = 10;
    if (missingVariables.length >= 3) {
      completenessScore = 2;
    } else if (missingVariables.length >= 1) {
      completenessScore = 6;
    }

    const overallScore = Math.max(
      0,
      Math.min(
        100,
        affordabilityScore +
          financialPressureScore +
          longTermScore +
          flexibilityScore +
          riskScore +
          completenessScore
      )
    );

    let status: DecisionAssessmentStatus = "PROCEED_WITH_CONFIDENCE";
    let statusHeadline = "Proceed with Confidence";
    const keyDrivers: string[] = [];

    if (monthlyFreeCashFlowAfter < 0 || cashReserveBefore < downPayment) {
      status = "HIGH_RISK_DEFICIT";
      statusHeadline = "High Risk — Liquidity or Cash Flow Deficit";
      keyDrivers.push("Monthly cash flow turns negative or upfront cash is insufficient.");
    } else if (completenessScore < 6) {
      status = "NEEDS_MORE_INFORMATION";
      statusHeadline = "Needs More Information to Assess Confidently";
      keyDrivers.push("Critical terms such as interest type or fees are unconfirmed in documents.");
    } else if (overallScore < 70 || reserveFloorMonthsAfter < 3.0 || goalDelayDays > 45) {
      status = "PROCEED_WITH_CAUTION";
      statusHeadline = "Proceed with Caution — Reserve Cushion Under Target";
      if (reserveFloorMonthsAfter < 3.0) {
        keyDrivers.push(`Liquid reserve buffer drops to ${reserveFloorMonthsAfter} months (below recommended 3.0 months).`);
      }
      if (goalDelayDays > 30) {
        keyDrivers.push(`Primary goal completion shifts back by +${goalDelayDays} days.`);
      }
    } else {
      status = "PROCEED_WITH_CONFIDENCE";
      statusHeadline = "Proceed with Confidence — Balance Sheet Resilient";
      keyDrivers.push("Monthly free cash flow absorbs ongoing payment with safe buffer intact.");
    }

    let explanation = `Aimly Decision Score of ${overallScore}/100. `;
    if (status === "PROCEED_WITH_CONFIDENCE") {
      explanation += `Your financial profile absorbs this commitment while preserving ${reserveFloorMonthsAfter} months of living defense.`;
    } else if (status === "PROCEED_WITH_CAUTION") {
      explanation += `The monthly commitment is manageable but reduces operating flexibility and shifts goal timelines by +${goalDelayDays} days.`;
    } else if (status === "NEEDS_MORE_INFORMATION") {
      explanation += `Key contractual variables remain unconfirmed. Review the suggested questions before signing.`;
    } else {
      explanation += `This decision creates structural cash flow strain or breaches critical safety reserves.`;
    }

    const score: AimlyDecisionScore = {
      overallScore,
      status,
      statusHeadline,
      scoreBreakdown: {
        affordability: affordabilityScore,
        financialPressure: financialPressureScore,
        longTermCommitment: longTermScore,
        flexibilityDefense: flexibilityScore,
        riskExposure: riskScore,
        informationCompleteness: completenessScore,
      },
      explanation,
      keyDrivers,
    };

    return {
      calculations,
      score,
    };
  }
}

export const documentDecisionCalculator = new DocumentDecisionCalculator();
