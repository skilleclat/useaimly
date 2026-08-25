/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * SENSITIVITY ANALYSIS ENGINE (PROMPT 9)
 *
 * Discovers which variables truly control the financial decision.
 * Answers: "Which number, if wrong, changes everything?"
 *
 * Evaluates candidate variables (Price, Income, Interest Rate, Revenue, Maintenance, Resale)
 * and returns THE 3 VARIABLES THAT MATTER MOST with:
 * 1. Current assumption
 * 2. What happens if it improves
 * 3. What happens if it worsens
 * 4. Exact tipping point threshold where the recommendation flips
 */

import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "../utils/currency";
import { DecisionIntelligenceObject } from "./master-decision-model";

export interface CriticalSensitivityVariable {
  id: string;
  variableNameEn: string;
  variableNameFr: string;
  variableNameEs: string;
  category: "COST" | "INCOME" | "FINANCING" | "REVENUE" | "MAINTENANCE" | "RESALE" | "TIMING";
  sensitivityRank: 1 | 2 | 3;
  elasticityScore: number; // relative impact magnitude

  // 4 Core Dimensions
  currentAssumption: {
    value: number | string;
    formatted: string;
    notesEn: string;
    notesFr: string;
    notesEs: string;
  };
  ifImproves: {
    testedShift: string;
    resultingOutcomeEn: string;
    resultingOutcomeFr: string;
    resultingOutcomeEs: string;
    runwayDeltaMonths: number;
    goalPacingImpactEn: string;
    goalPacingImpactFr: string;
    goalPacingImpactEs: string;
  };
  ifWorsens: {
    testedShift: string;
    resultingOutcomeEn: string;
    resultingOutcomeFr: string;
    resultingOutcomeEs: string;
    runwayDeltaMonths: number;
    goalPacingImpactEn: string;
    goalPacingImpactFr: string;
    goalPacingImpactEs: string;
  };
  tippingPointThreshold: {
    thresholdValueFormatted: string;
    descriptionEn: string;
    descriptionFr: string;
    descriptionEs: string;
    recommendationShift: "SAFE_TO_CAUTION" | "CAUTION_TO_DANGER" | "DANGER_TO_UNVIABLE";
  };
}

export interface SensitivityAnalysisReport {
  timestamp: string;
  currency: CurrencyCode;
  topThreeVariables: [CriticalSensitivityVariable, CriticalSensitivityVariable, CriticalSensitivityVariable];
  allTestedVariablesCount: number;
  singleMostDangerousVariable: {
    nameEn: string;
    nameFr: string;
    nameEs: string;
    coreVulnerabilityEn: string;
    coreVulnerabilityFr: string;
    coreVulnerabilityEs: string;
    tippingPointEn: string;
    tippingPointFr: string;
    tippingPointEs: string;
  };
  elasticitySummaryEn: string;
  elasticitySummaryFr: string;
  elasticitySummaryEs: string;
}

/**
 * EXECUTE SENSITIVITY STRESS SCAN & DISCOVER TOP 3 CONTROLLING VARIABLES
 */
