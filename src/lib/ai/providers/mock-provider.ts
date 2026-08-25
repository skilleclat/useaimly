/**
 * Mock AI Provider
 * High-fidelity, deterministic narrative synthesis.
 * Generates the 4 signature Useaimly sections in calm, neutral language without guilt or fear.
 * Supports EN (English), FR (Français), and ES (Español).
 */

import { DecisionExplanationPayload, AIExplanationResult } from "../../types/ai";
import { formatCurrency } from "../../utils/currency";
import { formatMonthYear } from "../../utils/date";
import { AIProvider } from "../provider-interface";
import { generateSeniorStrategistAssessment } from "../senior-strategist-engine";

export class MockAIProvider implements AIProvider {
  readonly providerName = "mock" as const;

  async generateDecisionExplanation(
    payload: DecisionExplanationPayload
  ): Promise<AIExplanationResult> {
    const { simulation, profileSummary, goalSummary, language = "en" } = payload;
    const isFr = language === "fr";
    const isEs = language === "es";
    const currency = (profileSummary.currency || "USD") as any;
    const primary = simulation.primaryGoalImpact;
    const isDelayed = primary.delayInMonths > 0;
    const cashAffordable = simulation.cashAffordable;
    const decisionAmount = simulation.decision.amount;

    // Use Senior Wealth Strategist Engine for institutional master synthesis
    const strategistAssessment = generateSeniorStrategistAssessment({
      language,
      currency,
      monthlyInflow: profileSummary.monthlyFreeCashFlow > 0 ? profileSummary.monthlyFreeCashFlow * 2.5 : 100000,
      monthlyOutflow: profileSummary.monthlyFreeCashFlow > 0 ? profileSummary.monthlyFreeCashFlow * 1.5 : 120000,
      monthlyFreeCashFlow: profileSummary.monthlyFreeCashFlow,
      totalLiquidSavings: simulation.availableCashBefore,
      targetAmount: goalSummary.targetAmount,
      targetDate: goalSummary.targetDate,
      destinationTitle: goalSummary.title,
      delayInDays: primary.delayInMonths * 30,
      requiredMonthlySavings: primary.additionalMonthlySavingsRequired || Math.round(goalSummary.targetAmount / 24),
      decisionContext: {
        title: simulation.decision.title,
        amount: decisionAmount,
        isRecurring: Boolean((simulation.decision as any).isRecurring),
        frequency: simulation.decision.recurringFrequency,
      },
    });

    // SECTION 1: WHAT YOU CAN DO
    let whatYouCanDo = strategistAssessment.whatYouCanDo;
    if (!whatYouCanDo) {
      if (cashAffordable) {
        whatYouCanDo = isEs
          ? `Puede realizar técnicamente este pago desde sus reservas líquidas de ${formatCurrency(simulation.availableCashBefore, currency)}, dejando ${formatCurrency(simulation.availableCashAfter, currency)} en su colchón.`
          : isFr
          ? `Vous pouvez techniquement effectuer ce paiement à partir de vos réserves liquides de ${formatCurrency(simulation.availableCashBefore, currency)}, ce qui laisse ${formatCurrency(simulation.availableCashAfter, currency)} dans votre matelas.`
          : `You can technically make this payment from your current liquid reserves of ${formatCurrency(simulation.availableCashBefore, currency)}, which leaves ${formatCurrency(simulation.availableCashAfter, currency)} in your buffer.`;
      } else {
        whatYouCanDo = isEs
          ? `Actualmente no dispone de suficiente liquidez para esta compra sin recurrir a sobregiro o crédito. Sus reservas disponibles son de ${formatCurrency(simulation.availableCashBefore, currency)}, dejando un déficit de ${formatCurrency(Math.abs(simulation.availableCashAfter), currency)}.`
          : isFr
          ? `Vous ne disposez pas actuellement de liquidités suffisantes pour cet achat sans découvert ni emprunt. Vos réserves disponibles sont de ${formatCurrency(simulation.availableCashBefore, currency)}, laissant un déficit de ${formatCurrency(Math.abs(simulation.availableCashAfter), currency)}.`
          : `You do not currently have sufficient liquid cash for this purchase without overdraft or borrowing. Your available reserves are ${formatCurrency(simulation.availableCashBefore, currency)}, leaving a shortfall of ${formatCurrency(Math.abs(simulation.availableCashAfter), currency)}.`;
      }
    }

    // SECTION 2: WHAT IT CHANGES
    let whatItChanges = strategistAssessment.whatItChanges;
    if (!whatItChanges) {
      if (!cashAffordable) {
        whatItChanges = isEs
          ? `Ejecutar este gasto de inmediato desestabiliza su flujo mensual y debilita su colchón de liquidez esencial.`
          : isFr
          ? `L'exécution immédiate de cette dépense fragilise votre trésorerie mensuelle et entame votre coussin de sécurité.`
          : `Executing this expense immediately derails your monthly cash flow and depletes your essential liquidity cushion.`;
      } else if (isDelayed) {
        const baseDateFormatted = formatMonthYear(primary.baselineCompletionDate);
        const simDateFormatted = formatMonthYear(primary.simulatedCompletionDate);
        whatItChanges = isEs
          ? `La consecución de su meta "${goalSummary.title}" pasa de ${baseDateFormatted} a ${simDateFormatted} (un retraso de ${primary.delayInMonths} mes${primary.delayInMonths > 1 ? "es" : ""}).`
          : isFr
          ? `La réalisation de votre objectif "${goalSummary.title}" passe de ${baseDateFormatted} à ${simDateFormatted} (un retard de ${primary.delayInMonths} mois).`
          : `Your "${goalSummary.title}" goal completion moves from ${baseDateFormatted} to ${simDateFormatted} (a delay of ${primary.delayInMonths} month${primary.delayInMonths > 1 ? "s" : ""}).`;
      } else {
        whatItChanges = isEs
          ? `El cronograma de su meta principal se mantiene intacto para ${formatMonthYear(goalSummary.targetDate)}. Este gasto es absorbido por su flujo libre.`
          : isFr
          ? `L'échéance de votre objectif principal reste inchangée pour ${formatMonthYear(goalSummary.targetDate)}. Cette dépense est absorbée par votre marge financière.`
          : `Your primary destination timeline remains unchanged for ${formatMonthYear(goalSummary.targetDate)}. This expense is absorbed by your current cash flow buffer.`;
      }
    }

    // SECTION 3: TO STAY ON TRACK
    let toStayOnTrack = strategistAssessment.toStayOnTrack;
    if (!toStayOnTrack) {
      if (primary.additionalMonthlySavingsRequired > 0) {
        toStayOnTrack = isEs
          ? `Necesitaría ahorrar ${formatCurrency(primary.additionalMonthlySavingsRequired, currency)} más cada mes para mantener su fecha objetivo original.`
          : isFr
          ? `Vous devriez épargner ${formatCurrency(primary.additionalMonthlySavingsRequired, currency)} de plus par mois pour conserver votre date d'arrivée initiale.`
          : `You would need to save ${formatCurrency(primary.additionalMonthlySavingsRequired, currency)} more each month to maintain your original arrival date.`;
      } else if (!cashAffordable) {
        toStayOnTrack = isEs
          ? `Ponga en pausa esta decisión hasta que su colchón alcance al menos ${formatCurrency(decisionAmount * 1.5, currency)} para proteger sus compromisos fijos.`
          : isFr
          ? `Mettez en pause cette décision jusqu'à ce que votre matelas atteigne au moins ${formatCurrency(decisionAmount * 1.5, currency)} pour protéger vos charges fixes.`
          : `Pause this decision until your liquid buffer reaches at least ${formatCurrency(decisionAmount * 1.5, currency)} to protect essential living commitments.`;
      } else {
        toStayOnTrack = isEs
          ? `No se requiere ahorro mensual adicional. Su flujo de caja libre de ${formatCurrency(profileSummary.monthlyFreeCashFlow, currency)} cubre este gasto sin ajustes.`
          : isFr
          ? `Aucune épargne supplémentaire n'est requise. Votre cash-flow libre de ${formatCurrency(profileSummary.monthlyFreeCashFlow, currency)} couvre cette dépense sans ajustement.`
          : `No additional monthly savings are required. Your current monthly free cash flow of ${formatCurrency(profileSummary.monthlyFreeCashFlow, currency)} covers this without adjustment.`;
      }
    }

    // SECTION 4: USEAIMLY'S READ
    const UseaimlysRead = strategistAssessment.strategicRead;

    // Build headline
    const headline = strategistAssessment.headlineVerdict || (cashAffordable
      ? isDelayed
        ? isEs
          ? `Asequible en efectivo, pero retrasa la meta "${goalSummary.title}"`
          : isFr
          ? `Accessible en trésorerie, mais décale l'objectif "${goalSummary.title}"`
          : `Cash Affordable, but Shifts "${goalSummary.title}" Timeline`
        : isEs
        ? `Totalmente Asequible — Sin retraso en la meta`
        : isFr
        ? `Parfaitement accessible — Aucun retard d'objectif`
        : `Fully Affordable — Zero Goal Delay`
      : isEs
      ? `Aviso de Déficit de Liquidez: Supera las Reservas`
      : isFr
      ? `Alerte déficit de trésorerie : dépasse les réserves liquides`
      : `Cash Deficit Warning: Exceeds Liquid Reserves`);

    return {
      whatYouCanDo,
      whatItChanges,
      toStayOnTrack,
      UseaimlysRead,
      headline,
      directAnswer: whatYouCanDo,
      cashAffordabilityVerdict: whatYouCanDo,
      planAffordabilityVerdict: whatItChanges,
      tradeoffAnalysis: UseaimlysRead,
      actionableRecommendation: toStayOnTrack,
      recoveryGuidance: simulation.recoveryPlan?.explanation,
      masterStrategyParagraph: strategistAssessment.masterStrategyParagraph,
      strategicArchetype: strategistAssessment.archetype,
      confidenceScore: 0.98,
      providerUsed: "mock",
      generatedAt: new Date().toISOString(),
    };
  }
}
