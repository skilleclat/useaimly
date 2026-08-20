import { BaselineFinancialProfile } from "../types";
import { calculateCashFlow } from "../cash-flow/cash-flow-calculator";
import { calculateTotalDebtBalance, calculateDebtToIncomeRatio } from "../debt/debt-calculator";

export interface FinancialHealthScore {
  score: number; // 0 to 100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  runwayMonths: number;
  savingsRatePercentage: number;
  dtiPercentage: number;
  debtToSavingsRatio: number;
  metrics: {
    runwayScore: number; // max 30
    savingsRateScore: number; // max 30
    debtHealthScore: number; // max 25
    goalProgressScore: number; // max 15
  };
  strengths: string[];
  vulnerabilities: string[];
}

/**
 * Calculates financial runway in months based on liquid savings and essential outflows.
 */
export function calculateFinancialRunwayMonths(
  liquidSavings: number,
  monthlyEssentialExpenses: number,
  monthlyDebtPayments: number = 0
): number {
  const monthlyBurn = monthlyEssentialExpenses + monthlyDebtPayments;
  if (monthlyBurn <= 0) return 36;
  return Number((liquidSavings / monthlyBurn).toFixed(1));
}

/**
 * Calculates composite financial health score (0-100) across liquidity runway, savings rate, DTI, and goal progress.
 */
export function calculateCompositeFinancialHealth(profile: BaselineFinancialProfile): FinancialHealthScore {
  const cashFlow = calculateCashFlow(
    profile.incomes,
    profile.expenses,
    profile.debts,
    profile.commitments
  );

  const runwayMonths = calculateFinancialRunwayMonths(
    profile.liquidSavings,
    cashFlow.monthlyEssentialExpenses,
    cashFlow.monthlyDebtPayments
  );

  const dtiPercentage = calculateDebtToIncomeRatio(profile.debts, cashFlow.monthlyGrossIncome);
  const totalDebt = calculateTotalDebtBalance(profile.debts);
  const debtToSavingsRatio =
    profile.liquidSavings > 0 ? Number((totalDebt / profile.liquidSavings).toFixed(2)) : totalDebt > 0 ? 99 : 0;

  const strengths: string[] = [];
  const vulnerabilities: string[] = [];

  // 1. Runway Score (0 to 30 pts)
  // Target: 6 months = 30 pts, 3 months = 20 pts, 1 month = 10 pts
  let runwayScore = 0;
  if (runwayMonths >= 6) {
    runwayScore = 30;
    strengths.push(`Strong liquidity cushion (${runwayMonths} months of essential living expenses).`);
  } else if (runwayMonths >= 3) {
    runwayScore = 20 + Math.round(((runwayMonths - 3) / 3) * 10);
    strengths.push(`Solid 3+ month operational buffer (${runwayMonths} months).`);
  } else if (runwayMonths >= 1) {
    runwayScore = 10 + Math.round(((runwayMonths - 1) / 2) * 10);
    vulnerabilities.push(`Cushion is under 3 months (${runwayMonths} months); build emergency reserve.`);
  } else {
    runwayScore = Math.max(0, Math.round(runwayMonths * 10));
    vulnerabilities.push(`Critical reserve shortfall (${runwayMonths} months); vulnerable to income disruption.`);
  }

  // 2. Savings Rate Score (0 to 30 pts)
  // Target: 30%+ = 30 pts, 20% = 22 pts, 10% = 12 pts, 0% = 0 pts
  let savingsRateScore = 0;
  const savingsRate = cashFlow.savingsRatePercentage;
  if (savingsRate >= 30) {
    savingsRateScore = 30;
    strengths.push(`Exceptional savings velocity (${savingsRate}% of gross income converted to free cash flow).`);
  } else if (savingsRate >= 20) {
    savingsRateScore = 22 + Math.round(((savingsRate - 20) / 10) * 8);
    strengths.push(`Healthy savings rate (${savingsRate}%).`);
  } else if (savingsRate >= 10) {
    savingsRateScore = 12 + Math.round(((savingsRate - 10) / 10) * 10);
  } else if (savingsRate > 0) {
    savingsRateScore = Math.round((savingsRate / 10) * 12);
    vulnerabilities.push(`Low free cash flow buffer (${savingsRate}% savings rate).`);
  } else {
    savingsRateScore = 0;
    vulnerabilities.push(`Negative or zero free cash flow (${cashFlow.monthlyFreeCashFlow}/mo); living expenses exceed income.`);
  }

  // 3. Debt Health Score (0 to 25 pts)
  // Target: DTI = 0% -> 25 pts, DTI < 20% -> 20 pts, DTI < 36% -> 12 pts, DTI > 50% -> 0 pts
  let debtHealthScore = 0;
  if (profile.debts.length === 0 || dtiPercentage === 0) {
    debtHealthScore = 25;
    strengths.push("Debt-free balance sheet with zero monthly liability drag.");
  } else if (dtiPercentage < 20) {
    debtHealthScore = 20;
    strengths.push(`Low debt service burden (DTI is ${dtiPercentage}%).`);
  } else if (dtiPercentage < 36) {
    debtHealthScore = 12;
  } else if (dtiPercentage < 50) {
    debtHealthScore = 5;
    vulnerabilities.push(`High debt service burden (DTI is ${dtiPercentage}%).`);
  } else {
    debtHealthScore = 0;
    vulnerabilities.push(`Critical debt load (DTI of ${dtiPercentage}% consumes over half of gross income).`);
  }

  // 4. Goal Progress Score (0 to 15 pts)
  let goalProgressScore = 0;
  if (profile.goals.length > 0) {
    const totalTarget = profile.goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalCurrent = profile.goals.reduce((s, g) => s + g.currentAmount, 0);
    const goalRatio = totalTarget > 0 ? totalCurrent / totalTarget : 1;
    goalProgressScore = Math.round(Math.min(15, goalRatio * 15));
    if (goalRatio >= 0.5) {
      strengths.push(`Over ${(goalRatio * 100).toFixed(0)}% accumulated toward target milestones.`);
    }
  } else {
    goalProgressScore = 10;
  }

  // Total Score
  const score = Math.min(100, Math.max(0, runwayScore + savingsRateScore + debtHealthScore + goalProgressScore));

  let grade: "A+" | "A" | "B" | "C" | "D" | "F" = "B";
  if (score >= 95) grade = "A+";
  else if (score >= 85) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 50) grade = "C";
  else if (score >= 35) grade = "D";
  else grade = "F";

  return {
    score,
    grade,
    runwayMonths,
    savingsRatePercentage: savingsRate,
    dtiPercentage,
    debtToSavingsRatio,
    metrics: {
      runwayScore,
      savingsRateScore,
      debtHealthScore,
      goalProgressScore,
    },
    strengths,
    vulnerabilities,
  };
}
