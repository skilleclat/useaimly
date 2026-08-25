/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * PRE-MORTEM SIMULATION ENGINE (PROMPT 11)
 *
 * Mandatory retrospective pre-commitment diagnostic:
 * "It is 12 months later. This decision performed badly. Why?"
 *
 * Generates decision-specific, actionable failure modes with:
 * - Specific failure scenario description
 * - Likelihood: LOW / MEDIUM / HIGH
 * - Financial Impact: LOW / MEDIUM / HIGH / CRITICAL
 * - Early Warning Signal (concrete metric)
 * - Preventative Mitigation Action (before commitment)
 */

import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "../utils/currency";
import { DecisionIntelligenceObject } from "./master-decision-model";

export type FailureLikelihood = "LOW" | "MEDIUM" | "HIGH";
export type FailureImpact = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface PreMortemFailureMode {
  id: string;
  category:
    | "REVENUE_SHORTFALL"
    | "RECURRING_COST_EXPLOSION"
    | "LIQUIDITY_SUFFOCATION"
    | "RESALE_COLLAPSE"
    | "FINANCING_TRAP"
    | "UNDERUTILIZATION"
    | "EXTERNAL_SHOCK";
  failureDescriptionEn: string;
  failureDescriptionFr: string;
  failureDescriptionEs: string;
  likelihood: FailureLikelihood;
  financialImpact: FailureImpact;
  earlyWarningSignalEn: string;
  earlyWarningSignalFr: string;
  earlyWarningSignalEs: string;
  preventativeMitigationEn: string;
  preventativeMitigationFr: string;
  preventativeMitigationEs: string;
  triggerConditionMetric: string;
}

export interface PreMortemReport {
  timestamp: string;
  currency: CurrencyCode;
  preMortemPremiseEn: string;
  preMortemPremiseFr: string;
  preMortemPremiseEs: string;
  identifiedFailureModes: PreMortemFailureMode[];
  highestRiskFailureMode: PreMortemFailureMode;
  preventativeChecklistEn: string[];
  preventativeChecklistFr: string[];
  preventativeChecklistEs: string[];
  isHighPreMortemRisk: boolean;
}

/**
 * EXECUTE PRE-MORTEM DIAGNOSTIC
 */
