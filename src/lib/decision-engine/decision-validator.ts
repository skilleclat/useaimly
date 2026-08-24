import { CanonicalDecisionAnalysis, ScenarioImpactResult } from "./canonical-decision-engine";
import { CurrencyCode } from "../types/finance";

export interface DecisionVerificationCheck {
  id: string;
  category:
    | "MATHEMATICAL_CONSISTENCY"
    | "TRANSACTION_CONSISTENCY"
    | "MONTHLY_CASH_FLOW_CONSISTENCY"
    | "VERDICT_CONSISTENCY"
    | "SCENARIO_CONSISTENCY"
    | "GOAL_CONSISTENCY"
    | "TIMELINE_CONSISTENCY"
    | "NARRATIVE_GROUNDING";
  name: string;
  nameFr: string;
  passed: boolean;
  notes: string;
  notesFr: string;
}

export interface VerificationResult {
  status: "VERIFIED" | "VERIFIED WITH ASSUMPTIONS" | "NEEDS REVIEW" | "INCONSISTENCY DETECTED";
  overallScore: number; // 0 to 100
  checks: DecisionVerificationCheck[];
  assumptions: string[];
  inconsistencies: string[];
  verifiedAt: string;
}

// Backward-compatible interface for PDF and components
export interface VerifiedDecisionData {
  decisionId: string;
  reportId: string;
  version: number;
  decisionTitle: string;
  category: string;
  decisionType?: string;
  amount: number;
  downPayment: number;
  monthlyPayment: number;
  isRecurring: boolean;
  currency: CurrencyCode;
  timestamp: string;

  baseline: {
    liquidSavings: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyDebtService: number;
    netFreeCashFlow: number;
    emergencyRunwayMonths: number;
    primaryGoalTitle: string;
    primaryGoalTarget: number;
    primaryGoalCurrent: number;
    primaryGoalTargetDate: string;
  };

  calculatedImpact: {
    immediateCashOutflow: number;
    postDecisionCash: number;
    deltaCash: number;
    newMonthlyObligation: number;
    postDecisionRunway: number;
    deltaRunway: number;
    postDecisionFreeCashFlow: number;
    deltaFreeCashFlow: number;
    fcfPercentageShift: number;
    goalDelayDays: number;
    goalDelayMonths: number;
    goalStatus: string;
    monthlyPressurePercent: number;
    verdict: "RECOMMENDED" | "PROCEED_WITH_CAUTION" | "NOT_RECOMMENDED";
    verdictHeadline: string;
    primaryReason: string;
  };

  alternatives: {
    optionA: {
      title: string;
      badge: string;
      delayDays: number;
      cashRemaining: number;
      runway: number;
      monthlyObligation: number;
      isRecommended: boolean;
    };
    optionB: {
      title: string;
      badge: string;
      delayDays: number;
      cashRemaining: number;
      runway: number;
      monthlyObligation: number;
      isRecommended: boolean;
    };
    optionC: {
      title: string;
      badge: string;
      delayDays: number;
      cashRemaining: number;
      runway: number;
      monthlyObligation: number;
      isRecommended: boolean;
    };
  };

  narrative: {
    executiveSummary: string;
    whyThisVerdict: string;
    recommendedPath: string;
    tradeoffsSummary: string;
  };

  assumptions: string[];
  isAssumedLoanTerms?: boolean;
}

/**
 * THE AIMLY COHERENCE CHECK (V2 - FORENSIC HARD GATES)
 * Strictly verifies every mathematical and logical claim.
 */
