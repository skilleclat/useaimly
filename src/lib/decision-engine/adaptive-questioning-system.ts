/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * STEP 2: DETAILS — ADAPTIVE QUESTIONING SYSTEM (PROMPT 3)
 *
 * Dynamically prioritizes questions based on:
 * QUESTION_IMPORTANCE = Financial Materiality × Uncertainty × Decision Sensitivity
 *
 * Supports numeric inputs, ranges, choices, "I don't know", estimates, and skips.
 * Never blocks the analysis: unknown values are marked as UNKNOWN with internal uncertainty modeling.
 */

import { CurrencyCode } from "../types/finance";
import {
  DecisionIntelligenceObject,
  MasterDecisionCategory,
  createUserProvided,
  createUserEstimate,
  createUnknown,
} from "./master-decision-model";

export type QuestionInputType = "NUMERIC" | "CHOICE" | "BOOLEAN" | "RANGE";

export interface QuestionChoiceOption {
  id: string;
  labelEn: string;
  labelFr: string;
  labelEs: string;
  value: any;
  subtextEn?: string;
  subtextFr?: string;
  subtextEs?: string;
}

export interface AdaptiveQuestion {
  id: string;
  targetField: string; // Keypath or semantic field in Decision Intelligence Object
  category: MasterDecisionCategory | "ALL";
  titleEn: string;
  titleFr: string;
  titleEs: string;
  helperEn: string;
  helperFr: string;
  helperEs: string;
  inputType: QuestionInputType;
  choices?: QuestionChoiceOption[];
  minNumeric?: number;
  maxNumeric?: number;
  stepNumeric?: number;
  unitSuffix?: string;
  defaultValue?: any;
  financialMateriality: number; // 0.0 to 1.0 (magnitude of cash/cost impact)
  uncertainty: number;          // 0.0 to 1.0 (how uncertain the engine currently is)
  decisionSensitivity: number;  // 0.0 to 1.0 (how likely this changes the final recommendation)
  importanceScore: number;      // Computed priority score
  allowsDontKnow: boolean;
  allowsEstimate: boolean;
  impactIfUnknownEn: string;
  impactIfUnknownFr: string;
  impactIfUnknownEs: string;
}

export interface UserAnswerRecord {
  questionId: string;
  value: any;
  isUnknown: boolean;
  isEstimate: boolean;
  answeredAt: string;
}

export interface AdaptiveQuestioningState {
  answeredQuestions: Record<string, UserAnswerRecord>;
  skippedQuestionIds: string[];
  currentPendingQuestions: AdaptiveQuestion[];
  isSufficientForResponsibleAnalysis: boolean;
  remainingUncertaintyScore: number;
}

/**
 * MASTER CATALOG OF CANDIDATE ADAPTIVE QUESTIONS
 */
