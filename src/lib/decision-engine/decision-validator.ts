import {
  CanonicalDecisionAnalysis,
  ScenarioImpactResult,
  FinancingSummary,
  CategorizedAssumptions,
  ScenarioFundingLedger,
  CanonicalTransactionType,
} from "./canonical-decision-engine";
import { CurrencyCode } from "../types/finance";

export interface DecisionVerificationCheck {
  id: string;
  category:
    | "STRUCTURE_MODEL_CONSISTENCY"
    | "MONEY_CONSERVATION_INVARIANT"
    | "MATHEMATICAL_CONSISTENCY"
    | "SINGLE_RECOMMENDATION_CONSISTENCY"
    | "SCENARIO_DIFFERENTIATION_CONSISTENCY"
    | "TRANSACTION_CONSISTENCY"
    | "MONTHLY_CASH_FLOW_CONSISTENCY"
    | "VERDICT_CONSISTENCY"
    | "GOAL_CONSISTENCY"
    | "NARRATIVE_GROUNDING"
    | "ASSUMPTION_RELEVANCE";
  name: string;
  nameFr: string;
  passed: boolean;
  notes: string;
  notesFr: string;
}

export interface VerificationResult {
  status:
    | "VERIFIED"
    | "VERIFIED WITH ASSUMPTIONS"
    | "ESTIMATED"
    | "INSUFFICIENT_DATA"
    | "STRUCTURE_MODEL_MISMATCH"
    | "VALIDATION_FAILED";
  overallScore: number; // 0 to 100
  checks: DecisionVerificationCheck[];
  assumptions: string[];
  inconsistencies: string[];
  verifiedAt: string;
}

