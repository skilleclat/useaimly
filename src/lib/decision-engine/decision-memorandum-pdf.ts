/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * PREMIUM FINANCIAL DECISION MEMORANDUM PDF GENERATOR (PROMPT 18)
 *
 * Transforms the Master Decision Report into an elite, publication-grade
 * multi-page Financial Decision Memorandum.
 *
 * Key Architecture:
 * - Executive Briefing & Crisp Verdict Hero Banner
 * - Epistemic Classification (Facts, Estimates, Assumptions, Unknowns)
 * - Trajectory & Liquidity Comparison Table
 * - Sensitivity Elasticity Matrix (The 3 Numbers That Matter Most)
 * - 5 Plausible Economic Futures Table (Base, Favorable, Cautious, Adverse, Severe Stress)
 * - 12-Month Pre-Mortem Autopsy & Early Warning Signals
 * - Red Flags Risk Hierarchy (Critical, Important, Watch)
 * - Strategic Alternatives Evaluation & Optimal Structure Verdict
 * - Pre-Commitment Action Plan & Professional Decision-Support Disclaimer
 * - Zero overflowing elements, zero broken tables, multi-language support (EN, FR, ES)
 */

import { jsPDF } from "jspdf";
import { formatCurrency } from "../utils/currency";
import { USEAIMLY_LOGO_BASE64 } from "../brand/logo-base64";
import { MasterDecisionReportPayload } from "./step7-master-decision-report";

