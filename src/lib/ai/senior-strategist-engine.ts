/**
 * Senior Financial Trajectory Architect Engine
 * Generates evidence-based, transparent, zero-hyperbole strategic assessments
 * and actionable recommendation pillars across financial profiles.
 * Enforces strict adherence to mathematical invariants and canonical state.
 */

import { formatCurrency } from "../utils/currency";
import { formatMonthYear } from "../utils/date";
import { CurrencyCode, ExecutiveDecision, ConfidenceLevel } from "../types/finance";
import { LanguageCode } from "../i18n/translations";

export interface StrategistProfileContext {
  language?: LanguageCode;
  currency: CurrencyCode;
  monthlyInflow: number;
  monthlyOutflow: number;
  monthlyFreeCashFlow: number;
  totalLiquidSavings: number;
  assignedGoalCapital?: number;
  targetAmount: number;
  targetDate: string;
  destinationTitle: string;
  projectedDate?: string;
  delayInDays?: number;
  requiredMonthlySavings?: number;
  executiveDecision?: ExecutiveDecision;
  confidenceLevel?: ConfidenceLevel;
  reserveBufferMonths?: number;
  reserveTargetMonths?: number; // default 3.0
  decisionContext?: {
    title: string;
    amount: number;
    isRecurring: boolean;
    frequency?: string;
  };
}

export interface SeniorStrategistOutput {
  archetype:
    | "GOAL_ACHIEVED"
    | "DEFICIT_BURN_RATE"
    | "TIGHT_MARGIN_SHORTFALL"
    | "BALANCED_ACCUMULATION"
    | "HIGH_VELOCITY_ACCELERATOR"
    | "DECISION_PURCHASE_IMPACT";
  headlineVerdict: string;
  whatYouCanDo: string;
  whatItChanges: string;
  toStayOnTrack: string;
  strategicRead: string;
  masterStrategyParagraph: string;
  burnRateRunwayMonths?: number;
  livingBufferMonths: number;
  executiveDecision: ExecutiveDecision;
  confidenceLevel: ConfidenceLevel;
}

