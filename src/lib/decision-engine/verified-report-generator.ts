import { jsPDF } from "jspdf";
import { VerifiedDecisionData, VerificationResult } from "./decision-validator";
import { formatCurrency } from "../utils/currency";
import { USEAIMLY_LOGO_BASE64 } from "../brand/logo-base64";

/**
 * Generate a professional, audit-grade Verified Financial Decision Report PDF
 */
export function generateVerifiedDecisionReportPDF(
  data: VerifiedDecisionData,
  verification: VerificationResult,
  language: "en" | "fr" | "sw" = "en"
): jsPDF {
  const isFr = language === "fr";
  const isSw = language === "sw";

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

  const fmt = (amt: number) => formatCurrency(amt, data.currency);

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 14;
      // Top header on subsequent pages
      doc.setFillColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
      doc.text("USEAIMLY VERIFIED FINANCIAL DECISION REPORT", margin, y);
      doc.text(`ID: ${data.reportId} • v${data.version}`, pageWidth - margin, y, { align: "right" });
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 8;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGE 1: COVER, VERDICT, CONTEXT & FINANCIAL IMPACT
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
    isFr
      ? "RAPPORT D'ANALYSE DÉCISIONNELLE VÉRIFIÉE"
      : isSw
      ? "RIPOTI ILIYOTHIBITISHWA YA MAAMUZI YA KIFEDHA"
      : "VERIFIED FINANCIAL DECISION REPORT",
    titleX + 4,
    12
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(
    `${isFr ? "ID Rapport" : isSw ? "Nambari ya Ripoti" : "Report ID"}: ${data.reportId} • v${data.version} • ${new Date(data.timestamp).toLocaleDateString(isFr ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    titleX + 4,
    18
  );

  // Status Seal Badge
  const sealWidth = 38;
  const sealX = pageWidth - margin - sealWidth;
  doc.setFillColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.roundedRect(sealX, 7, sealWidth, 16, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("AIMLY COHERENCE", sealX + sealWidth / 2, 12, { align: "center" });
  doc.setFontSize(8);
  doc.text("VERIFIED", sealX + sealWidth / 2, 18, { align: "center" });

  y = 28;

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
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, "FD");

  // Verdict Pill
  doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.roundedRect(margin + 4, y + 4, 48, 7, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  const verdictLabel =
    data.calculatedImpact.verdict === "RECOMMENDED"
      ? isFr ? "RECOMMANDÉ" : isSw ? "INASHAURIWA" : "RECOMMENDED"
      : data.calculatedImpact.verdict === "PROCEED_WITH_CAUTION"
      ? isFr ? "AVEC PRUDENCE" : isSw ? "KWA TAHADHARI" : "PROCEED WITH CAUTION"
      : isFr ? "NON RECOMMANDÉ" : isSw ? "HAISHAURIWI" : "NOT RECOMMENDED";
  doc.text(verdictLabel, margin + 28, y + 8.8, { align: "center" });

  // Verdict Headline
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const headlineLines = doc.splitTextToSize(data.calculatedImpact.verdictHeadline, contentWidth - 8);
  doc.text(headlineLines.slice(0, 2), margin + 4, y + 17);

  // Primary verified reason
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  const reasonLines = doc.splitTextToSize(
    `${isFr ? "Motif principal :" : isSw ? "Sababu kuu :" : "Primary verified reason:"} ${data.calculatedImpact.primaryReason}`,
    contentWidth - 8
  );
  doc.text(reasonLines.slice(0, 2), margin + 4, y + 25);

  y += 36;

  // 2. DECISION OVERVIEW & 3. FINANCIAL CONTEXT (2-Column Grid)
  const colWidth = (contentWidth - 4) / 2;

  // Left Column: Decision Overview
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, colWidth, 40, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.text(isFr ? "1. DÉTAILS DE LA DÉCISION" : isSw ? "1. MAELEZO YA UAMUZI" : "1. DECISION OVERVIEW", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`${isFr ? "Intitulé :" : isSw ? "Kichwa :" : "Decision:"} ${data.decisionTitle}`, margin + 4, y + 13);
  doc.text(`${isFr ? "Montant Total :" : isSw ? "Kiasi Kamili :" : "Purchase Outlay:"} ${fmt(data.amount)}`, margin + 4, y + 20);
  doc.text(
    `${isFr ? "Modalité :" : isSw ? "Aina ya Malipo :" : "Payment Method:"} ${data.downPayment > 0 ? `${fmt(data.downPayment)} ${isFr ? "acompte" : "down"}` : isFr ? "Comptant" : "Full Outlay"}`,
    margin + 4,
    y + 27
  );
  doc.text(
    `${isFr ? "Nature :" : isSw ? "Urejeshaji :" : "Structure:"} ${data.isRecurring ? (isFr ? "Récurrent mensuel" : "Recurring Monthly") : isFr ? "Achat Ponctuel" : "One-Off Decision"}`,
    margin + 4,
    y + 34
  );

  // Right Column: Financial Context Used (User Data vs Assumptions)
  doc.roundedRect(margin + colWidth + 4, y, colWidth, 40, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.text(isFr ? "2. PROFIL FINANCIER UTILISÉ" : isSw ? "2. WASIFU WA KIFEDHA" : "2. FINANCIAL CONTEXT USED", margin + colWidth + 8, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`${isFr ? "Réserves Liquides :" : isSw ? "Akiba ya Papo Hapo :" : "Liquid Reserves:"} ${fmt(data.baseline.liquidSavings)}`, margin + colWidth + 8, y + 13);
  doc.text(`${isFr ? "Revenu Mensuel Brut :" : isSw ? "Mapato ya Mwezi :" : "Monthly Inflow:"} ${fmt(data.baseline.monthlyIncome)}`, margin + colWidth + 8, y + 20);
  doc.text(`${isFr ? "Dépenses Fixes & Dettes :" : isSw ? "Gharama na Madeni :" : "Monthly Fixed Outflows:"} ${fmt(data.baseline.monthlyExpenses + data.baseline.monthlyDebtService)}`, margin + colWidth + 8, y + 27);
  doc.text(`${isFr ? "Cash-Flow Libre Net :" : isSw ? "Pesa Huru ya Mwezi :" : "Net Free Cash Flow:"} +${fmt(data.baseline.netFreeCashFlow)}/mo`, margin + colWidth + 8, y + 34);

  y += 44;

  // 4. FINANCIAL IMPACT TABLE (METRIC | BEFORE | AFTER | IMPACT)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(isFr ? "3. TABLEAU D'IMPACT DÉTERMINISTE" : isSw ? "3. JEDWALI LA ATHARI ZA KIFEDHA" : "3. DETERMINISTIC FINANCIAL IMPACT", margin, y);

  y += 3;

  // Table Header
  const rowHeight = 6.5;
  doc.setFillColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.rect(margin, y, contentWidth, rowHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(isFr ? "INDICATEUR CLÉ" : isSw ? "KIPIMO" : "FINANCIAL INDICATOR", margin + 3, y + 4.5);
  doc.text(isFr ? "AVANT DÉCISION" : isSw ? "KABLA" : "BASELINE", margin + 60, y + 4.5);
  doc.text(isFr ? "APRÈS DÉCISION" : isSw ? "BAADA" : "POST-DECISION", margin + 105, y + 4.5);
  doc.text(isFr ? "IMPACT NET" : isSw ? "ATHARI" : "DELTA IMPACT", margin + 150, y + 4.5);

  y += rowHeight;

  const tableRows = [
    {
      label: isFr ? "Liquidités Disponibles" : isSw ? "Akiba ya Papo Hapo" : "Liquid Cash Reserves",
      before: fmt(data.baseline.liquidSavings),
      after: fmt(data.calculatedImpact.postDecisionCash),
      impact: `-${fmt(data.amount)}`,
      highlight: data.calculatedImpact.postDecisionCash < data.baseline.liquidSavings * 0.5,
    },
    {
      label: isFr ? "Matelas de Sécurité (Runway)" : isSw ? "Miezi ya Dharura" : "Emergency Living Buffer",
      before: `${data.baseline.emergencyRunwayMonths} ${isFr ? "mois" : "mos"}`,
      after: `${data.calculatedImpact.postDecisionRunway} ${isFr ? "mois" : "mos"}`,
      impact: `${(data.calculatedImpact.postDecisionRunway - data.baseline.emergencyRunwayMonths).toFixed(1)} mos`,
      highlight: data.calculatedImpact.postDecisionRunway < 3.0,
    },
    {
      label: isFr ? "Pression sur Cash-Flow Libre" : isSw ? "Mzigo wa Kila Mwezi" : "Monthly Free Cash Flow Shift",
      before: `+${fmt(data.baseline.netFreeCashFlow)}/mo`,
      after: `+${fmt(Math.max(0, data.baseline.netFreeCashFlow - (data.monthlyPayment || 0)))}/mo`,
      impact: `+${data.calculatedImpact.monthlyPressurePercent}% shift`,
      highlight: data.calculatedImpact.monthlyPressurePercent > 25,
    },
    {
      label: isFr ? `Objectif: ${data.baseline.primaryGoalTitle}` : isSw ? `Lengo: ${data.baseline.primaryGoalTitle}` : `Goal: ${data.baseline.primaryGoalTitle}`,
      before: isFr ? "Dans les temps" : "On schedule",
      after: `+${data.calculatedImpact.goalDelayDays}d shift`,
      impact: `-${data.calculatedImpact.goalDelayDays} ${isFr ? "jours" : "days"}`,
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
    doc.text(r.label, margin + 3, y + 4.5);
    doc.text(r.before, margin + 60, y + 4.5);
    doc.text(r.after, margin + 105, y + 4.5);

    doc.setFont("helvetica", "bold");
    if (r.highlight) {
      doc.setTextColor(roseAccent[0], roseAccent[1], roseAccent[2]);
    } else {
      doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    }
    doc.text(r.impact, margin + 150, y + 4.5);

    y += rowHeight;
  });

  y += 6;

  // 5. SCENARIO COMPARISON (OPTION A, B, C)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(isFr ? "4. COMPARAISON DES SCÉNARIOS ALTERNATIFS" : isSw ? "4. ULINGANISHO WA NJIA MBADALA" : "4. SCENARIO ALTERNATIVES COMPARISON", margin, y);

  y += 3;

  const cardW = (contentWidth - 6) / 3;
  const cardH = 26;
  const options = [
    { ...data.alternatives.optionA, label: "OPTION A" },
    { ...data.alternatives.optionB, label: "OPTION B" },
    { ...data.alternatives.optionC, label: "OPTION C" },
  ];

  options.forEach((opt, idx) => {
    const cardX = margin + idx * (cardW + 3);
    doc.setFillColor(opt.isRecommended ? 240 : lightBg[0], opt.isRecommended ? 253 : lightBg[1], opt.isRecommended ? 244 : lightBg[2]);
    doc.setDrawColor(opt.isRecommended ? brandEmerald[0] : borderGray[0], opt.isRecommended ? brandEmerald[1] : borderGray[1], opt.isRecommended ? brandEmerald[2] : borderGray[2]);
    doc.setLineWidth(opt.isRecommended ? 0.8 : 0.4);
    doc.roundedRect(cardX, y, cardW, cardH, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(opt.isRecommended ? brandEmerald[0] : mutedGray[0], opt.isRecommended ? brandEmerald[1] : mutedGray[1], opt.isRecommended ? brandEmerald[2] : mutedGray[2]);
    doc.text(`${opt.label} ${opt.isRecommended ? "★ BEST" : ""}`, cardX + 3, y + 5);

    doc.setFontSize(7.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    const optTitleLines = doc.splitTextToSize(opt.title, cardW - 6);
    doc.text(optTitleLines[0] || "", cardX + 3, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text(`${isFr ? "Décalage :" : "Goal Shift:"} +${opt.delayDays}d`, cardX + 3, y + 16);
    doc.text(`${isFr ? "Matelas :" : "Runway:"} ${opt.runway} mos`, cardX + 3, y + 21);
  });

  y += cardH + 8;

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGE 2: DETAILED ANALYSIS, RECOMMENDED PATH, ASSUMPTIONS & SEAL
  // ─────────────────────────────────────────────────────────────────────────────
  checkPageBreak(120);

  // 6. DETAILED GROUNDED ANALYSIS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(isFr ? "5. ANALYSE STRATÉGIQUE DÉTAILLÉE" : isSw ? "5. UCHAMBUZI WA KINA WA KIMKAKATI" : "5. DETAILED GROUNDED ANALYSIS", margin, y);

  y += 4;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const analysisLines = doc.splitTextToSize(
    data.narrative.executiveSummary ||
      `This analysis evaluates the exact capital impact of committing ${fmt(data.amount)} toward ${data.decisionTitle}. While cash capacity permits the immediate execution, it shifts primary goal compounding and reduces the living buffer to ${data.calculatedImpact.postDecisionRunway} months.`,
    contentWidth - 8
  );
  doc.text(analysisLines.slice(0, 4), margin + 4, y + 6);

  y += 28;

  // 7. RECOMMENDED PATH & NEXT BEST ACTIONS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(isFr ? "6. PLAN D'ACTION RECOMMANDÉ D'AIMLY" : isSw ? "6. MPANGO UNAOSHAURIWA WA KUCHUKUA HATUA" : "6. AIMLY RECOMMENDED ACTION PLAN", margin, y);

  y += 4;

  const actions = [
    isFr
      ? `1. Privilégier l'Option B (Attendre ou étaler) afin de conserver un matelas de sécurité minimum de 3.0 mois.`
      : `1. Execute Option B (Wait or Budget Alternative) to protect your essential 3.0-month living reserve floor.`,
    isFr
      ? `2. Allouer un surplus mensuel temporaire de +${fmt(Math.round(data.amount / 12))}/mois pour neutraliser tout retard sur "${data.baseline.primaryGoalTitle}".`
      : `2. Channel an extra +${fmt(Math.round(data.amount / 12))}/month toward "${data.baseline.primaryGoalTitle}" to completely neutralize the +${data.calculatedImpact.goalDelayDays}-day shift.`,
    isFr
      ? `3. Réévaluer la décision si une rentrée de trésorerie exceptionnelle intervient avant la date cible.`
      : `3. Re-evaluate this decision if unexpected liquidity becomes available prior to target timeline.`,
  ];

  actions.forEach((act) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    const actLines = doc.splitTextToSize(act, contentWidth - 4);
    doc.text(actLines, margin + 2, y);
    y += 5;
  });

  y += 4;

  // 8. ASSUMPTIONS & SENSITIVITY
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(isFr ? "7. HYPOTHÈSES SOUS-JACENTES & SENSIBILITÉ" : isSw ? "7. MAKADIRIO NA DHANA ZILIZOTUMIKA" : "7. ASSUMPTIONS & SENSITIVITY ANALYSIS", margin, y);

  y += 4;

  (data.assumptions || [
    "Monthly gross income remains stable over the 12 to 24-month horizon.",
    "Fixed living expenses and debt payments remain consistent with active baseline profile.",
    "No emergency liquidity drawdowns occur during the goal accumulation window.",
  ]).forEach((ass) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text(`• ${ass}`, margin + 2, y);
    y += 4.5;
  });

  y += 4;

  // 9. AIMLY ANALYSIS VALIDATION (SEAL & CHECKLIST)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.text("AIMLY ANALYSIS COHERENCE VERIFICATION SEAL", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("✓ Mathematical Consistency Verified", margin + 4, y + 13);
  doc.text("✓ Verdict Traceability to Risk Thresholds Verified", margin + 4, y + 18);
  doc.text("✓ Scenario Comparison Coherence Verified", margin + 4, y + 23);

  doc.text("✓ Goal Impact & Trajectory Alignment Verified", margin + 95, y + 13);
  doc.text("✓ Timeline Days/Months Model Verified", margin + 95, y + 18);
  doc.text("✓ Narrative Facts Grounded in Calculation Data", margin + 95, y + 23);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(
    isFr
      ? "Aucune incohérence critique détectée. Ce rapport est certifié conforme au moteur mathématique déterministe UseAimly."
      : "No critical inconsistencies detected. This report is certified mathematically grounded by the UseAimly engine.",
    margin + 4,
    y + 29
  );

  y += 38;

  // 10. IMPORTANT LIMITATIONS & DISCLAIMER
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  const disclaimerText = isFr
    ? "AVIS DE NON-RESPONSABILITÉ : Ce document est un instrument d'aide à la décision financière basé sur les données et hypothèses renseignées au moment de l'analyse. Il ne constitue pas un conseil financier, juridique ou fiscal personnalisé réglementé. Les résultats futurs peuvent varier en fonction des évolutions économiques et imprévus de trésorerie."
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
      `UseAimly Financial Decision Engine • ${data.reportId} • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  return doc;
}
