/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * STEP 5: MASTER ANALYSIS ORCHESTRATOR (PROMPT 13)
 *
 * Orchestrates all deterministic and diagnostic analysis engines:
 * 1. Materiality Assessment: Evaluates capital, liquidity exposure, recurring drag,
 *    irreversibility, and uncertainty to classify depth (STANDARD / DEEP / HIGH-STAKES).
 * 2. Core Financial Calculations (TCO, Cash Flow, Amortization, Break-Even, Depreciation, Opportunity Cost).
 * 3. Micro-Scenario Scan (Hidden Costs, Timing, Liquidity, Dependencies).
 * 4. Multi-Scenario 5-Futures Simulation (Base, Favorable, Cautious, Adverse, Severe Stress).
 * 5. Sensitivity Analysis (Top 3 Variables & Tipping Point Thresholds).
 * 6. Opportunity Cost & Realistic Alternatives (6 Strategic Paths & Inaction Cost).
 * 7. Pre-Mortem Retrospective Diagnostic (12-Month Failure Autopsy & Mitigations).
 * 8. Aimly Red Team Independent Skeptical Audit & Verdict Gate.
 */

import { CurrencyCode } from "../types/finance";
import { DecisionIntelligenceObject } from "./master-decision-model";
import {
  runCoreFinancialAnalysis,
  MasterFinancialAnalysisReport,
} from "./core-financial-analyzer";
import {
  runMicroScenarioScan,
  MicroScenarioScanReport,
} from "./micro-scenario-scan";
import {
  runMultiScenarioSimulation,
  MultiScenarioSimulationReport,
} from "./multi-scenario-simulation-engine";
import {
  runSensitivityAnalysis,
  SensitivityAnalysisReport,
} from "./sensitivity-analysis-engine";
import {
  evaluateOpportunityAlternatives,
  OpportunityAlternativesReport,
} from "./opportunity-alternatives-engine";
import {
  runPreMortemDiagnostic,
  PreMortemReport,
} from "./pre-mortem-engine";
import {
  runAimlyRedTeamAudit,
  RedTeamAuditReport,
} from "./aimly-red-team";

export type AnalysisDepthTier = "STANDARD" | "DEEP" | "HIGH_STAKES";

export interface DecisionMaterialityAssessment {
  depthTier: AnalysisDepthTier;
  materialityScore: number; // 0 to 100
  factors: {
    capitalOutlayMagnitude: number; // 0 to 25
    liquidityExposureRatio: number; // 0 to 25
    recurringCommitmentWeight: number; // 0 to 20
    irreversibilityPenalty: number; // 0 to 15
    epistemicUncertaintyPenalty: number; // 0 to 15
  };
  rationaleEn: string;
  rationaleFr: string;
  rationaleEs: string;
  enabledModules: {
    coreFinancials: boolean;
    microScenarioScan: boolean;
    multiScenarioSimulation: boolean;
    sensitivityAnalysis: boolean;
    opportunityAlternatives: boolean;
    preMortemDiagnostic: boolean;
    aimlyRedTeamAudit: boolean;
  };
}

export interface Step5AnalysisOrchestrationReport {
  timestamp: string;
  currency: CurrencyCode;
  materiality: DecisionMaterialityAssessment;
  coreFinancialReport: MasterFinancialAnalysisReport;
  microScenarioReport: MicroScenarioScanReport;
  multiScenarioReport: MultiScenarioSimulationReport;
  sensitivityReport: SensitivityAnalysisReport;
  alternativesReport: OpportunityAlternativesReport;
  preMortemReport: PreMortemReport;
  redTeamReport: RedTeamAuditReport;
  analysisExecutionTimeMs: number;
}

/**
 * ASSESS DECISION MATERIALITY & DETERMINE REQUIRED ANALYSIS RIGOR
 */
