/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * OPPORTUNITY COST & REALISTIC ALTERNATIVES ENGINE (PROMPT 10)
 *
 * Systematically evaluates 6 plausible strategic paths:
 * A. PROCEED NOW — Execute current proposal immediately
 * B. DELAY & ACCUMULATE — Pre-save dedicated buffer before buying
 * C. MODIFY DECISION STRUCTURE — Stagger, finance partially, or adjust terms
 * D. CHOOSE A CHEAPER OPTION — Refurbished, certified pre-owned, or mid-tier alternative
 * E. DEPLOY TO STRONGEST ALTERNATIVE — Debt payoff, emergency fund, or core life goal
 * F. DO NOTHING — Understand the true cost of inaction vs preserved liquidity
 *
 * Answers: "Is the current proposal actually the best structure for achieving the user's goal?"
 */

import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "../utils/currency";
import { DecisionIntelligenceObject } from "./master-decision-model";

export type StrategicAlternativeCode =
  | "PROCEED_NOW"
  | "DELAY_AND_ACCUMULATE"
  | "MODIFY_DECISION_STRUCTURE"
  | "CHOOSE_CHEAPER_OPTION"
  | "DEPLOY_TO_STRONGEST_ALTERNATIVE"
  | "DO_NOTHING";

export interface AlternativeStrategyOption {
  code: StrategicAlternativeCode;
  titleEn: string;
  titleFr: string;
  titleEs: string;
  actionSummaryEn: string;
  actionSummaryFr: string;
  actionSummaryEs: string;

  // Comparison Dimensions
  immediateCost: number;
  longTermTotalCost: number;
  liquidityImpactRunwayMonths: number;
  expectedBenefitEn: string;
  expectedBenefitFr: string;
  expectedBenefitEs: string;
  downsideRiskEn: string;
  downsideRiskFr: string;
  downsideRiskEs: string;
  flexibilityScore: number; // 0 to 100
  opportunityCostAssessmentEn: string;
  opportunityCostAssessmentFr: string;
  opportunityCostAssessmentEs: string;

  // Inaction / Waiting Cost Analysis
  costOfWaitingOrInactionEn?: string;
  costOfWaitingOrInactionFr?: string;
  costOfWaitingOrInactionEs?: string;

  // Strategic Score & Ranking
  strategicEfficiencyScore: number; // 0 to 100
  isRecommendedAlternative: boolean;
}

export interface OpportunityAlternativesReport {
  timestamp: string;
  currency: CurrencyCode;
  evaluatedAlternatives: AlternativeStrategyOption[];
  recommendedAlternativeCode: StrategicAlternativeCode;
  isCurrentProposalOptimal: boolean;
  optimalStructureVerdictEn: string;
  optimalStructureVerdictFr: string;
  optimalStructureVerdictEs: string;
  costOfInactionSummaryEn: string;
  costOfInactionSummaryFr: string;
  costOfInactionSummaryEs: string;
}

/**
 * EVALUATE STRATEGIC ALTERNATIVES & OPPORTUNITY COSTS
 */