export function runPreMortemDiagnostic(
  decisionObject: DecisionIntelligenceObject
): PreMortemReport {
  const curr: CurrencyCode = decisionObject.definition.currency;
  const fmt = (n: number) => formatCurrency(n, curr);

  const amount = Math.max(0, decisionObject.definition.financial_amount.value || 0);
  const downPayment = Math.max(0, decisionObject.economics.down_payment.value || 0);
  const interestRate = Math.max(0, decisionObject.economics.interest_rate.value || 8.5);
  const recurringUpkeep = Math.max(0, decisionObject.economics.recurring_cost.value || 0);
  const expectedRevenue = Math.max(0, decisionObject.economics.expected_revenue.value || 0);

  const liquidSavings = Math.max(0, decisionObject.context.liquid_savings.value || 0);
  const monthlyIncome = Math.max(0, decisionObject.context.monthly_income.value || 0);
  const essentialExpenses = Math.max(0, decisionObject.context.essential_expenses.value || 0);
  const monthlyDebt = Math.max(0, decisionObject.context.monthly_debt_payments.value || 0);

  const isLoan =
    decisionObject.definition.decision_category === "TAKE_A_LOAN" ||
    (downPayment > 0 && downPayment < amount);
  const isCar = decisionObject.definition.decision_category === "BUY_A_CAR";
  const isBusiness = decisionObject.definition.decision_category === "BUSINESS_EXPENSE" || expectedRevenue > 0;

  const postCash = Math.max(0, liquidSavings - (isLoan ? downPayment : amount));
  const postRunway = essentialExpenses > 0 ? postCash / essentialExpenses : 0;
  const savingsExposurePct = liquidSavings > 0 ? (amount / liquidSavings) * 100 : 100;

  const failureModes: PreMortemFailureMode[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // 1. LIQUIDITY SUFFOCATION / UNBUFFERED EMERGENCY (IF POST-RUNWAY < 3.0)
  // ─────────────────────────────────────────────────────────────────────────
  if (postRunway < 3.0 || savingsExposurePct > 40) {
    failureModes.push({
      id: "pm_liquidity_suffocation",
      category: "LIQUIDITY_SUFFOCATION",
      failureDescriptionEn: `12 months later: A routine emergency (${fmt(Math.round(essentialExpenses * 1.5))}) occurred with only ${postRunway.toFixed(1)} months of runway remaining, forcing high-interest credit card debt.`,
      failureDescriptionFr: `12 mois plus tard : Un imprévu de ${fmt(Math.round(essentialExpenses * 1.5))} est survenu avec seulement ${postRunway.toFixed(1)} mois de réserve, contraignant à un endettement coûteux.`,
      failureDescriptionEs: `12 meses después: Un imprevisto de ${fmt(Math.round(essentialExpenses * 1.5))} ocurrió con solo ${postRunway.toFixed(1)} meses de reserva, forzando deudas con tarjeta.`,
      likelihood: postRunway < 1.5 ? "HIGH" : "MEDIUM",
      financialImpact: postRunway < 1.5 ? "CRITICAL" : "HIGH",
      earlyWarningSignalEn: `Liquid bank balance drops below ${fmt(Math.round(essentialExpenses * 2.5))} within 60 days of purchase.`,
      earlyWarningSignalFr: `Solde bancaire liquide inférieur à ${fmt(Math.round(essentialExpenses * 2.5))} dans les 60 jours.`,
      earlyWarningSignalEs: `Saldo líquido inferior a ${fmt(Math.round(essentialExpenses * 2.5))} en los primeros 60 días.`,
      preventativeMitigationEn: `Do not commit full cash upfront; pre-save until reserves exceed ${fmt(Math.round(essentialExpenses * 3.5 + amount))} or finance only 30%.`,
      preventativeMitigationFr: `Ne décaissez pas comptant ; épargnez jusqu'à disposer de ${fmt(Math.round(essentialExpenses * 3.5 + amount))} ou étalez 30%.`,
      preventativeMitigationEs: `No pague al contado; ahorre hasta disponer de ${fmt(Math.round(essentialExpenses * 3.5 + amount))} o financie solo el 30%.`,
      triggerConditionMetric: `Post-Decision Runway = ${postRunway.toFixed(1)} months (< 3.0 mo floor)`,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. COMMERCIAL REVENUE SHORTFALL (IF BUSINESS / REVENUE)
  // ─────────────────────────────────────────────────────────────────────────
  if (isBusiness) {
    failureModes.push({
      id: "pm_revenue_shortfall",
      category: "REVENUE_SHORTFALL",
      failureDescriptionEn: `12 months later: Projected client billing of ${fmt(expectedRevenue || 800)}/mo failed to materialize due to extended client acquisition cycles, turning the asset into a sunken capital loss.`,
      failureDescriptionFr: `12 mois plus tard : La facturation prévue de ${fmt(expectedRevenue || 800)}/mois ne s'est pas concrétisée, transformant l'achat en perte en capital sèche.`,
      failureDescriptionEs: `12 meses después: La facturación prevista de ${fmt(expectedRevenue || 800)}/mes no se concretó por ciclos lentos de clientes, convirtiendo la compra en pérdida.`,
      likelihood: "MEDIUM",
      financialImpact: "HIGH",
      earlyWarningSignalEn: `Monthly revenue generated by this asset is < ${fmt(Math.round((expectedRevenue || 800) * 0.4))}/mo at Month 3.`,
      earlyWarningSignalFr: `Revenus générés par l'actif < ${fmt(Math.round((expectedRevenue || 800) * 0.4))}/mois au bout de 3 mois.`,
      earlyWarningSignalEs: `Ingresos generados < ${fmt(Math.round((expectedRevenue || 800) * 0.4))}/mes al tercer mes.`,
      preventativeMitigationEn: "Secure at least 2 signed client commitments or pre-orders before purchasing dedicated hardware.",
      preventativeMitigationFr: "Obtenir au moins 2 accords de principe ou pré-commandes clients signées avant l'achat.",
      preventativeMitigationEs: "Conseguir al menos 2 compromisos firmados o pedidos previos antes de comprar.",
      triggerConditionMetric: "Revenue Dependency = Active",
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. FINANCING DEBT SERVICE SQUEEZE (IF LOAN)
  // ─────────────────────────────────────────────────────────────────────────
  if (isLoan) {
    const loanPrincipal = Math.max(0, amount - downPayment);
    const estPmt = Math.round(loanPrincipal / 36 + (loanPrincipal * (interestRate / 100)) / 12);
    failureModes.push({
      id: "pm_financing_squeeze",
      category: "FINANCING_TRAP",
      failureDescriptionEn: `12 months later: The mandatory installment of ${fmt(estPmt)}/mo became unmanageable when another household expense spiked, forcing missed payments or penalty interest.`,
      failureDescriptionFr: `12 mois plus tard : La mensualité obligatoire de ${fmt(estPmt)}/mois est devenue étouffante lors d'une hausse d'autres charges.`,
      failureDescriptionEs: `12 meses después: La cuota fija de ${fmt(estPmt)}/mes se volvió insostenible ante un aumento de otros gastos.`,
      likelihood: interestRate >= 12 ? "HIGH" : "MEDIUM",
      financialImpact: "HIGH",
      earlyWarningSignalEn: `Monthly debt service exceeds 20% of monthly income or total free cash flow drops below ${fmt(300)}/mo.`,
      earlyWarningSignalFr: `Le service de la dette dépasse 20% des revenus ou le cash-flow libre descend sous ${fmt(300)}/mois.`,
      earlyWarningSignalEs: `La deuda supera el 20% de los ingresos o el flujo libre cae por debajo de ${fmt(300)}/mes.`,
      preventativeMitigationEn: `Lock in a fixed APR < 10% and verify that post-debt free cash flow remains > ${fmt(Math.round(monthlyIncome * 0.2))}/month.`,
      preventativeMitigationFr: `Verrouillez un taux fixe < 10% et vérifiez que votre surplus reste > ${fmt(Math.round(monthlyIncome * 0.2))}/mois.`,
      preventativeMitigationEs: `Asegure una tasa fija < 10% y verifique que el excedente se mantenga > ${fmt(Math.round(monthlyIncome * 0.2))}/mes.`,
      triggerConditionMetric: `Loan APR = ${interestRate}%`,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. RECURRING MAINTENANCE & INSURANCE EXPLOSION (IF CAR / RECURRING)
  // ─────────────────────────────────────────────────────────────────────────
  if (isCar || recurringUpkeep > 0) {
    const upkeepBase = recurringUpkeep > 0 ? recurringUpkeep : Math.round(amount * 0.02);
    failureModes.push({
      id: "pm_maintenance_explosion",
      category: "RECURRING_COST_EXPLOSION",
      failureDescriptionEn: `12 months later: Secondary upkeep, insurance premiums, and wear-and-tear exceeded initial estimates by 45%, consuming ${fmt(Math.round(upkeepBase * 1.45 * 12))}/year.`,
      failureDescriptionFr: `12 mois plus tard : L'assurance, le carburant et l'entretien ont dépassé les prévisions de 45%, coûtant ${fmt(Math.round(upkeepBase * 1.45 * 12))}/an.`,
      failureDescriptionEs: `12 meses después: Seguro, mantenimiento y desgaste superaron las previsiones en un 45%, costando ${fmt(Math.round(upkeepBase * 1.45 * 12))}/año.`,
      likelihood: "MEDIUM",
      financialImpact: "MEDIUM",
      earlyWarningSignalEn: `First 90 days of operational costs exceed ${fmt(Math.round(upkeepBase * 1.25))}/mo.`,
      earlyWarningSignalFr: `Les coûts d'usage des 90 premiers jours dépassent ${fmt(Math.round(upkeepBase * 1.25))}/mois.`,
      earlyWarningSignalEs: `Los costes operativos de los primeros 90 días superan ${fmt(Math.round(upkeepBase * 1.25))}/mes.`,
      preventativeMitigationEn: "Obtain binding insurance quotes in advance and establish a separate dedicated maintenance sinking fund.",
      preventativeMitigationFr: "Obtenez des devis d'assurance fermes avant achat et créez un sous-compte d'entretien dédié.",
      preventativeMitigationEs: "Obtenga presupuestos de seguro vinculantes y cree un fondo dedicado para revisiones.",
      triggerConditionMetric: `Recurring Cost = ${fmt(upkeepBase)}/mo`,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. UNDERUTILIZATION & DISCRETIONARY BUYER'S REMORSE
  // ─────────────────────────────────────────────────────────────────────────
  failureModes.push({
    id: "pm_underutilization",
    category: "UNDERUTILIZATION",
    failureDescriptionEn: `12 months later: The purchase delivered marginal lifestyle/work improvement, sitting idle while delaying priority life milestones by ${Math.round((amount / Math.max(50, decisionObject.context.primary_goal?.monthlyAllocation || 350)) * 30)} days.`,
    failureDescriptionFr: `12 mois plus tard : L'achat a apporté un gain marginal, restant sous-utilisé tout en retardant vos projets de vie de ${Math.round((amount / Math.max(50, decisionObject.context.primary_goal?.monthlyAllocation || 350)) * 30)} jours.`,
    failureDescriptionEs: `12 meses después: La compra aportó un beneficio marginal, quedando infrautilizada y retrasando sus metas en ${Math.round((amount / Math.max(50, decisionObject.context.primary_goal?.monthlyAllocation || 350)) * 30)} días.`,
    likelihood: "MEDIUM",
    financialImpact: "LOW",
    earlyWarningSignalEn: "Asset is used < 4 hours per week during the first 30 days after acquisition.",
    earlyWarningSignalFr: "L'équipement est utilisé moins de 4 heures par semaine au cours du premier mois.",
    earlyWarningSignalEs: "El activo se utiliza menos de 4 horas por semana durante el primer mes.",
    preventativeMitigationEn: "Enforce a strict 7-day cooling-off rule before buying; test low-cost rental or borrow first if uncertain.",
    preventativeMitigationFr: "Appliquez une règle de réflexion de 7 jours ; testez la location ou l'emprunt au préalable.",
    preventativeMitigationEs: "Aplique una regla de espera de 7 días antes de comprar; alquile o pruebe antes si duda.",
    triggerConditionMetric: "Discretionary Capital Commitment",
  });

  // Rank failure modes by severity
  const severityScore = (fm: PreMortemFailureMode) => {
    let score = 0;
    if (fm.financialImpact === "CRITICAL") score += 40;
    else if (fm.financialImpact === "HIGH") score += 30;
    else if (fm.financialImpact === "MEDIUM") score += 20;
    else score += 10;

    if (fm.likelihood === "HIGH") score += 30;
    else if (fm.likelihood === "MEDIUM") score += 20;
    else score += 10;

    return score;
  };

  failureModes.sort((a, b) => severityScore(b) - severityScore(a));
  const highestRiskFailureMode = failureModes[0];

  const preventativeChecklistEn = failureModes.map(
    (fm) => `[${fm.category.replace(/_/g, " ")}] ${fm.preventativeMitigationEn}`
  );
  const preventativeChecklistFr = failureModes.map(
    (fm) => `[${fm.category.replace(/_/g, " ")}] ${fm.preventativeMitigationFr}`
  );
  const preventativeChecklistEs = failureModes.map(
    (fm) => `[${fm.category.replace(/_/g, " ")}] ${fm.preventativeMitigationEs}`
  );

  return {
    timestamp: new Date().toISOString(),
    currency: curr,
    preMortemPremiseEn:
      'Diagnostic assumption: "It is 12 months later. This financial decision performed poorly. Here is the realistic autopsy."',
    preMortemPremiseFr:
      'Hypothèse diagnostique : « Nous sommes 12 mois plus tard. Cette décision a mal tourné. Voici l\'autopsie réaliste. »',
    preMortemPremiseEs:
      'Hipótesis diagnóstica: « Han pasado 12 meses. Esta decisión financiera salió mal. Esta es la autopsia realista. »',
    identifiedFailureModes: failureModes,
    highestRiskFailureMode,
    preventativeChecklistEn,
    preventativeChecklistFr,
    preventativeChecklistEs,
    isHighPreMortemRisk: highestRiskFailureMode.financialImpact === "CRITICAL" || highestRiskFailureMode.likelihood === "HIGH",
  };
}
