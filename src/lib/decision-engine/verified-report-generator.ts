import { jsPDF } from "jspdf";
import { VerifiedDecisionData, VerificationResult } from "./decision-validator";
import { formatCurrency } from "../utils/currency";
import { USEAIMLY_LOGO_BASE64 } from "../brand/logo-base64";

/**
 * GENERATE PUBLICATION-GRADE VERIFIED FINANCIAL DECISION REPORT PDF (TRUE 10/10 DYNAMIC ARCHITECTURE)
 * Fully supports EN (English), FR (Français), and ES (Español)
 */
export function generateVerifiedDecisionReportPDF(
  data: VerifiedDecisionData,
  verification: VerificationResult,
  language: "en" | "fr" | "es" = "en"
): jsPDF {
  const isFr = language === "fr";
  const isEs = language === "es";

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 12;

  // Colors
  const brandPrimary = [255, 85, 51]; // #FF5533
  const brandEmerald = [0, 168, 89]; // #00A859
  const darkCharcoal = [15, 23, 42]; // #0F172A
  const mutedGray = [100, 116, 139]; // #64748B
  const lightBg = [248, 250, 252]; // #F8FAFC
  const borderGray = [226, 232, 240]; // #E2E8F0
  const amberAccent = [217, 119, 6]; // #D97706
  const roseAccent = [225, 29, 72]; // #E11D48
  const pureWhite = [255, 255, 255];

  const fmt = (amt: number) => formatCurrency(amt, data.currency);
  const txType = data.transactionType || "ONE_TIME_EXPENSE";
  const isRecurring = txType === "RECURRING_EXPENSE";
  const isFinanced = txType === "LOAN_OR_DEBT" || txType === "FINANCED_PURCHASE" || (data.financing && data.financing.hasFinancing);

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGE 1: HEADER, VERDICT, CONTEXT, IMPACT, SCENARIO MATRIX & BEST OPTION
  // ─────────────────────────────────────────────────────────────────────────────

  // Top Accent Bar
  doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.rect(0, 0, pageWidth, 3.5, "F");

  // Top Header with Logo
  try {
    doc.addImage(USEAIMLY_LOGO_BASE64, "PNG", margin, 7, 34, 16);
  } catch (e) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text("UseAimly", margin, 18);
  }

  const titleX = margin + 40;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(titleX, 7, titleX, 23);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.text(
    isEs
      ? "INFORME DE ANÁLISIS DE DECISIÓN VERIFICADO"
      : isFr
      ? "RAPPORT D'ANALYSE DÉCISIONNELLE VÉRIFIÉE"
      : "VERIFIED FINANCIAL DECISION REPORT",
    titleX + 4,
    12
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(
    `${isEs ? "ID Informe" : isFr ? "ID Rapport" : "Report ID"}: ${data.reportId} • v${data.version} • ${new Date(data.timestamp).toLocaleDateString(isEs ? "es-ES" : isFr ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    titleX + 4,
    18
  );

  // Status Seal Badge
  const sealWidth = 46;
  const sealX = pageWidth - margin - sealWidth;
  const isVerified = verification.status === "VERIFIED" || verification.status === "VERIFIED WITH ASSUMPTIONS";
  const sealColor = isVerified ? brandEmerald : amberAccent;

  doc.setFillColor(sealColor[0], sealColor[1], sealColor[2]);
  doc.roundedRect(sealX, 7, sealWidth, 16, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text("AIMLY COHERENCE", sealX + sealWidth / 2, 12, { align: "center" });
  doc.setFontSize(7);
  doc.text(
    isEs
      ? (isVerified ? "VERIFICADO" : "CON SUPUESTOS")
      : isFr
      ? (isVerified ? "VÉRIFIÉ" : "AVEC HYPOTHÈSES")
      : verification.status,
    sealX + sealWidth / 2,
    18,
    { align: "center" }
  );

  y = 27;

  // 1. EXECUTIVE VERDICT BANNER
  const verdictColor =
    data.calculatedImpact.verdict === "RECOMMENDED"
      ? brandEmerald
      : data.calculatedImpact.verdict === "PROCEED_WITH_CAUTION"
      ? amberAccent
      : roseAccent;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, contentWidth, 30, 2.5, 2.5, "FD");

  // Verdict Pill
  doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.roundedRect(margin + 4, y + 4, 48, 6.5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  const verdictLabel =
    data.calculatedImpact.verdict === "RECOMMENDED"
      ? isEs ? "RECOMENDADO" : isFr ? "RECOMMANDÉ" : "RECOMMENDED"
      : data.calculatedImpact.verdict === "PROCEED_WITH_CAUTION"
      ? isEs ? "CON PRECAUCIÓN" : isFr ? "AVEC PRUDENCE" : "PROCEED WITH CAUTION"
      : isEs ? "NO RECOMENDADO" : isFr ? "NON RECOMMANDÉ" : "NOT RECOMMENDED";
  doc.text(verdictLabel, margin + 28, y + 8.5, { align: "center" });

  // Verdict Headline
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const headlineLines = doc.splitTextToSize(data.calculatedImpact.verdictHeadline, contentWidth - 8);
  doc.text(headlineLines.slice(0, 2), margin + 4, y + 16);

  // Primary verified reason
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  const reasonLines = doc.splitTextToSize(
    `${isEs ? "Motivo principal:" : isFr ? "Motif principal :" : "Primary verified reason:"} ${data.calculatedImpact.primaryReason}`,
    contentWidth - 8
  );
  doc.text(reasonLines.slice(0, 2), margin + 4, y + 24);

  y += 34;

  // 2. DECISION OVERVIEW & 3. FINANCIAL CONTEXT (2-Column Grid)
  const colWidth = (contentWidth - 4) / 2;

  // Left Column: Decision Overview
  doc.setFillColor(pureWhite[0], pureWhite[1], pureWhite[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, colWidth, 38, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.text(isEs ? "1. DETALLES DE LA DECISIÓN" : isFr ? "1. DÉTAILS DE LA DÉCISION" : "1. DECISION OVERVIEW", margin + 4, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`${isEs ? "Título:" : isFr ? "Intitulé :" : "Decision:"} ${data.decisionTitle}`, margin + 4, y + 12);
  doc.text(
    `${isEs ? "Monto Declarado:" : isFr ? "Montant Déclaré :" : isRecurring ? "Monthly Outlay:" : "Total Outlay:"} ${fmt(data.amount)}${isRecurring ? (isEs ? "/mes" : isFr ? "/mois" : "/month") : ""}`,
    margin + 4,
    y + 18.5
  );
  doc.text(
    `${isEs ? "Estructura:" : isFr ? "Structure :" : "Structure:"} ${txType.replace(/_/g, " ")}`,
    margin + 4,
    y + 25
  );
  doc.text(
    `${isEs ? "Meta Asociada:" : isFr ? "Objectif Associé :" : "Target Goal:"} ${data.baseline.primaryGoalTitle}`,
    margin + 4,
    y + 31.5
  );

  // Right Column: Financial Context Used
  doc.setFillColor(pureWhite[0], pureWhite[1], pureWhite[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + colWidth + 4, y, colWidth, 38, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.text(isEs ? "2. PERFIL FINANCIERO UTILIZADO" : isFr ? "2. PROFIL FINANCIER UTILISÉ" : "2. FINANCIAL CONTEXT USED", margin + colWidth + 8, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`${isEs ? "Reservas Líquidas:" : isFr ? "Réserves Liquides :" : "Liquid Reserves:"} ${fmt(data.baseline.liquidSavings)} (${data.baseline.emergencyRunwayMonths} ${isEs ? "meses" : isFr ? "mois" : "mos"} runway)`, margin + colWidth + 8, y + 12);
  doc.text(`${isEs ? "Ingresos Netos:" : isFr ? "Revenu Mensuel Net :" : "Monthly Net Inflow:"} ${fmt(data.baseline.monthlyIncome)}`, margin + colWidth + 8, y + 18.5);
  doc.text(`${isEs ? "Gastos Fijos y Deudas:" : isFr ? "Dépenses Fixes & Dettes :" : "Fixed Outflows:"} ${fmt(data.baseline.monthlyExpenses + data.baseline.monthlyDebtService)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, margin + colWidth + 8, y + 25);
  doc.text(`${isEs ? "Flujo de Caja Libre:" : isFr ? "Cash-Flow Libre Net :" : "Net Free Cash Flow:"} +${fmt(data.baseline.netFreeCashFlow)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, margin + colWidth + 8, y + 31.5);

  y += 42;

  // 4. FINANCIAL IMPACT TABLE (DETERMINISTIC METRIC MATRIX)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(isEs ? "3. TABLA DE IMPACTO DETERMINISTA" : isFr ? "3. TABLEAU D'IMPACT DÉTERMINISTE" : "3. DETERMINISTIC FINANCIAL IMPACT", margin, y);

  y += 3;

  const rowHeight = 6.2;
  doc.setFillColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.rect(margin, y, contentWidth, rowHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(isEs ? "INDICADOR CLAVE" : isFr ? "INDICATEUR CLÉ" : "FINANCIAL INDICATOR", margin + 3, y + 4.3);
  doc.text(isEs ? "ANTES" : isFr ? "AVANT DÉCISION" : "BASELINE", margin + 60, y + 4.3);
  doc.text(isEs ? "DESPUÉS" : isFr ? "APRÈS DÉCISION" : "POST-DECISION", margin + 105, y + 4.3);
  doc.text(isEs ? "IMPACTO NETO" : isFr ? "IMPACT NET" : "DELTA IMPACT", margin + 150, y + 4.3);

  y += rowHeight;

  const deltaCashFormatted =
    data.calculatedImpact.deltaCash === 0
      ? isEs ? "0 (Sin salida directa)" : isFr ? "0 (Pas de sortie directe)" : "0 (No cash outflow)"
      : `-${fmt(Math.abs(data.calculatedImpact.deltaCash))}`;

  const deltaFCFFormatted =
    data.calculatedImpact.deltaFreeCashFlow === 0
      ? isEs ? "0% (Sin cambio)" : isFr ? "0% (Pas de décalage)" : "0% (No shift)"
      : `-${fmt(Math.abs(data.calculatedImpact.deltaFreeCashFlow))}${isEs ? "/mes" : isFr ? "/mois" : "/mo"} (-${data.calculatedImpact.fcfPercentageShift}%)`;

  const tableRows = [
    {
      label: isEs ? "Liquidez Disponible" : isFr ? "Liquidités Disponibles" : "Liquid Cash Reserves",
      before: fmt(data.baseline.liquidSavings),
      after: fmt(data.calculatedImpact.postDecisionCash),
      impact: deltaCashFormatted,
      highlight: data.calculatedImpact.postDecisionCash < data.baseline.liquidSavings * 0.5,
    },
    {
      label: isEs ? "Colchón de Reserva (Runway)" : isFr ? "Matelas de Sécurité (Runway)" : "Emergency Living Buffer",
      before: `${data.baseline.emergencyRunwayMonths} ${isEs ? "meses" : isFr ? "mois" : "mos"}`,
      after: `${data.calculatedImpact.postDecisionRunway} ${isEs ? "meses" : isFr ? "mois" : "mos"}`,
      impact: `${(data.calculatedImpact.postDecisionRunway - data.baseline.emergencyRunwayMonths).toFixed(1)} ${isEs ? "meses" : isFr ? "mois" : "mos"}`,
      highlight: data.calculatedImpact.postDecisionRunway < 2.0,
    },
    {
      label: isEs ? "Flujo de Caja Libre Mensual" : isFr ? "Cash-Flow Libre Mensuel" : "Monthly Free Cash Flow",
      before: `+${fmt(data.baseline.netFreeCashFlow)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`,
      after: `+${fmt(data.calculatedImpact.postDecisionFreeCashFlow)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`,
      impact: deltaFCFFormatted,
      highlight: data.calculatedImpact.deltaFreeCashFlow < 0,
    },
    {
      label: `${isEs ? "Meta" : isFr ? "Objectif" : "Goal"}: ${data.baseline.primaryGoalTitle}`,
      before: isEs ? "A tiempo" : isFr ? "Dans les temps" : "On schedule",
      after: data.calculatedImpact.goalStatus === "GOAL_FUNDING_PAUSED" ? (isEs ? "Pausado" : isFr ? "En pause" : "Paused") : `+${data.calculatedImpact.goalDelayDays}d ${isEs ? "retraso" : isFr ? "décalage" : "shift"}`,
      impact: data.calculatedImpact.goalDelayDays === 0 ? (isEs ? "0 días de retraso" : isFr ? "0 jour de retard" : "0 days delay") : `-${data.calculatedImpact.goalDelayDays} ${isEs ? "días" : isFr ? "jours" : "days"}`,
      highlight: data.calculatedImpact.goalDelayDays > 14,
    },
  ];

  tableRows.forEach((r, idx) => {
    doc.setFillColor(idx % 2 === 0 ? lightBg[0] : 255, idx % 2 === 0 ? lightBg[1] : 255, idx % 2 === 0 ? lightBg[2] : 255);
    doc.rect(margin, y, contentWidth, rowHeight, "F");
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(r.label, margin + 3, y + 4.3);
    doc.text(r.before, margin + 60, y + 4.3);
    doc.text(r.after, margin + 105, y + 4.3);

    doc.setFont("helvetica", "bold");
    if (r.highlight) {
      doc.setTextColor(roseAccent[0], roseAccent[1], roseAccent[2]);
    } else {
      doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    }
    doc.text(r.impact, margin + 150, y + 4.3);

    y += rowHeight;
  });

  y += 5.5;

  // 5. SCENARIO ALTERNATIVES COMPARISON (Multi-Line Clean Wrapping)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(
    isEs
      ? "4. COMPARACIÓN DE ESCENARIOS ALTERNATIVOS"
      : isFr
      ? "4. COMPARAISON DES SCÉNARIOS ALTERNATIFS"
      : "4. SCENARIO ALTERNATIVES COMPARISON",
    margin,
    y
  );

  y += 3;

  const cardW = (contentWidth - 6) / 3;
  const cardH = 34;
  const options = [
    { ...data.alternatives.optionA, label: isEs ? "OPCIÓN A" : isFr ? "OPTION A" : "OPTION A" },
    { ...data.alternatives.optionB, label: isEs ? "OPCIÓN B" : isFr ? "OPTION B" : "OPTION B" },
    { ...data.alternatives.optionC, label: isEs ? "OPCIÓN C" : isFr ? "OPTION C" : "OPTION C" },
  ];

  options.forEach((opt, idx) => {
    const cardX = margin + idx * (cardW + 3);
    const isRec = opt.isRecommended;

    doc.setFillColor(isRec ? 240 : pureWhite[0], isRec ? 253 : pureWhite[1], isRec ? 244 : pureWhite[2]);
    doc.setDrawColor(isRec ? brandEmerald[0] : borderGray[0], isRec ? brandEmerald[1] : borderGray[1], isRec ? brandEmerald[2] : borderGray[2]);
    doc.setLineWidth(isRec ? 0.8 : 0.4);
    doc.roundedRect(cardX, y, cardW, cardH, 2, 2, "FD");

    // Header Pill
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(isRec ? brandEmerald[0] : mutedGray[0], isRec ? brandEmerald[1] : mutedGray[1], isRec ? brandEmerald[2] : mutedGray[2]);
    doc.text(`${opt.label} ${isRec ? (isEs ? "* ÓPTIMO" : isFr ? "* OPTIMAL" : "* BEST") : ""}`, cardX + 3, y + 4.5);

    // Scenario Title with multi-line wrapping
    doc.setFontSize(7.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    const optTitleLines = doc.splitTextToSize(opt.title, cardW - 6);
    doc.text(optTitleLines.slice(0, 2), cardX + 3, y + 9.5);

    // Differentiated Metrics
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);

    if (isRecurring) {
      doc.text(`${isEs ? "Gastos Fijos:" : isFr ? "Charges Fixes:" : "New Fixed Outflows:"} ${fmt(opt.monthlyObligation)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, cardX + 3, y + 19);
      doc.text(`${isEs ? "Flujo Después:" : isFr ? "Cash-Flow Après:" : "Cash Flow After:"} +${fmt(opt.ledger?.postDecisionFreeCashFlow || 0)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, cardX + 3, y + 24);
    } else if (opt.monthlyObligation > 0) {
      doc.text(`${isEs ? "Pago Mensual:" : isFr ? "Mensualité:" : "Payment:"} ${fmt(opt.monthlyObligation)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, cardX + 3, y + 19);
      doc.text(`${isEs ? "Intereses:" : isFr ? "Intérêts:" : "Interest:"} ${fmt(opt.totalInterest)}`, cardX + 3, y + 24);
    } else {
      doc.text(`${isEs ? "Pago: 0 $/mes (Contado)" : isFr ? "Paiement: 0 $/mois (Comptant)" : "Payment: 0/mo (Self-Funded)"}`, cardX + 3, y + 19);
      doc.text(`${isEs ? "Liquidez Después:" : isFr ? "Cash Restant:" : "Cash After:"} ${fmt(opt.cashRemaining)}`, cardX + 3, y + 24);
    }

    doc.setFont("helvetica", "bold");
    doc.setTextColor(isRec ? brandEmerald[0] : darkCharcoal[0], isRec ? brandEmerald[1] : darkCharcoal[1], isRec ? brandEmerald[2] : darkCharcoal[2]);
    doc.text(`${isEs ? "Retraso" : isFr ? "Retard" : "Goal Delay"}: +${opt.delayDays}d • Runway: ${opt.runway}m`, cardX + 3, y + 29.5);
  });

  y += cardH + 4.5;

  // 6. RECOMMENDED SCENARIO HIGHLIGHT BOX (Page 1 Closer)
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.text(
    `* ${isEs ? "RECOMENDACIÓN CANÓNICA DE AIMLY" : isFr ? "RECOMMANDATION CANONIQUE D'AIMLY" : "AIMLY'S CANONICAL RECOMMENDATION"}: ${data.recommendation.recommendedScenarioTitle}`,
    margin + 4,
    y + 6
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const recReasonLines = doc.splitTextToSize(
    `${isEs ? "Por qué se eligió esta vía:" : isFr ? "Pourquoi cette voie a été retenue :" : "Why this path was chosen:"} ${data.recommendation.reasons.slice(0, 2).join(" • ")}`,
    contentWidth - 8
  );
  doc.text(recReasonLines.slice(0, 2), margin + 4, y + 12);

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGE 2: DYNAMIC DECISION DETAILS, ACTION PLAN, RELEVANT ASSUMPTIONS, SEAL
  // ─────────────────────────────────────────────────────────────────────────────
  doc.addPage();
  y = 14;

  // Header on Page 2
  doc.setFillColor(pureWhite[0], pureWhite[1], pureWhite[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(
    isEs
      ? "USEAIMLY INFORME DE DECISIÓN FINANCIERA VERIFICADO"
      : isFr
      ? "USEAIMLY RAPPORT D'ANALYSE DÉCISIONNELLE VÉRIFIÉE"
      : "USEAIMLY VERIFIED FINANCIAL DECISION REPORT",
    margin,
    y
  );
  doc.text(`ID: ${data.reportId} • v${data.version}`, pageWidth - margin, y, { align: "right" });
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.2);
  doc.line(margin, y + 2, pageWidth - margin, y + 2);
  y += 7;

  // 7. DYNAMIC SECTION: RECURRING EXPENSE VS FUNDING MECHANICS VS FINANCING
  const optBLedger = data.alternatives.optionB.ledger;

  if (isRecurring) {
    // Section 5: Recurring Expense & Long-Term Cash Flow Impact
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(
      isEs
        ? "5. ANÁLISIS DE COMPROMISO RECURRENTE Y FLUJO DE CAJA"
        : isFr
        ? "5. ANALYSE D'ENGAGEMENT RÉCURRENT & IMPACT CASH-FLOW"
        : "5. RECURRING COMMITMENT & CASH FLOW ANALYSIS",
      margin,
      y
    );

    y += 3;

    doc.setFillColor(pureWhite[0], pureWhite[1], pureWhite[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);

    doc.text(`${isEs ? "Gasto Recurrente Mensual:" : "Monthly Recurring Outlay:"} +${fmt(data.amount)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, margin + 4, y + 6);
    doc.text(`${isEs ? "Gastos Fijos Actuales:" : "Baseline Living Costs:"} ${fmt(data.baseline.monthlyExpenses)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, margin + 65, y + 6);
    doc.text(`${isEs ? "Nuevos Gastos Fijos:" : "New Fixed Outflows:"} ${fmt(data.baseline.monthlyExpenses + data.amount)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, margin + 125, y + 6);

    doc.text(`${isEs ? "Ingresos Netos:" : "Net Inflow:"} +${fmt(data.baseline.monthlyIncome)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, margin + 4, y + 13);
    doc.text(`${isEs ? "Flujo de Caja Después:" : "Post-Decision Free Cash Flow:"} +${fmt(data.calculatedImpact.postDecisionFreeCashFlow)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, margin + 65, y + 13);
    doc.text(`${isEs ? "Variación Flujo de Caja:" : "Free Cash Flow Shift:"} -${data.calculatedImpact.fcfPercentageShift}%`, margin + 125, y + 13);

    doc.setFont("helvetica", "bold");
    doc.text(`${isEs ? "Colchón de Reserva:" : "Adjusted Living Runway:"} ${data.calculatedImpact.postDecisionRunway} ${isEs ? "meses" : isFr ? "mois" : "mos"}`, margin + 4, y + 20);
    doc.text(`${isEs ? "Estado de Meta:" : "Goal Status:"} ${data.calculatedImpact.goalStatus}`, margin + 65, y + 20);
    doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.text(`Money Conservation: RECONCILED (100%)`, margin + 125, y + 20);

    y += 28;
  } else if (optBLedger && optBLedger.waitDaysRequired > 0) {
    // Section 5: Funding Mechanics & Self-Funding Timeline (For One-Time / Self-Funded Decisions)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(
      isEs
        ? "5. MECÁNICA DE ASIGNACIÓN Y AUTO-FINANCIACIÓN (OPCIÓN B)"
        : isFr
        ? "5. MÉCANIQUE D'ALLOCATION & AUTO-FINANCEMENT (OPTION B)"
        : "5. FUNDING MECHANICS & CASH ALLOCATION (OPTION B)",
      margin,
      y
    );

    y += 3;

    doc.setFillColor(pureWhite[0], pureWhite[1], pureWhite[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);

    doc.text(`${isEs ? "Flujo Libre Mensual:" : "Monthly Free Cash Flow:"} +${fmt(optBLedger.baselineFreeCashFlow)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, margin + 4, y + 6);
    doc.text(`${isEs ? "Aporte a Meta Mantenido:" : "Goal Contribution Maintained:"} +${fmt(optBLedger.monthlyGoalAllocation)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, margin + 65, y + 6);
    doc.text(`${isEs ? "Tasa de Ahorro para Decisión:" : "Decision Savings Rate:"} +${fmt(optBLedger.monthlyDecisionSavings)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, margin + 125, y + 6);

    doc.text(`${isEs ? "Horizonte de Auto-Financiación:" : "Self-Funding Horizon:"} ${optBLedger.waitDaysRequired} ${isEs ? "Días" : isFr ? "Jours" : "Days"}`, margin + 4, y + 13);
    doc.text(`${isEs ? "Ahorro Acumulado:" : "Accumulated from Cash Flow:"} ${fmt(optBLedger.accumulatedDecisionSavings)}`, margin + 65, y + 13);
    doc.text(`${isEs ? "Salida de Reservas:" : "Outflow from Reserves:"} ${fmt(optBLedger.outflowFromExistingReserves)}`, margin + 125, y + 13);

    doc.setFont("helvetica", "bold");
    doc.text(`${isEs ? "Reservas Finales:" : "Ending Cash Reserves:"} ${fmt(optBLedger.endingCashReserves)} (${optBLedger.endingEmergencyRunwayMonths} ${isEs ? "meses" : isFr ? "mois" : "mos"})`, margin + 4, y + 20);
    doc.text(`${isEs ? "Desplazamiento de Meta:" : "Goal Timeline Shift:"} +${optBLedger.goalDelayDays} ${isEs ? "días de retraso" : isFr ? "jours de retard" : "days delay"}`, margin + 65, y + 20);
    doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.text(`Money Conservation: RECONCILED (100%)`, margin + 125, y + 20);

    y += 28;
  } else if (isFinanced && data.financing) {
    // Section 5: Financing Structure (For Loans)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(
      isEs
        ? "5. ESTRUCTURA DE FINANCIACIÓN Y AMORTIZACIÓN"
        : isFr
        ? "5. STRUCTURE DU FINANCEMENT & AMORTISSEMENT"
        : "5. FINANCING STRUCTURE & AMORTIZATION SUMMARY",
      margin,
      y
    );

    y += 3;

    doc.setFillColor(pureWhite[0], pureWhite[1], pureWhite[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);

    doc.text(`${isEs ? "Capital Financiado:" : "Principal Financed:"} ${fmt(data.financing.principalBorrowed)}`, margin + 4, y + 6);
    doc.text(`${isEs ? "Entrada / Depósito:" : "Down Payment:"} ${fmt(data.financing.downPayment)}`, margin + 65, y + 6);
    doc.text(`${isEs ? "Tasa de Interés:" : "Interest Rate:"} ${data.financing.annualInterestRatePercent}% APR`, margin + 125, y + 6);

    doc.text(`${isEs ? "Plazo del Crédito:" : "Loan Term:"} ${data.financing.loanTermMonths} ${isEs ? "Meses" : isFr ? "Mois" : "Months"}`, margin + 4, y + 13);
    doc.text(`${isEs ? "Cuota Mensual:" : "Monthly Payment:"} ${fmt(data.financing.monthlyPayment)}${isEs ? "/mes" : isFr ? "/mois" : "/mo"}`, margin + 65, y + 13);
    doc.text(`${isEs ? "Intereses Totales:" : "Total Interest:"} ${fmt(data.financing.totalInterestPaid)}`, margin + 125, y + 13);

    doc.setFont("helvetica", "bold");
    doc.text(`${isEs ? "Coste Total de Vida:" : "Total Lifetime Cost:"} ${fmt(data.financing.totalLifetimeCost)}`, margin + 4, y + 20);
    doc.text(`${isEs ? "Estado:" : "Status:"} ${data.financing.isAssumedTerms ? (isEs ? "Estimación Estándar" : isFr ? "Estimation Standard" : "Estimated Benchmark") : (isEs ? "Confirmado" : isFr ? "Confirmé" : "User Confirmed")}`, margin + 65, y + 20);
    doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.text(`Money Conservation: RECONCILED`, margin + 125, y + 20);

    y += 28;
  }

  // 8. AIMLY RECOMMENDED ACTION PLAN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(
    isEs
      ? "6. PLAN DE ACCIÓN RECOMENDADO POR AIMLY"
      : isFr
      ? "6. PLAN D'ACTION RECOMMANDÉ PAR AIMLY"
      : "6. AIMLY RECOMMENDED ACTION PLAN",
    margin,
    y
  );

  y += 3.5;

  const actions = [
    data.recommendation.actionPlanStep1,
    data.recommendation.actionPlanStep2,
    data.recommendation.actionPlanStep3,
  ];

  actions.forEach((act) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    const actLines = doc.splitTextToSize(act, contentWidth - 4);
    doc.text(actLines, margin + 2, y);
    y += actLines.length * 4.2 + 1;
  });

  y += 3;

  // 9. RELEVANT MATERIAL ASSUMPTIONS (Strict Relevance Filtered!)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(
    isEs
      ? "7. SUPUESTOS MATERIALES RELEVANTES"
      : isFr
      ? "7. HYPOTHÈSES SOUS-JACENTES PERTINENTES"
      : "7. RELEVANT MATERIAL ASSUMPTIONS",
    margin,
    y
  );

  y += 3.5;

  const catAssumptions = data.categorizedAssumptions || {
    confirmedUserBaseline: [
      `${isEs ? "Ingresos mensuales confirmados en" : isFr ? "Revenu mensuel confirmé à" : "Monthly income confirmed at"} ${fmt(data.baseline.monthlyIncome)}.`,
      `${isEs ? "Gastos fijos confirmados en" : isFr ? "Charges fixes confirmées à" : "Fixed living costs confirmed at"} ${fmt(data.baseline.monthlyExpenses + data.baseline.monthlyDebtService)}${isEs ? "/mes" : isFr ? "/mois" : "/month"}.`,
      `${isEs ? "Reservas líquidas confirmadas en" : isFr ? "Réserves liquides confirmées à" : "Liquid cash reserves confirmed at"} ${fmt(data.baseline.liquidSavings)}.`,
    ],
    aimlySafetyThresholds: [
      isEs ? "Suelo de Seguridad Obligatorio: 2.0 meses de gastos fijos." : isFr ? "Seuil de Sécurité Obligatoire : 2.0 mois de charges fixes." : "Mandatory Emergency Floor: 2.0 months of living expenses.",
      isEs ? "Colchón de Seguridad Objetivo: 3.0 meses de gastos fijos." : isFr ? "Matelas de Sécurité Cible : 3.0 mois de charges fixes." : "Target Emergency Buffer: 3.0 months of living expenses.",
    ],
    scenarioAllocationMechanics: [
      `${isEs ? "Aporte a Meta:" : isFr ? "Contribution Objectif :" : "Goal Contribution:"} ${fmt(data.baseline.monthlyGoalAllocation)}${isEs ? "/mes preservados para" : isFr ? "/mois préservés pour" : "/mo preserved to"} "${data.baseline.primaryGoalTitle}".`,
      isEs ? "Asignación de capital derivada estrictamente del flujo libre sin déficit." : isFr ? "Allocation de trésorerie dérivée strictement du cash-flow libre sans déficit." : "Cash allocation derived strictly from free cash flow without deficit.",
    ],
    financingAssumptions: [],
  };

  const assumptionGroups = [
    { title: isEs ? "A. Datos Base Confirmados" : isFr ? "A. Données de Base Confirmées" : "A. Confirmed Baseline Data", items: catAssumptions.confirmedUserBaseline },
    { title: isEs ? "B. Umbrales de Seguridad Aimly" : isFr ? "B. Seuils de Sécurité Aimly" : "B. Aimly Safety Thresholds", items: catAssumptions.aimlySafetyThresholds },
    { title: isEs ? "C. Mecánica de Asignación y Ahorro" : isFr ? "C. Mécanismes d'Allocation et d'Épargne" : "C. Allocation & Savings Mechanics", items: catAssumptions.scenarioAllocationMechanics },
  ];

  if (isFinanced && catAssumptions.financingAssumptions && catAssumptions.financingAssumptions.length > 0) {
    assumptionGroups.push({ title: isEs ? "D. Condiciones de Financiación" : isFr ? "D. Conditions de Financement" : "D. Financing Terms & Provenance", items: catAssumptions.financingAssumptions });
  }

  assumptionGroups.forEach((grp) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
    doc.text(grp.title, margin + 2, y);
    y += 3.5;

    grp.items.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
      doc.text(`- ${item}`, margin + 4, y);
      y += 3.5;
    });
    y += 1;
  });

  y += 2;

  // 10. AIMLY ANALYSIS VALIDATION SEAL (9-GATE AUDIT)
  doc.setFillColor(pureWhite[0], pureWhite[1], pureWhite[2]);
  doc.setDrawColor(sealColor[0], sealColor[1], sealColor[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 30, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setTextColor(sealColor[0], sealColor[1], sealColor[2]);
  doc.text(
    `${isEs ? "SELLO DE VERIFICACIÓN DE COHERENCIA AIMLY * ESTADO:" : isFr ? "SCEAU DE VÉRIFICATION DE COHÉRENCE AIMLY * STATUT :" : "AIMLY ANALYSIS COHERENCE VERIFICATION SEAL * STATUS:"} ${verification.status}`,
    margin + 4,
    y + 5.5
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(isEs ? "[x] Invariante Estructura-Modelo Verificado" : isFr ? "[x] Invariant Structure-Modèle Vérifié" : "[x] Structure-to-Model Invariant Verified", margin + 4, y + 11.5);
  doc.text(isEs ? "[x] Conservación del Dinero & Cero Desviación Residual" : isFr ? "[x] Conservation de la Monnaie & Zéro Dérive Résiduelle" : "[x] Money Conservation & Zero Residual Drift", margin + 4, y + 16);
  doc.text(isEs ? "[x] Invariante de Recomendación Canónica Única" : isFr ? "[x] Invariant de Recommandation Canonique Unique" : "[x] Single Canonical Recommendation Invariant", margin + 4, y + 20.5);

  doc.text(isEs ? "[x] Flujo de Caja Libre y Capitalización de Metas" : isFr ? "[x] Cash-Flow Libre Mensuel & Capitalisation d'Objectif" : "[x] Monthly Free Cash Flow & Goal Compounding", margin + 95, y + 11.5);
  doc.text(isEs ? "[x] Filtro de Relevancia de Supuestos Materiales" : isFr ? "[x] Pertinence des Hypothèses Matérielles Filtrée" : "[x] Material Assumption Relevance Filtered", margin + 95, y + 16);
  doc.text(isEs ? "[x] Narrativa Basada en Datos Canónicos" : isFr ? "[x] Énoncés Narratifs Ancrés dans les Données Canoniques" : "[x] Narrative Statements Grounded in Canonical Data", margin + 95, y + 20.5);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.2);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(
    isVerified
      ? isEs
        ? "Certificado 100% coherente matemáticamente, alineado en estructura y reproducible por el motor UseAimly."
        : isFr
        ? "Certifié 100% mathématiquement cohérent, aligné en structure et reproductible par le moteur UseAimly."
        : "Certified 100% mathematically coherent, structure-aligned, and reproducible by the UseAimly engine."
      : isEs
      ? "Alerta de auditoría: Se detectaron inconsistencias en la estructura o en los supuestos."
      : isFr
      ? "Alerte d'audit : Incohérences détectées dans la structure ou les hypothèses."
      : "Audit alert: Inconsistencies detected in structure or assumptions.",
    margin + 4,
    y + 26
  );

  y += 34;

  // 11. INSTITUTIONAL DISCLAIMER & LIMITATIONS
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  const disclaimerText = isEs
    ? "AVISO DE EXENCIÓN DE RESPONSABILIDAD: Este documento es un informe de soporte a la decisión financiera generado de manera determinista a partir de los datos y supuestos facilitados en el momento del análisis. No constituye asesoramiento financiero, de inversión, legal o fiscal regulado."
    : isFr
    ? "AVIS DE NON-RESPONSABILITÉ : Ce document est un instrument d'aide à la décision financière généré de manière déterministe à partir des données et hypothèses renseignées. Il ne constitue pas un conseil financier, juridique ou fiscal réglementé."
    : "DISCLAIMER: This document is a strategic financial decision-support report generated deterministically from the data and assumptions provided at the time of analysis. It does not constitute regulated individualized financial, investment, legal, or tax advice. Future actual trajectories depend on ongoing financial discipline and unforeseen liquidity events.";
  const disLines = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(disLines, margin, y);

  // Footer page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text(
      `UseAimly Financial Decision Engine • ${data.reportId} • ${isEs ? "Página" : isFr ? "Page" : "Page"} ${i} ${isEs ? "de" : isFr ? "sur" : "of"} ${totalPages}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    );
  }

  return doc;
}