const QUESTION_CATALOG: Omit<AdaptiveQuestion, "importanceScore">[] = [
  // 1. Down Payment / Upfront Cash
  {
    id: "q_down_payment",
    targetField: "economics.down_payment",
    category: "ALL",
    titleEn: "How much upfront cash or down payment will you put down?",
    titleFr: "Combien d'apport initial ou de paiement comptant prévoyez-vous ?",
    titleEs: "¿Cuánto aporte inicial o pago al contado planea realizar?",
    helperEn: "Reduces loan borrowing or initial cash buffer depletion.",
    helperFr: "Réduit le montant emprunté ou l'érosion de votre matelas de liquidités.",
    helperEs: "Reduce el monto del préstamo o la erosión de su reserva líquida.",
    inputType: "NUMERIC",
    defaultValue: 0,
    financialMateriality: 0.9,
    uncertainty: 0.8,
    decisionSensitivity: 0.85,
    allowsDontKnow: true,
    allowsEstimate: true,
    impactIfUnknownEn: "Engine will model full cash upfront vs standard 15% financing down payment.",
    impactIfUnknownFr: "Le moteur modélisera un paiement 100% comptant vs un apport standard de 15%.",
    impactIfUnknownEs: "El motor modelará el pago 100% al contado frente a un aporte estándar del 15%.",
  },

  // 2. Financing APR / Interest Rate
  {
    id: "q_interest_rate",
    targetField: "economics.interest_rate",
    category: "ALL",
    titleEn: "What annual interest rate (APR) do you expect if financed?",
    titleFr: "Quel taux d'intérêt annuel (TAEG) anticipez-vous en cas d'emprunt ?",
    titleEs: "¿Qué tasa de interés anual (TAE) prevé si recurre a financiación?",
    helperEn: "Directly determines total interest drag and lifetime purchase cost.",
    helperFr: "Détermine directement le coût des intérêts et le coût total de revient.",
    helperEs: "Determina directamente el costo de intereses y el costo total de la decisión.",
    inputType: "NUMERIC",
    defaultValue: 8.5,
    unitSuffix: "%",
    minNumeric: 0,
    maxNumeric: 40,
    stepNumeric: 0.5,
    financialMateriality: 0.8,
    uncertainty: 0.7,
    decisionSensitivity: 0.9,
    allowsDontKnow: true,
    allowsEstimate: true,
    impactIfUnknownEn: "Engine will use regional benchmark average (8.5%).",
    impactIfUnknownFr: "Le moteur appliquera le taux moyen de référence régional (8,5%).",
    impactIfUnknownEs: "El motor aplicará la tasa media de referencia regional (8,5%).",
  },

  // 3. Loan Term / Duration
  {
    id: "q_loan_duration",
    targetField: "economics.loan_duration",
    category: "ALL",
    titleEn: "What loan repayment duration are you considering?",
    titleFr: "Quelle durée de remboursement envisagez-vous ?",
    titleEs: "¿Qué plazo de amortización del préstamo está considerando?",
    helperEn: "Shorter loans save significant interest; longer loans reduce monthly payment pressure.",
    helperFr: "Un prêt court économise des intérêts ; un prêt plus long allège la mensualité.",
    helperEs: "Un plazo más corto ahorra intereses; un plazo más largo alivia la cuota mensual.",
    inputType: "CHOICE",
    choices: [
      { id: "12", labelEn: "12 Months (1 Year)", labelFr: "12 Mois (1 An)", labelEs: "12 Meses (1 Año)", value: 12 },
      { id: "24", labelEn: "24 Months (2 Years)", labelFr: "24 Mois (2 Ans)", labelEs: "24 Meses (2 Años)", value: 24 },
      { id: "36", labelEn: "36 Months (3 Years)", labelFr: "36 Mois (3 Ans)", labelEs: "36 Meses (3 Años)", value: 36 },
      { id: "48", labelEn: "48 Months (4 Years)", labelFr: "48 Mois (4 Ans)", labelEs: "48 Meses (4 Años)", value: 48 },
      { id: "60", labelEn: "60 Months (5 Years)", labelFr: "60 Mois (5 Ans)", labelEs: "60 Meses (5 Años)", value: 60 },
    ],
    defaultValue: 36,
    financialMateriality: 0.75,
    uncertainty: 0.6,
    decisionSensitivity: 0.8,
    allowsDontKnow: true,
    allowsEstimate: true,
    impactIfUnknownEn: "Engine will evaluate 12, 24, and 36 month comparative matrices.",
    impactIfUnknownFr: "Le moteur comparera les grilles 12, 24 et 36 mois.",
    impactIfUnknownEs: "El motor evaluará matrices comparativas a 12, 24 y 36 meses.",
  },

  // 4. Secondary Recurring Upkeep / Insurance
  {
    id: "q_recurring_upkeep",
    targetField: "economics.recurring_cost",
    category: "ALL",
    titleEn: "Are there ongoing monthly costs attached (insurance, subscriptions, maintenance)?",
    titleFr: "Y a-t-il des coûts mensuels récurrents associés (assurance, abonnements, entretien) ?",
    titleEs: "¿Existen costos mensuales recurrentes asociados (seguro, suscripciones, mantenimiento)?",
    helperEn: "Recurring commitments create permanent overhead on your monthly free cash flow.",
    helperFr: "Les engagements récurrents augmentent durablement votre plancher de dépenses fixes.",
    helperEs: "Los compromisos recurrentes aumentan permanentemente su suelo de gastos fijos.",
    inputType: "NUMERIC",
    defaultValue: 0,
    financialMateriality: 0.85,
    uncertainty: 0.85,
    decisionSensitivity: 0.8,
    allowsDontKnow: true,
    allowsEstimate: true,
    impactIfUnknownEn: "Engine will assume zero ongoing friction unless category-specific benchmarks exist.",
    impactIfUnknownFr: "Le moteur supposera zéro friction récurrente sauf standard de catégorie.",
    impactIfUnknownEs: "El motor asumirá cero fricción recurrente salvo estándar de categoría.",
  },

  // 5. Ancillary Accessories / Setup Fees
  {
    id: "q_hidden_ancillary_costs",
    targetField: "economics.hidden_costs",
    category: "ALL",
    titleEn: "Do you anticipate additional setup, software, or accessories costs?",
    titleFr: "Prévoyez-vous des frais d'accessoires, logiciels ou mise en service ?",
    titleEs: "¿Anticipa gastos adicionales de accesorios, software o configuración?",
    helperEn: "Often adds 10-25% to nominal purchase prices.",
    helperFr: "Représente souvent 10 à 25% supplémentaires sur le prix nominal.",
    helperEs: "Suele representar un 10-25% adicional sobre el precio nominal.",
    inputType: "NUMERIC",
    defaultValue: 0,
    financialMateriality: 0.6,
    uncertainty: 0.7,
    decisionSensitivity: 0.5,
    allowsDontKnow: true,
    allowsEstimate: true,
    impactIfUnknownEn: "Engine will model 10% buffer in worst-case scenario.",
    impactIfUnknownFr: "Le moteur appliquera une marge de sécurité de 10% au pire scénario.",
    impactIfUnknownEs: "El motor aplicará un margen de seguridad del 10% en el peor escenario.",
  },

  // 6. Expected Revenue Generation
  {
    id: "q_revenue_generation",
    targetField: "economics.expected_revenue",
    category: "ALL",
    titleEn: "Will this purchase or asset directly generate monthly income for you?",
    titleFr: "Cet achat ou investissement générera-t-il directement des revenus mensuels ?",
    titleEs: "¿Esta compra o inversión generará directamente ingresos mensuales?",
    helperEn: "Income-generating assets shorten payback periods and offset cash outflows.",
    helperFr: "Les actifs productifs réduisent le délai de rentabilité et amortissent la dépense.",
    helperEs: "Los activos productivos reducen el plazo de amortización y compensan el desembolso.",
    inputType: "NUMERIC",
    defaultValue: 0,
    financialMateriality: 0.9,
    uncertainty: 0.9,
    decisionSensitivity: 0.85,
    allowsDontKnow: true,
    allowsEstimate: true,
    impactIfUnknownEn: "Treated as a pure cost expenditure with 0 offset revenue.",
    impactIfUnknownFr: "Considéré comme une dépense pure avec 0 revenu compensatoire.",
    impactIfUnknownEs: "Tratado como gasto puro con 0 ingresos compensatorios.",
  },
];