export function evaluateOpportunityAlternatives(
  decisionObject: DecisionIntelligenceObject
): OpportunityAlternativesReport {
  const curr: CurrencyCode = decisionObject.definition.currency;
  const fmt = (n: number) => formatCurrency(n, curr);

  const amount = Math.max(0, decisionObject.definition.financial_amount.value || 0);
  const downPayment = Math.max(0, decisionObject.economics.down_payment.value || 0);
  const interestRate = Math.max(0, decisionObject.economics.interest_rate.value || 8.5);
  const loanDuration = Math.max(1, decisionObject.economics.loan_duration.value || 36);
  const recurringUpkeep = Math.max(0, decisionObject.economics.recurring_cost.value || 0);
  const expectedRevenue = Math.max(0, decisionObject.economics.expected_revenue.value || 0);

  const liquidSavings = Math.max(0, decisionObject.context.liquid_savings.value || 0);
  const monthlyIncome = Math.max(0, decisionObject.context.monthly_income.value || 0);
  const essentialExpenses = Math.max(0, decisionObject.context.essential_expenses.value || 0);
  const monthlyDebt = Math.max(0, decisionObject.context.monthly_debt_payments.value || 0);
  const primaryGoal = decisionObject.context.primary_goal;
  const goalAllocation = Math.max(50, primaryGoal?.monthlyAllocation || 350);

  const isLoan =
    decisionObject.definition.decision_category === "TAKE_A_LOAN" ||
    (downPayment > 0 && downPayment < amount);
  const isCar = decisionObject.definition.decision_category === "BUY_A_CAR";
  const isBusiness = decisionObject.definition.decision_category === "BUSINESS_EXPENSE" || expectedRevenue > 0;

  const baselineRunway = essentialExpenses > 0 ? liquidSavings / essentialExpenses : 6;
  const postCashReserves = Math.max(0, liquidSavings - (isLoan ? downPayment : amount));
  const postRunway = essentialExpenses > 0 ? postCashReserves / essentialExpenses : 0;

  // ─────────────────────────────────────────────────────────────────────────
  // A. OPTION 1: PROCEED NOW (CURRENT PROPOSAL)
  // ─────────────────────────────────────────────────────────────────────────
  const proceedNow: AlternativeStrategyOption = {
    code: "PROCEED_NOW",
    titleEn: "Proceed Now (Current Proposal)",
    titleFr: "Exécuter Maintenant (Proposition Actuelle)",
    titleEs: "Ejecutar Ahora (Propuesta Actual)",
    actionSummaryEn: `Commit ${fmt(amount)} immediately on stated terms.`,
    actionSummaryFr: `Engager ${fmt(amount)} immédiatement selon les termes déclarés.`,
    actionSummaryEs: `Comprometer ${fmt(amount)} inmediatamente según los términos declarados.`,
    immediateCost: isLoan ? downPayment : amount,
    longTermTotalCost: amount + (isLoan ? Math.round(amount * (interestRate / 100) * (loanDuration / 24)) : 0),
    liquidityImpactRunwayMonths: Number(postRunway.toFixed(1)),
    expectedBenefitEn: "Immediate access to asset/utility and immediate resolution of operational friction.",
    expectedBenefitFr: "Accès immédiat à l'actif et résolution immédiate du besoin.",
    expectedBenefitEs: "Acceso inmediato al activo y resolución inmediata de la necesidad.",
    downsideRiskEn: `Draws down liquid reserves by ${fmt(isLoan ? downPayment : amount)} immediately on Day 0.`,
    downsideRiskFr: `Prélève ${fmt(isLoan ? downPayment : amount)} sur votre épargne dès le premier jour.`,
    downsideRiskEs: `Reduce su reserva líquida en ${fmt(isLoan ? downPayment : amount)} desde el primer día.`,
    flexibilityScore: 50,
    opportunityCostAssessmentEn: `Delays "${primaryGoal?.title || "Primary Goal"}" by ${Math.round((amount / goalAllocation) * 30)} days.`,
    opportunityCostAssessmentFr: `Retarde « ${primaryGoal?.title || "Objectif Principal"} » de ${Math.round((amount / goalAllocation) * 30)} jours.`,
    opportunityCostAssessmentEs: `Retrasa « ${primaryGoal?.title || "Objetivo Principal"} » en ${Math.round((amount / goalAllocation) * 30)} días.`,
    strategicEfficiencyScore: postRunway >= 3.0 ? 90 : postRunway >= 2.0 ? 70 : 35,
    isRecommendedAlternative: postRunway >= 3.0,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // B. OPTION 2: DELAY & ACCUMULATE (PRE-SAVING BUFFER)
  // ─────────────────────────────────────────────────────────────────────────
  const delayMonths = Math.min(6, Math.max(2, Math.ceil(amount / Math.max(100, monthlyIncome - essentialExpenses - monthlyDebt))));
  const delayAndAccumulate: AlternativeStrategyOption = {
    code: "DELAY_AND_ACCUMULATE",
    titleEn: `Delay & Accumulate (${delayMonths} Months Buffer)`,
    titleFr: `Épargner d'Abord & Décaler (${delayMonths} Mois)`,
    titleEs: `Ahorro Previo y Aplazamiento (${delayMonths} Meses)`,
    actionSummaryEn: `Pre-save ${fmt(Math.round(amount / delayMonths))}/month for ${delayMonths} months before purchasing.`,
    actionSummaryFr: `Épargner ${fmt(Math.round(amount / delayMonths))}/mois pendant ${delayMonths} mois avant d'acheter.`,
    actionSummaryEs: `Ahorrar ${fmt(Math.round(amount / delayMonths))}/mes durante ${delayMonths} meses antes de comprar.`,
    immediateCost: 0,
    longTermTotalCost: amount, // Zero interest drag
    liquidityImpactRunwayMonths: Number(baselineRunway.toFixed(1)),
    expectedBenefitEn: "Zero debt interest, zero emergency buffer depletion, 100% preserved financial resilience.",
    expectedBenefitFr: "Zéro intérêt d'emprunt, zéro dégradation du matelas de sécurité, résilience totale.",
    expectedBenefitEs: "Cero intereses, cero erosión del fondo de emergencia, máxima resiliencia.",
    downsideRiskEn: `Delays asset access by ${delayMonths} months.`,
    downsideRiskFr: `Décale la jouissance de l'actif de ${delayMonths} mois.`,
    downsideRiskEs: `Pospone el disfrute del activo durante ${delayMonths} meses.`,
    flexibilityScore: 90,
    opportunityCostAssessmentEn: "Zero goal milestone disruption; funding accumulated purely from surplus cash flow.",
    opportunityCostAssessmentFr: "Zéro perturbation de vos objectifs ; financement constitué sur les excédents.",
    opportunityCostAssessmentEs: "Cero disrupción de objetivos; financiación generada con excedentes.",
    costOfWaitingOrInactionEn: isBusiness
      ? "Delaying a business asset may forfeit 2-3 months of early client billing."
      : isCar
      ? "Waiting may incur ongoing maintenance on an existing aging vehicle."
      : "Pure convenience delay with minimal financial cost.",
    costOfWaitingOrInactionFr: isBusiness
      ? "Décaler un outil professionnel peut reporter les premiers revenus clients."
      : isCar
      ? "Attendre peut générer des frais d'entretien sur un véhicule ancien."
      : "Simple attente de confort sans surcoût financier mesurable.",
    costOfWaitingOrInactionEs: isBusiness
      ? "Aplazar una herramienta de negocio puede retrasar la facturación."
      : isCar
      ? "Esperar puede generar costes en un vehículo antiguo."
      : "Simple espera de confort sin sobrecoste financiero relevante.",
    strategicEfficiencyScore: postRunway < 2.5 ? 92 : 72,
    isRecommendedAlternative: postRunway < 2.5 && postRunway >= 1.0,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // C. OPTION 3: MODIFY DECISION STRUCTURE (HYBRID / SPREAD)
  // ─────────────────────────────────────────────────────────────────────────
  const hybridDown = Math.round(amount * 0.4);
  const hybridFinanced = amount - hybridDown;
  const modifyStructure: AlternativeStrategyOption = {
    code: "MODIFY_DECISION_STRUCTURE",
    titleEn: "Modify Structure (40% Down / 60% Short-Term Spread)",
    titleFr: "Restructurer l'Exécution (40% Apport / 60% Étalement Court)",
    titleEs: "Reestructurar Ejecución (40% Entrada / 60% Financiación Corta)",
    actionSummaryEn: `Put ${fmt(hybridDown)} down and spread remaining ${fmt(hybridFinanced)} over 12 months.`,
    actionSummaryFr: `Verser ${fmt(hybridDown)} d'apport et étaler le solde de ${fmt(hybridFinanced)} sur 12 mois.`,
    actionSummaryEs: `Pagar ${fmt(hybridDown)} de entrada y financiar ${fmt(hybridFinanced)} a 12 meses.`,
    immediateCost: hybridDown,
    longTermTotalCost: Math.round(amount + hybridFinanced * 0.05),
    liquidityImpactRunwayMonths: Number(((liquidSavings - hybridDown) / essentialExpenses).toFixed(1)),
    expectedBenefitEn: "Balances immediate utility with liquid buffer preservation; minimal interest overhead.",
    expectedBenefitFr: "Équilibre accès immédiat et préservation des réserves ; surcoût d'intérêts minime.",
    expectedBenefitEs: "Equilibra inmediatez y preservación de reservas con coste de intereses mínimo.",
    downsideRiskEn: `Adds ${fmt(Math.round(hybridFinanced / 12))}/month debt service for 12 months.`,
    downsideRiskFr: `Ajoute ${fmt(Math.round(hybridFinanced / 12))}/mois de mensualité pendant 1 an.`,
    downsideRiskEs: `Añade ${fmt(Math.round(hybridFinanced / 12))}/mes de cuota durante 1 año.`,
    flexibilityScore: 75,
    opportunityCostAssessmentEn: `Low goal delay (~${Math.round((hybridDown / goalAllocation) * 30)} days).`,
    opportunityCostAssessmentFr: `Faible décalage d'objectif (~${Math.round((hybridDown / goalAllocation) * 30)} jours).`,
    opportunityCostAssessmentEs: `Bajo retraso de objetivos (~${Math.round((hybridDown / goalAllocation) * 30)} días).`,
    strategicEfficiencyScore: postRunway >= 2.0 && postRunway < 3.0 ? 88 : 68,
    isRecommendedAlternative: postRunway >= 2.0 && postRunway < 3.0,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // D. OPTION 4: CHOOSE A CHEAPER OPTION (REFURBISHED / PRE-OWNED)
  // ─────────────────────────────────────────────────────────────────────────
  const cheaperAmount = Math.round(amount * 0.68); // 32% savings
  const chooseCheaper: AlternativeStrategyOption = {
    code: "CHOOSE_CHEAPER_OPTION",
    titleEn: "Choose a Value Alternative (Certified Refurbished / Tier 2)",
    titleFr: "Alternative Économique (Reconditionné Garanti / Gamme N-1)",
    titleEs: "Opción Alternativa Económica (Reacondicionado / Gama Media)",
    actionSummaryEn: `Acquire certified pre-owned/refurbished unit for ${fmt(cheaperAmount)} (saves ${fmt(amount - cheaperAmount)}).`,
    actionSummaryFr: `Acquérir un modèle reconditionné pour ${fmt(cheaperAmount)} (économise ${fmt(amount - cheaperAmount)}).`,
    actionSummaryEs: `Adquirir modelo reacondicionado por ${fmt(cheaperAmount)} (ahorra ${fmt(amount - cheaperAmount)}).`,
    immediateCost: cheaperAmount,
    longTermTotalCost: cheaperAmount,
    liquidityImpactRunwayMonths: Number(((liquidSavings - cheaperAmount) / essentialExpenses).toFixed(1)),
    expectedBenefitEn: "Delivers ~85-90% of peak functionality while saving 32% of capital upfront.",
    expectedBenefitFr: "Délivre 85 à 90% des performances utiles tout en économisant 32% du capital.",
    expectedBenefitEs: "Ofrece el 85-90% de funcionalidad ahorrando un 32% de capital.",
    downsideRiskEn: "Slightly older hardware generation or shorter warranty period (1 yr vs 2 yr).",
    downsideRiskFr: "Génération légèrement antérieure ou garantie constructeur plus courte (1 an).",
    downsideRiskEs: "Generación tecnológica anterior o garantía más corta (1 año).",
    flexibilityScore: 80,
    opportunityCostAssessmentEn: `Reduces goal milestone delay by ${Math.round(((amount - cheaperAmount) / goalAllocation) * 30)} days.`,
    opportunityCostAssessmentFr: `Réduit le retard d'objectif de ${Math.round(((amount - cheaperAmount) / goalAllocation) * 30)} jours.`,
    opportunityCostAssessmentEs: `Reduce el retraso de meta en ${Math.round(((amount - cheaperAmount) / goalAllocation) * 30)} días.`,
    strategicEfficiencyScore: 78,
    isRecommendedAlternative: false,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // E. OPTION 5: DEPLOY TO STRONGEST REALISTIC ALTERNATIVE
  // ─────────────────────────────────────────────────────────────────────────
  const deployAlternative: AlternativeStrategyOption = {
    code: "DEPLOY_TO_STRONGEST_ALTERNATIVE",
    titleEn: `Deploy to "${primaryGoal?.title || "Primary Wealth Goal"}"`,
    titleFr: `Affecter à « ${primaryGoal?.title || "Objectif Patrimonial Majeur"} »`,
    titleEs: `Asignar a « ${primaryGoal?.title || "Meta Patrimonial Principal"} »`,
    actionSummaryEn: `Inject the ${fmt(amount)} directly into priority goal accumulation or emergency fund.`,
    actionSummaryFr: `Injecter les ${fmt(amount)} directement sur votre objectif de vie ou épargne de sécurité.`,
    actionSummaryEs: `Inyectar los ${fmt(amount)} directamente en su meta de vida o fondo de seguridad.`,
    immediateCost: 0,
    longTermTotalCost: 0,
    liquidityImpactRunwayMonths: Number(baselineRunway.toFixed(1)),
    expectedBenefitEn: `Accelerates priority goal arrival by ${Math.round((amount / goalAllocation) * 30)} days.`,
    expectedBenefitFr: `Avance l'atteinte de votre objectif de ${Math.round((amount / goalAllocation) * 30)} jours.`,
    expectedBenefitEs: `Adelanta la consecución de su meta en ${Math.round((amount / goalAllocation) * 30)} días.`,
    downsideRiskEn: "Operational friction or desire remains unaddressed.",
    downsideRiskFr: "Le besoin matériel initial n'est pas comblé.",
    downsideRiskEs: "La necesidad material inicial no se cubre.",
    flexibilityScore: 95,
    opportunityCostAssessmentEn: "Maximizes compounding net worth growth.",
    opportunityCostAssessmentFr: "Maximise la croissance de votre patrimoine net.",
    opportunityCostAssessmentEs: "Maximiza el crecimiento de su patrimonio neto.",
    strategicEfficiencyScore: 76,
    isRecommendedAlternative: false,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // F. OPTION 6: DO NOTHING (INACTION COST AUDIT)
  // ─────────────────────────────────────────────────────────────────────────
  const doNothing: AlternativeStrategyOption = {
    code: "DO_NOTHING",
    titleEn: "Do Nothing (Maintain Status Quo)",
    titleFr: "Ne Rien Faire (Maintenir le Statu Quo)",
    titleEs: "No Hacer Nada (Mantener el Statu Quo)",
    actionSummaryEn: "Cancel the proposed purchase entirely and retain all cash.",
    actionSummaryFr: "Abandonner le projet et conserver l'intégralité des liquidités.",
    actionSummaryEs: "Descartar la compra y conservar la totalidad del efectivo.",
    immediateCost: 0,
    longTermTotalCost: 0,
    liquidityImpactRunwayMonths: Number(baselineRunway.toFixed(1)),
    expectedBenefitEn: "Complete liquidity preservation and zero debt commitments.",
    expectedBenefitFr: "Préservation totale des liquidités et zéro dette.",
    expectedBenefitEs: "Preservación total de liquidez y cero deudas.",
    downsideRiskEn: isBusiness
      ? "Missed revenue capacity and ongoing operational inefficiency."
      : isCar
      ? "Continued reliance on aging transport with potential breakdown friction."
      : "Forfeited personal utility or tool productivity.",
    downsideRiskFr: isBusiness
      ? "Manque à gagner commercial et inefficacité opérationnelle persistante."
      : isCar
      ? "Dépendance continue envers un véhicule ancien avec risque de panne."
      : "Renoncement au confort ou à l'efficacité de travail.",
    downsideRiskEs: isBusiness
      ? "Pérdida de facturación e ineficiencia operativa continua."
      : isCar
      ? "Dependencia de vehículo antiguo con riesgo de averías."
      : "Renuncia al confort o a la productividad.",
    flexibilityScore: 100,
    opportunityCostAssessmentEn: "Zero financial capital outlay; potential operational penalty.",
    opportunityCostAssessmentFr: "Zéro décaissement financier ; pénalité opérationnelle potentielle.",
    opportunityCostAssessmentEs: "Cero desembolso financiero; posible coste operativo.",
    costOfWaitingOrInactionEn: isBusiness
      ? "Inaction cost: ~10-15 hours/month lost to slower hardware or missed client deliverables."
      : "Inaction cost is minimal; cash compounds safely in reserves.",
    costOfWaitingOrInactionFr: isBusiness
      ? "Coût de l'inaction : ~10 à 15h/mois perdues en productivité ou retards clients."
      : "Coût de l'inaction minime ; les liquidités fructifient en réserve.",
    costOfWaitingOrInactionEs: isBusiness
      ? "Coste de inacción: ~10-15h/mes perdidas en productividad o retrasos."
      : "Coste de inacción mínimo; el efectivo rinde en reserva.",
    strategicEfficiencyScore: postRunway < 1.0 ? 95 : 55,
    isRecommendedAlternative: postRunway < 1.0,
  };

  const evaluatedAlternatives = [
    proceedNow,
    delayAndAccumulate,
    modifyStructure,
    chooseCheaper,
    deployAlternative,
    doNothing,
  ];

  // Determine winning recommendation
  evaluatedAlternatives.sort((a, b) => b.strategicEfficiencyScore - a.strategicEfficiencyScore);
  const recommendedAlternative = evaluatedAlternatives[0];
  const isCurrentProposalOptimal = recommendedAlternative.code === "PROCEED_NOW";

  const optimalStructureVerdictEn = isCurrentProposalOptimal
    ? `The current proposal ("Proceed Now") is structurally optimal: strong cash runway (${postRunway.toFixed(1)} mo) and high execution efficiency.`
    : `The current proposal is NOT the optimal structure. "${recommendedAlternative.titleEn}" yields a superior safety and efficiency profile.`;

  const optimalStructureVerdictFr = isCurrentProposalOptimal
    ? `La proposition actuelle (« Exécuter Maintenant ») est structurellement optimale : réserve solide (${postRunway.toFixed(1)} mois) et haute efficacité.`
    : `La proposition actuelle n'est PAS la structure optimale. « ${recommendedAlternative.titleFr} » offre un profil de sécurité et de rentabilité supérieur.`;

  const optimalStructureVerdictEs = isCurrentProposalOptimal
    ? `La propuesta actual (« Ejecutar Ahora ») es estructuralmente óptima: reserva sólida (${postRunway.toFixed(1)} meses) y alta eficiencia.`
    : `La propuesta actual NO es la estructura óptima. « ${recommendedAlternative.titleEs} » ofrece un perfil de seguridad y rentabilidad superior.`;

  const costOfInactionSummaryEn =
    "Inaction is also a decision: Doing nothing avoids all cash bleed but forfeits utility, whereas delaying with a planned pre-saving schedule captures the benefits safely.";

  const costOfInactionSummaryFr =
    "L'inaction est aussi une décision : Ne rien faire élimine toute dépense mais fige les gains, tandis qu'un décalage avec épargne préalable sécurise l'achat.";

  const costOfInactionSummaryEs =
    "La inacción también es una decisión: No hacer nada evita gastos pero congela beneficios, mientras que un aplazamiento con ahorro planificado asegura la compra.";

  return {
    timestamp: new Date().toISOString(),
    currency: curr,
    evaluatedAlternatives,
    recommendedAlternativeCode: recommendedAlternative.code,
    isCurrentProposalOptimal,
    optimalStructureVerdictEn,
    optimalStructureVerdictFr,
    optimalStructureVerdictEs,
    costOfInactionSummaryEn,
    costOfInactionSummaryFr,
    costOfInactionSummaryEs,
  };
}
