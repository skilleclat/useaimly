/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * MICRO-SCENARIO DETECTION ENGINE (PROMPT 4)
 *
 * Runs before the final recommendation to systematically scan for overlooked second-order factors:
 * 1. Hidden Costs (taxes, fees, insurance, maintenance, subscriptions, FX conversion)
 * 2. Timing Problems (cash flow lag, overlapping payment dates, financing deadlines)
 * 3. Liquidity Problems (reserves exhaustion, locked capital, emergency buffer compression)
 * 4. Dependency Risks (assumptions that MUST stay true: employment, income stability, market stability)
 * 5. Behavioral Risks (urgency pressure, FOMO, optimism bias, underestimating recurring drag)
 * 6. Hidden Opportunity Costs (goal delay, forgone compounding capital growth)
 *
 * Strictly filters out trivial noise: returns only financially meaningful, ranked findings.
 */

import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "../utils/currency";
import { DecisionIntelligenceObject } from "./master-decision-model";

export type MicroScenarioSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type MicroScenarioCategory =
  | "HIDDEN_COSTS"
  | "TIMING_PROBLEMS"
  | "LIQUIDITY_PROBLEMS"
  | "DEPENDENCY_RISKS"
  | "BEHAVIORAL_RISKS"
  | "HIDDEN_OPPORTUNITY_COSTS";

export interface MicroScenarioFinding {
  id: string;
  category: MicroScenarioCategory;
  severity: MicroScenarioSeverity;
  headlineEn: string;
  headlineFr: string;
  headlineEs: string;
  detectedIssueEn: string;
  detectedIssueFr: string;
  detectedIssueEs: string;
  whyItMattersEn: string;
  whyItMattersFr: string;
  whyItMattersEs: string;
  financialConsequenceEn: string;
  financialConsequenceFr: string;
  financialConsequenceEs: string;
  canInformationReduceUncertainty: boolean;
  uncertaintyReductionActionEn?: string;
  uncertaintyReductionActionFr?: string;
  uncertaintyReductionActionEs?: string;
  estimatedFinancialImpactAmount?: number;
}