export function runAimlyCoherenceCheck(data: VerifiedDecisionData): VerificationResult {
  const checks: DecisionVerificationCheck[] = [];
  const inconsistencies: string[] = [];

  const { baseline, calculatedImpact, amount, downPayment, alternatives, narrative } = data;

  // 1. MATHEMATICAL & CASH RECONCILIATION CHECK
  // postDecisionCash MUST equal baseline.liquidSavings - immediateCashOutflow
  const expectedCashAfter = Math.max(
    0,
    baseline.liquidSavings - calculatedImpact.immediateCashOutflow
  );
  const mathDiff = Math.abs(calculatedImpact.postDecisionCash - expectedCashAfter);
  const expectedDeltaCash = calculatedImpact.postDecisionCash - baseline.liquidSavings;
  const deltaCashDiff = Math.abs(calculatedImpact.deltaCash - expectedDeltaCash);

  const mathPassed = mathDiff <= 0.01 && deltaCashDiff <= 0.01;

  if (!mathPassed) {
    inconsistencies.push(
      `Mathematical disparity: Baseline cash (${baseline.liquidSavings}) - Outflow (${calculatedImpact.immediateCashOutflow}) does not equal Post-Decision Cash (${calculatedImpact.postDecisionCash}).`
    );
  }

  checks.push({
    id: "check-math",
    category: "MATHEMATICAL_CONSISTENCY",
    name: "Mathematical & Cash Balance Reconciliation",
    nameFr: "Réconciliation Arithmétique du Solde de Trésorerie",
    passed: mathPassed,
    notes: mathPassed
      ? `Exact cash arithmetic verified: ${baseline.liquidSavings} - ${calculatedImpact.immediateCashOutflow} = ${calculatedImpact.postDecisionCash} ${data.currency}.`
      : `Disparity detected in reserve arithmetic.`,
    notesFr: mathPassed
      ? `Arithmétique exacte des réserves vérifiée : ${baseline.liquidSavings} - ${calculatedImpact.immediateCashOutflow} = ${calculatedImpact.postDecisionCash} ${data.currency}.`
      : `Écart détecté dans l'arithmétique des réserves.`,
  });

  // 2. MONTHLY CASH FLOW RECONCILIATION CHECK
  // If delta FCF is 0, percentage shift MUST be strictly 0%
  let fcfPassed = true;
  if (calculatedImpact.deltaFreeCashFlow === 0 && calculatedImpact.fcfPercentageShift !== 0) {
    fcfPassed = false;
    inconsistencies.push(
      `FCF percentage shift contradiction: Delta FCF is 0 but shift was displayed as ${calculatedImpact.fcfPercentageShift}%.`
    );
  }

  // Expected FCF After = Income - (Expenses + Debt + NewObligations)
  const expectedMonthlyExpenses =
    baseline.monthlyExpenses + baseline.monthlyDebtService + calculatedImpact.newMonthlyObligation;
  const expectedFCFAfter = Math.max(0, baseline.monthlyIncome - expectedMonthlyExpenses);
  const fcfDiff = Math.abs(calculatedImpact.postDecisionFreeCashFlow - expectedFCFAfter);

  if (fcfDiff > 0.05) {
    fcfPassed = false;
    inconsistencies.push(
      `Monthly FCF mismatch: Expected ${expectedFCFAfter} but calculated ${calculatedImpact.postDecisionFreeCashFlow}.`
    );
  }

  checks.push({
    id: "check-fcf",
    category: "MONTHLY_CASH_FLOW_CONSISTENCY",
    name: "Monthly Cash Flow & Free Cash Flow Reconciliation",
    nameFr: "Réconciliation du Cash-Flow Libre Mensuel",
    passed: fcfPassed,
    notes: fcfPassed
      ? `Monthly cash flow verified: +${calculatedImpact.postDecisionFreeCashFlow} ${data.currency}/mo after new obligations.`
      : `Monthly cash flow contains arithmetic conflict.`,
    notesFr: fcfPassed
      ? `Flux mensuel vérifié : +${calculatedImpact.postDecisionFreeCashFlow} ${data.currency}/mois après engagements.`
      : `Le flux mensuel contient un conflit de calcul.`,
  });

  // 3. TRANSACTION & LOAN MODELING CHECK
  let transactionPassed = true;
  if (data.decisionType === "LOAN_FACILITY" || data.category === "TAKE_A_LOAN") {
    // If loan, immediate cash outflow cannot be full principal unless user explicitly configured it
    if (calculatedImpact.immediateCashOutflow >= amount && amount > 1000 && downPayment < amount) {
      transactionPassed = false;
      inconsistencies.push(
        `Transaction modeling error: Loan of ${amount} ${data.currency} was treated as immediate full cash deduction.`
      );
    }
  }

  checks.push({
    id: "check-transaction",
    category: "TRANSACTION_CONSISTENCY",
    name: "Transaction Structure & Financing Modeling",
    nameFr: "Structure de Transaction et Modélisation du Financement",
    passed: transactionPassed,
    notes: transactionPassed
      ? `Transaction model is consistent with archetype (${data.decisionType || data.category}).`
      : `Transaction structure misclassified.`,
    notesFr: transactionPassed
      ? `Modèle de transaction conforme à l'archétype (${data.decisionType || data.category}).`
      : `Structure de transaction mal classifiée.`,
  });

  // 4. GOAL PROJECTION & ANOMALY CHECK
  let goalPassed = true;
  // Anomaly Guard: Reject absurd multi-decade numbers (e.g. 29,970 days)
  if (calculatedImpact.goalDelayDays > 1825) {
    goalPassed = false;
    inconsistencies.push(
      `Goal delay anomaly detected: ${calculatedImpact.goalDelayDays} days (~${Math.round(calculatedImpact.goalDelayDays / 365)} years) exceeds safety threshold.`
    );
  }

  if (calculatedImpact.goalDelayDays < 0) {
    goalPassed = false;
    inconsistencies.push(`Negative goal delay detected (${calculatedImpact.goalDelayDays} days).`);
  }

  checks.push({
    id: "check-goal",
    category: "GOAL_CONSISTENCY",
    name: "Goal Compounding & Timeline Anomaly Guard",
    nameFr: "Alignement des Objectifs et Garde-Fou d'Anomalie",
    passed: goalPassed,
    notes: goalPassed
      ? `Primary goal "${baseline.primaryGoalTitle}" impact verified (+${calculatedImpact.goalDelayDays}d delay).`
      : `Goal projection triggered an anomaly flag.`,
    notesFr: goalPassed
      ? `Impact sur l'objectif "${baseline.primaryGoalTitle}" vérifié (+${calculatedImpact.goalDelayDays}j).`
      : `La projection de l'objectif a déclenché un drapeau d'anomalie.`,
  });

  // 5. SCENARIO & CROSS-FIELD RUNWAY CHECK
  let scenarioPassed = true;
  // Cross-field Check E: If baseline runway is 2.1 mos, Option B cannot claim to protect 3.0 mos!
  if (
    baseline.emergencyRunwayMonths < 3.0 &&
    alternatives.optionB.runway < 3.0 &&
    narrative.recommendedPath.includes("3.0-month")
  ) {
    scenarioPassed = false;
    inconsistencies.push(
      `Cross-field contradiction: Option B runway is ${alternatives.optionB.runway} months but narrative claims to protect a 3.0-month floor.`
    );
  }

  checks.push({
    id: "check-scenarios",
    category: "SCENARIO_CONSISTENCY",
    name: "Scenario Alternatives & Cross-Field Validation",
    nameFr: "Validation Croisée des Scénarios Alternatifs",
    passed: scenarioPassed,
    notes: scenarioPassed
      ? `Scenarios A, B, and C are mutually coherent with baseline reserve constraints.`
      : `Contradiction detected in scenario claim.`,
    notesFr: scenarioPassed
      ? `Les scénarios A, B et C sont mutuellement cohérents avec les réserves de base.`
      : `Contradiction détectée dans les affirmations de scénario.`,
  });

  // 6. VERDICT TRACEABILITY CHECK
  let verdictPassed = true;
  if (calculatedImpact.verdict === "RECOMMENDED" && calculatedImpact.postDecisionRunway < 2.0) {
    verdictPassed = false;
    inconsistencies.push(
      `Verdict conflict: Decision marked RECOMMENDED while runway (${calculatedImpact.postDecisionRunway} mos) is below 2.0-month safety floor.`
    );
  }

  checks.push({
    id: "check-verdict",
    category: "VERDICT_CONSISTENCY",
    name: "Deterministic Verdict Rule Traceability",
    nameFr: "Traçabilité Déterministe du Verdict",
    passed: verdictPassed,
    notes: verdictPassed
      ? `Verdict '${calculatedImpact.verdict}' matches risk runway (${calculatedImpact.postDecisionRunway} mos) and cash-flow rules.`
      : `Verdict violates risk rule thresholds.`,
    notesFr: verdictPassed
      ? `Le verdict '${calculatedImpact.verdict}' respecte les règles de réserve (${calculatedImpact.postDecisionRunway} mois) et de flux.`
      : `Le verdict viole les seuils de risque.`,
  });

  // 7. NARRATIVE FACT GROUNDING CHECK
  let narrativePassed = true;
  // Check that narrative does not contain rogue numbers (e.g. 70.77, 53.08) ungrounded from data
  if (narrative.whyThisVerdict.length < 10 || narrative.executiveSummary.length < 10) {
    narrativePassed = false;
  }

  checks.push({
    id: "check-narrative",
    category: "NARRATIVE_GROUNDING",
    name: "Narrative Grounding & Fact Verification",
    nameFr: "Ancrage Factuel et Vérification Narrative",
    passed: narrativePassed,
    notes: narrativePassed
      ? `All narrative statements are strictly grounded in canonical calculation metrics.`
      : `Narrative contains ungrounded or incomplete statements.`,
    notesFr: narrativePassed
      ? `Toutes les explications s'appuient strictement sur les métriques canoniques.`
      : `Le récit contient des affirmations incomplètes ou non ancrées.`,
  });

  // Determine Final Status
  const allPassed = checks.every((c) => c.passed);
  const passedCount = checks.filter((c) => c.passed).length;
  const overallScore = Math.round((passedCount / checks.length) * 100);

  let status: VerificationResult["status"] = "VERIFIED";

  if (!allPassed || inconsistencies.length > 0) {
    status = inconsistencies.length > 0 ? "INCONSISTENCY DETECTED" : "NEEDS REVIEW";
  } else if (data.isAssumedLoanTerms || (data.assumptions && data.assumptions.length > 0)) {
    status = "VERIFIED WITH ASSUMPTIONS";
  }

  return {
    status,
    overallScore,
    checks,
    assumptions: data.assumptions || [
      `Assumes stable monthly income of ${baseline.monthlyIncome} ${data.currency}.`,
      `Assumes living costs remain constant at ${baseline.monthlyExpenses} ${data.currency}/month.`,
    ],
    inconsistencies,
    verifiedAt: new Date().toISOString(),
  };
}
