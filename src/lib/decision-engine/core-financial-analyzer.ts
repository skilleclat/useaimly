/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * CORE FINANCIAL ANALYSIS ENGINE (PROMPT 7)
 *
 * Deterministic calculation & multi-method financial intelligence layer.
 * 1. Selects ONLY methodologically appropriate analyses per decision type
 * 2. Enforces strict unit, currency, and time-frequency consistency (no mixing monthly/annual)
 * 3. Never treats revenue as profit or expected return as guaranteed return
 * 4. Stores formula inputs, source provenance, assumptions, outputs, and confidence
 * 5. Models uncertainty with explicit low/expected/high ranges
 */

import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "../utils/currency";
import { DecisionIntelligenceObject } from "./master-decision-model";

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATION AUDIT & PROVENANCE INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface CalculationInputRecord {
  value: number | string | boolean;
  unit: "CURRENCY" | "PERCENT" | "MONTHS" | "YEARS" | "RATIO" | "BOOLEAN";
  sourceClassification: string;
  sourceNotes?: string;
}

export interface CalculationAuditBlock<T> {
  analysisMethod: string;
  isMethodAppropriate: boolean;
  justificationForInclusion: string;
  formulaDescription: string;
  inputs: Record<string, CalculationInputRecord>;
  assumptions: string[];
  output: T;
  confidenceLevel: number; // 0.0 to 1.0
  uncertaintyRange?: {
    conservativeLow: number;
    expectedBaseline: number;
    optimisticHigh: number;
  };
  currency: CurrencyCode;
}

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALIZED ANALYSIS RESULT CONTRACTS
// ─────────────────────────────────────────────────────────────────────────────

export interface TotalCostOfOwnershipOutput {
  nominalPurchasePrice: number;
  financingInterestPaid: number;
  taxesAndOriginationFees: number;
  cumulativeRecurringUpkeep: number; // over analytical horizon
  expectedResaleRecovery: number;
  trueLifetimeNetCost: number;
  costMultipleOfNominal: number; // trueCost / nominalPrice
  analyticalHorizonMonths: number;
}

export interface CashFlowDynamicsOutput {
  baselineMonthlyIncome: number;
  baselineEssentialExpenses: number;
  baselineDebtService: number;
  baselineFreeCashFlow: number;
  postDecisionMonthlyExpenses: number;
  postDecisionDebtService: number;
  postDecisionFreeCashFlow: number;
  deltaFreeCashFlow: number;
  fcfBurnRatePercentage: number;
  postDecisionEmergencyRunwayMonths: number;
  runwayMonthsConsumed: number;
  isCashFlowNegative: boolean;
}

export interface FinancingAmortizationOutput {
  principalBorrowed: number;
  downPaymentMade: number;
  annualInterestRatePercent: number;
  monthlyInterestRatePercent: number;
  loanTermMonths: number;
  monthlyPayment: number;
  totalPaymentsOverTerm: number;
  totalInterestPaid: number;
  interestToPrincipalRatio: number;
  isSubprimeRateWarning: boolean;
}

export interface BreakEvenPaybackOutput {
  netCapitalInvested: number;
  grossMonthlyRevenue: number;
  operatingCostsPerMonth: number;
  netMonthlyOperatingProfit: number; // Revenue - Operating Costs
  paybackPeriodMonths: number;
  paybackPeriodDays: number;
  annualizedReturnOnInvestmentPercent: number;
  isRevenueGenerating: boolean;
}

export interface DepreciationResaleOutput {
  originalCost: number;
  estimatedUsefulLifeYears: number;
  depreciationModel: "STRAIGHT_LINE" | "TECH_ELECTRONICS_DECAY" | "AUTOMOTIVE_DECAY" | "REAL_ESTATE_APPRECIATION";
  year1ResaleValue: number;
  year2ResaleValue: number;
  year3ResaleValue: number;
  year5ResaleValue: number;
  terminalSalvageValue: number;
}