export interface MicroScenarioScanResult {
  scanTimestamp: string;
  findings: MicroScenarioFinding[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  highestSeverity: MicroScenarioSeverity | "NONE";
  overallRiskFrictionScore: number; // 0 (minimal friction) to 100 (extreme systemic risk)
  summaryEn: string;
  summaryFr: string;
  summaryEs: string;
}

/**
 * EXECUTE SYSTEMATIC MICRO-SCENARIO SCAN
 */
export function runMicroScenarioScan(
  decisionObject: DecisionIntelligenceObject
): MicroScenarioScanResult {
  const findings: MicroScenarioFinding[] = [];
  const curr: CurrencyCode = decisionObject.definition.currency;
  const fmt = (n: number) => formatCurrency(n, curr);

  const amount = decisionObject.definition.financial_amount.value || 0;
  const category = decisionObject.definition.decision_category;
  const rawQuery = decisionObject.definition.decision_description || decisionObject.definition.proposed_action || "";
  const lowerQuery = rawQuery.toLowerCase();

  const liquidCash = decisionObject.context.liquid_savings.value || 0;
  const monthlyIncome = decisionObject.context.monthly_income.value || 0;
  const monthlyExpenses = decisionObject.context.essential_expenses.value || 0;
  const monthlyDebt = decisionObject.context.monthly_debt_payments.value || 0;
  const monthlyFreeCashFlow = Math.max(0, monthlyIncome - monthlyExpenses - monthlyDebt);
  const incomeStability = decisionObject.context.income_stability.value;

  const isLoan =
    category === "TAKE_A_LOAN" ||
    decisionObject.definition.decision_category === "TAKE_A_LOAN" ||
    (decisionObject.economics.financing_cost.value > 0 && decisionObject.economics.down_payment.value > 0);
  const isCar = category === "BUY_A_CAR";
  const isHome = category === "MOVE_HOME";
  const isBusiness = category === "BUSINESS_EXPENSE";
  const isInvest = category === "INVEST";

  // ─────────────────────────────────────────────────────────────────────────
  // 1. LIQUIDITY PROBLEMS SCANNER
  // ─────────────────────────────────────────────────────────────────────────
  const postDecisionReserves = Math.max(0, liquidCash - (decisionObject.economics.down_payment.value || amount));
  const baselineRunwayMonths = monthlyExpenses > 0 ? liquidCash / monthlyExpenses : 6;
  const postDecisionRunwayMonths = monthlyExpenses > 0 ? postDecisionReserves / monthlyExpenses : 0;

  if (amount > liquidCash && !isLoan) {
    findings.push({
      id: "liq_exceeds_available_cash",
      category: "LIQUIDITY_PROBLEMS",
      severity: "CRITICAL",
      headlineEn: "Direct Cash Deficit Detected",
      headlineFr: "Déficit de Trésorerie Immédiat Détecté",
      headlineEs: "Déficit Directo de Tesorería Detectado",
      detectedIssueEn: `Proposed outlay of ${fmt(amount)} exceeds available liquid savings of ${fmt(liquidCash)}.`,
      detectedIssueFr: `La dépense envisagée de ${fmt(amount)} dépasse votre épargne disponible de ${fmt(liquidCash)}.`,
      detectedIssueEs: `El desembolso propuesto de ${fmt(amount)} supera sus ahorros líquidos disponibles de ${fmt(liquidCash)}.`,
      whyItMattersEn: "Cannot execute in cash without entering an overdraft or forcing debt financing.",
      whyItMattersFr: "Impossible à régler comptant sans découvert bancaire ou recours obligatoire au crédit.",
      whyItMattersEs: "Imposible de pagar al contado sin incurrir en descubierto bancario o endeudamiento forzado.",
      financialConsequenceEn: "Immediate overdraft interest or debt dependency.",
      financialConsequenceFr: "Frais d'agios immédiats ou dépendance accrue au crédit.",
      financialConsequenceEs: "Intereses de descubierto inmediatos o dependencia de deuda.",
      canInformationReduceUncertainty: true,
      uncertaintyReductionActionEn: "Verify whether external funding, installment spread, or partial down payment is intended.",
      uncertaintyReductionActionFr: "Vérifier si un étalement, un financement ou un apport partiel est prévu.",
      uncertaintyReductionActionEs: "Verificar si se prevé pago fraccionado, financiación o aporte parcial.",
      estimatedFinancialImpactAmount: amount - liquidCash,
    });
  } else if (postDecisionRunwayMonths < 1.0) {
    findings.push({
      id: "liq_severe_emergency_depletion",
      category: "LIQUIDITY_PROBLEMS",
      severity: "CRITICAL",
      headlineEn: "Severe Emergency Runway Compression (<1 Month)",
      headlineFr: "Érosion Critique du Matelas de Sécurité (<1 Mois)",
      headlineEs: "Erosión Crítica del Fondo de Emergencia (<1 Mes)",
      detectedIssueEn: `Leaves only ${postDecisionRunwayMonths.toFixed(1)} months of emergency living expenses in reserve.`,
      detectedIssueFr: `Ne laisse que ${postDecisionRunwayMonths.toFixed(1)} mois de charges de subsistance en réserve.`,
      detectedIssueEs: `Deja solo ${postDecisionRunwayMonths.toFixed(1)} meses de gastos esenciales en reserva.`,
      whyItMattersEn: "A single minor life unexpected shock (medical, car repair, job delay) will cause insolvency.",
      whyItMattersFr: "Le moindre imprévu (santé, réparation, délai de salaire) provoquera un découvert immédiat.",
      whyItMattersEs: "El menor imprevisto (salud, reparación, retraso de ingresos) causará insolvencia.",
      financialConsequenceEn: "Extreme vulnerability to predatory short-term debt.",
      financialConsequenceFr: "Vulnérabilité extrême aux crédits d'urgence coûteux.",
      financialConsequenceEs: "Vulnerabilidad extrema a créditos de emergencia costosos.",
      canInformationReduceUncertainty: false,
    });
  } else if (postDecisionRunwayMonths < 3.0 && baselineRunwayMonths >= 3.0) {
    findings.push({
      id: "liq_safety_buffer_breach",
      category: "LIQUIDITY_PROBLEMS",
      severity: "HIGH",
      headlineEn: "Emergency Buffer Drops Below 3-Month Gold Standard",
      headlineFr: "Passage sous le Seuil des 3 Mois de Sécurité",
      headlineEs: "Descenso por Debajo del Estándar de 3 Meses de Seguridad",
      detectedIssueEn: `Runway drops from ${baselineRunwayMonths.toFixed(1)} to ${postDecisionRunwayMonths.toFixed(1)} months.`,
      detectedIssueFr: `Votre autonomie de sécurité passe de ${baselineRunwayMonths.toFixed(1)} à ${postDecisionRunwayMonths.toFixed(1)} mois.`,
      detectedIssueEs: `Su autonomía de seguridad se reduce de ${baselineRunwayMonths.toFixed(1)} a ${postDecisionRunwayMonths.toFixed(1)} meses.`,
      whyItMattersEn: "Reduces flexibility to handle temporary economic shocks or career changes.",
      whyItMattersFr: "Réduit votre flexibilité face aux imprévus professionnels ou économiques.",
      whyItMattersEs: "Reduce su margen de maniobra ante imprevistos laborales o económicos.",
      financialConsequenceEn: "Higher anxiety and lower ability to absorb unexpected annual bills.",
      financialConsequenceFr: "Pression financière accrue en cas d'échéance annuelle imprévue.",
      financialConsequenceEs: "Mayor presión financiera ante compromisos anuales sobrevenidos.",
      canInformationReduceUncertainty: false,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. HIDDEN COSTS SCANNER
  // ─────────────────────────────────────────────────────────────────────────
  if (isCar) {
    const estimatedCarFriction = Math.round(amount * 0.18);
    findings.push({
      id: "cost_car_ancillary_friction",
      category: "HIDDEN_COSTS",
      severity: "HIGH",
      headlineEn: "Vehicle Ownership Overhead (Insurance, Fuel, Maintenance)",
      headlineFr: "Friction de Propriété Véhicule (Assurance, Entretien, Carburant)",
      headlineEs: "Costes Ocultos del Vehículo (Seguro, Mantenimiento, Combustible)",
      detectedIssueEn: `Car purchases typically add 15-22% annual cost in insurance, registration, and routine upkeep (~${fmt(estimatedCarFriction)}/yr).`,
      detectedIssueFr: `L'achat d'un véhicule entraîne 15 à 22% de coûts annexes annuels (assurance, carte grise, entretien ~${fmt(estimatedCarFriction)}/an).`,
      detectedIssueEs: `La compra de un vehículo añade un 15-22% de costes anuales en seguro, matriculación y mantenimiento (~${fmt(estimatedCarFriction)}/año).`,
      whyItMattersEn: "Focusing solely on purchase price underestimates total monthly cash bleed by 20-30%.",
      whyItMattersFr: "Ne regarder que le prix d'achat sous-estime l'hémorragie mensuelle réelle de 20 à 30%.",
      whyItMattersEs: "Fijarse solo en el precio de compra subestima el gasto mensual real en un 20-30%.",
      financialConsequenceEn: `Recurring unmodeled drag of approximately ${fmt(Math.round(estimatedCarFriction / 12))}/month.`,
      financialConsequenceFr: `Charge récurrente non budgétée d'environ ${fmt(Math.round(estimatedCarFriction / 12))}/mois.`,
      financialConsequenceEs: `Carga recurrente no presupuestada de aprox. ${fmt(Math.round(estimatedCarFriction / 12))}/mes.`,
      canInformationReduceUncertainty: true,
      uncertaintyReductionActionEn: "Request exact insurance quote and estimate monthly fuel/maintenance miles.",
      uncertaintyReductionActionFr: "Demander un devis d'assurance précis et estimer le kilométrage mensuel.",
      uncertaintyReductionActionEs: "Solicitar presupuesto exacto de seguro y estimar kilometraje mensual.",
      estimatedFinancialImpactAmount: estimatedCarFriction,
    });
  }

  if (category === "BUY_SOMETHING" && /laptop|computer|macbook|camera|tech/i.test(lowerQuery)) {
    const estimatedTechFriction = Math.round(amount * 0.12);
    findings.push({
      id: "cost_tech_accessories_software",
      category: "HIDDEN_COSTS",
      severity: "MEDIUM",
      headlineEn: "Ancillary Accessories, Adapters & Software Subscriptions",
      headlineFr: "Accessoires, Adaptateurs et Abonnements Logiciels Requis",
      headlineEs: "Accesorios, Adaptadores y Suscripciones de Software Requeridas",
      detectedIssueEn: `Hardware upgrades frequently require peripheral adapters, protective gear, and software tools (~${fmt(estimatedTechFriction)}).`,
      detectedIssueFr: `Les équipements informatiques nécessitent souvent des adaptateurs, housses et licences logicielles (~${fmt(estimatedTechFriction)}).`,
      detectedIssueEs: `El equipamiento informático suele requerir adaptadores, fundas y licencias de software (~${fmt(estimatedTechFriction)}).`,
      whyItMattersEn: "Increases net cash outflow beyond sticker price on unboxing day.",
      whyItMattersFr: "Augmente la dépense réelle totale dès la mise en service.",
      whyItMattersEs: "Incrementa el desembolso real total desde el primer día.",
      financialConsequenceEn: `Potential unbudgeted cost overrun of ~${fmt(estimatedTechFriction)}.`,
      financialConsequenceFr: `Dépassement de budget imprévu d'environ ~${fmt(estimatedTechFriction)}.`,
      financialConsequenceEs: `Desvío presupuestario imprevisto de aprox. ~${fmt(estimatedTechFriction)}.`,
      canInformationReduceUncertainty: true,
      uncertaintyReductionActionEn: "Confirm whether existing cables, peripherals, and software licenses are compatible.",
      uncertaintyReductionActionFr: "Vérifier si vos accessoires et licences actuels sont compatibles.",
      uncertaintyReductionActionEs: "Comprobar si sus accesorios y licencias actuales son compatibles.",
      estimatedFinancialImpactAmount: estimatedTechFriction,
    });
  }

  if (isLoan) {
    const rate = decisionObject.economics.interest_rate.value || 8.5;
    const duration = decisionObject.economics.loan_duration.value || 36;
    const monthlyRate = rate / 100 / 12;
    const monthlyPmt = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -duration));
    const totalCost = monthlyPmt * duration;
    const totalInterest = Math.round(totalCost - amount);

    if (totalInterest > amount * 0.15) {
      findings.push({
        id: "cost_financing_interest_drag",
        category: "HIDDEN_COSTS",
        severity: "HIGH",
        headlineEn: "Compounded Interest Overhead Drag",
        headlineFr: "Fardeau des Intérêts Cumulés d'Emprunt",
        headlineEs: "Carga de Intereses Compuestos de Financiación",
        detectedIssueEn: `Borrowing ${fmt(amount)} at ${rate}% APR over ${duration} months incurs ${fmt(totalInterest)} in total interest fees.`,
        detectedIssueFr: `Emprunter ${fmt(amount)} à ${rate}% sur ${duration} mois coûte ${fmt(totalInterest)} d'intérêts cumulés.`,
        detectedIssueEs: `Financiar ${fmt(amount)} al ${rate}% a ${duration} meses genera ${fmt(totalInterest)} en intereses acumulados.`,
        whyItMattersEn: `You will effectively pay ${((totalCost / amount) * 100).toFixed(0)}% of the original purchase price.`,
        whyItMattersFr: `Vous paierez réellement ${((totalCost / amount) * 100).toFixed(0)}% du prix d'origine.`,
        whyItMattersEs: `Pagará efectivamente el ${((totalCost / amount) * 100).toFixed(0)}% del precio inicial.`,
        financialConsequenceEn: `${fmt(totalInterest)} permanently lost to borrowing cost rather than building net worth.`,
        financialConsequenceFr: `${fmt(totalInterest)} perdus en intérêts au lieu de capitaliser sur votre patrimoine.`,
        financialConsequenceEs: `${fmt(totalInterest)} perdidos en intereses en vez de invertirse en su patrimonio.`,
        canInformationReduceUncertainty: true,
        uncertaintyReductionActionEn: "Shop for lower APR options or shorten tenure to 24 months to save ~35% in interest.",
        uncertaintyReductionActionFr: "Comparer les offres de crédit ou réduire la durée à 24 mois pour économiser ~35% d'intérêts.",
        uncertaintyReductionActionEs: "Comparar opciones de crédito o reducir el plazo a 24 meses para ahorrar ~35% en intereses.",
        estimatedFinancialImpactAmount: totalInterest,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. DEPENDENCY RISKS SCANNER ("What must go right?")
  // ─────────────────────────────────────────────────────────────────────────
  if (incomeStability === "VARIABLE" || incomeStability === "VOLATILE") {
    if (isLoan || category === "MOVE_HOME" || decisionObject.economics.recurring_cost.value > 0) {
      findings.push({
        id: "dep_variable_income_fixed_obligation",
        category: "DEPENDENCY_RISKS",
        severity: "CRITICAL",
        headlineEn: "Fixed Monthly Obligation on Variable Income Stream",
        headlineFr: "Engagement Mensuel Fixe adossé à des Revenus Variables",
        headlineEs: "Obligación Mensual Fija vinculada a Ingresos Variables",
        detectedIssueEn: "Adding fixed recurring commitments while your income fluctuates creates default risk during lean months.",
        detectedIssueFr: "Ajouter des charges fixes avec des revenus variables crée un risque d'impayé durant les mois creux.",
        detectedIssueEs: "Añadir gastos fijos con ingresos variables genera riesgo de impago en meses bajos.",
        whyItMattersEn: "Fixed creditors demand payment regardless of whether client invoices are paid on time.",
        whyItMattersFr: "Les créanciers exigent leur mensualité quelle que soit la ponctualité de vos clients.",
        whyItMattersEs: "Los acreedores exigen el pago puntual independientemente de la facturación del mes.",
        financialConsequenceEn: "Severe risk of late fees, credit score penalty, and emergency distress.",
        financialConsequenceFr: "Risque élevé de pénalités de retard et de détresse de trésorerie.",
        financialConsequenceEs: "Riesgo elevado de recargos por demora y estrés de tesorería.",
        canInformationReduceUncertainty: true,
        uncertaintyReductionActionEn: "Maintain a dedicated 6-month buffer specifically earmarked for fixed debts.",
        uncertaintyReductionActionFr: "Provisionner un sas de sécurité de 6 mois dédié aux charges fixes.",
        uncertaintyReductionActionEs: "Provisionar un fondo de seguridad de 6 meses para gastos fijos.",
      });
    }
  }

  if (isBusiness) {
    findings.push({
      id: "dep_business_payback_uncertainty",
      category: "DEPENDENCY_RISKS",
      severity: "HIGH",
      headlineEn: "Commercial Payback Horizon Dependency",
      headlineFr: "Dépendance au Délai de Rentabilité Commerciale",
      headlineEs: "Dependencia del Plazo de Retorno Comercial",
      detectedIssueEn: "Assumes this business outlay will convert into tangible client revenue within 3-6 months.",
      detectedIssueFr: "Suppose que cette dépense commerciale se transformera en chiffre d'affaires sous 3 à 6 mois.",
      detectedIssueEs: "Asume que este gasto de negocio se traducirá en ingresos en 3-6 meses.",
      whyItMattersEn: "If client acquisition lags, the upfront capital remains locked without replenishment.",
      whyItMattersFr: "Si les ventes tardent, le capital reste immobilisé sans amortissement.",
      whyItMattersEs: "Si las ventas se retrasan, el capital queda inmovilizado sin reposición.",
      financialConsequenceEn: "Potential capital write-off or delayed breakeven.",
      financialConsequenceFr: "Amortissement retardé ou perte de capital.",
      financialConsequenceEs: "Retorno retrasado o descapitalización.",
      canInformationReduceUncertainty: true,
      uncertaintyReductionActionEn: "Establish clear milestone metrics: if ROI is < 50% after 90 days, pivot or pause further spend.",
      uncertaintyReductionActionFr: "Définir des jalons clairs : si le ROI est < 50% après 90 jours, pivoter ou stopper les dépenses.",
      uncertaintyReductionActionEs: "Fijar hitos claros: si el ROI es < 50% tras 90 días, pivotar o pausar el gasto.",
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. BEHAVIORAL RISKS SCANNER
  // ─────────────────────────────────────────────────────────────────────────
  if (/urgent|today|must buy|right now|limited|deal|sale|promo|fomo/i.test(lowerQuery)) {
    findings.push({
      id: "beh_urgency_pressure_bias",
      category: "BEHAVIORAL_RISKS",
      severity: "MEDIUM",
      headlineEn: "Artificial Urgency & Promotion Pressure Bias",
      headlineFr: "Pression d'Urgence Temporelle ou Promotionnelle",
      headlineEs: "Sesgo de Urgencia Temporal o Presión Promocional",
      detectedIssueEn: "Decision framing contains urgency indicators (deal expiration, immediate impulse).",
      detectedIssueFr: "La formulation contient des signaux d'urgence ou d'achat d'impulsion.",
      detectedIssueEs: "La formulación contiene señales de urgencia o compra por impulso.",
      whyItMattersEn: "Urgency compresses rational price comparison and second-hand market evaluation.",
      whyItMattersFr: "L'urgence réduit le temps de comparaison des prix et alternatives d'occasion.",
      whyItMattersEs: "La urgencia reduce el tiempo para comparar precios y opciones de segunda mano.",
      financialConsequenceEn: "Paying 10-25% premium due to rushed execution.",
      financialConsequenceFr: "Surcoût potentiel de 10 à 25% lié à l'absence de mise en concurrence.",
      financialConsequenceEs: "Sobreprecio potencial del 10-25% por falta de comparativa.",
      canInformationReduceUncertainty: true,
      uncertaintyReductionActionEn: "Enforce a mandatory 72-hour cooling-off delay before executing.",
      uncertaintyReductionActionFr: "Instaurer un délai de réflexion de 72 heures avant tout engagement.",
      uncertaintyReductionActionEs: "Aplicar un periodo de reflexión de 72 horas antes de comprometer fondos.",
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. HIDDEN OPPORTUNITY COSTS SCANNER
  // ─────────────────────────────────────────────────────────────────────────
  const goalAllocation = decisionObject.context.primary_goal?.monthlyAllocation || 350;
  const goalDelayDays = Math.round((amount / Math.max(50, goalAllocation)) * 30);
  const forgoneCompound10Y = Math.round(amount * (Math.pow(1.07, 10) - 1));

  if (goalDelayDays >= 60) {
    findings.push({
      id: "opp_primary_goal_postponement",
      category: "HIDDEN_OPPORTUNITY_COSTS",
      severity: goalDelayDays > 120 ? "HIGH" : "MEDIUM",
      headlineEn: `Postpones Priority Life Goal by ~${Math.round(goalDelayDays / 30)} Months (${goalDelayDays} Days)`,
      headlineFr: `Reporte votre Objectif Prioritaire de ~${Math.round(goalDelayDays / 30)} Mois (${goalDelayDays} Jours)`,
      headlineEs: `Retrasa su Objetivo Principal en ~${Math.round(goalDelayDays / 30)} Meses (${goalDelayDays} Días)`,
      detectedIssueEn: `Diverting ${fmt(amount)} delays reaching "${decisionObject.context.primary_goal?.title || "Primary Goal"}" by ${goalDelayDays} days.`,
      detectedIssueFr: `Allouer ${fmt(amount)} retarde l'atteinte de « ${decisionObject.context.primary_goal?.title || "Objectif Principal"} » de ${goalDelayDays} jours.`,
      detectedIssueEs: `Destinar ${fmt(amount)} retrasa la consecución de « ${decisionObject.context.primary_goal?.title || "Objetivo Principal"} » en ${goalDelayDays} días.`,
      whyItMattersEn: "Every dollar spent today cannot simultaneously fund long-term financial freedom milestones.",
      whyItMattersFr: "Chaque somme dépensée aujourd'hui ne peut pas financer vos projets de vie à long terme.",
      whyItMattersEs: "Cada cantidad gastada hoy no puede financiar simultáneamente sus proyectos de vida futuros.",
      financialConsequenceEn: `Equivalent forgone 10-year compounding growth benchmark: ~${fmt(forgoneCompound10Y)} at 7% p.a.`,
      financialConsequenceFr: `Manque à gagner sur 10 ans avec un rendement composé de 7%/an : ~${fmt(forgoneCompound10Y)}.`,
      financialConsequenceEs: `Coste de oportunidad a 10 años al 7% anual compuesto: aprox. ~${fmt(forgoneCompound10Y)}.`,
      canInformationReduceUncertainty: false,
      estimatedFinancialImpactAmount: forgoneCompound10Y,
    });
  }

  // Count severities
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  findings.forEach((f) => {
    if (f.severity === "CRITICAL") criticalCount++;
    else if (f.severity === "HIGH") highCount++;
    else if (f.severity === "MEDIUM") mediumCount++;
    else if (f.severity === "LOW") lowCount++;
  });

  const highestSeverity: MicroScenarioSeverity | "NONE" =
    criticalCount > 0
      ? "CRITICAL"
      : highCount > 0
      ? "HIGH"
      : mediumCount > 0
      ? "MEDIUM"
      : lowCount > 0
      ? "LOW"
      : "NONE";

  const overallRiskFrictionScore = Math.min(
    100,
    criticalCount * 35 + highCount * 20 + mediumCount * 10 + lowCount * 5
  );

  const summaryEn =
    criticalCount > 0
      ? `Scan detected ${criticalCount} CRITICAL vulnerability requiring structural mitigation before commitment.`
      : highCount > 0
      ? `Scan identified ${highCount} high-sensitivity friction factors with meaningful financial drag.`
      : `Scan completed: ${findings.length} second-order factors identified with manageable risk profile.`;

  const summaryFr =
    criticalCount > 0
      ? `Le scan a détecté ${criticalCount} vulnérabilité CRITIQUE nécessitant un ajustement avant tout engagement.`
      : highCount > 0
      ? `Le scan a identifié ${highCount} facteurs de friction à fort impact financier.`
      : `Scan terminé : ${findings.length} facteurs de second ordre identifiés avec un profil de risque maîtrisé.`;

  const summaryEs =
    criticalCount > 0
      ? `El análisis detectó ${criticalCount} vulnerabilidad CRÍTICA que requiere ajustes antes del compromiso.`
      : highCount > 0
      ? `El análisis identificó ${highCount} factores de fricción de alto impacto financiero.`
      : `Análisis completado: ${findings.length} factores de segundo orden detectados con perfil de riesgo manejable.`;

  return {
    scanTimestamp: new Date().toISOString(),
    findings,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    highestSeverity,
    overallRiskFrictionScore,
    summaryEn,
    summaryFr,
    summaryEs,
  };
}
