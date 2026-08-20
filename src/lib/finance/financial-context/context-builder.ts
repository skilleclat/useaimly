/**
 * Deterministic Financial Context Builder
 * Prepares a structured, verified financial payload to be fed into the AI explanation layer.
 */

import { DecisionExplanationPayload } from "../../types/ai";
import { DecisionSimulationResult } from "../../types/decision";
import { FinancialProfile } from "../../types/finance";
import { FinancialGoal } from "../../types/goal";
import { calculateCashFlowSummary } from "../calculations/cash-flow";
import { calculateNetWorth } from "../calculations/net-worth";

export function buildDecisionContextPayload(
  profile: FinancialProfile,
  goals: FinancialGoal[],
  simulation: DecisionSimulationResult,
  userQuery: string
): DecisionExplanationPayload {
  const cashFlow = calculateCashFlowSummary(profile.cashFlowItems);
  const netWorth = calculateNetWorth(profile.accounts, cashFlow.monthlyTotalExpenses);
  
  const targetGoal = goals.find((g) => g.id === simulation.primaryGoalImpact.goalId) || goals[0];

  return {
    userQuery,
    simulation,
    profileSummary: {
      currency: profile.currency,
      monthlyFreeCashFlow: cashFlow.monthlyFreeCashFlow,
      savingsRate: cashFlow.savingsRate,
      liquidRunwayMonths: netWorth.liquidRunwayMonths,
    },
    goalSummary: {
      title: targetGoal?.title || "Primary Financial Destination",
      targetAmount: targetGoal?.targetAmount || 0,
      targetDate: targetGoal?.targetDate || "Unspecified",
      currentAmount: targetGoal?.currentAmount || 0,
    },
  };
}