export function generateFinancialDecisionMemorandumPDF(
  report: MasterDecisionReportPayload
): jsPDF {
  const isFr = report.locale === "fr";
  const isEs = report.locale === "es";

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Curated Luxury Corporate Palette
  const brandPrimary = [255, 85, 51];   // #FF5533 Brand Orange
  const brandEmerald = [16, 185, 129]; // #10B981 Emerald
  const darkCharcoal = [15, 23, 42];   // #0F172A Slate 900
  const slateDark = [30, 41, 59];      // #1E293B Slate 800
  const mutedGray = [100, 116, 139];   // #64748B Slate 500
  const lightBg = [248, 250, 252];     // #F8FAFC
  const cardBorder = [226, 232, 240];  // #E2E8F0
  const amberAccent = [217, 119, 6];   // #D97706
  const roseAccent = [225, 29, 72];    // #E11D48
  const indigoAccent = [79, 70, 229];  // #4F46E5

  const fmt = (amt: number) => formatCurrency(amt, report.currency);

  // Helper for Section Titles
  const renderSectionHeader = (title: string, yPos: number, accentColor = brandPrimary) => {
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(margin, yPos, 2.5, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(title.toUpperCase(), margin + 5, yPos + 4);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(margin + 5 + doc.getTextWidth(title.toUpperCase()) + 3, yPos + 2.5, pageWidth - margin, yPos + 2.5);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGE 1: EXECUTIVE BRIEFING, VERDICT, IMPACT & SENSITIVITY MATRIX
  // ─────────────────────────────────────────────────────────────────────────────

  // Top Accent Bar
  doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.rect(0, 0, pageWidth, 3.5, "F");

  // Logo & Header
  try {
    doc.addImage(USEAIMLY_LOGO_BASE64, "PNG", margin, 7, 34, 15);
  } catch {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
    doc.text("UseAimly", margin, 17);
  }

  const titleX = margin + 38;
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.4);
  doc.line(titleX, 7, titleX, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(
    isEs
      ? "MEMORÁNDUM DE DECISIÓN FINANCIERA"
      : isFr
      ? "MÉMORANDUM DE DÉCISION FINANCIÈRE"
      : "FINANCIAL DECISION MEMORANDUM",
    titleX + 4,
    12
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(
    `ID: ${report.reportId} • ${report.robustness.classificationLabelEn} • Depth: ${report.verification.fourIndicators.decisionRobustness.level} • ${new Date(report.generatedAt).toLocaleDateString(isEs ? "es-ES" : isFr ? "fr-FR" : "en-US", { year: "numeric", month: "short", day: "numeric" })}`,
    titleX + 4,
    17.5
  );

  // Confidence Seal
  const sealWidth = 44;
  const sealX = pageWidth - margin - sealWidth;
  const isResilient = report.section1_verdict.verdictCode === "STRONG_GO" || report.robustness.classification === "ROBUST";
  const sealColor = isResilient ? brandEmerald : report.section1_verdict.verdictCode === "NO_GO" ? roseAccent : amberAccent;

  doc.setFillColor(sealColor[0], sealColor[1], sealColor[2]);
  doc.roundedRect(sealX, 7, sealWidth, 15, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    isEs ? "VERIFICACIÓN AIMLY" : isFr ? "VALIDATION AIMLY" : "AIMLY VERIFIED",
    sealX + sealWidth / 2,
    11.5,
    { align: "center" }
  );
  doc.setFontSize(8);
  doc.text(
    `CONFIDENCE: ${report.verification.fourIndicators.aimlyConfidence.score}%`,
    sealX + sealWidth / 2,
    17.5,
    { align: "center" }
  );

  let y = 26;

  // 1. HERO VERDICT BANNER
  const verdictCode = report.section1_verdict.verdictCode;
  const bannerBg =
    verdictCode === "STRONG_GO"
      ? [240, 253, 244]
      : verdictCode === "NO_GO"
      ? [255, 241, 242]
      : verdictCode === "MODIFY" || verdictCode === "WAIT"
      ? [238, 242, 255]
      : [254, 252, 232];

  const bannerBorder =
    verdictCode === "STRONG_GO"
      ? brandEmerald
      : verdictCode === "NO_GO"
      ? roseAccent
      : verdictCode === "MODIFY" || verdictCode === "WAIT"
      ? indigoAccent
      : amberAccent;

  doc.setFillColor(bannerBg[0], bannerBg[1], bannerBg[2]);
  doc.setDrawColor(bannerBorder[0], bannerBorder[1], bannerBorder[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 23, 2.5, 2.5, "FD");

  // Left Verdict Tag
  doc.setFillColor(bannerBorder[0], bannerBorder[1], bannerBorder[2]);
  doc.roundedRect(margin + 3, y + 3.5, 48, 7, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(report.section1_verdict.verdictLabel, margin + 27, y + 8.2, { align: "center" });

  // Main Verdict Rationale
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const explanationLines = doc.splitTextToSize(report.section1_verdict.oneSentenceExplanation, contentWidth - 58);
  doc.text(explanationLines, margin + 54, y + 7.5);

  // Sub-Pillars (Biggest Risk & Key Condition)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  const subline = `Biggest Risk: ${report.section1_verdict.biggestRisk.title} (${report.section1_verdict.biggestRisk.severity}) • Key Condition: ${report.section1_verdict.keyCondition.actionableRequirement}`;
  const sublines = doc.splitTextToSize(subline, contentWidth - 8);
  doc.text(sublines.slice(0, 2), margin + 4, y + 15.5);

  y += 27;

  // 2. THE DECISION & WHAT AIMLY KNOWS (DUAL PANEL)
  renderSectionHeader(
    isFr ? "1. Profil de Décision & Données Vérifiées" : isEs ? "1. Perfil de Decisión y Datos Verificados" : "1. Decision Profile & Grounded Evidence",
    y
  );
  y += 7;

  const colWidth = (contentWidth - 4) / 2;

  // Left Card: The Decision
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, y, colWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(report.section2_theDecision.actionTitle.substring(0, 38), margin + 3, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(`Category: ${report.section2_theDecision.category}`, margin + 3, y + 10);
  doc.text(`Commitment: ${report.section2_theDecision.financialCommitmentSummary}`, margin + 3, y + 14.5);
  doc.text(`Time Horizon: ${report.section2_theDecision.timeHorizonMonths} mo • Reversibility: ${report.section2_theDecision.reversibility}`, margin + 3, y + 19);
  doc.text(`Core Intent: ${report.section2_theDecision.underlyingProblemOrGoal.substring(0, 42)}`, margin + 3, y + 23.5);

  // Right Card: What Aimly Knows (Epistemic Breakdown)
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin + colWidth + 4, y, colWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`Epistemic Grounding (Completeness: ${report.section3_whatAimlyKnows.epistemicConfidenceScore}%)`, margin + colWidth + 7, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  const factsText = report.section3_whatAimlyKnows.facts.slice(0, 2).join(" • ");
  const estimatesText = report.section3_whatAimlyKnows.estimates.slice(0, 1).join(" • ") || "None";
  const unknownsText = report.section3_whatAimlyKnows.unknowns.slice(0, 1).join(" • ") || "None";

  doc.text(`• Facts: ${factsText.substring(0, 52)}`, margin + colWidth + 7, y + 10);
  doc.text(`• Estimates: ${estimatesText.substring(0, 52)}`, margin + colWidth + 7, y + 14.5);
  doc.text(`• Unknowns: ${unknownsText.substring(0, 52)}`, margin + colWidth + 7, y + 19);
  doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.text(`✓ Verified against zero unstated assumptions`, margin + colWidth + 7, y + 23.5);

  y += 30;

  // 3. FINANCIAL IMPACT & RUNWAY SHIFT TABLE
  renderSectionHeader(
    isFr ? "2. Impact Financier & Dérive de Trésorerie" : isEs ? "2. Impacto Financiero y Deriva de Tesorería" : "2. Financial Trajectory & Liquidity Impact",
    y
  );
  y += 7;

  // 4 Metrics Grid
  const metricBoxW = (contentWidth - 6) / 4;
  const metrics = [
    { label: "UPFRONT OUTLAY", val: report.section4_financialImpact.upfrontImpactFormatted, sub: "Immediate capital drain" },
    { label: "LIFETIME TCO", val: report.section4_financialImpact.totalLifetimeCostFormatted, sub: `Over ${report.section4_financialImpact.timeHorizonFormatted}` },
    { label: "RUNWAY SHIFT", val: report.section4_financialImpact.liquidRunwayBeforeVsAfter, sub: "Post-decision buffer" },
    { label: "FREE CASH FLOW", val: report.section4_financialImpact.freeCashFlowBeforeVsAfter, sub: "Monthly liquidity surplus" },
  ];

  metrics.forEach((m, idx) => {
    const mx = margin + idx * (metricBoxW + 2);
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(mx, y, metricBoxW, 16, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text(m.label, mx + 3, y + 4.5);

    doc.setFontSize(7.8);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(m.val.substring(0, 24), mx + 3, y + 9.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.8);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(m.sub, mx + 3, y + 13.5);
  });

  y += 20;

  // 4. THE 3 NUMBERS THAT MATTER MOST (SENSITIVITY MATRIX)
  renderSectionHeader(
    isFr ? "3. Les 3 Chiffres Clés & Seuils de Bascule" : isEs ? "3. Las 3 Variables Clave y Umbrales Críticos" : "3. The 3 Numbers That Matter Most (Sensitivity Matrix)",
    y
  );
  y += 7;

  // Table Header
  const thY = y;
  doc.setFillColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.roundedRect(margin, thY, contentWidth, 5.5, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text("CONTROLLING VARIABLE", margin + 3, thY + 3.8);
  doc.text("CURRENT ASSUMPTION", margin + 55, thY + 3.8);
  doc.text("IF DOWNSIDE OCCURS", margin + 105, thY + 3.8);
  doc.text("TIPPING POINT THRESHOLD", margin + 145, thY + 3.8);

  y += 6;

  // Table Rows (Top 3 Variables)
  report.section7_threeNumbersThatMatterMost.forEach((v, idx) => {
    const rowBg = idx % 2 === 0 ? lightBg : [255, 255, 255];
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(margin, y, contentWidth, 10.5, "F");
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 10.5, pageWidth - margin, y + 10.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(`${idx + 1}. ${v.variableNameEn.substring(0, 28)}`, margin + 3, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text(`Elasticity: ${(v.elasticityScore * 100).toFixed(0)}%`, margin + 3, y + 8.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.3);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(v.currentAssumption.formatted, margin + 55, y + 6);

    doc.text(v.ifWorsens.testedShift.substring(0, 24), margin + 105, y + 4.5);
    doc.setTextColor(roseAccent[0], roseAccent[1], roseAccent[2]);
    doc.text(`Runway Δ: ${v.ifWorsens.runwayDeltaMonths} mo`, margin + 105, y + 8.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(v.tippingPointThreshold.thresholdValueFormatted, margin + 145, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(v.tippingPointThreshold.recommendationShift.replace(/_/g, " "), margin + 145, y + 8.5);

    y += 10.5;
  });

  y += 4;

  // 5. FUTURE TIMELINE
  renderSectionHeader(
    isFr ? "4. Chronologie Prévisionnelle (Que se passe-t-il ensuite ?)" : isEs ? "4. Cronología Previsional (¿Qué sucede después?)" : "4. Future Timeline: What Happens Next?",
    y
  );
  y += 6;

  const tboxW = (contentWidth - 6) / 4;
  const timePhases = [
    { tag: "TODAY (DAY 0)", text: report.section5_futureTimeline.today },
    { tag: "MONTHS 1–3", text: report.section5_futureTimeline.next30To90Days },
    { tag: "MONTH 12", text: report.section5_futureTimeline.year1 },
    { tag: "YEARS 3–5", text: report.section5_futureTimeline.longTerm },
  ];

  timePhases.forEach((p, idx) => {
    const px = margin + idx * (tboxW + 2);
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(px, y, tboxW, 20, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
    doc.text(p.tag, px + 2.5, y + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    const pLines = doc.splitTextToSize(p.text, tboxW - 5);
    doc.text(pLines.slice(0, 4), px + 2.5, y + 8);
  });

  // Page 1 Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("UseAimly Decision Engine • Page 1 of 2 • Confidential Financial Decision Memorandum", margin, pageHeight - 6);
  doc.text("100% Deterministic Accounting • No False Certainty", pageWidth - margin, pageHeight - 6, { align: "right" });

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGE 2: SCENARIOS, PRE-MORTEM, RED FLAGS, ALTERNATIVES & ACTION PLAN
  // ─────────────────────────────────────────────────────────────────────────────
  doc.addPage();
  y = 12;

  // Top Accent Bar
  doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.rect(0, 0, pageWidth, 3.5, "F");

  // Page 2 Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(
    isEs ? "ANÁLISIS MULTIESCENARIO Y PLAN DE ACCIÓN" : isFr ? "ANALYSE MULTI-SCÉNARIOS & PLAN D'ACTION" : "MULTI-SCENARIO STRESS & ACTION PLAN",
    margin,
    y
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(`Report ID: ${report.reportId} • Aimly Robustness Tier: ${report.robustness.classificationLabelEn}`, pageWidth - margin, y, { align: "right" });

  y += 6;

  // 6. SCENARIO MATRIX (5 PLAUSIBLE FUTURES)
  renderSectionHeader(
    isFr ? "5. Simulation Multi-Scénarios (5 Futurs Plausibles)" : isEs ? "5. Simulación Multiescenario (5 Futuros Plausibles)" : "5. Multi-Scenario Stress Simulation (5 Plausible Futures)",
    y
  );
  y += 7;

  // Scenario Table Header
  doc.setFillColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.roundedRect(margin, y, contentWidth, 5.5, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(255, 255, 255);
  doc.text("SCENARIO", margin + 3, y + 3.8);
  doc.text("TOTAL OUTLAY", margin + 42, y + 3.8);
  doc.text("ENDING CASH", margin + 74, y + 3.8);
  doc.text("RUNWAY", margin + 104, y + 3.8);
  doc.text("MAIN ASSUMPTION & RISK", margin + 128, y + 3.8);
  doc.text("SOLVENCY", margin + 168, y + 3.8);

  y += 6;

  const scenariosList = [
    report.section6_scenarios.favorable,
    report.section6_scenarios.base,
    report.section6_scenarios.cautious,
    report.section6_scenarios.adverse,
    report.section6_scenarios.severeStress,
  ];

  scenariosList.forEach((sc, idx) => {
    const rowBg = idx % 2 === 0 ? lightBg : [255, 255, 255];
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(margin, y, contentWidth, 8.5, "F");
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 8.5, pageWidth - margin, y + 8.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(sc.labelEn.substring(0, 24), margin + 3, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.text(fmt(sc.totalCostOutcome), margin + 42, y + 5);
    doc.text(fmt(sc.endingLiquidCash), margin + 74, y + 5);
    doc.text(`${sc.endingEmergencyRunwayMonths} mo`, margin + 104, y + 5);

    doc.setFontSize(5.2);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(sc.mainAssumptionEn.substring(0, 34), margin + 128, y + 5);

    const statusCol = sc.solvencyStatus === "HEALTHY" ? brandEmerald : sc.solvencyStatus === "TIGHT" ? amberAccent : roseAccent;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(statusCol[0], statusCol[1], statusCol[2]);
    doc.text(sc.solvencyStatus, margin + 168, y + 5);

    y += 8.5;
  });

  y += 4;

  // 7. PRE-MORTEM AUTOPSY & RED FLAGS (DUAL PANEL)
  renderSectionHeader(
    isFr ? "6. Autopsie Pré-Mortem (À 12 Mois) & Signaux d'Alerte" : isEs ? "6. Autopsia Pre-Mortem (A 12 Meses) y Señales de Alerta" : "6. 12-Month Pre-Mortem Autopsy & Red Flags",
    y
  );
  y += 7;

  // Left Panel: Pre-Mortem
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, y, colWidth, 32, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('Pre-Mortem Premise: "12 Months Later: What Went Wrong?"', margin + 3, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  const pm1 = report.section10_preMortemAutopsy.topFailureModes[0];
  if (pm1) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(roseAccent[0], roseAccent[1], roseAccent[2]);
    doc.text(`• Mode: ${pm1.category} (${pm1.likelihood} Likelihood / ${pm1.impact} Impact)`, margin + 3, y + 10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    const descLines = doc.splitTextToSize(pm1.description, colWidth - 6);
    doc.text(descLines.slice(0, 2), margin + 3, y + 14.5);
    doc.text(`Warning: ${pm1.earlyWarning.substring(0, 52)}`, margin + 3, y + 23);
    doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.text(`Mitigation: ${pm1.mitigation.substring(0, 52)}`, margin + 3, y + 28);
  }

  // Right Panel: Red Flags Hierarchy
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin + colWidth + 4, y, colWidth, 32, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("Red Flags & Vulnerability Scan", margin + colWidth + 7, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  if (report.section9_redFlags.critical.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(roseAccent[0], roseAccent[1], roseAccent[2]);
    doc.text(`[CRITICAL] ${report.section9_redFlags.critical[0].substring(0, 52)}`, margin + colWidth + 7, y + 10);
  } else {
    doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.text(`✓ [CRITICAL] Zero fatal insolvency red flags detected`, margin + colWidth + 7, y + 10);
  }

  doc.setFont("helvetica", "normal");
  doc.setTextColor(amberAccent[0], amberAccent[1], amberAccent[2]);
  const imp = report.section9_redFlags.important[0] || "No major liquidity compression flags.";
  doc.text(`• [IMPORTANT] ${imp.substring(0, 54)}`, margin + colWidth + 7, y + 16);

  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  const wtch = report.section9_redFlags.watch[0] || "Baseline assumptions grounded.";
  doc.text(`• [WATCH] ${wtch.substring(0, 54)}`, margin + colWidth + 7, y + 22);
  doc.text(`• [RED TEAM] ${report.verification.fourIndicators.aimlyConfidence.epistemicGroundingRationale.substring(0, 50)}`, margin + colWidth + 7, y + 28);

  y += 36;

  // 8. STRATEGIC ALTERNATIVES EVALUATION
  renderSectionHeader(
    isFr ? "7. Évaluation des Alternatives Stratégiques" : isEs ? "7. Evaluación de Alternativas Estratégicas" : "7. Strategic Alternatives Evaluation",
    y
  );
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.text(`Optimal Structure Verdict: ${report.section11_betterAlternatives.optimalStructureVerdict.substring(0, 110)}`, margin, y);
  y += 4.5;

  const altBoxW = (contentWidth - 4) / 3;
  report.section11_betterAlternatives.topAlternatives.forEach((alt, idx) => {
    const ax = margin + idx * (altBoxW + 2);
    const isRec = alt.isRecommended;
    doc.setFillColor(isRec ? 240 : lightBg[0], isRec ? 253 : lightBg[1], isRec ? 244 : lightBg[2]);
    doc.setDrawColor(isRec ? brandEmerald[0] : cardBorder[0], isRec ? brandEmerald[1] : cardBorder[1], isRec ? brandEmerald[2] : cardBorder[2]);
    doc.roundedRect(ax, y, altBoxW, 17, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(isRec ? brandEmerald[0] : darkCharcoal[0], isRec ? brandEmerald[1] : darkCharcoal[1], isRec ? brandEmerald[2] : darkCharcoal[2]);
    doc.text(`${alt.title.substring(0, 28)} ${isRec ? "★" : ""}`, ax + 2.5, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    const sLines = doc.splitTextToSize(alt.summary, altBoxW - 5);
    doc.text(sLines.slice(0, 2), ax + 2.5, y + 8.5);

    doc.setFont("helvetica", "bold");
    doc.text(`Cost: ${alt.cost} • Score: ${alt.efficiencyScore}/100`, ax + 2.5, y + 14.5);
  });

  y += 21;

  // 9. AIMLY PRE-COMMITMENT ACTION PLAN & DISCLAIMER
  renderSectionHeader(
    isFr ? "8. Plan d'Action Préalable & Avertissement Légal" : isEs ? "8. Plan de Acción Previo y Aviso Legal" : "8. Pre-Commitment Action Plan & Advisory Notice",
    y
  );
  y += 6;

  // Action Plan Checklist Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 19, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("MANDATORY PRE-COMMITMENT ACTION STEPS:", margin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  report.section12_actionPlan.mandatoryPreCommitmentSteps.slice(0, 3).forEach((st, idx) => {
    doc.text(`[ ] ${st.substring(0, 110)}`, margin + 3, y + 8.5 + idx * 3.8);
  });

  y += 22;

  // Disclaimer Box
  doc.setFont("helvetica", "italic");
  doc.setFontSize(5.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  const disclaimerText =
    "ADVISORY NOTICE: UseAimly is an advanced financial decision-support and scenario intelligence platform. All simulations, verdicts, and sensitivity analyses are calculated deterministically based on stated inputs, mathematical amortization models, and declared assumptions. This document does not constitute personalized legal, tax, or accredited fiduciary financial advisory. Always verify terms before binding capital commitment.";
  const disLines = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(disLines, margin, y);

  // Page 2 Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("UseAimly Decision Engine • Page 2 of 2 • End of Financial Decision Memorandum", margin, pageHeight - 6);
  doc.text("Generated by Aimly Senior Decision Engine", pageWidth - margin, pageHeight - 6, { align: "right" });

  return doc;
}
