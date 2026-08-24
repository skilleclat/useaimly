import { DecisionSimulationResult } from "../types";

export interface PreFlightValidationResult {
  isValid: boolean;
  errorCode?: "CALCULATION_OR_DECISION_CONFLICT" | "ARITHMETIC_MISMATCH" | "CONSTRAINT_VIOLATION_CONFLICT";
  errors: string[];
  warnings: string[];
}

export function runPreFlightValidation(
  data: DecisionSimulationResult
): PreFlightValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // CHECK 1 — Arithmetic Integrity
  const { baseline, simulated, delta, affordability, executiveDecision, constraintResults } = data;

  if (baseline.primaryGoal) {
    const calcGap = Math.max(0, baseline.primaryGoal.targetAmount - baseline.primaryGoal.currentAmount);
    if (Math.abs(calcGap - baseline.primaryGoal.remainingAmount) > 1) {
      errors.push(
        `Goal Arithmetic Mismatch: Target (${baseline.primaryGoal.targetAmount}) - Current (${baseline.primaryGoal.currentAmount}) != Remaining (${baseline.primaryGoal.remainingAmount})`
      );
    }
  }

  // CHECK 2 — Fund Separation Integrity
  // Warn if total liquid savings are assumed to serve both emergency reserve and goal funds without explicit separation
  if (baseline.liquidSavings > 0 && baseline.primaryGoal && baseline.primaryGoal.currentAmount > 0) {
    if (baseline.liquidSavings === baseline.primaryGoal.currentAmount) {
      warnings.push(
        "FUND_OVERLAP_UNKNOWN: Liquid savings and accumulated goal funds share identical numbers. Verify if emergency reserves are distinct from goal funds."
      );
    }
  }

  // CHECK 3 — Timeline Integrity & Contradiction Detection
  if (baseline.primaryGoal && simulated.primaryGoal) {
    const proj1 = baseline.primaryGoal.projectedCompletionDate;
    const proj2 = delta.baselineCompletionDate;

    if (proj1 && proj2 && proj1 !== proj2 && proj1 !== "Goal Achieved" && proj2 !== "Goal Achieved") {
      errors.push(
        `TIMELINE CONFLICT: Baseline completion date in goal metrics (${proj1}) does not match delta baseline date (${proj2}).`
      );
    }
  }

  // CHECK 4 — Constraint Integrity & Recommendation Alignment
  const hardBlockers = constraintResults.filter((c) => c.severity === "HARD_BLOCKER" && c.status !== "SATISFIED");
  
  if (hardBlockers.length > 0 && executiveDecision === "GO") {
    errors.push(
      `DECISION CONFLICT: Recommendation is 'GO' but active hard financial constraint is breached: ${hardBlockers.map((h) => h.ruleName).join(", ")}`
    );
  }

  // CHECK 5 — Reserve Floor Warning vs Over-optimistic Narrative
  const reserveConstraint = constraintResults.find((c) => c.ruleName.includes("Emergency Reserve Floor Shield"));
  if (reserveConstraint && reserveConstraint.status !== "SATISFIED") {
    if (data.headlineVerdict.toLowerCase().includes("impregnable") || data.headlineVerdict.toLowerCase().includes("institutional-grade") || data.headlineVerdict.toLowerCase().includes("elite")) {
      errors.push(
        `NARRATIVE CONFLICT: Headline verdict uses hyperbole ('${data.headlineVerdict}') while emergency reserve floor is BELOW TARGET (${reserveConstraint.currentValue}).`
      );
    }
  }

  // CHECK 6 — Vehicle Ownership Burden Validation
  if (data.vehicleFramework?.isVehiclePurchase) {
    const { decisionA, decisionB } = data.vehicleFramework;
    if (decisionA.canFundPurchase && !decisionB.canAffordOwnership && executiveDecision === "GO") {
      errors.push(
        "VEHICLE DECISION CONFLICT: Can Fund Purchase (Decision A) is TRUE, but Can Afford Ownership (Decision B) is FALSE. Recommendation must be WAIT or ADJUST."
      );
    }
  }

  // Final Verdict
  const isValid = errors.length === 0;

  return {
    isValid,
    errorCode: isValid ? undefined : "CALCULATION_OR_DECISION_CONFLICT",
    errors,
    warnings,
  };
}