/**
 * CALCULATE QUESTION IMPORTANCE & SELECT NEXT ADAPTIVE QUESTIONS
 *
 * Formula: Importance = Materiality × Uncertainty × Sensitivity
 */
export function getAdaptiveQuestions(
  decisionObject: DecisionIntelligenceObject,
  answeredQuestions: Record<string, UserAnswerRecord> = {},
  skippedQuestionIds: string[] = [],
  maxQuestionsToReturn = 3
): AdaptiveQuestioningState {
  const category = decisionObject.definition.decision_category;
  const isLoanCategory = category === "TAKE_A_LOAN";
  const isCarCategory = category === "BUY_A_CAR";
  const isBusiness = category === "BUSINESS_EXPENSE";
  const isInvest = category === "INVEST";

  // Score and filter questions
  const candidateQuestions: AdaptiveQuestion[] = QUESTION_CATALOG.filter((q) => {
    if (answeredQuestions[q.id]) return false;
    if (skippedQuestionIds.includes(q.id)) return false;

    // Filter by category relevance
    if (q.category !== "ALL" && q.category !== category) return false;

    // Filter out loan terms if user is not financing or taking loan
    if (q.id === "q_interest_rate" && !isLoanCategory && !isCarCategory) {
      // only ask if high amount (> $1,000)
      if (decisionObject.definition.financial_amount.value < 1000) return false;
    }

    if (q.id === "q_revenue_generation" && !isBusiness && !isInvest) {
      return false;
    }

    return true;
  }).map((q) => {
    // Dynamic weight adjustments
    let materiality = q.financialMateriality;
    let uncertainty = q.uncertainty;
    let sensitivity = q.decisionSensitivity;

    if (isLoanCategory && (q.id === "q_interest_rate" || q.id === "q_loan_duration")) {
      materiality = 1.0;
      sensitivity = 1.0;
    }

    if (isCarCategory && q.id === "q_recurring_upkeep") {
      materiality = 0.95;
      sensitivity = 0.9;
    }

    const importanceScore = Math.round(materiality * uncertainty * sensitivity * 100) / 100;

    return {
      ...q,
      financialMateriality: materiality,
      uncertainty,
      decisionSensitivity: sensitivity,
      importanceScore,
    };
  });

  // Sort descending by importance score
  candidateQuestions.sort((a, b) => b.importanceScore - a.importanceScore);

  const topQuestions = candidateQuestions.slice(0, maxQuestionsToReturn);

  // Compute remaining uncertainty
  const totalAnsweredCount = Object.keys(answeredQuestions).length;
  const remainingUncertaintyScore = Math.max(
    0,
    Math.round((1 - totalAnsweredCount / (totalAnsweredCount + candidateQuestions.length + 0.1)) * 100)
  );

  const isSufficientForResponsibleAnalysis =
    totalAnsweredCount >= 1 || candidateQuestions.length === 0 || decisionObject.definition.financial_amount.value <= 500;

  return {
    answeredQuestions,
    skippedQuestionIds,
    currentPendingQuestions: topQuestions,
    isSufficientForResponsibleAnalysis,
    remainingUncertaintyScore,
  };
}