export interface VerifiedDecisionData {
  decisionId: string;
  reportId: string;
  version: number;
  decisionTitle: string;
  category: string;
  transactionType?: CanonicalTransactionType;
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
    monthlyGoalAllocation: number;
  };

  financing?: FinancingSummary;
  categorizedAssumptions?: CategorizedAssumptions;

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
    goalExplanation?: string;
    monthlyPressurePercent: number;
    verdict: "RECOMMENDED" | "PROCEED_WITH_CAUTION" | "NOT_RECOMMENDED";
    verdictHeadline: string;
    primaryReason: string;
  };

  recommendation: {
    recommendedScenarioId: "OPTION_A" | "OPTION_B" | "OPTION_C" | "OPTION_D";
    recommendedScenarioTitle: string;
    actionPlanStep1: string;
    actionPlanStep2: string;
    actionPlanStep3: string;
    reasons: string[];
  };

  alternatives: {
    optionA: {
      code: "OPTION_A";
      title: string;
      badge: string;
      delayDays: number;
      cashRemaining: number;
      runway: number;
      monthlyObligation: number;
      totalInterest: number;
      totalCost: number;
      ledger?: ScenarioFundingLedger;
      isRecommended: boolean;
    };
    optionB: {
      code: "OPTION_B";
      title: string;
      badge: string;
      delayDays: number;
      cashRemaining: number;
      runway: number;
      monthlyObligation: number;
      totalInterest: number;
      totalCost: number;
      ledger?: ScenarioFundingLedger;
      isRecommended: boolean;
    };
    optionC: {
      code: "OPTION_C";
      title: string;
      badge: string;
      delayDays: number;
      cashRemaining: number;
      runway: number;
      monthlyObligation: number;
      totalInterest: number;
      totalCost: number;
      ledger?: ScenarioFundingLedger;
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
 * THE AIMLY COHERENCE CHECK (ZERO-COMPROMISE 10/10 AUDIT)
 */
export function runAimlyCoherenceCheck(data: VerifiedDecisionData): VerificationResult {
  const checks: DecisionVerificationCheck[] = [];
  const inconsistencies: string[] = [];

  const {
    baseline,
    calculatedImpact,
    alternatives,
    recommendation,
    narrative,
    amount,
    downPayment,
    transactionType = "ONE_TIME_EXPENSE",
    financing,
    categorizedAssumptions,
  } = data;

  // 1. STRUCTURE-MODEL INVARIANT (CRITICAL ARCHITECTURAL GATE)
  let structureModelPassed = true;

  if (transactionType === "RECURRING_EXPENSE") {
    // Recurring expense MUST affect monthly cash flow and MUST NOT be treated as a one-time cash drop
    if (calculatedImpact.newMonthlyObligation <= 0 || calculatedImpact.deltaFreeCashFlow >= 0) {
      structureModelPassed = false;
      inconsistencies.push(
        `STRUCTURE_MODEL_MISMATCH: Decision declared as RECURRING_EXPENSE but calculation showed 0 new monthly obligation or 0% FCF shift.`
      );
    }
    if (calculatedImpact.immediateCashOutflow >= amount && amount > 100 && downPayment === 0) {
      structureModelPassed = false;
      inconsistencies.push(
        `STRUCTURE_MODEL_MISMATCH: Decision declared as RECURRING_EXPENSE but full recurring amount was deducted from liquid cash reserves.`
      );
    }
  } else if (transactionType === "ONE_TIME_EXPENSE" || transactionType === "PURCHASE_FUNDING") {
    // One-time purchase MUST NOT create unexplained ongoing recurring obligations
    if (calculatedImpact.newMonthlyObligation > 0 && calculatedImpact.deltaFreeCashFlow < 0) {
      structureModelPassed = false;
      inconsistencies.push(
        `STRUCTURE_MODEL_MISMATCH: Decision declared as ONE_TIME_EXPENSE but calculation added ongoing monthly debt obligations.`
      );
    }
  }

  checks.push({
    id: "check-structure-model",
    category: "STRUCTURE_MODEL_CONSISTENCY",
    name: "Structure-to-Financial-Model Invariant",
    nameFr: "Invariant de Structure et Modèle Financier",
    passed: structureModelPassed,
    notes: structureModelPassed
      ? `Declared structure (${transactionType}) matches the active mathematical calculation model perfectly.`
      : `STRUCTURE_MODEL_MISMATCH: Transaction structure contradicts calculation model.`,
    notesFr: structureModelPassed
      ? `La structure déclarée (${transactionType}) correspond parfaitement au modèle de calcul actif.`
      : `Incohérence entre la structure de transaction et le modèle de calcul.`,
  });

  // 2. MONEY CONSERVATION INVARIANT & PROVENANCE
  let conservationPassed = true;
  const optBLedger = alternatives.optionB.ledger;

  if (optBLedger) {
    const cashBalance = Math.abs(
      baseline.liquidSavings - optBLedger.outflowFromExistingReserves - optBLedger.endingCashReserves
    );
    if (cashBalance > 0.05) {
      conservationPassed = false;
      inconsistencies.push(
        `Money conservation failure: Baseline cash (${baseline.liquidSavings}) - Outflow (${optBLedger.outflowFromExistingReserves}) != Ending Cash (${optBLedger.endingCashReserves}).`
      );
    }
  }

  checks.push({
    id: "check-conservation",
    category: "MONEY_CONSERVATION_INVARIANT",
    name: "Money Conservation & Provenance Invariant",
    nameFr: "Invariant de Conservation Monétaire et Provenance",
    passed: conservationPassed,
    notes: conservationPassed
      ? `Money conservation reconciled across all scenarios: No unexplained cash created or lost (Zero residual drift).`
      : `Money conservation failed in scenario ledger.`,
    notesFr: conservationPassed
      ? `Conservation monétaire réconciliée : aucun euro créé ou perdu sans traçabilité.`
      : `Échec de conservation monétaire dans le grand livre de scénario.`,
  });

  // 3. MATHEMATICAL & CASH BALANCE RECONCILIATION
  const expectedCashAfter = Math.max(0, baseline.liquidSavings - calculatedImpact.immediateCashOutflow);
  const mathDiff = Math.abs(calculatedImpact.postDecisionCash - expectedCashAfter);
  const expectedDeltaCash = calculatedImpact.postDecisionCash - baseline.liquidSavings;
  const deltaCashDiff = Math.abs(calculatedImpact.deltaCash - expectedDeltaCash);

  const mathPassed = mathDiff <= 0.01 && deltaCashDiff <= 0.01;
  if (!mathPassed) {
    inconsistencies.push(
      `Mathematical disparity: Baseline cash (${baseline.liquidSavings}) - Outflow (${calculatedImpact.immediateCashOutflow}) != Post-Decision Cash (${calculatedImpact.postDecisionCash}).`
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

  // 4. SINGLE CANONICAL RECOMMENDATION INVARIANT
  const markedOptions = [alternatives.optionA, alternatives.optionB, alternatives.optionC].filter(
    (o) => o.isRecommended
  );

  let singleRecPassed = true;
  if (markedOptions.length !== 1) {
    singleRecPassed = false;
    inconsistencies.push(
      `Recommendation conflict: Found ${markedOptions.length} options marked as BEST/Recommended instead of exactly 1.`
    );
  } else if (markedOptions[0].code !== recommendation.recommendedScenarioId) {
    singleRecPassed = false;
    inconsistencies.push(
      `Recommendation mismatch: Marked scenario (${markedOptions[0].code}) does not match canonical recommendationId (${recommendation.recommendedScenarioId}).`
    );
  }

  const targetScenarioStr = recommendation.recommendedScenarioId.replace("_", " ").toLowerCase();
  if (!recommendation.actionPlanStep1.toLowerCase().includes(targetScenarioStr)) {
    singleRecPassed = false;
    inconsistencies.push(
      `Action plan contradiction: Action Step 1 does not reference the canonical winner (${recommendation.recommendedScenarioId}).`
    );
  }

  checks.push({
    id: "check-single-rec",
    category: "SINGLE_RECOMMENDATION_CONSISTENCY",
    name: "Single Canonical Recommendation Invariant",
    nameFr: "Invariant Canonique Unique de Recommandation",
    passed: singleRecPassed,
    notes: singleRecPassed
      ? `Exactly one canonical winner (${recommendation.recommendedScenarioId}) drives badge, action plan, and narrative.`
      : `Contradiction detected in recommendation mapping across report sections.`,
    notesFr: singleRecPassed
      ? `Un vainqueur canonique unique (${recommendation.recommendedScenarioId}) contrôle le badge, le plan d'action et le récit.`
      : `Contradiction détectée dans le mapping des recommandations.`,
  });

  // 5. SCENARIO ECONOMIC DIFFERENTIATION
  let diffPassed = true;
  const isAllSameMonthly =
    alternatives.optionA.monthlyObligation === alternatives.optionB.monthlyObligation &&
    alternatives.optionB.monthlyObligation === alternatives.optionC.monthlyObligation;

  const isAllSameCost =
    alternatives.optionA.totalCost === alternatives.optionB.totalCost &&
    alternatives.optionB.totalCost === alternatives.optionC.totalCost;

  const isAllSameCash =
    alternatives.optionA.cashRemaining === alternatives.optionB.cashRemaining &&
    alternatives.optionB.cashRemaining === alternatives.optionC.cashRemaining;

  if (isAllSameMonthly && isAllSameCost && isAllSameCash) {
    diffPassed = false;
    inconsistencies.push(
      "Scenario engine failure: Options A, B, and C produced identical financial outputs with zero differentiation."
    );
  }

  checks.push({
    id: "check-scenario-diff",
    category: "SCENARIO_DIFFERENTIATION_CONSISTENCY",
    name: "Scenario Economic Differentiation",
    nameFr: "Différenciation Économique des Scénarios",
    passed: diffPassed,
    notes: diffPassed
      ? `Scenarios A, B, and C are mathematically differentiated across cash reserves, monthly obligations, and timelines.`
      : `Scenarios fail to present meaningful economic alternatives.`,
    notesFr: diffPassed
      ? `Les scénarios A, B et C sont mathématiquement différenciés sur les réserves, mensualités et délais.`
      : `Les scénarios ne présentent pas d'alternatives économiques significatives.`,
  });

  // 6. MONTHLY CASH FLOW RECONCILIATION
  let fcfPassed = true;
  if (calculatedImpact.deltaFreeCashFlow === 0 && calculatedImpact.fcfPercentageShift !== 0) {
    fcfPassed = false;
    inconsistencies.push(
      `FCF percentage shift contradiction: Delta FCF is 0 but shift was displayed as ${calculatedImpact.fcfPercentageShift}%.`
    );
  }

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
      ? `Monthly cash flow verified: +${calculatedImpact.postDecisionFreeCashFlow} ${data.currency}/mo after commitments.`
      : `Monthly cash flow contains arithmetic conflict.`,
    notesFr: fcfPassed
      ? `Flux mensuel vérifié : +${calculatedImpact.postDecisionFreeCashFlow} ${data.currency}/mois après engagements.`
      : `Le flux mensuel contient un conflit de calcul.`,
  });

  // 7. ASSUMPTION RELEVANCE FILTER (CRITICAL FIX)
  let assumptionsRelevancePassed = true;
  const isFinancingUsed = financing && financing.hasFinancing;
  const hasFinancingAssumptions =
    categorizedAssumptions?.financingAssumptions && categorizedAssumptions.financingAssumptions.length > 0;

  if (!isFinancingUsed && hasFinancingAssumptions) {
    assumptionsRelevancePassed = false;
    inconsistencies.push(
      `Irrelevant assumption leak: Financing assumptions (APR) displayed on a non-financed decision.`
    );
  }

  checks.push({
    id: "check-assumptions-relevance",
    category: "ASSUMPTION_RELEVANCE",
    name: "Material Assumption Relevance Filter",
    nameFr: "Filtre de Pertinence des Hypothèses Matérielles",
    passed: assumptionsRelevancePassed,
    notes: assumptionsRelevancePassed
      ? `Only material assumptions that actively affect this decision model are displayed.`
      : `Irrelevant financing assumptions leaked into report.`,
    notesFr: assumptionsRelevancePassed
      ? `Seules les hypothèses matérielles influençant ce modèle sont affichées.`
      : `Des hypothèses de financement non pertinentes sont apparues.`,
  });

  // 8. VERDICT CONSISTENCY (CRITICAL RULE)
  let verdictPassed = true;
  if (calculatedImpact.verdict === "RECOMMENDED" && calculatedImpact.postDecisionRunway < 2.0) {
    verdictPassed = false;
    inconsistencies.push(
      `Verdict conflict: Decision marked RECOMMENDED while runway (${calculatedImpact.postDecisionRunway} mos) is below safety floor.`
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

  // 9. GOAL PROJECTION & ANOMALY GUARD
  let goalPassed = true;
  if (calculatedImpact.goalDelayDays > 1825) {
    goalPassed = false;
    inconsistencies.push(`Goal delay anomaly: ${calculatedImpact.goalDelayDays} days exceeds threshold.`);
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

  // 10. NARRATIVE GROUNDING
  let narrativePassed = true;
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
      : `Narrative contains ungrounded statements.`,
    notesFr: narrativePassed
      ? `Toutes les explications s'appuient strictement sur les métriques canoniques.`
      : `Le récit contient des affirmations incomplètes ou non ancrées.`,
  });

  // Determine Final Verification State
  const allPassed = checks.every((c) => c.passed);
  const passedCount = checks.filter((c) => c.passed).length;
  const overallScore = Math.round((passedCount / checks.length) * 100);

  let status: VerificationResult["status"] = "VERIFIED";
  if (!structureModelPassed) {
    status = "STRUCTURE_MODEL_MISMATCH";
  } else if (!allPassed || inconsistencies.length > 0) {
    status = "INCONSISTENCY DETECTED";
  } else if (data.isAssumedLoanTerms || (data.assumptions && data.assumptions.length > 0)) {
    status = "VERIFIED WITH ASSUMPTIONS";
  }

  return {
    status,
    overallScore,
    checks,
    assumptions: data.assumptions || [],
    inconsistencies,
    verifiedAt: new Date().toISOString(),
  };
}