export function generateSeniorStrategistAssessment(
  context: StrategistProfileContext
): SeniorStrategistOutput {
  const {
    language = "en",
    currency,
    monthlyInflow,
    monthlyOutflow,
    monthlyFreeCashFlow,
    totalLiquidSavings,
    assignedGoalCapital = 0,
    targetAmount,
    targetDate,
    destinationTitle,
    projectedDate,
    delayInDays = 0,
    requiredMonthlySavings = 0,
    executiveDecision: inputDecision,
    confidenceLevel = "HIGH",
    reserveTargetMonths = 3.0,
    decisionContext,
  } = context;

  const isFr = language === "fr";

  const livingBufferMonths =
    monthlyOutflow > 0
      ? Number((totalLiquidSavings / monthlyOutflow).toFixed(1))
      : 12;

  const isDeficit = monthlyFreeCashFlow < 0;
  const targetDateStr = formatMonthYear(targetDate);
  const projDateStr = projectedDate ? formatMonthYear(projectedDate) : targetDateStr;
  const targetAmtStr = formatCurrency(targetAmount, currency);
  const savedAmtStr = formatCurrency(assignedGoalCapital, currency);
  const liquidStr = formatCurrency(totalLiquidSavings, currency);
  const inflowStr = formatCurrency(monthlyInflow, currency);
  const outflowStr = formatCurrency(monthlyOutflow, currency);
  const fcfStr = formatCurrency(Math.abs(monthlyFreeCashFlow), currency);
  const reqStr = formatCurrency(requiredMonthlySavings, currency);

  const remainingGap = Math.max(0, targetAmount - assignedGoalCapital);
  const isGoalAchieved = targetAmount > 0 && remainingGap === 0;

  // Default Decision Determination
  let decision: ExecutiveDecision = inputDecision || "GO";
  if (isDeficit || livingBufferMonths < 1.0) {
    decision = "WAIT";
  } else if (!isGoalAchieved && (livingBufferMonths < reserveTargetMonths || delayInDays > 30)) {
    decision = "ADJUST";
  }

  // =========================================================================
  // SCENARIO 0: GOAL ALREADY ACHIEVED / FULLY FUNDED
  // =========================================================================
  if (isGoalAchieved) {
    const headlineVerdict = isFr
      ? "Décision Exécutive : ACCORDÉ (GO) — Objectif Totalement Atteint"
      : "Executive Decision: GO — Destination Fully Achieved";

    const whatYouCanDo = isFr
      ? `Votre objectif "${destinationTitle}" est 100% financé avec ${savedAmtStr} d'épargne confirmée (cible : ${targetAmtStr}).`
      : `Your goal "${destinationTitle}" is 100% funded with ${savedAmtStr} in confirmed saved capital (target: ${targetAmtStr}).`;

    const whatItChanges = isFr
      ? `Aucun versement supplémentaire n'est requis pour cet objectif. Vous dégagez de la capacité pour d'autres projets.`
      : `No further monthly allocation required for this destination. All future cash flow can be reallocated.`;

    const toStayOnTrack = isFr
      ? `Réaffectez votre capacité mensuelle de ${fcfStr}/mois vers la constitution de vos réserves ou votre prochain objectif.`
      : `Reallocate your monthly capacity of ${fcfStr}/mo toward building liquid reserves or secondary destinations.`;

    const strategicRead = isFr
      ? `Objectif sécurisé. Vos réserves liquides de ${liquidStr} assurent ${livingBufferMonths} mois de protection des charges.`
      : `Destination secured. Liquid reserves of ${liquidStr} provide ${livingBufferMonths} months of living defense.`;

    const masterStrategyParagraph = isFr
      ? `Du point de vue de l'architecture patrimoniale à 30 ans, votre objectif principal "${destinationTitle}" (${targetAmtStr}) est entièrement atteint avec ${savedAmtStr} de capital confirmé. Aucun apport mensuel complémentaire n'est requis. Nous recommandons d'affecter votre cash-flow libre de ${fcfStr}/mois au renforcement de votre matelas de liquidités de sécurité (${liquidStr}).`
      : `From a 30-year wealth architecture perspective, your anchor destination "${destinationTitle}" (${targetAmtStr}) is fully funded with ${savedAmtStr} in confirmed saved capital. Zero further monthly contribution is required for this goal. We recommend directing your monthly free cash flow of ${fcfStr}/mo toward strengthening your liquid reserve buffer (${liquidStr}) or secondary life goals.`;

    return {
      archetype: "GOAL_ACHIEVED",
      headlineVerdict,
      whatYouCanDo,
      whatItChanges,
      toStayOnTrack,
      strategicRead,
      masterStrategyParagraph,
      livingBufferMonths,
      executiveDecision: "GO",
      confidenceLevel: "HIGH",
    };
  }

  // =========================================================================
  // SCENARIO 1: CAPITAL DEFICIT / BURN RATE (Inflows < Outflows)
  // =========================================================================
  if (isDeficit) {
    const monthlyBurn = Math.abs(monthlyFreeCashFlow);
    const burnRunwayMonths =
      monthlyBurn > 0
        ? Number((totalLiquidSavings / monthlyBurn).toFixed(1))
        : 0;

    const headlineVerdict = isFr
      ? "Décision Exécutive : ATTENDRE — Déficit Structurel (Taux de Brûlage Détecté)"
      : "Executive Decision: WAIT — Structural Deficit (Burn Rate Detected)";

    const whatYouCanDo = isFr
      ? `Stoppez immédiatement les dépenses discrétionnaires pour stabiliser le cash-flow et stopper la baisse de -${fcfStr}/mois.`
      : `Halt discretionary spending immediately to stabilize monthly cash flow and stop the -${fcfStr}/mo liquid drawdown.`;

    const whatItChanges = isFr
      ? `Les allocations pour "${destinationTitle}" sont suspendues pendant que vos réserves (${liquidStr}) couvrent vos charges fixes.`
      : `Goal allocations for "${destinationTitle}" are paused while liquid reserves (${liquidStr}) cover fixed living obligations.`;

    const toStayOnTrack = isFr
      ? `Récupérez +${fcfStr}/mois par la réduction de vos charges ou le développement de vos revenus.`
      : `Reclaim +${fcfStr}/mo through spending reduction or income expansion to restore baseline equilibrium.`;

    const strategicRead = isFr
      ? `Vos réserves liquides de ${liquidStr} procurent environ ${burnRunwayMonths} mois de couverture de survie sous le rythme actuel.`
      : `Liquid reserves of ${liquidStr} provide approximately ${burnRunwayMonths} months of operating runway under current net monthly outflow.`;

    const masterStrategyParagraph = isFr
      ? `Du point de vue de l'architecture patrimoniale à 30 ans, votre objectif prioritaire actuel n'est pas l'accumulation de capital mais la stabilisation structurelle du cash-flow. Vos charges fixes mensuelles (${outflowStr}) dépassent vos revenus bruts (${inflowStr}), entraînant une contraction nette de -${fcfStr}/mois. Vos réserves actuelles (${liquidStr}) offrent environ ${burnRunwayMonths} mois de protection. Auditez vos charges pour récupérer +${fcfStr}/mois avant de réactiver vos allocations vers "${destinationTitle}".`
      : `From a 30-year wealth architecture perspective, your primary objective right now is structural cash-flow stabilization. Your current monthly mandatory outflows (${outflowStr}) exceed your monthly gross inflows (${inflowStr}), resulting in a net monthly capital contraction of -${fcfStr}/mo. While your current liquid reserve of ${liquidStr} provides an estimated ${burnRunwayMonths}-month operational cushion, continuing at this burn rate without intervention will erode your financial baseline. Audit living obligations to recover at least +${fcfStr}/mo before initiating allocations toward "${destinationTitle}".`;

    return {
      archetype: "DEFICIT_BURN_RATE",
      headlineVerdict,
      whatYouCanDo,
      whatItChanges,
      toStayOnTrack,
      strategicRead,
      masterStrategyParagraph,
      burnRateRunwayMonths: burnRunwayMonths,
      livingBufferMonths,
      executiveDecision: "WAIT",
      confidenceLevel: "HIGH",
    };
  }

  // =========================================================================
  // SCENARIO 2: DECISION PURCHASE EVALUATION
  // =========================================================================
  if (decisionContext && decisionContext.amount > 0) {
    const decAmtStr = formatCurrency(decisionContext.amount, currency);
    const remainingCash = Math.max(0, totalLiquidSavings - (decisionContext.isRecurring ? 0 : decisionContext.amount));
    const remainingCashStr = formatCurrency(remainingCash, currency);
    const postBufferMonths = monthlyOutflow > 0 ? Number((remainingCash / monthlyOutflow).toFixed(1)) : 12;

    if (decision === "GO") {
      const headlineVerdict = isFr
        ? "Décision Exécutive : ACCORDÉ (GO) — Plan & Matelas Intacts"
        : "Executive Decision: GO — Plan & Buffer Intact";

      const whatYouCanDo = isFr
        ? `Vous pouvez financer cet achat de ${decAmtStr} directement depuis vos liquidités tout en conservant ${remainingCashStr} (${postBufferMonths} mois) en réserve.`
        : `You can fund this ${decAmtStr} allocation directly from liquid cash while retaining ${remainingCashStr} (${postBufferMonths} months) in reserves.`;

      const whatItChanges = isFr
        ? `L'arrivée de votre objectif "${destinationTitle}" reste maintenue au ${projDateStr}.`
        : `Your "${destinationTitle}" arrival remains projected on schedule for ${projDateStr}.`;

      const toStayOnTrack = isFr
        ? `Maintenez votre allocation mensuelle automatique de ${fcfStr}/mois.`
        : `Maintain current automated monthly goal allocation of ${fcfStr}/mo.`;

      const strategicRead = isFr
        ? `Votre matelas de sécurité après achat conserve ${postBufferMonths} mois de charges essentielles, respectant votre cible de ${reserveTargetMonths.toFixed(1)} mois.`
        : `Post-purchase liquid buffer retains ${postBufferMonths} months of essential living defense, satisfying your ${reserveTargetMonths.toFixed(1)}-month target.`;

      const masterStrategyParagraph = isFr
        ? `Les calculs financiers confirment que votre cash-flow libre mensuel (${fcfStr}/mois) et vos réserves liquides (${liquidStr}) absorbent cette dépense de ${decAmtStr} sans enfreindre votre réserve d'urgence de 3,0 mois ni décaler votre objectif "${destinationTitle}" (${targetAmtStr}). Vos réserves après achat (${remainingCashStr}) maintiennent ${postBufferMonths} mois de sécurité. Safe pour continuer.`
        : `Financial calculations confirm that your monthly free cash flow (${fcfStr}/mo) and liquid reserves (${liquidStr}) can absorb this ${decAmtStr} outlay without breaching your 3.0-month emergency reserve target or delaying "${destinationTitle}" (${targetAmtStr}). Post-purchase liquid reserves (${remainingCashStr}) maintain ${postBufferMonths} months of essential living defense. Safe to proceed as planned.`;

      return {
        archetype: "DECISION_PURCHASE_IMPACT",
        headlineVerdict,
        whatYouCanDo,
        whatItChanges,
        toStayOnTrack,
        strategicRead,
        masterStrategyParagraph,
        livingBufferMonths: postBufferMonths,
        executiveDecision: "GO",
        confidenceLevel,
      };
    } else if (decision === "ADJUST") {
      const headlineVerdict = isFr
        ? `Décision Exécutive : À AJUSTER — ${delayInDays > 0 ? `+${delayInDays} Jours de Décalage` : "Seuil de Réserve Franchi"}`
        : `Executive Decision: ADJUST — ${delayInDays > 0 ? `+${delayInDays} Days Delay` : "Reserve Floor Breached"}`;

      const whatYouCanDo = isFr
        ? (postBufferMonths < reserveTargetMonths
            ? `Réduisez le budget d'achat ou différez la dépense pour maintenir ${reserveTargetMonths.toFixed(1)} mois de réserve.`
            : `Exécuter cette dépense décale la réalisation de "${destinationTitle}" d'environ +${delayInDays} jours.`)
        : (postBufferMonths < reserveTargetMonths
            ? `Reduce purchase budget or delay purchase to maintain your ${reserveTargetMonths.toFixed(1)}-month reserve floor.`
            : `Executing this outlay shifts completion of "${destinationTitle}" back by approximately +${delayInDays} days.`);

      const whatItChanges = isFr
        ? `La date d'arrivée projetée glisse au ${projDateStr} (+${delayInDays} jours).`
        : `Projected arrival moves to ${projDateStr} (+${delayInDays} days delay).`;

      const toStayOnTrack = isFr
        ? (postBufferMonths < reserveTargetMonths
            ? `Réduisez le montant de l'achat à ${formatCurrency(decisionContext.amount * 0.7, currency)} pour préserver vos réserves.`
            : `Augmentez votre épargne mensuelle de +${reqStr}/mois pour neutraliser le retard.`)
        : (postBufferMonths < reserveTargetMonths
            ? `Reduce purchase amount to ${formatCurrency(decisionContext.amount * 0.7, currency)} to protect reserve stability.`
            : `Increase monthly goal allocation by +${reqStr}/mo to neutralize the timeline shift.`);

      const strategicRead = isFr
        ? `Avoir du cash disponible ne signifie pas que le plan peut l'absorber sans ajustement.`
        : `Cash availability does not equal plan availability; reserve floor or timeline protection requires adjustment.`;

      const masterStrategyParagraph = isFr
        ? `L'évaluation de cette dépense de ${decAmtStr} par rapport à vos chiffres montre que la disponibilité du cash ne garantit pas la tenue du plan. Vos réserves après achat (${remainingCashStr}) assurent ${postBufferMonths} mois de couverture. L'exécution décale "${destinationTitle}" de +${delayInDays} jours (Projeté : ${projDateStr}). Recommandation : Ajustez le budget ou prévoyez une épargne préalable.`
        : `Evaluating this ${decAmtStr} allocation against your active financial baseline reveals that cash availability does not equal plan availability. Post-purchase reserves (${remainingCashStr}) provide ${postBufferMonths} months of mandatory living buffer. Executing the expenditure shifts "${destinationTitle}" by +${delayInDays} days (Projected: ${projDateStr}). Recommendation: Adjust the purchase budget or save in advance to protect reserve stability.`;

      return {
        archetype: "DECISION_PURCHASE_IMPACT",
        headlineVerdict,
        whatYouCanDo,
        whatItChanges,
        toStayOnTrack,
        strategicRead,
        masterStrategyParagraph,
        livingBufferMonths: postBufferMonths,
        executiveDecision: "ADJUST",
        confidenceLevel,
      };
    } else {
      const headlineVerdict = isFr
        ? "Décision Exécutive : ATTENDRE — Risque Inacceptable sur les Réserves"
        : "Executive Decision: WAIT — Unacceptable Reserve Risk";

      const whatYouCanDo = isFr
        ? `Mettez en pause cet achat de ${decAmtStr} jusqu'à constituer une épargne dédiée séparée de vos réserves d'urgence.`
        : `Pause this ${decAmtStr} purchase until dedicated savings are accumulated separately from emergency reserves.`;

      const whatItChanges = isFr
        ? `Exécuter maintenant réduirait vos réserves d'urgence sous le seuil de sécurité ou créerait un déficit.`
        : `Executing now depletes emergency reserves below safe operating thresholds or creates a monthly deficit.`;

      const toStayOnTrack = isFr
        ? `Constituez un fonds dédié pour réunir ${decAmtStr} tout en conservant 3,0 mois de réserve de sécurité.`
        : `Build dedicated goal funds to ${decAmtStr} while maintaining a full 3.0-month emergency reserve.`;

      const strategicRead = isFr
        ? `Vos réserves actuelles sont insuffisantes pour absorber cette dépense sans créer de vulnérabilité.`
        : `Liquid reserves are insufficient to absorb this expenditure without creating vulnerability.`;

      const masterStrategyParagraph = isFr
        ? `L'évaluation quantitative indique qu'exécuter cette dépense de ${decAmtStr} présente un risque de liquidité important. Vos réserves tomberaient à ${postBufferMonths} mois de charges, laissant une protection insuffisante. Recommandation : Attendez d'avoir accumulé des fonds dédiés.`
        : `Quantitative evaluation indicates that executing this ${decAmtStr} expenditure presents significant liquidity risk. Post-purchase reserves would drop to ${postBufferMonths} months of mandatory expenses, leaving inadequate protection against income disruption. Recommendation: Wait until dedicated funds are accumulated, preserving your emergency buffer.`;

      return {
        archetype: "DECISION_PURCHASE_IMPACT",
        headlineVerdict,
        whatYouCanDo,
        whatItChanges,
        toStayOnTrack,
        strategicRead,
        masterStrategyParagraph,
        livingBufferMonths: postBufferMonths,
        executiveDecision: "WAIT",
        confidenceLevel,
      };
    }
  }

  // =========================================================================
  // SCENARIO 3: TRAJECTORY PACING (ON TRACK vs SHORTFALL)
  // =========================================================================
  const isPaceShortfall = requiredMonthlySavings > 0 && monthlyFreeCashFlow < requiredMonthlySavings;
  const isOnTrack = !isPaceShortfall && delayInDays <= 0;
  const archetype = isPaceShortfall ? "TIGHT_MARGIN_SHORTFALL" : "BALANCED_ACCUMULATION";


  if (isOnTrack) {
    const headlineVerdict = isFr
      ? (decision === "ADJUST"
          ? "Décision Exécutive : À AJUSTER — Seuil de Réserve Sous la Cible"
          : "Décision Exécutive : ACCORDÉ (GO) — Dans les Temps pour la Date Cible")
      : (decision === "ADJUST"
          ? "Executive Decision: ADJUST — Reserve Buffer Below Target"
          : "Executive Decision: GO — On Track for Target Date");

    const whatYouCanDo = isFr
      ? `Allouez ${fcfStr}/mois vers "${destinationTitle}" (${targetAmtStr}).`
      : `Allocate ${fcfStr}/mo toward "${destinationTitle}" (${targetAmtStr}).`;

    const whatItChanges = isFr
      ? `L'arrivée actuellement projetée est maintenue au ${projDateStr}.`
      : `Current projected completion is on track for ${projDateStr}.`;

    const toStayOnTrack = isFr
      ? `Maintenez votre taux d'épargne mensuel automatique de ${fcfStr}/mois.`
      : `Maintain current automated savings rate of ${fcfStr}/mo.`;

    const strategicRead = isFr
      ? `Votre coussin de trésorerie de base assure ${livingBufferMonths} mois de couverture de charges obligatoires.`
      : `Baseline living cushion provides ${livingBufferMonths} months of mandatory expense protection.`;

    const masterStrategyParagraph = isFr
      ? `L'analyse complète montre une trajectoire d'accumulation équilibrée et conforme pour "${destinationTitle}" (${targetAmtStr}), avec une arrivée projetée pour le ${projDateStr}. Votre cash-flow libre mensuel disponible (${fcfStr}/mois) couvre le rythme requis sans créer d'écart de vitesse. Vos réserves liquides (${liquidStr}) assurent ${livingBufferMonths} mois de protection.`
      : `A comprehensive review reveals a baseline operating on track for your primary destination "${destinationTitle}" (${targetAmtStr}) projected for arrival on ${projDateStr}. Your available monthly free cash flow of ${fcfStr}/mo supports your goal timeline without a pacing shortfall. Continue executing your automated monthly allocation while maintaining your liquid reserve buffer (${liquidStr}).`;

    return {
      archetype,
      headlineVerdict,
      whatYouCanDo,
      whatItChanges,
      toStayOnTrack,
      strategicRead,
      masterStrategyParagraph,
      livingBufferMonths,
      executiveDecision: decision,
      confidenceLevel,
    };
  } else {
    const paceShortfallVal = Math.max(0, requiredMonthlySavings - monthlyFreeCashFlow);
    const paceShortfallStr = formatCurrency(paceShortfallVal, currency);

    const headlineVerdict = isFr
      ? "Décision Exécutive : À AJUSTER — Écart de Rythme Détecté"
      : "Executive Decision: ADJUST — Pace Shortfall Detected";

    const whatYouCanDo = isFr
      ? `Allouez ${fcfStr}/mois vers "${destinationTitle}" (${targetAmtStr}).`
      : `Allocate ${fcfStr}/mo toward "${destinationTitle}" (${targetAmtStr}).`;

    const whatItChanges = isFr
      ? `Sans ajustement, la date d'arrivée projetée décale au ${projDateStr} (+${delayInDays} jours).`
      : `Current projected completion shifts to ${projDateStr} (+${delayInDays} days shift).`;

    const toStayOnTrack = isFr
      ? `Augmentez votre contribution mensuelle de +${paceShortfallStr}/mois ou prolongez l'échéance.`
      : `Increase monthly goal allocation by +${paceShortfallStr}/mo or adjust target timeline to ${projDateStr}.`;

    const strategicRead = isFr
      ? `Votre coussin de trésorerie de base assure ${livingBufferMonths} mois de couverture de charges obligatoires.`
      : `Baseline living cushion provides ${livingBufferMonths} months of mandatory expense protection.`;

    const masterStrategyParagraph = isFr
      ? `L'analyse complète montre une trésorerie saine mais un écart de rythme d'épargne. Vous dégagez ${fcfStr}/mois de cash-flow libre face à ${outflowStr} de charges. Atteindre "${destinationTitle}" (${targetAmtStr}) pour la date voulue (${targetDateStr}) requiert ${reqStr}/mois—laissant un écart de rythme de ${paceShortfallStr}/mois. Recommandation : augmentez votre allocation mensuelle de +${paceShortfallStr}/mois ou décalez l'échéance au ${projDateStr}.`
      : `A comprehensive review reveals a baseline with an actionable velocity gap. You generate ${fcfStr}/mo free cash flow against ${outflowStr} mandatory outlays. Achieving "${destinationTitle}" (${targetAmtStr}) by ${targetDateStr} requires ${reqStr}/mo—leaving a current pacing variance gap of ${paceShortfallStr}/mo. Initiate trajectory acceleration of +${paceShortfallStr}/mo or extend target date to ${projDateStr} to bridge the shortfall.`;

    return {
      archetype,
      headlineVerdict,
      whatYouCanDo,
      whatItChanges,
      toStayOnTrack,
      strategicRead,
      masterStrategyParagraph,
      livingBufferMonths,
      executiveDecision: "ADJUST",
      confidenceLevel,
    };
  }
}