/**
 * APPLY USER ANSWER TO DECISION INTELLIGENCE OBJECT
 */
export function applyAdaptiveAnswer(
  decisionObject: DecisionIntelligenceObject,
  questionId: string,
  answer: {
    value: any;
    isUnknown?: boolean;
    isEstimate?: boolean;
    sourceNotes?: string;
  }
): DecisionIntelligenceObject {
  const updated: DecisionIntelligenceObject = JSON.parse(JSON.stringify(decisionObject));
  const isUnknown = !!answer.isUnknown;
  const isEstimate = !!answer.isEstimate;

  switch (questionId) {
    case "q_down_payment":
      updated.economics.down_payment = isUnknown
        ? createUnknown(0, "Down payment unknown")
        : isEstimate
        ? createUserEstimate(Number(answer.value) || 0, 0.7)
        : createUserProvided(Number(answer.value) || 0);
      break;

    case "q_interest_rate":
      updated.economics.interest_rate = isUnknown
        ? createUnknown(8.5, "Interest rate unknown; assumed 8.5%")
        : isEstimate
        ? createUserEstimate(Number(answer.value) || 8.5, 0.7)
        : createUserProvided(Number(answer.value) || 8.5);
      break;

    case "q_loan_duration":
      updated.economics.loan_duration = isUnknown
        ? createUnknown(36, "Duration unknown; assumed 36 months")
        : createUserProvided(Number(answer.value) || 36);
      break;

    case "q_recurring_cost":
    case "q_recurring_upkeep":
      updated.economics.recurring_cost = isUnknown
        ? createUnknown(0, "Recurring upkeep unentered")
        : isEstimate
        ? createUserEstimate(Number(answer.value) || 0, 0.6)
        : createUserProvided(Number(answer.value) || 0);
      break;

    case "q_hidden_ancillary_costs":
      updated.economics.hidden_costs = isUnknown
        ? createUnknown(0, "Hidden costs unknown")
        : isEstimate
        ? createUserEstimate(Number(answer.value) || 0, 0.6)
        : createUserProvided(Number(answer.value) || 0);
      break;

    case "q_revenue_generation":
      updated.economics.expected_revenue = isUnknown
        ? createUnknown(0, "Revenue unentered")
        : isEstimate
        ? createUserEstimate(Number(answer.value) || 0, 0.5)
        : createUserProvided(Number(answer.value) || 0);
      break;
  }

  // Update epistemic audit counts
  let factCount = 0;
  let estimateCount = 0;
  let unknownCount = 0;

  Object.values(updated.economics).forEach((val) => {
    if (val && typeof val === "object" && "classification" in val) {
      if (val.classification === "VERIFIED_FACT" || val.classification === "USER_PROVIDED") factCount++;
      else if (val.classification === "USER_ESTIMATE") estimateCount++;
      else if (val.classification === "UNKNOWN") unknownCount++;
    }
  });

  updated.confidence.audit.factCount = factCount;
  updated.confidence.audit.userEstimateCount = estimateCount;
  updated.confidence.audit.unknownCount = unknownCount;
  updated.metadata.lastModifiedAt = new Date().toISOString();

  return updated;
}
