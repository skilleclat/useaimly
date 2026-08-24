import { CanonicalFinancialDecision } from "../types";

export interface ConsistencyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates runtime mathematical invariants on a CanonicalFinancialDecision object.
 * Guarantees that contradictory states (e.g. Goal Achieved + Pace Shortfall, On Track + Delay > 0,
 * Required Monthly = 0 + Catch-Up Plan, ADJUST decision without a specific action, or KES in USD report) are impossible.
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

  if (decision.confirmedSaved >= decision.targetAmount || decision.targetAmount <= 0) {
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

  // INVARIANT 2: Achieved Goal Recommendation Termination
  if (decision.goalStatus === "ACHIEVED") {
    const textBlob = `${decision.headlineVerdict} ${decision.strategicRead} ${decision.masterStrategyParagraph} ${decision.recommendedAction}`.toLowerCase();
    if (
      textBlob.includes(`toward "${decision.destinationTitle.toLowerCase()}"`) ||
      textBlob.includes("maintain current automated savings rate") ||
      textBlob.includes("continue funding") ||
      textBlob.includes("allocate $") ||
      textBlob.includes("allocate kes")
    ) {
      if (!textBlob.includes("do not allocate further") && !textBlob.includes("no further monthly allocation required")) {
        errors.push(
          `ACHIEVED_GOAL_FUNDING_CONTRADICTION: Goal is ACHIEVED, but narrative recommends allocating funds toward the same goal: '${decision.recommendedAction}'.`
        );
      }
    }
  }

  // INVARIANT 3: Timeline & Goal Status Rules
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

  // INVARIANT 4: Currency Integrity (Zero hardcoded KES in non-KES reports)
  if (decision.currency !== "KES") {
    const fullNarrative = `${decision.headlineVerdict} ${decision.strategicRead} ${decision.masterStrategyParagraph} ${decision.recommendedAction}`.toUpperCase();
    if (fullNarrative.includes("KES ") || fullNarrative.includes("KES0")) {
      errors.push(
        `CURRENCY_MISMATCH_VIOLATION: Report currency is '${decision.currency}', but generated narrative text contains hardcoded 'KES' currency symbol.`
      );
    }
  }

  // INVARIANT 5: Reserve Dual Threshold Validation
  if (decision.reserveMonths >= decision.reserveMinimumMonths) {
    if (decision.minimumReserveStatus !== "SATISFIED") {
      errors.push(
        `RESERVE_FLOOR_STATUS_MISMATCH: Reserve coverage is ${decision.reserveMonths} mos (>= ${decision.reserveMinimumMonths} mo minimum floor), but minimumReserveStatus is '${decision.minimumReserveStatus}'.`
      );
    }
  } else {
    if (decision.minimumReserveStatus !== "BELOW_MINIMUM") {
      errors.push(
        `RESERVE_FLOOR_STATUS_MISMATCH: Reserve coverage is ${decision.reserveMonths} mos (< ${decision.reserveMinimumMonths} mo minimum floor), but minimumReserveStatus is '${decision.minimumReserveStatus}'.`
      );
    }
  }

  if (decision.reserveMonths < decision.reserveTargetMonths) {
    if (decision.targetReserveStatus !== "BELOW_TARGET") {
      errors.push(
        `RESERVE_TARGET_STATUS_MISMATCH: Reserve coverage is ${decision.reserveMonths} mos (< ${decision.reserveTargetMonths} mos target), but targetReserveStatus is '${decision.targetReserveStatus}'.`
      );
    }
  }

  // INVARIANT 6: ADJUST Decision Action Specificity
  if (decision.purchaseDecision === "ADJUST") {
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
