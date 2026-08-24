import { CanonicalFinancialDecision } from "../types";

export interface ConsistencyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates runtime mathematical invariants on a CanonicalFinancialDecision object.
 * Guarantees that contradictory states (e.g. Goal Achieved + Pace Shortfall, On Track + Delay > 0,
 * Required Monthly = 0 + Catch-Up Plan, ADJUST decision without a specific action) are impossible.
 */
export function validateDecisionConsistency(
  decision: CanonicalFinancialDecision
): ConsistencyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // INVARIANT 1: Remaining Gap & Goal Status Integrity
  const expectedGap = Math.max(0, decision.targetAmount - decision.confirmedSaved);
  if (Math.abs(decision.remainingGap - expectedGap) > 1) {
    errors.push(
      `MATHEMATICAL_INVARIANT_VIOLATION: Remaining gap (${decision.remainingGap}) does not match targetAmount (${decision.targetAmount}) - confirmedSaved (${decision.confirmedSaved}) = ${expectedGap}.`
    );
  }

  if (decision.confirmedSaved >= decision.targetAmount) {
    if (decision.remainingGap !== 0) {
      errors.push(
        `GOAL_ACHIEVED_GAP_MISMATCH: Goal is fully funded (saved ${decision.confirmedSaved} >= target ${decision.targetAmount}), but remainingGap is ${decision.remainingGap} instead of 0.`
      );
    }
    if (decision.goalStatus !== "ACHIEVED") {
      errors.push(
        `GOAL_STATUS_MISMATCH: Goal is fully funded, but goalStatus is '${decision.goalStatus}' instead of 'ACHIEVED'.`
      );
    }
    if (decision.requiredMonthlyAllocation !== 0) {
      errors.push(
        `REQUIRED_ALLOCATION_MISMATCH: Goal is fully funded, but requiredMonthlyAllocation is ${decision.requiredMonthlyAllocation} instead of 0.`
      );
    }
    if (decision.shortfallAmount !== 0) {
      errors.push(
        `SHORTFALL_AMOUNT_MISMATCH: Goal is fully funded, but shortfallAmount is ${decision.shortfallAmount} instead of 0.`
      );
    }
  }

  // INVARIANT 2: Timeline & Goal Status Rules
  if (decision.trajectoryDelayMonths <= 0) {
    if (decision.goalStatus === "OFF_TRACK") {
      errors.push(
        `TIMELINE_CONTRADICTION: Trajectory delay is ${decision.trajectoryDelayMonths} months (on schedule or ahead), but goalStatus is marked 'OFF_TRACK'.`
      );
    }
  } else {
    if (decision.goalStatus === "ACHIEVED" || decision.goalStatus === "ON_TRACK") {
      errors.push(
        `TIMELINE_CONTRADICTION: Trajectory has +${decision.trajectoryDelayMonths} months delay, but goalStatus is marked '${decision.goalStatus}'.`
      );
    }
  }

  // INVARIANT 3: Achieved / On-Track Shortfall Text Suppression
  if (decision.goalStatus === "ACHIEVED" || decision.goalStatus === "ON_TRACK") {
    const textBlob = `${decision.headlineVerdict} ${decision.strategicRead} ${decision.masterStrategyParagraph} ${decision.recommendedAction}`.toLowerCase();
    if (
      textBlob.includes("pace shortfall") ||
      textBlob.includes("actionable velocity gap") ||
      textBlob.includes("pacing variance gap") ||
      textBlob.includes("trajectory acceleration to bridge the shortfall")
    ) {
      errors.push(
        `NARRATIVE_CONTRADICTION: Narrative contains shortfall/acceleration claims while goalStatus is '${decision.goalStatus}'.`
      );
    }
  }

  // INVARIANT 4: ADJUST Decision Action Specificity
  if (decision.decision === "ADJUST") {
    if (!decision.recommendedAction || decision.recommendedAction.trim().length === 0) {
      errors.push(
        "ADJUST_DECISION_WITHOUT_ACTION: Executive decision is ADJUST, but recommendedAction is missing or empty."
      );
    } else if (
      decision.recommendedAction.toLowerCase() === "proceed with current goal allocation schedule." ||
      decision.recommendedAction.toLowerCase() === "proceed with purchase while maintaining automated monthly allocation to goal destination."
    ) {
      errors.push(
        `ADJUST_DECISION_CONTRADICTORY_ACTION: Decision is ADJUST, but recommendedAction says '${decision.recommendedAction}' without specifying what variable changes.`
      );
    }
  }

  // INVARIANT 5: Confidence & Data Completeness
  if (decision.confidence === "HIGH" && decision.missingVariables.length > 2) {
    warnings.push(
      "CONFIDENCE_OVERSTATED: Confidence level is HIGH, but more than 2 missing variables were identified."
    );
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
  };
}

/**
 * Asserts invariants and throws a descriptive error if invalid.
 */
export function assertDecisionConsistency(decision: CanonicalFinancialDecision): void {
  const result = validateDecisionConsistency(decision);
  if (!result.isValid) {
    throw new Error(
      `[CANONICAL_DECISION_INVARIANT_VIOLATION]\n${result.errors.join("\n")}`
    );
  }
}