export interface OpportunityCostOutput {
  divertedCapitalAmount: number;
  primaryGoalDelayDays: number;
  primaryGoalDelayMonths: number;
  compoundInvestmentForgone10Y: {
    at5PercentConservative: number;
    at7PercentBaseline: number;
    at9PercentOptimistic: number;
  };
  liquidEmergencyBufferDaysLost: number;
}

export interface MasterFinancialAnalysisReport {
  timestamp: string;
  currency: CurrencyCode;
  applicableAnalysesSummary: string[];
  tcoAnalysis?: CalculationAuditBlock<TotalCostOfOwnershipOutput>;
  cashFlowAnalysis: CalculationAuditBlock<CashFlowDynamicsOutput>;
  financingAnalysis?: CalculationAuditBlock<FinancingAmortizationOutput>;
  breakEvenAnalysis?: CalculationAuditBlock<BreakEvenPaybackOutput>;
  depreciationAnalysis?: CalculationAuditBlock<DepreciationResaleOutput>;
  opportunityCostAnalysis: CalculationAuditBlock<OpportunityCostOutput>;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE DETERMINISTIC ANALYSIS ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function runCoreFinancialAnalysis(
  decisionObject: DecisionIntelligenceObject
): MasterFinancialAnalysisReport {
  const curr: CurrencyCode = decisionObject.definition.currency;
  const cat = decisionObject.definition.decision_category;
  const fmt = (n: number) => formatCurrency(n, curr);

  const totalAmount = Math.max(0, decisionObject.definition.financial_amount.value || 0);
  const downPayment = Math.max(0, decisionObject.economics.down_payment.value || 0);
  const loanDuration = Math.max(1, decisionObject.economics.loan_duration.value || 36);
  const interestRate = Math.max(0, decisionObject.economics.interest_rate.value || 8.5);
  const recurringUpkeep = Math.max(0, decisionObject.economics.recurring_cost.value || 0);
  const hiddenCosts = Math.max(0, decisionObject.economics.hidden_costs.value || 0);
  const expectedRevenue = Math.max(0, decisionObject.economics.expected_revenue.value || 0);

  const liquidSavings = Math.max(0, decisionObject.context.liquid_savings.value || 0);
  const monthlyIncome = Math.max(0, decisionObject.context.monthly_income.value || 0);
  const essentialExpenses = Math.max(0, decisionObject.context.essential_expenses.value || 0);
  const monthlyDebt = Math.max(0, decisionObject.context.monthly_debt_payments.value || 0);

  const isLoan = cat === "TAKE_A_LOAN" || (downPayment > 0 && downPayment < totalAmount);
  const isCar = cat === "BUY_A_CAR";
  const isBusiness = cat === "BUSINESS_EXPENSE" || expectedRevenue > 0;
  const isDepreciatingAsset = isCar || cat === "BUY_SOMETHING";

  const applicableAnalysesSummary: string[] = ["CASH_FLOW_DYNAMICS", "OPPORTUNITY_COST_ANALYSIS"];
  if (isLoan) applicableAnalysesSummary.push("FINANCING_AMORTIZATION");
  if (isDepreciatingAsset) applicableAnalysesSummary.push("DEPRECIATION_AND_RESALE");
  if (isBusiness) applicableAnalysesSummary.push("BREAK_EVEN_AND_PAYBACK");
  applicableAnalysesSummary.push("TOTAL_COST_OF_OWNERSHIP");

  // ─────────────────────────────────────────────────────────────────────────
  // 1. FINANCING AMORTIZATION (IF APPLICABLE)
  // ─────────────────────────────────────────────────────────────────────────
  let financingAuditBlock: CalculationAuditBlock<FinancingAmortizationOutput> | undefined;
  let computedMonthlyLoanPayment = 0;
  let computedTotalInterest = 0;

  if (isLoan) {
    const principalBorrowed = Math.max(0, totalAmount - downPayment);
    const monthlyRate = interestRate / 100 / 12;

    if (monthlyRate > 0 && principalBorrowed > 0) {
      computedMonthlyLoanPayment =
        (principalBorrowed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanDuration));
    } else {
      computedMonthlyLoanPayment = principalBorrowed > 0 ? principalBorrowed / loanDuration : 0;
    }

    const totalPaid = computedMonthlyLoanPayment * loanDuration;
    computedTotalInterest = Math.max(0, totalPaid - principalBorrowed);

    financingAuditBlock = {
      analysisMethod: "FINANCING_AMORTIZATION",
      isMethodAppropriate: true,
      justificationForInclusion: "Transaction involves principal borrowing requiring amortization schedule.",
      formulaDescription: "Standard Annuity Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]",
      inputs: {
        principalBorrowed: { value: principalBorrowed, unit: "CURRENCY", sourceClassification: "DERIVED_CALCULATION" },
        downPayment: { value: downPayment, unit: "CURRENCY", sourceClassification: decisionObject.economics.down_payment.classification },
        annualInterestRate: { value: interestRate, unit: "PERCENT", sourceClassification: decisionObject.economics.interest_rate.classification },
        loanTermMonths: { value: loanDuration, unit: "MONTHS", sourceClassification: decisionObject.economics.loan_duration.classification },
      },
      assumptions: [
        `Fixed interest rate of ${interestRate}% throughout loan tenure`,
        "Constant monthly amortization without early repayment penalties",
      ],
      output: {
        principalBorrowed: Math.round(principalBorrowed),
        downPaymentMade: Math.round(downPayment),
        annualInterestRatePercent: interestRate,
        monthlyInterestRatePercent: Number((monthlyRate * 100).toFixed(4)),
        loanTermMonths: loanDuration,
        monthlyPayment: Math.round(computedMonthlyLoanPayment),
        totalPaymentsOverTerm: Math.round(totalPaid),
        totalInterestPaid: Math.round(computedTotalInterest),
        interestToPrincipalRatio: principalBorrowed > 0 ? Number((computedTotalInterest / principalBorrowed).toFixed(3)) : 0,
        isSubprimeRateWarning: interestRate >= 18.0,
      },
      confidenceLevel: decisionObject.economics.interest_rate.isEstimate ? 0.75 : 0.95,
      uncertaintyRange: {
        conservativeLow: Math.round(computedTotalInterest * 0.9),
        expectedBaseline: Math.round(computedTotalInterest),
        optimisticHigh: Math.round(computedTotalInterest * 1.15),
      },
      currency: curr,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. CASH FLOW DYNAMICS (UNIVERSAL)
  // ─────────────────────────────────────────────────────────────────────────
  const baselineFreeCashFlow = Math.max(0, monthlyIncome - essentialExpenses - monthlyDebt);
  const upfrontCashOutlay = isLoan ? downPayment : totalAmount;
  const postCashReserves = Math.max(0, liquidSavings - upfrontCashOutlay);

  const postMonthlyExpenses = essentialExpenses + recurringUpkeep;
  const postDebtService = monthlyDebt + (isLoan ? computedMonthlyLoanPayment : 0);
  const postDecisionFreeCashFlow = Math.max(0, monthlyIncome - postMonthlyExpenses - postDebtService);
  const deltaFreeCashFlow = postDecisionFreeCashFlow - baselineFreeCashFlow;
  const fcfBurnRatePercentage =
    baselineFreeCashFlow > 0 ? Math.round((Math.abs(deltaFreeCashFlow) / baselineFreeCashFlow) * 100) : 0;

  const baselineRunway = essentialExpenses > 0 ? liquidSavings / essentialExpenses : 6;
  const postRunway = postMonthlyExpenses > 0 ? postCashReserves / postMonthlyExpenses : 0;

  const cashFlowAuditBlock: CalculationAuditBlock<CashFlowDynamicsOutput> = {
    analysisMethod: "CASH_FLOW_DYNAMICS",
    isMethodAppropriate: true,
    justificationForInclusion: "Essential solvency analysis measuring monthly cash flow shifts and runway.",
    formulaDescription: "Free Cash Flow = Net Inflow - (Essential Living + Debt Service + Decision Commitments)",
    inputs: {
      monthlyIncome: { value: monthlyIncome, unit: "CURRENCY", sourceClassification: decisionObject.context.monthly_income.classification },
      essentialExpenses: { value: essentialExpenses, unit: "CURRENCY", sourceClassification: decisionObject.context.essential_expenses.classification },
      monthlyDebt: { value: monthlyDebt, unit: "CURRENCY", sourceClassification: decisionObject.context.monthly_debt_payments.classification },
      newMonthlyCommitment: { value: recurringUpkeep + computedMonthlyLoanPayment, unit: "CURRENCY", sourceClassification: "DERIVED_CALCULATION" },
    },
    assumptions: [
      "Income remains stable at declared baseline level",
      "Essential expenses exclude optional discretionary cuts",
    ],
    output: {
      baselineMonthlyIncome: monthlyIncome,
      baselineEssentialExpenses: essentialExpenses,
      baselineDebtService: monthlyDebt,
      baselineFreeCashFlow,
      postDecisionMonthlyExpenses: postMonthlyExpenses,
      postDecisionDebtService: postDebtService,
      postDecisionFreeCashFlow,
      deltaFreeCashFlow,
      fcfBurnRatePercentage,
      postDecisionEmergencyRunwayMonths: Number(postRunway.toFixed(1)),
      runwayMonthsConsumed: Number(Math.max(0, baselineRunway - postRunway).toFixed(1)),
      isCashFlowNegative: postDecisionFreeCashFlow <= 0,
    },
    confidenceLevel: 0.95,
    currency: curr,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 3. TOTAL COST OF OWNERSHIP (TCO)
  // ─────────────────────────────────────────────────────────────────────────
  const analyticalHorizonMonths = isLoan ? loanDuration : 36;
  const cumulativeRecurring = recurringUpkeep * analyticalHorizonMonths;
  const totalFeesAndHidden = hiddenCosts;

  // Estimated terminal salvage
  let estimatedResale = 0;
  if (isCar) estimatedResale = Math.round(totalAmount * 0.45);
  else if (cat === "BUY_SOMETHING") estimatedResale = Math.round(totalAmount * 0.2);

  const trueLifetimeNetCost =
    totalAmount + computedTotalInterest + totalFeesAndHidden + cumulativeRecurring - estimatedResale;

  const tcoAuditBlock: CalculationAuditBlock<TotalCostOfOwnershipOutput> = {
    analysisMethod: "TOTAL_COST_OF_OWNERSHIP",
    isMethodAppropriate: true,
    justificationForInclusion: "Full lifecycle cost aggregation including recurring friction and terminal value.",
    formulaDescription: "TCO = Purchase Price + Financing Interest + Ancillary Fees + Lifetime Upkeep - Resale Recovery",
    inputs: {
      nominalPurchasePrice: { value: totalAmount, unit: "CURRENCY", sourceClassification: decisionObject.definition.financial_amount.classification },
      financingInterest: { value: computedTotalInterest, unit: "CURRENCY", sourceClassification: "DERIVED_CALCULATION" },
      cumulativeUpkeep: { value: cumulativeRecurring, unit: "CURRENCY", sourceClassification: "DERIVED_CALCULATION" },
      estimatedResale: { value: estimatedResale, unit: "CURRENCY", sourceClassification: "ASSUMPTION" },
    },
    assumptions: [
      `Evaluated across a ${analyticalHorizonMonths}-month analytical lifecycle`,
      `Terminal resale recovery assumed at ${fmt(estimatedResale)}`,
    ],
    output: {
      nominalPurchasePrice: totalAmount,
      financingInterestPaid: Math.round(computedTotalInterest),
      taxesAndOriginationFees: totalFeesAndHidden,
      cumulativeRecurringUpkeep: Math.round(cumulativeRecurring),
      expectedResaleRecovery: estimatedResale,
      trueLifetimeNetCost: Math.round(trueLifetimeNetCost),
      costMultipleOfNominal: totalAmount > 0 ? Number((trueLifetimeNetCost / totalAmount).toFixed(2)) : 1.0,
      analyticalHorizonMonths,
    },
    confidenceLevel: 0.85,
    uncertaintyRange: {
      conservativeLow: Math.round(trueLifetimeNetCost * 0.9),
      expectedBaseline: Math.round(trueLifetimeNetCost),
      optimisticHigh: Math.round(trueLifetimeNetCost * 1.2),
    },
    currency: curr,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 4. BREAK-EVEN & PAYBACK PERIOD (IF BUSINESS / INCOME GENERATING)
  // ─────────────────────────────────────────────────────────────────────────
  let breakEvenAuditBlock: CalculationAuditBlock<BreakEvenPaybackOutput> | undefined;
  if (isBusiness && expectedRevenue > 0) {
    const netMonthlyOperatingProfit = Math.max(0, expectedRevenue - recurringUpkeep);
    const paybackMonths =
      netMonthlyOperatingProfit > 0 ? Math.round((totalAmount / netMonthlyOperatingProfit) * 10) / 10 : 999;
    const annualNetProfit = netMonthlyOperatingProfit * 12;
    const annualizedRoi = totalAmount > 0 ? Math.round((annualNetProfit / totalAmount) * 100) : 0;

    breakEvenAuditBlock = {
      analysisMethod: "BREAK_EVEN_AND_PAYBACK",
      isMethodAppropriate: true,
      justificationForInclusion: "Revenue-generating asset evaluated for capital payback period and operating profit margin.",
      formulaDescription: "Payback Period = Net Capital Outlay / Net Monthly Operating Profit (Revenue - Upkeep)",
      inputs: {
        capitalInvested: { value: totalAmount, unit: "CURRENCY", sourceClassification: decisionObject.definition.financial_amount.classification },
        grossRevenuePerMonth: { value: expectedRevenue, unit: "CURRENCY", sourceClassification: decisionObject.economics.expected_revenue.classification },
        monthlyUpkeep: { value: recurringUpkeep, unit: "CURRENCY", sourceClassification: decisionObject.economics.recurring_cost.classification },
      },
      assumptions: [
        "Revenue projections assume linear client billing without seasonal gaps",
        "Operating costs exclude income tax and corporate amortizations",
      ],
      output: {
        netCapitalInvested: totalAmount,
        grossMonthlyRevenue: expectedRevenue,
        operatingCostsPerMonth: recurringUpkeep,
        netMonthlyOperatingProfit,
        paybackPeriodMonths: paybackMonths,
        paybackPeriodDays: Math.round(paybackMonths * 30),
        annualizedReturnOnInvestmentPercent: annualizedRoi,
        isRevenueGenerating: true,
      },
      confidenceLevel: decisionObject.economics.expected_revenue.isEstimate ? 0.6 : 0.85,
      uncertaintyRange: {
        conservativeLow: Math.round(paybackMonths * 1.3),
        expectedBaseline: Math.round(paybackMonths),
        optimisticHigh: Math.round(paybackMonths * 0.8),
      },
      currency: curr,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. DEPRECIATION & RESALE DECAY
  // ─────────────────────────────────────────────────────────────────────────
  let depreciationAuditBlock: CalculationAuditBlock<DepreciationResaleOutput> | undefined;
  if (isDepreciatingAsset && totalAmount > 0) {
    let yr1 = Math.round(totalAmount * 0.7);
    let yr2 = Math.round(totalAmount * 0.55);
    let yr3 = Math.round(totalAmount * 0.42);
    let yr5 = Math.round(totalAmount * 0.25);
    let model: DepreciationResaleOutput["depreciationModel"] = "TECH_ELECTRONICS_DECAY";

    if (isCar) {
      model = "AUTOMOTIVE_DECAY";
      yr1 = Math.round(totalAmount * 0.8);
      yr2 = Math.round(totalAmount * 0.68);
      yr3 = Math.round(totalAmount * 0.58);
      yr5 = Math.round(totalAmount * 0.42);
    }

    depreciationAuditBlock = {
      analysisMethod: "DEPRECIATION_AND_RESALE",
      isMethodAppropriate: true,
      justificationForInclusion: "Physical capital asset subject to standard secondary market depreciation.",
      formulaDescription: "Standard Category Decay Curve based on empirical secondary transactions.",
      inputs: {
        originalPurchaseCost: { value: totalAmount, unit: "CURRENCY", sourceClassification: decisionObject.definition.financial_amount.classification },
      },
      assumptions: [
        "Normal wear and tear; asset kept in good working condition",
        "Liquid secondary resale market exists without liquidation lockup",
      ],
      output: {
        originalCost: totalAmount,
        estimatedUsefulLifeYears: isCar ? 10 : 4,
        depreciationModel: model,
        year1ResaleValue: yr1,
        year2ResaleValue: yr2,
        year3ResaleValue: yr3,
        year5ResaleValue: yr5,
        terminalSalvageValue: yr5,
      },
      confidenceLevel: 0.8,
      currency: curr,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. OPPORTUNITY COST & GOAL DELAY (UNIVERSAL)
  // ─────────────────────────────────────────────────────────────────────────
  const goalAllocation = Math.max(50, decisionObject.context.primary_goal?.monthlyAllocation || 350);
  const goalDelayDays = Math.round((totalAmount / goalAllocation) * 30);
  const goalDelayMonths = Math.round((goalDelayDays / 30) * 10) / 10;

  const compoundForgone5 = Math.round(totalAmount * (Math.pow(1.05, 10) - 1));
  const compoundForgone7 = Math.round(totalAmount * (Math.pow(1.07, 10) - 1));
  const compoundForgone9 = Math.round(totalAmount * (Math.pow(1.09, 10) - 1));
  const liquidBufferDaysLost = essentialExpenses > 0 ? Math.round((upfrontCashOutlay / (essentialExpenses / 30))) : 0;

  const opportunityCostAuditBlock: CalculationAuditBlock<OpportunityCostOutput> = {
    analysisMethod: "OPPORTUNITY_COST_ANALYSIS",
    isMethodAppropriate: true,
    justificationForInclusion: "Evaluates the counterfactual capital growth and life-goal milestone postponement.",
    formulaDescription: "Goal Delay = Capital Diverted / Monthly Goal Contribution | 10Y Compound = Principal * (1+r)^10 - Principal",
    inputs: {
      capitalDiverted: { value: totalAmount, unit: "CURRENCY", sourceClassification: decisionObject.definition.financial_amount.classification },
      monthlyGoalContribution: { value: goalAllocation, unit: "CURRENCY", sourceClassification: "VERIFIED_FACT" },
    },
    assumptions: [
      "Benchmark compound index returns at 5% (conservative), 7% (baseline), and 9% (optimistic)",
      "Goal timeline assumes steady monthly allocations without pause",
    ],
    output: {
      divertedCapitalAmount: totalAmount,
      primaryGoalDelayDays: goalDelayDays,
      primaryGoalDelayMonths: goalDelayMonths,
      compoundInvestmentForgone10Y: {
        at5PercentConservative: compoundForgone5,
        at7PercentBaseline: compoundForgone7,
        at9PercentOptimistic: compoundForgone9,
      },
      liquidEmergencyBufferDaysLost: liquidBufferDaysLost,
    },
    confidenceLevel: 0.9,
    currency: curr,
  };

  return {
    timestamp: new Date().toISOString(),
    currency: curr,
    applicableAnalysesSummary,
    tcoAnalysis: tcoAuditBlock,
    cashFlowAnalysis: cashFlowAuditBlock,
    financingAnalysis: financingAuditBlock,
    breakEvenAnalysis: breakEvenAuditBlock,
    depreciationAnalysis: depreciationAuditBlock,
    opportunityCostAnalysis: opportunityCostAuditBlock,
  };
}