export function assessDecisionMateriality(
  decisionObject: DecisionIntelligenceObject
): DecisionMaterialityAssessment {
  const amount = Math.max(0, decisionObject.definition.financial_amount.value || 0);
  const liquidSavings = Math.max(1, decisionObject.context.liquid_savings.value || 1);
  const monthlyIncome = Math.max(1, decisionObject.context.monthly_income.value || 1);
  const downPayment = Math.max(0, decisionObject.economics.down_payment.value || 0);
  const recurringUpkeep = Math.max(0, decisionObject.economics.recurring_cost.value || 0);

  const isLoan =
    decisionObject.definition.decision_category === "TAKE_A_LOAN" ||
    (downPayment > 0 && downPayment < amount);
  const isBusiness = decisionObject.definition.decision_category === "BUSINESS_EXPENSE";
  const reversibility = decisionObject.definition.reversibility_level;

  // Factor 1: Capital Outlay Magnitude (0-25)
  const incomeMultiple = amount / monthlyIncome;
  const capitalOutlayMagnitude = Math.min(25, Math.round(incomeMultiple * 10));

  // Factor 2: Liquidity Exposure Ratio (0-25)
  const exposurePct = (amount / liquidSavings) * 100;
  const liquidityExposureRatio = Math.min(25, Math.round(exposurePct * 0.35));

  // Factor 3: Recurring Commitment Weight (0-20)
  let recurringCommitmentWeight = 0;
  if (isLoan) recurringCommitmentWeight += 12;
  if (recurringUpkeep > 0) recurringCommitmentWeight += 8;

  // Factor 4: Irreversibility Penalty (0-15)
  let irreversibilityPenalty = 5;
  if (reversibility === "IRREVERSIBLE") irreversibilityPenalty = 15;
  else if (reversibility === "HARD_TO_REVERSE") irreversibilityPenalty = 10;
  else if (reversibility === "PARTIALLY_REVERSIBLE") irreversibilityPenalty = 5;
  else irreversibilityPenalty = 2;

  // Factor 5: Epistemic Uncertainty Penalty (0-15)
  let epistemicUncertaintyPenalty = 0;
  if (decisionObject.context.monthly_income.source !== "VERIFIED_FACT") epistemicUncertaintyPenalty += 5;
  if (decisionObject.economics.expected_revenue.value && decisionObject.economics.expected_revenue.source !== "VERIFIED_FACT") epistemicUncertaintyPenalty += 5;
  if (isBusiness) epistemicUncertaintyPenalty += 5;
  epistemicUncertaintyPenalty = Math.min(15, epistemicUncertaintyPenalty);

  const totalScore = Math.min(
    100,
    capitalOutlayMagnitude +
      liquidityExposureRatio +
      recurringCommitmentWeight +
      irreversibilityPenalty +
      epistemicUncertaintyPenalty
  );

  let depthTier: AnalysisDepthTier = "STANDARD";
  if (totalScore >= 65 || isLoan || isBusiness || exposurePct >= 40) {
    depthTier = "HIGH_STAKES";
  } else if (totalScore >= 35 || exposurePct >= 20 || amount >= 1500) {
    depthTier = "DEEP";
  } else {
    depthTier = "STANDARD";
  }

  const rationaleEn =
    depthTier === "HIGH_STAKES"
      ? "High-Stakes Decision: Involves significant capital, debt obligations, or unverified revenue. Triggering maximum analytical rigor, stress simulations, and skeptical Red Team review."
      : depthTier === "DEEP"
      ? "Deep Analysis: Meaningful financial commitment affecting liquid reserves. Full scenario, sensitivity, and alternative engines activated."
      : "Standard Analysis: Routine capital outlay with minimal liquidity impact. Core cash flow and opportunity cost evaluated cleanly without unnecessary friction.";

  const rationaleFr =
    depthTier === "HIGH_STAKES"
      ? "Décision à Fort Enjeu : Implique un capital substantiel, une dette ou des revenus incertains. Déclenchement de la rigueur maximale et de l'audit Red Team."
      : depthTier === "DEEP"
      ? "Analyse Approfondie : Engagement financier notable affectant les réserves. Simulation multi-scénarios et alternatives activées."
      : "Analyse Standard : Décaissement maîtrisé à faible impact sur la trésorerie. Analyse fluide des flux et du coût d'opportunité.";

  const rationaleEs =
    depthTier === "HIGH_STAKES"
      ? "Decisión de Alto Impacto: Involucra capital significativo o deuda. Rigor analítico máximo y auditoría Red Team activados."
      : depthTier === "DEEP"
      ? "Análisis Profundo: Compromiso financiero relevante sobre las reservas. Simulación multiescenario y alternativas activas."
      : "Análisis Estándar: Gasto controlado con bajo impacto en liquidez. Evaluación ágil de flujo y coste de oportunidad.";

  return {
    depthTier,
    materialityScore: totalScore,
    factors: {
      capitalOutlayMagnitude,
      liquidityExposureRatio,
      recurringCommitmentWeight,
      irreversibilityPenalty,
      epistemicUncertaintyPenalty,
    },
    rationaleEn,
    rationaleFr,
    rationaleEs,
    enabledModules: {
      coreFinancials: true,
      microScenarioScan: true,
      multiScenarioSimulation: true,
      sensitivityAnalysis: true,
      opportunityAlternatives: true,
      preMortemDiagnostic: true,
      aimlyRedTeamAudit: true,
    },
  };
}

/**
 * MASTER ORCHESTRATION OF STEP 5: ANALYZE
 */
export function runStep5MasterAnalysis(
  decisionObject: DecisionIntelligenceObject
): Step5AnalysisOrchestrationReport {
  const startTime = Date.now();
  const curr = decisionObject.definition.currency;

  const materiality = assessDecisionMateriality(decisionObject);
  const coreFinancialReport = runCoreFinancialAnalysis(decisionObject);
  const microScenarioReport = runMicroScenarioScan(decisionObject);
  const multiScenarioReport = runMultiScenarioSimulation(decisionObject);
  const sensitivityReport = runSensitivityAnalysis(decisionObject);
  const alternativesReport = evaluateOpportunityAlternatives(decisionObject);
  const preMortemReport = runPreMortemDiagnostic(decisionObject);
  const redTeamReport = runAimlyRedTeamAudit(decisionObject);

  const executionTimeMs = Date.now() - startTime;

  return {
    timestamp: new Date().toISOString(),
    currency: curr,
    materiality,
    coreFinancialReport,
    microScenarioReport,
    multiScenarioReport,
    sensitivityReport,
    alternativesReport,
    preMortemReport,
    redTeamReport,
    analysisExecutionTimeMs: executionTimeMs,
  };
}
