import { BaselineFinancialProfile } from "./types";
import { simulateDecision } from "./simulations/simulation-engine";

export interface StressScenarioResult {
  scenarioId: "BASE" | "INCOME_DROP" | "EMERGENCY_EXPENSE" | "HIGHER_COST" | "GOAL_PRIORITY";
  title: string;
  description: string;
  verdict: "SAFE" | "WARNING" | "CRITICAL";
  resilienceScore: number; // 0 to 100
  liquidBufferMonths: number;
  monthlyFreeCashFlow: number;
  goalDelayDays: number;
  explanation: string;
}

export interface DecisionStressTestResult {
  overallResilienceScore: number; // average score across 5 scenarios
  overallVerdict: "STRENGTH_PROVEN" | "MODERATE_RISK" | "HIGH_VULNERABILITY";
  scenarios: StressScenarioResult[];
}

/**
 * Executes a 5-scenario adverse stress test on a proposed financial decision.
 */
export function runDecisionStressTest(
  baseline: BaselineFinancialProfile,
  decisionAmount: number,
  decisionTitle: string = "Proposed Outlay",
  isRecurring: boolean = false
): DecisionStressTestResult {
  // Scenario 1: Base Case
  const baseSim = simulateDecision(baseline, { decisionTitle, amount: decisionAmount, isRecurring });
  const baseMonths = baseSim.affordability.obligationsPreservedMonths;
  const baseCashFlow = baseSim.simulated.monthlyFreeCashFlow;
  const baseDelay = baseSim.delta.delayInDays;

  const scenario1: StressScenarioResult = {
    scenarioId: "BASE",
    title: "Base Case",
    description: "Current income and expense trajectory continues unchanged.",
    verdict: baseMonths >= 3.0 && baseCashFlow >= 0 ? "SAFE" : baseMonths >= 1.5 ? "WARNING" : "CRITICAL",
    resilienceScore: Math.min(100, Math.round((baseMonths / 3.0) * 100)),
    liquidBufferMonths: baseMonths,
    monthlyFreeCashFlow: baseCashFlow,
    goalDelayDays: baseDelay,
    explanation: baseMonths >= 3.0 ? "Reserves remain healthy above 3.0 months." : "Reserve buffer is below target floor.",
  };

  // Scenario 2: Income Drop (-20%)
  const incomeDropBaseline: BaselineFinancialProfile = {
    ...baseline,
    incomes: baseline.incomes.map((inc) => ({ ...inc, amount: Math.round(inc.amount * 0.8) })),
  };
  const incSim = simulateDecision(incomeDropBaseline, { decisionTitle, amount: decisionAmount, isRecurring });
  const incMonths = incSim.affordability.obligationsPreservedMonths;
  const incCashFlow = incSim.simulated.monthlyFreeCashFlow;

  const scenario2: StressScenarioResult = {
    scenarioId: "INCOME_DROP",
    title: "20% Income Reduction",
    description: "Primary income drops by 20% due to market slowdown or job transition.",
    verdict: incCashFlow >= 0 && incMonths >= 2.0 ? "SAFE" : incCashFlow >= 0 ? "WARNING" : "CRITICAL",
    resilienceScore: Math.max(0, Math.min(100, Math.round((incCashFlow >= 0 ? 70 : 30) + incMonths * 10))),
    liquidBufferMonths: incMonths,
    monthlyFreeCashFlow: incCashFlow,
    goalDelayDays: incSim.delta.delayInDays,
    explanation: incCashFlow >= 0 ? "Cash flow remains positive despite 20% income reduction." : "Income drop creates an immediate monthly cash deficit.",
  };

  // Scenario 3: Unexpected Emergency Expense (80,000 KES Outflow)
  const emergencyOutflow = 80000;
  const emergencyBaseline: BaselineFinancialProfile = {
    ...baseline,
    liquidSavings: Math.max(0, baseline.liquidSavings - emergencyOutflow),
  };
  const emgSim = simulateDecision(emergencyBaseline, { decisionTitle, amount: decisionAmount, isRecurring });
  const emgMonths = emgSim.affordability.obligationsPreservedMonths;

  const scenario3: StressScenarioResult = {
    scenarioId: "EMERGENCY_EXPENSE",
    title: "Unexpected Emergency Outflow",
    description: "An immediate unexpected KES 80,000 medical or repair bill occurs.",
    verdict: emgMonths >= 2.0 ? "SAFE" : emgMonths >= 1.0 ? "WARNING" : "CRITICAL",
    resilienceScore: Math.max(0, Math.min(100, Math.round(emgMonths * 30))),
    liquidBufferMonths: emgMonths,
    monthlyFreeCashFlow: emgSim.simulated.monthlyFreeCashFlow,
    goalDelayDays: emgSim.delta.delayInDays,
    explanation: emgMonths >= 2.0 ? "Reserves absorb emergency outflow without critical deficit." : "Emergency expense depletes safety reserves to vulnerable level.",
  };

  // Scenario 4: Higher Recurring Cost (+15% Fee/Interest inflation)
  const higherCostBaseline: BaselineFinancialProfile = {
    ...baseline,
    expenses: baseline.expenses.map((exp) => ({ ...exp, amount: Math.round(exp.amount * 1.15) })),
  };
  const costSim = simulateDecision(higherCostBaseline, { decisionTitle, amount: decisionAmount, isRecurring });
  const costCashFlow = costSim.simulated.monthlyFreeCashFlow;

  const scenario4: StressScenarioResult = {
    scenarioId: "HIGHER_COST",
    title: "15% Inflation / Higher Fee Shock",
    description: "Essential living expenses and interest rates rise by 15%.",
    verdict: costCashFlow >= 0 ? "SAFE" : "CRITICAL",
    resilienceScore: costCashFlow >= 0 ? 85 : 35,
    liquidBufferMonths: costSim.affordability.obligationsPreservedMonths,
    monthlyFreeCashFlow: costCashFlow,
    goalDelayDays: costSim.delta.delayInDays,
    explanation: costCashFlow >= 0 ? "Monthly budget comfortably absorbs 15% cost inflation." : "Expense inflation turns monthly cash flow negative.",
  };

  // Scenario 5: Strict Goal Protection
  const goalSim = baseSim;
  const goalVerdict = goalSim.delta.delayInDays <= 0 ? "SAFE" : goalSim.delta.delayInDays <= 30 ? "WARNING" : "CRITICAL";

  const scenario5: StressScenarioResult = {
    scenarioId: "GOAL_PRIORITY",
    title: "Strict Life Goal Protection",
    description: "Evaluating whether target life savings goal date is preserved.",
    verdict: goalVerdict,
    resilienceScore: goalSim.delta.delayInDays <= 0 ? 100 : Math.max(20, 100 - goalSim.delta.delayInDays),
    liquidBufferMonths: baseMonths,
    monthlyFreeCashFlow: baseCashFlow,
    goalDelayDays: goalSim.delta.delayInDays,
    explanation: goalSim.delta.delayInDays <= 0 ? "Goal completion date remains 100% on schedule." : `Decision shifts target goal date by +${goalSim.delta.delayInDays} days.`,
  };

  const scenarios = [scenario1, scenario2, scenario3, scenario4, scenario5];
  const overallResilienceScore = Math.round(
    scenarios.reduce((acc, s) => acc + s.resilienceScore, 0) / scenarios.length
  );

  let overallVerdict: DecisionStressTestResult["overallVerdict"] = "STRENGTH_PROVEN";
  if (overallResilienceScore >= 75) {
    overallVerdict = "STRENGTH_PROVEN";
  } else if (overallResilienceScore >= 50) {
    overallVerdict = "MODERATE_RISK";
  } else {
    overallVerdict = "HIGH_VULNERABILITY";
  }

  return {
    overallResilienceScore,
    overallVerdict,
    scenarios,
  };
}
