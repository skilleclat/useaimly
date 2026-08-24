import { jsPDF } from "jspdf";
import { AimlyIntelligenceReport } from "../types/document-intelligence";
import { formatCurrency } from "../utils/currency";
import { USEAIMLY_LOGO_BASE64 } from "../brand/logo-base64";

export function generateAimlyDecisionPDF(report: AimlyIntelligenceReport, language: "fr" | "en" = "en"): jsPDF {
  const isFr = language === "fr";
  const {
    currency,
    whatThisMeansForYou,
    theBigPicture,
    score,
    whatMattersMost,
    financialImpact,
    whatMightIBeMissing,
    scenarios,
    comparison,
    context,
  } = report;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  // Primary Palette
  const brandEmerald = [0, 168, 89]; // #00A859
  const darkCharcoal = [15, 23, 42]; // #0F172A
  const mutedGray = [100, 116, 139]; // #64748B
  const lightBg = [248, 250, 252]; // #F8FAFC
  const borderGray = [226, 232, 240]; // #E2E8F0

  // 1. TOP ACCENT BAR
  doc.setFillColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.rect(0, 0, pageWidth, 4, "F");

  // 2. HEADER
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 4, pageWidth, 26, "F");

  try {
    doc.addImage(USEAIMLY_LOGO_BASE64, "PNG", margin, 7, 36, 18);
  } catch (e) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text("UseAimly", margin, 18);
  }

  const titleX = margin + 42;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(titleX, 8, titleX, 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.text(
    isFr ? "RAPPORT D'INTELLIGENCE DÉCISIONNELLE DOCUMENTAIRE" : "AI DOCUMENT & DECISION INTELLIGENCE REPORT",
    titleX + 4,
    14
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(
    `${isFr ? "Généré le" : "Generated"}: ${new Date().toLocaleDateString(isFr ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })} • ${context.documents[0]?.name || "Attached Quote/Contract"}`,
    titleX + 4,
    20
  );

  y = 35;

  // 3. EXECUTIVE VERDICT & SCORE HERO CARD
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, "FD");

  // Score Badge
  const scoreBoxWidth = 38;
  const scoreBoxX = margin + contentWidth - scoreBoxWidth - 4;
  doc.setFillColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.roundedRect(scoreBoxX, y + 4, scoreBoxWidth, 30, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(isFr ? "AIMLY SCORE" : "AIMLY SCORE", scoreBoxX + scoreBoxWidth / 2, y + 11, { align: "center" });

  doc.setFontSize(16);
  doc.text(`${score.overallScore}/100`, scoreBoxX + scoreBoxWidth / 2, y + 21, { align: "center" });

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(score.status.replace(/_/g, " "), scoreBoxX + scoreBoxWidth / 2, y + 28, { align: "center" });

  // Verdict Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.text(isFr ? "CE QUE CELA SIGNIFIE POUR VOUS :" : "WHAT THIS MEANS FOR YOU:", margin + 4, y + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const verdictLines = doc.splitTextToSize(whatThisMeansForYou, contentWidth - scoreBoxWidth - 12);
  doc.text(verdictLines.slice(0, 2), margin + 4, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  const bigPictureLines = doc.splitTextToSize(theBigPicture, contentWidth - scoreBoxWidth - 12);
  doc.text(bigPictureLines.slice(0, 2), margin + 4, y + 27);

  y += 44;

  // 4. WHAT MATTERS MOST (4 KEY HIGHLIGHT BLOCKS)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(isFr ? "ÉLÉMENTS CLÉS & ENGAGEMENTS CONTRACTUELS" : "WHAT MATTERS MOST & KEY COMMITMENTS", margin, y);
  y += 4;

  const cardW = (contentWidth - 6) / 2;
  const cardH = 22;

  whatMattersMost.slice(0, 4).forEach((card, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = margin + col * (cardW + 6);
    const cy = y + row * (cardH + 4);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(cx, cy, cardW, cardH, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text(card.title.toUpperCase(), cx + 3, cy + 5.5);

    doc.setFontSize(10);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(card.value, cx + 3, cy + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    const sub = doc.splitTextToSize(card.subtext, cardW - 6);
    doc.text(sub[0] || "", cx + 3, cy + 17.5);
  });

  y += 2 * (cardH + 4) + 4;

  // 5. DETAILED FINANCIAL IMPACT TABLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(isFr ? "DÉCOMPOSITION DÉTERMINISTE DE L'IMPACT FINANCIER" : "DETERMINISTIC FINANCIAL IMPACT BREAKDOWN", margin, y);
  y += 4;

  const tableData = [
    [
      isFr ? "1. Apport Initial Requis" : "1. Upfront Cash Required",
      formatCurrency(financialImpact.immediateAmount, currency),
      financialImpact.immediateImpact,
    ],
    [
      isFr ? "2. Mensualité de Remboursement" : "2. Monthly Payment Obligation",
      `${formatCurrency(financialImpact.monthlyAmount, currency)}/mo`,
      financialImpact.monthlyImpact,
    ],
    [
      isFr ? "3. Engagement Total sur la Durée" : "3. Total Lifetime Commitment",
      formatCurrency(financialImpact.totalCommitmentAmount, currency),
      financialImpact.longTermImpact,
    ],
    [
      isFr ? "4. Matelas de Sécurité Restant" : "4. Remaining Reserve Cushion",
      `${context.calculations.reserveFloorMonthsAfter} ${isFr ? "Mois" : "Months"}`,
      financialImpact.flexibilityImpact,
    ],
  ];

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(isFr ? "MÉTRIQUE" : "METRIC", margin + 3, y + 4.5);
  doc.text(isFr ? "MONTANT" : "AMOUNT", margin + 65, y + 4.5);
  doc.text(isFr ? "ANALYSE D'IMPACT DÉTERMINISTE" : "DETERMINISTIC IMPACT ANALYSIS", margin + 110, y + 4.5);
  y += 6;

  tableData.forEach((row) => {
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(margin, y, margin + contentWidth, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(row[0], margin + 3, y + 4.5);
    doc.text(row[1], margin + 65, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    const wrapped = doc.splitTextToSize(row[2], contentWidth - 115);
    doc.text(wrapped[0] || "", margin + 110, y + 4.5);

    y += 7;
  });

  y += 4;

  // 6. WHAT MIGHT I BE MISSING (QUESTIONS TO ASK & RISKS)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(isFr ? "🔍 QUE POURRAIS-JE OUBLIER ? (QUESTIONS CRITIQUES AVANT DE SIGNER)" : "🔍 WHAT MIGHT I BE MISSING? (CRITICAL QUESTIONS TO ASK)", margin, y);
  y += 4;

  whatMightIBeMissing.questionsToAsk.slice(0, 3).forEach((q, i) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(245, 158, 11); // Amber border
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(`${q.number}. ${q.question}`, margin + 3, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    const why = doc.splitTextToSize(`${isFr ? "Pourquoi c'est vital" : "Why it matters"}: ${q.whyItMatters}`, contentWidth - 6);
    doc.text(why[0] || "", margin + 3, y + 10);

    y += 16;
  });

  // FOOTER
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(margin, 282, margin + contentWidth, 282);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("UseAimly — See tomorrow before deciding today • 100% Deterministic Financial Intelligence", margin, 287);
  doc.text("Page 1 / 1", margin + contentWidth, 287, { align: "right" });

  return doc;
}