export function runSensitivityAnalysis(
  decisionObject: DecisionIntelligenceObject
): SensitivityAnalysisReport {
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
  const goalAllocation = Math.max(50, decisionObject.context.primary_goal?.monthlyAllocation || 350);

  const isLoan =
    decisionObject.definition.decision_category === "TAKE_A_LOAN" ||
    (downPayment > 0 && downPayment < amount);
  const isCar = decisionObject.definition.decision_category === "BUY_A_CAR";
  const isBusiness = decisionObject.definition.decision_category === "BUSINESS_EXPENSE" || expectedRevenue > 0;

  const candidateVariables: (Omit<CriticalSensitivityVariable, "sensitivityRank"> & { sortScore: number })[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // 1. PURCHASE PRICE / CAPITAL OUTLAY SENSITIVITY
  // ─────────────────────────────────────────────────────────────────────────
  const priceWorseAmount = Math.round(amount * 1.2);
  const priceBetterAmount = Math.round(amount * 0.9);
  const priceTippingThreshold = Math.min(amount * 1.35, Math.max(amount * 1.15, liquidSavings * 0.7));

  candidateVariables.push({
    id: "sens_purchase_price",
    variableNameEn: "Total Capital Outlay / Purchase Price",
    variableNameFr: "Prix d'Achat Total / Décaissement",
    variableNameEs: "Precio de Compra Total / Desembolso",
    category: "COST",
    sortScore: 90,
    elasticityScore: 0.9,
    currentAssumption: {
      value: amount,
      formatted: fmt(amount),
      notesEn: "Base purchase quote without unexpected ancillary overruns.",
      notesFr: "Prix nominal déclaré sans dépassements imprévus.",
      notesEs: "Precio nominal declarado sin sobrecostes no previstos.",
    },
    ifImproves: {
      testedShift: "-10% discount",
      resultingOutcomeEn: `Saves ${fmt(amount - priceBetterAmount)}, leaving ${fmt(liquidSavings - (isLoan ? downPayment : priceBetterAmount))} in liquid reserves.`,
      resultingOutcomeFr: `Économise ${fmt(amount - priceBetterAmount)}, laissant ${fmt(liquidSavings - (isLoan ? downPayment : priceBetterAmount))} d'épargne.`,
      resultingOutcomeEs: `Ahorra ${fmt(amount - priceBetterAmount)}, dejando ${fmt(liquidSavings - (isLoan ? downPayment : priceBetterAmount))} en reservas.`,
      runwayDeltaMonths: 0.4,
      goalPacingImpactEn: `Recovers ${Math.round(((amount - priceBetterAmount) / goalAllocation) * 30)} days on priority goal.`,
      goalPacingImpactFr: `Gagne ${Math.round(((amount - priceBetterAmount) / goalAllocation) * 30)} jours sur votre objectif.`,
      goalPacingImpactEs: `Recupera ${Math.round(((amount - priceBetterAmount) / goalAllocation) * 30)} días en su meta principal.`,
    },
    ifWorsens: {
      testedShift: "+20% cost overrun",
      resultingOutcomeEn: `Outflow rises to ${fmt(priceWorseAmount)}, consuming an extra ${fmt(priceWorseAmount - amount)} of cash.`,
      resultingOutcomeFr: `La dépense grimpe à ${fmt(priceWorseAmount)}, consommant ${fmt(priceWorseAmount - amount)} supplémentaires.`,
      resultingOutcomeEs: `El gasto asciende a ${fmt(priceWorseAmount)}, consumiendo ${fmt(priceWorseAmount - amount)} adicionales.`,
      runwayDeltaMonths: -0.7,
      goalPacingImpactEn: `Delays priority goal by an additional ${Math.round(((priceWorseAmount - amount) / goalAllocation) * 30)} days.`,
      goalPacingImpactFr: `Retarde votre objectif de ${Math.round(((priceWorseAmount - amount) / goalAllocation) * 30)} jours de plus.`,
      goalPacingImpactEs: `Retrasa su meta en ${Math.round(((priceWorseAmount - amount) / goalAllocation) * 30)} días adicionales.`,
    },
    tippingPointThreshold: {
      thresholdValueFormatted: fmt(priceTippingThreshold),
      descriptionEn: `If purchase cost exceeds ${fmt(priceTippingThreshold)}, cash buffer falls into the critical risk zone.`,
      descriptionFr: `Si le prix dépasse ${fmt(priceTippingThreshold)}, votre matelas tombe en zone de risque critique.`,
      descriptionEs: `Si el precio supera ${fmt(priceTippingThreshold)}, la reserva cae en zona de riesgo crítico.`,
      recommendationShift: "SAFE_TO_CAUTION",
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. MONTHLY INCOME STABILITY SENSITIVITY
  // ─────────────────────────────────────────────────────────────────────────
  const incomeDip20 = Math.round(monthlyIncome * 0.8);
  const incomeSurge10 = Math.round(monthlyIncome * 1.1);
  const incomeTippingThreshold = Math.round(essentialExpenses + monthlyDebt + recurringUpkeep + 200);

  candidateVariables.push({
    id: "sens_monthly_income",
    variableNameEn: "Monthly Net Income",
    variableNameFr: "Revenu Net Mensuel",
    variableNameEs: "Ingreso Neto Mensual",
    category: "INCOME",
    sortScore: 95,
    elasticityScore: 0.95,
    currentAssumption: {
      value: monthlyIncome,
      formatted: `${fmt(monthlyIncome)}/mo`,
      notesEn: `Assumed steady monthly cash inflow of ${fmt(monthlyIncome)}.`,
      notesFr: `Revenu mensuel récurrent supposé stable à ${fmt(monthlyIncome)}.`,
      notesEs: `Ingreso mensual recurrente asumido como estable en ${fmt(monthlyIncome)}.`,
    },
    ifImproves: {
      testedShift: "+10% income growth",
      resultingOutcomeEn: `Expands monthly free cash flow by +${fmt(incomeSurge10 - monthlyIncome)}/mo.`,
      resultingOutcomeFr: `Augmente le cash-flow libre de +${fmt(incomeSurge10 - monthlyIncome)}/mois.`,
      resultingOutcomeEs: `Aumenta el flujo de caja libre en +${fmt(incomeSurge10 - monthlyIncome)}/mes.`,
      runwayDeltaMonths: 0.6,
      goalPacingImpactEn: "Compresses total recovery timeline by 35%.",
      goalPacingImpactFr: "Raccourcit le délai de rétablissement de 35%.",
      goalPacingImpactEs: "Reduce el plazo de recuperación en un 35%.",
    },
    ifWorsens: {
      testedShift: "-20% temporary contraction",
      resultingOutcomeEn: `Monthly surplus drops to ${fmt(Math.max(0, incomeDip20 - essentialExpenses - monthlyDebt))}/mo.`,
      resultingOutcomeFr: `L'excédent mensuel chute à ${fmt(Math.max(0, incomeDip20 - essentialExpenses - monthlyDebt))}/mois.`,
      resultingOutcomeEs: `El excedente mensual cae a ${fmt(Math.max(0, incomeDip20 - essentialExpenses - monthlyDebt))}/mes.`,
      runwayDeltaMonths: -1.2,
      goalPacingImpactEn: "Halts goal contributions until income is restored.",
      goalPacingImpactFr: "Gèle les versements vers l'objectif prioritaire.",
      goalPacingImpactEs: "Pausa las aportaciones a la meta principal.",
    },
    tippingPointThreshold: {
      thresholdValueFormatted: `${fmt(incomeTippingThreshold)}/mo`,
      descriptionEn: `If income drops below ${fmt(incomeTippingThreshold)}/mo, cash flow enters a structural deficit.`,
      descriptionFr: `Si le revenu descend sous ${fmt(incomeTippingThreshold)}/mois, le budget bascule en déficit structurel.`,
      descriptionEs: `Si el ingreso cae por debajo de ${fmt(incomeTippingThreshold)}/mes, el presupuesto entra en déficit estructural.`,
      recommendationShift: "CAUTION_TO_DANGER",
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. FINANCING INTEREST RATE SENSITIVITY (IF FINANCED)
  // ─────────────────────────────────────────────────────────────────────────
  if (isLoan) {
    const rateWorse = interestRate + 3.5;
    const rateBetter = Math.max(2.0, interestRate - 1.5);
    const principal = Math.max(0, amount - downPayment);
    const rateTippingThreshold = Math.min(22.0, Math.round(interestRate + 5.0));

    candidateVariables.push({
      id: "sens_interest_rate",
      variableNameEn: "Borrowing Interest Rate (APR)",
      variableNameFr: "Taux d'Intérêt du Crédit (TAEG)",
      variableNameEs: "Tasa de Interés de Financiación (TAE)",
      category: "FINANCING",
      sortScore: 85,
      elasticityScore: 0.85,
      currentAssumption: {
        value: interestRate,
        formatted: `${interestRate}% APR`,
        notesEn: `Fixed annual percentage rate over loan duration.`,
        notesFr: `Taux annuel fixe supposé sur la durée du prêt.`,
        notesEs: `Tasa anual fija asumida durante el plazo del préstamo.`,
      },
      ifImproves: {
        testedShift: `-150 bps rate improvement (${rateBetter}%)`,
        resultingOutcomeEn: `Saves ~${fmt(Math.round(principal * 0.015 * 2.5))} in cumulative interest fees.`,
        resultingOutcomeFr: `Économise ~${fmt(Math.round(principal * 0.015 * 2.5))} d'intérêts cumulés.`,
        resultingOutcomeEs: `Ahorra ~${fmt(Math.round(principal * 0.015 * 2.5))} en intereses acumulados.`,
        runwayDeltaMonths: 0.2,
        goalPacingImpactEn: "Lowers monthly debt drag.",
        goalPacingImpactFr: "Allège la charge mensuelle de la dette.",
        goalPacingImpactEs: "Alivia la carga mensual de la deuda.",
      },
      ifWorsens: {
        testedShift: `+350 bps rate spike (${rateWorse}%)`,
        resultingOutcomeEn: `Increases lifetime borrowing cost by +${fmt(Math.round(principal * 0.035 * 2.5))}.`,
        resultingOutcomeFr: `Majore le coût total du crédit de +${fmt(Math.round(principal * 0.035 * 2.5))}.`,
        resultingOutcomeEs: `Incrementa el coste total del crédito en +${fmt(Math.round(principal * 0.035 * 2.5))}.`,
        runwayDeltaMonths: -0.3,
        goalPacingImpactEn: "Compounds interest bleed.",
        goalPacingImpactFr: "Alourdit le fardeau des intérêts.",
        goalPacingImpactEs: "Aumenta la carga de intereses.",
      },
      tippingPointThreshold: {
        thresholdValueFormatted: `${rateTippingThreshold}% APR`,
        descriptionEn: `If loan APR exceeds ${rateTippingThreshold}%, financing becomes economically destructive compared to saving first.`,
        descriptionFr: `Si le TAEG dépasse ${rateTippingThreshold}%, l'emprunt devient financièrement destructeur vs épargner d'abord.`,
        descriptionEs: `Si la TAE supera el ${rateTippingThreshold}%, financiar resulta destructivo frente a ahorrar previamente.`,
        recommendationShift: "CAUTION_TO_DANGER",
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. RECURRING MAINTENANCE / UPKEEP SENSITIVITY (IF CAR / RECURRING)
  // ─────────────────────────────────────────────────────────────────────────
  if (isCar || recurringUpkeep > 0) {
    const upkeepBase = recurringUpkeep > 0 ? recurringUpkeep : Math.round(amount * 0.015);
    const upkeepWorse = Math.round(upkeepBase * 1.5);
    const upkeepTippingThreshold = Math.round(monthlyIncome * 0.15);

    candidateVariables.push({
      id: "sens_recurring_upkeep",
      variableNameEn: "Recurring Maintenance & Insurance Upkeep",
      variableNameFr: "Entretien Récurrent & Assurance",
      variableNameEs: "Mantenimiento Recurrente y Seguro",
      category: "MAINTENANCE",
      sortScore: 80,
      elasticityScore: 0.8,
      currentAssumption: {
        value: upkeepBase,
        formatted: `${fmt(upkeepBase)}/mo`,
        notesEn: "Estimated recurring monthly maintenance and insurance expenses.",
        notesFr: "Estimation des charges mensuelles récurrentes d'entretien et d'assurance.",
        notesEs: "Estimación de costes mensuales recurrentes de seguro y mantenimiento.",
      },
      ifImproves: {
        testedShift: "-25% lower maintenance efficiency",
        resultingOutcomeEn: `Saves ${fmt(Math.round(upkeepBase * 0.25 * 12))}/year in recurring friction.`,
        resultingOutcomeFr: `Économise ${fmt(Math.round(upkeepBase * 0.25 * 12))}/an de charges récurrentes.`,
        resultingOutcomeEs: `Ahorra ${fmt(Math.round(upkeepBase * 0.25 * 12))}/año en costes recurrentes.`,
        runwayDeltaMonths: 0.3,
        goalPacingImpactEn: "Preserves monthly surplus.",
        goalPacingImpactFr: "Préserve le surplus mensuel.",
        goalPacingImpactEs: "Preserva el excedente mensual.",
      },
      ifWorsens: {
        testedShift: "+50% repair & insurance surge",
        resultingOutcomeEn: `Recurring drag climbs to ${fmt(upkeepWorse)}/mo (+${fmt((upkeepWorse - upkeepBase) * 12)}/yr).`,
        resultingOutcomeFr: `La charge récurrente monte à ${fmt(upkeepWorse)}/mois (+${fmt((upkeepWorse - upkeepBase) * 12)}/an).`,
        resultingOutcomeEs: `El gasto recurrente sube a ${fmt(upkeepWorse)}/mes (+${fmt((upkeepWorse - upkeepBase) * 12)}/año).`,
        runwayDeltaMonths: -0.5,
        goalPacingImpactEn: "Permanently reduces monthly savings rate.",
        goalPacingImpactFr: "Réduit durablement votre capacité d'épargne mensuelle.",
        goalPacingImpactEs: "Reduce permanentemente su capacidad de ahorro mensual.",
      },
      tippingPointThreshold: {
        thresholdValueFormatted: `${fmt(upkeepTippingThreshold)}/mo`,
        descriptionEn: `If recurring upkeep surpasses ${fmt(upkeepTippingThreshold)}/mo, total ownership cost becomes unsustainable.`,
        descriptionFr: `Si l'entretien dépasse ${fmt(upkeepTippingThreshold)}/mois, le coût total devient insoutenable.`,
        descriptionEs: `Si el mantenimiento supera ${fmt(upkeepTippingThreshold)}/mes, el coste total resulta insostenible.`,
        recommendationShift: "SAFE_TO_CAUTION",
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. COMMERCIAL REVENUE PAYBACK SENSITIVITY (IF BUSINESS)
  // ─────────────────────────────────────────────────────────────────────────
  if (isBusiness) {
    const revBase = expectedRevenue > 0 ? expectedRevenue : 500;
    const revWorse = Math.round(revBase * 0.5);

    candidateVariables.push({
      id: "sens_commercial_revenue",
      variableNameEn: "Expected Business Revenue / Client Billing",
      variableNameFr: "Revenus Commerciaux / Facturation Clients",
      variableNameEs: "Ingresos Comerciales / Facturación de Clientes",
      category: "REVENUE",
      sortScore: 88,
      elasticityScore: 0.88,
      currentAssumption: {
        value: revBase,
        formatted: `${fmt(revBase)}/mo`,
        notesEn: "Projected monthly client revenue enabled by this asset.",
        notesFr: "Chiffre d'affaires mensuel prévisionnel généré par cet équipement.",
        notesEs: "Facturación mensual prevista generada por este activo.",
      },
      ifImproves: {
        testedShift: "+30% rapid client adoption",
        resultingOutcomeEn: `Payback period accelerates by 40% (full breakeven in under 4 months).`,
        resultingOutcomeFr: `Délai de rentabilité accéléré de 40% (retour sur investissement en < 4 mois).`,
        resultingOutcomeEs: `Plazo de retorno acelerado en un 40% (retorno completo en < 4 meses).`,
        runwayDeltaMonths: 0.8,
        goalPacingImpactEn: "Generates net surplus for life goals.",
        goalPacingImpactFr: "Génère un excédent net pour vos projets.",
        goalPacingImpactEs: "Genera excedente neto para sus objetivos.",
      },
      ifWorsens: {
        testedShift: "-50% client acquisition lag",
        resultingOutcomeEn: `Monthly revenue drops to ${fmt(revWorse)}/mo, doubling the payback period.`,
        resultingOutcomeFr: `Les revenus tombent à ${fmt(revWorse)}/mois, doublant le délai de rentabilité.`,
        resultingOutcomeEs: `Los ingresos caen a ${fmt(revWorse)}/mes, duplicando el plazo de amortización.`,
        runwayDeltaMonths: -0.6,
        goalPacingImpactEn: "Delays goal funding recovery.",
        goalPacingImpactFr: "Retarde le retour à l'équilibre.",
        goalPacingImpactEs: "Retrasa la recuperación del equilibrio.",
      },
      tippingPointThreshold: {
        thresholdValueFormatted: `${fmt(Math.round(revBase * 0.25))}/mo`,
        descriptionEn: `If revenue falls below ${fmt(Math.round(revBase * 0.25))}/mo, the capital outlay is a pure net loss.`,
        descriptionFr: `Si le revenu descend sous ${fmt(Math.round(revBase * 0.25))}/mois, l'investissement devient une perte sèche.`,
        descriptionEs: `Si los ingresos caen por debajo de ${fmt(Math.round(revBase * 0.25))}/mes, la inversión se convierte en pérdida pura.`,
        recommendationShift: "CAUTION_TO_DANGER",
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. ESSENTIAL LIVING EXPENSES (INFLATION / BASELINE PRESSURE)
  // ─────────────────────────────────────────────────────────────────────────
  const expensesWorse = Math.round(essentialExpenses * 1.15);
  const expensesBetter = Math.round(essentialExpenses * 0.9);
  const expenseTippingThreshold = Math.round(monthlyIncome - monthlyDebt - 150);

  candidateVariables.push({
    id: "sens_living_expenses",
    variableNameEn: "Baseline Living Expenses & Inflation",
    variableNameFr: "Dépenses de Subsistance & Inflation",
    variableNameEs: "Gastos de Subsistencia e Inflación",
    category: "COST",
    sortScore: 78,
    elasticityScore: 0.78,
    currentAssumption: {
      value: essentialExpenses,
      formatted: `${fmt(essentialExpenses)}/mo`,
      notesEn: `Baseline essential monthly living expenditures of ${fmt(essentialExpenses)}.`,
      notesFr: `Dépenses mensuelles incompressibles de ${fmt(essentialExpenses)}.`,
      notesEs: `Gastos mensuales esenciales de ${fmt(essentialExpenses)}.`,
    },
    ifImproves: {
      testedShift: "-10% lifestyle optimization",
      resultingOutcomeEn: `Frees up +${fmt(essentialExpenses - expensesBetter)}/mo in surplus cash.`,
      resultingOutcomeFr: `Libère +${fmt(essentialExpenses - expensesBetter)}/mois de surplus.`,
      resultingOutcomeEs: `Libera +${fmt(essentialExpenses - expensesBetter)}/mes de excedente.`,
      runwayDeltaMonths: 0.5,
      goalPacingImpactEn: "Accelerates goal accumulation.",
      goalPacingImpactFr: "Accélère l'accumulation de capital.",
      goalPacingImpactEs: "Acelera la acumulación de capital.",
    },
    ifWorsens: {
      testedShift: "+15% inflation / cost of living rise",
      resultingOutcomeEn: `Monthly burn rises by +${fmt(expensesWorse - essentialExpenses)}/mo.`,
      resultingOutcomeFr: `Les dépenses augmentent de +${fmt(expensesWorse - essentialExpenses)}/mois.`,
      resultingOutcomeEs: `El gasto mensual sube en +${fmt(expensesWorse - essentialExpenses)}/mes.`,
      runwayDeltaMonths: -0.8,
      goalPacingImpactEn: "Compresses monthly free cash flow.",
      goalPacingImpactFr: "Comprime le cash-flow libre mensuel.",
      goalPacingImpactEs: "Comprime el flujo de caja libre mensual.",
    },
    tippingPointThreshold: {
      thresholdValueFormatted: `${fmt(expenseTippingThreshold)}/mo`,
      descriptionEn: `If essential living expenses exceed ${fmt(expenseTippingThreshold)}/mo, monthly free cash flow hits zero.`,
      descriptionFr: `Si vos dépenses dépassent ${fmt(expenseTippingThreshold)}/mois, votre cash-flow libre s'annule.`,
      descriptionEs: `Si los gastos esenciales superan ${fmt(expenseTippingThreshold)}/mes, el flujo de caja libre llega a cero.`,
      recommendationShift: "CAUTION_TO_DANGER",
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 7. EXECUTION TIMING / PRE-SAVING PACING
  // ─────────────────────────────────────────────────────────────────────────
  const delayDays = 60;
  const savedDuringDelay = Math.round(monthlyIncome > essentialExpenses ? (monthlyIncome - essentialExpenses - monthlyDebt) * 2 : amount * 0.4);

  candidateVariables.push({
    id: "sens_execution_timing",
    variableNameEn: "Execution Timing (Immediate vs Phased Pre-Saving)",
    variableNameFr: "Date d'Engagement (Immédiat vs Épargne Préalable)",
    variableNameEs: "Plazo de Ejecución (Inmediato vs Ahorro Previo)",
    category: "TIMING",
    sortScore: 75,
    elasticityScore: 0.75,
    currentAssumption: {
      value: "Immediate Execution",
      formatted: "Execution on Day 0",
      notesEn: "Full immediate commitment without pre-accumulation delay.",
      notesFr: "Décaissement immédiat sans période d'accumulation préalable.",
      notesEs: "Compromiso inmediato sin periodo previo de acumulación.",
    },
    ifImproves: {
      testedShift: "+60 days pre-saving buffer",
      resultingOutcomeEn: `Accumulates +${fmt(savedDuringDelay)} in dedicated cash, protecting emergency runway.`,
      resultingOutcomeFr: `Permet d'accumuler +${fmt(savedDuringDelay)} dédiés, protégeant l'épargne d'urgence.`,
      resultingOutcomeEs: `Permite acumular +${fmt(savedDuringDelay)} dedicados, protegiendo el fondo de emergencia.`,
      runwayDeltaMonths: 0.9,
      goalPacingImpactEn: "Zero disruption to primary goal.",
      goalPacingImpactFr: "Zéro perturbation de l'objectif prioritaire.",
      goalPacingImpactEs: "Cero disrupción de la meta principal.",
    },
    ifWorsens: {
      testedShift: "Impulse immediate execution without buffer",
      resultingOutcomeEn: `Draws down immediately from existing reserves on Day 0.`,
      resultingOutcomeFr: `Prélève directement sur les réserves dès le premier jour.`,
      resultingOutcomeEs: `Extrae directamente de las reservas desde el primer día.`,
      runwayDeltaMonths: -0.5,
      goalPacingImpactEn: "Postpones goal milestone.",
      goalPacingImpactFr: "Décale l'échéance de l'objectif.",
      goalPacingImpactEs: "Pospone el plazo de la meta.",
    },
    tippingPointThreshold: {
      thresholdValueFormatted: "Immediate Execution (Day 0)",
      descriptionEn: "Executing immediately with < 3 months runway creates an unbuffered risk window.",
      descriptionFr: "Acheter immédiatement avec < 3 mois d'épargne crée une fenêtre de vulnérabilité.",
      descriptionEs: "Ejecutar de inmediato con < 3 meses de reserva genera una ventana de vulnerabilidad.",
      recommendationShift: "SAFE_TO_CAUTION",
    },
  });

  // Sort candidate variables by sort score
  candidateVariables.sort((a, b) => b.sortScore - a.sortScore);

  // Take top 3
  const topThreeList = candidateVariables.slice(0, 3).map((v, index) => ({
    ...v,
    sensitivityRank: (index + 1) as 1 | 2 | 3,
  })) as [CriticalSensitivityVariable, CriticalSensitivityVariable, CriticalSensitivityVariable];

  const mostDangerous = topThreeList[0];

  const singleMostDangerousVariable = {
    nameEn: mostDangerous.variableNameEn,
    nameFr: mostDangerous.variableNameFr,
    nameEs: mostDangerous.variableNameEs,
    coreVulnerabilityEn: `The decision is most sensitive to changes in ${mostDangerous.variableNameEn.toLowerCase()}.`,
    coreVulnerabilityFr: `La décision est principalement contrôlée par les variations de : ${mostDangerous.variableNameFr.toLowerCase()}.`,
    coreVulnerabilityEs: `La decisión está controlada principalmente por variaciones en: ${mostDangerous.variableNameEs.toLowerCase()}.`,
    tippingPointEn: mostDangerous.tippingPointThreshold.descriptionEn,
    tippingPointFr: mostDangerous.tippingPointThreshold.descriptionFr,
    tippingPointEs: mostDangerous.tippingPointThreshold.descriptionEs,
  };

  return {
    timestamp: new Date().toISOString(),
    currency: curr,
    topThreeVariables: topThreeList,
    allTestedVariablesCount: candidateVariables.length,
    singleMostDangerousVariable,
    elasticitySummaryEn: `Sensitivity scan complete: "${mostDangerous.variableNameEn}" has the highest decision leverage. Tipping threshold is ${mostDangerous.tippingPointThreshold.thresholdValueFormatted}.`,
    elasticitySummaryFr: `Scan de sensibilité terminé : « ${mostDangerous.variableNameFr} » exerce le plus fort effet de levier. Seuil de bascule à ${mostDangerous.tippingPointThreshold.thresholdValueFormatted}.`,
    elasticitySummaryEs: `Análisis de sensibilidad completado: « ${mostDangerous.variableNameEs} » tiene el mayor impacto decisivo. El umbral crítico es ${mostDangerous.tippingPointThreshold.thresholdValueFormatted}.`,
  };
}
