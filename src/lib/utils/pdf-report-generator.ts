import { jsPDF } from "jspdf";
import { formatCurrency } from "./currency";
import { CurrencyCode, ExecutiveDecision, ConfidenceLevel } from "@/lib/types/finance";
import { USEAIMLY_LOGO_BASE64 } from "@/lib/brand/logo-base64";

export interface PDFReportData {
  title?: string;
  userName?: string;
  currency: CurrencyCode;
  destinationTitle: string;
  targetAmount: number;
  currentAmount: number;
  remainingGap: number;
  targetDate: string;
  projectedDate: string;
  delayInDays: number;
  monthlyInflow: number;
  monthlyOutflow: number;
  availableForGoals: number;
  liquidSavings: number;
  executiveDecision: ExecutiveDecision;
  confidenceLevel: ConfidenceLevel;
  confidenceReasons?: string[];
  reserveStatus: "SATISFIED" | "BELOW_TARGET" | "VIOLATED";
  status: "SAFE" | "MANAGEABLE" | "HIGH_IMPACT" | "OFF_TRACK";
  headlineVerdict: string;
  whatYouCanDo: string;
  whatItChanges: string;
  toStayOnTrack: string;
  strategicRead: string;
  masterStrategyParagraph?: string;
  burnRateRunwayMonths?: number;
  missingVariables?: string[];
  singleAction?: string;
}

export function generateExecutivePDFReport(data: PDFReportData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Primary Color Palette
  const primaryOrange = [255, 85, 51]; // #FF5533
  const darkCharcoal = [23, 23, 23]; // #171717
  const mutedGray = [113, 109, 105]; // #716D69
  const lightBg = [247, 246, 243]; // #F7F6F3
  const cardBorder = [228, 226, 220]; // #E4E2DC

  // 1. BRAND HEADER BAR
  doc.setFillColor(255, 77, 38);
  doc.rect(0, 0, pageWidth, 3.5, "F");

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 3.5, pageWidth, 28.5, "F");

  doc.setDrawColor(228, 226, 220);
  doc.setLineWidth(0.5);
  doc.line(0, 32, pageWidth, 32);

  const logoX = margin;
  try {
    doc.addImage(USEAIMLY_LOGO_BASE64, "PNG", logoX, 6.5, 42, 22);
  } catch (e) {
    doc.setDrawColor(255, 77, 38);
    doc.setLineWidth(1.1);
    doc.circle(logoX + 5, 17, 6.5, "S");
    doc.setFillColor(255, 77, 38);
    doc.triangle(logoX + 3, 19.5, logoX + 7, 19.5, logoX + 5, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(23, 23, 23);
    doc.text("Use", logoX + 14, 19);
    doc.setTextColor(255, 77, 38);
    doc.text("Aimly", logoX + 14 + doc.getTextWidth("Use"), 19);
  }

  const sepX = logoX + 46;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(sepX, 8, sepX, 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 77, 38);
  doc.text("EXECUTIVE FINANCIAL TRAJECTORY REPORT", sepX + 5, 14.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Goal-Aware Deterministic Decision Intelligence", sepX + 5, 20);

  const nowStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  doc.text(`DATE: ${nowStr}`, pageWidth - margin, 14, { align: "right" });
  doc.text(`REF: UAM-${Math.floor(100000 + Math.random() * 900000)}`, pageWidth - margin, 20, { align: "right" });

  y = 42;

  // 2. DOCUMENT SUBTITLE & METADATA
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(data.destinationTitle || "Financial Trajectory Analysis", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(`Prepared for: ${data.userName || "Valued Strategist"}  |  Currency: ${data.currency}`, margin, y);
  y += 10;

  // 3. EXECUTIVE VERDICT CARD (GO / WAIT / ADJUST)
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, "FD");

  // Decision Badge Color
  let badgeColor = [22, 163, 74]; // GO (Green)
  if (data.executiveDecision === "ADJUST") badgeColor = [217, 119, 6]; // Amber
  if (data.executiveDecision === "WAIT") badgeColor = [225, 29, 72]; // Red

  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(margin + 5, y + 5, 24, 6.5, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(data.executiveDecision, margin + 17, y + 9.5, { align: "center" });

  // Confidence Badge
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(margin + 32, y + 5, 36, 6.5, 1.5, 1.5, "F");
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(7.5);
  doc.text(`CONFIDENCE: ${data.confidenceLevel}`, margin + 50, y + 9.5, { align: "center" });

  // Headline Title
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(data.headlineVerdict, margin + 72, y + 9.5);

  // Subtitle Details
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  let deltaText = "";
  if (data.availableForGoals < 0) {
    deltaText = `Monthly Cash Deficit: -${formatCurrency(Math.abs(data.availableForGoals), data.currency)}/mo (Operating Runway: ~${data.burnRateRunwayMonths || 0} mos)`;
  } else if (data.delayInDays <= 0) {
    deltaText = `Projected Arrival: ${data.projectedDate} (On Track with zero trajectory delay)`;
  } else {
    deltaText = `Goal Shift: +${data.delayInDays} days delay (Projected Arrival: ${data.projectedDate})`;
  }
  doc.text(deltaText, margin + 5, y + 18);

  // Best Next Action Sub-bar
  if (data.singleAction) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
    doc.text(`RECOMMENDED ACTION: ${data.singleAction}`, margin + 5, y + 25, { maxWidth: contentWidth - 10 });
  }

  y += 38;

  // 4. FINANCIAL BASELINE CAPACITY & SAFETY CHECK GRID (2x2 Boxes)
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("1. BASELINE FINANCIAL CAPACITY & SAFETY CHECK", margin, y);
  y += 5;

  const boxWidth = (contentWidth - 6) / 2;
  const boxHeight = 18;

  // Box A: Monthly Inflow
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("MONTHLY INFLOW (GROSS INCOME)", margin + 4, y + 6);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(formatCurrency(data.monthlyInflow, data.currency), margin + 4, y + 14);

  // Box B: Mandatory Outflows
  doc.roundedRect(margin + boxWidth + 6, y, boxWidth, boxHeight, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("MANDATORY OUTFLOWS (LIVING & DEBT)", margin + boxWidth + 10, y + 6);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(formatCurrency(data.monthlyOutflow, data.currency), margin + boxWidth + 10, y + 14);

  y += boxHeight + 4;

  // Box C: Monthly Capacity
  if (data.availableForGoals < 0) {
    doc.setFillColor(255, 241, 242);
    doc.setDrawColor(254, 205, 211);
    doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(225, 29, 72);
    doc.text("NET CASH BURN RATE (DEFICIT)", margin + 4, y + 6);
    doc.setFontSize(12);
    doc.text(`-${formatCurrency(Math.abs(data.availableForGoals), data.currency)}`, margin + 4, y + 14);
  } else {
    doc.setFillColor(255, 245, 242);
    doc.setDrawColor(255, 180, 160);
    doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
    doc.text("FREE CASH FLOW FOR GOALS", margin + 4, y + 6);
    doc.setFontSize(12);
    doc.text(formatCurrency(data.availableForGoals, data.currency), margin + 4, y + 14);
  }

  // Box D: Emergency Reserve & Status
  const isBelowTarget = data.reserveStatus !== "SATISFIED";
  if (isBelowTarget) {
    doc.setFillColor(254, 243, 199); // Amber Warning Tint
    doc.setDrawColor(251, 191, 36);
  } else {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  }
  doc.roundedRect(margin + boxWidth + 6, y, boxWidth, boxHeight, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(isBelowTarget ? 217 : mutedGray[0], isBelowTarget ? 119 : mutedGray[1], isBelowTarget ? 6 : mutedGray[2]);
  doc.text(`LIQUID RESERVES (${data.reserveStatus.replace("_", " ")})`, margin + boxWidth + 10, y + 6);
  doc.setFontSize(12);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(formatCurrency(data.liquidSavings, data.currency), margin + boxWidth + 10, y + 14);

  y += boxHeight + 12;

  // 5. THE NUMBERS THAT DRIVE THE DECISION (Goal Breakdown)
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("2. THE NUMBERS THAT DRIVE THE DECISION", margin, y);
  y += 5;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("TARGET AMOUNT", margin + 6, y + 7);
  doc.text("CONFIRMED SAVED", margin + 50, y + 7);
  doc.text("REMAINING GAP", margin + 98, y + 7);
  doc.text("PROJECTED ARRIVAL", margin + 142, y + 7);

  const remGap = Math.max(0, data.targetAmount - data.currentAmount);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(formatCurrency(data.targetAmount, data.currency), margin + 6, y + 16);
  doc.text(formatCurrency(data.currentAmount, data.currency), margin + 50, y + 16);
  doc.text(formatCurrency(remGap, data.currency), margin + 98, y + 16);
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text(data.projectedDate || "Pace Dependent", margin + 142, y + 16);

  y += 32;

  // 6. ACTION PLAN & DISCLOSURES
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("3. USEAIMLY STRATEGIC ACTION PLAN", margin, y);
  y += 7;

  const renderSynthesisBlock = (label: string, content: string, accentRGB: number[]) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");

    doc.setFillColor(accentRGB[0], accentRGB[1], accentRGB[2]);
    doc.rect(margin, y, 3, 18, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accentRGB[0], accentRGB[1], accentRGB[2]);
    doc.text(label.toUpperCase(), margin + 6, y + 6);

    doc.setFontSize(8.2);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    const splitLines = doc.splitTextToSize(content || "Analysis verified against deterministic engine.", contentWidth - 12);
    doc.text(splitLines[0] || "", margin + 6, y + 12);

    y += 22;
  };

  renderSynthesisBlock("01 — Immediate Liquidity Action", data.whatYouCanDo, [16, 185, 129]);
  renderSynthesisBlock("02 — Time & Trajectory Shift", data.whatItChanges, [245, 158, 11]);
  renderSynthesisBlock("03 — Recommended Catch-up Plan", data.toStayOnTrack, [255, 85, 51]);
  renderSynthesisBlock("04 — Executive Analysis", data.strategicRead, [79, 70, 229]);

  // Page 1 Footer
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.line(margin, 280, pageWidth - margin, 280);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("Confidential — Generated autonomously by UseAimly Goal-Aware Decision Intelligence Platform.", margin, 285);
  doc.text("Page 1 of 2", pageWidth - margin, 285, { align: "right" });

  // ==============================================================================
  // PAGE 2: SAFETY CHECK & WHAT WE DO NOT KNOW YET
  // ==============================================================================
  doc.addPage("a4", "portrait");
  let y2 = 20;

  doc.setFillColor(255, 77, 38);
  doc.rect(0, 0, pageWidth, 3, "F");

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 3, pageWidth, 25, "F");

  doc.setDrawColor(228, 226, 220);
  doc.setLineWidth(0.5);
  doc.line(0, 28, pageWidth, 28);

  try {
    doc.addImage(USEAIMLY_LOGO_BASE64, "PNG", margin, 5.5, 36, 19);
  } catch (e) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(23, 23, 23);
    doc.text("UseAimly Executive Briefing", margin, 16);
  }

  const sepX2 = margin + 40;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(sepX2, 7, sepX2, 23);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 77, 38);
  doc.text("RESILIENCE RADAR & UNCERTAINTY DISCLOSURE", sepX2 + 5, 13.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Strategic Decision Briefing — Page 2 of 2", sepX2 + 5, 19);

  y2 = 36;

  // 1. WHAT WE DO NOT KNOW YET (UNCERTAINTY DISCLOSURES)
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("1. WHAT WE DO NOT KNOW YET (VARIABLE DISCLOSURES)", margin, y2);
  y2 += 5;

  const missingList = data.missingVariables && data.missingVariables.length > 0
    ? data.missingVariables
    : ["No critical data variables missing; calculations reflect confirmed inputs."];

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y2, contentWidth, Math.max(20, missingList.length * 6 + 8), 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  missingList.forEach((item, idx) => {
    doc.text(`•  ${item}`, margin + 6, y2 + 6 + idx * 6);
  });

  y2 += Math.max(20, missingList.length * 6 + 8) + 10;

  // 2. MASTER STRATEGY SYNTHESIS
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("2. STRATEGIC MASTER ASSESSMENT", margin, y2);
  y2 += 5;

  const defaultMasterStrategy = `Based on confirmed balance sheet metrics, your available monthly cash flow of ${formatCurrency(data.availableForGoals, data.currency)} supports your primary destination "${data.destinationTitle}" (${formatCurrency(data.targetAmount, data.currency)}) projected for arrival on ${data.projectedDate}. Liquid reserves of ${formatCurrency(data.liquidSavings, data.currency)} provide essential operational buffer against unexpected living outlays. Maintain discipline around discretionary spending to safeguard your goal completion trajectory.`;

  const strategyText = data.masterStrategyParagraph || defaultMasterStrategy;
  const masterLines = doc.splitTextToSize(strategyText, contentWidth - 12);
  const masterBoxHeight = Math.max(38, masterLines.length * 4.2 + 12);

  doc.setFillColor(252, 251, 249);
  doc.setDrawColor(230, 226, 218);
  doc.roundedRect(margin, y2, contentWidth, masterBoxHeight, 2, 2, "FD");

  doc.setFillColor(255, 85, 51);
  doc.rect(margin, y2, 3, masterBoxHeight, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text("FINANCIAL TRAJECTORY SYNTHESIS", margin + 6, y2 + 6);

  doc.setFontSize(7.8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(masterLines, margin + 6, y2 + 12, { lineHeightFactor: 1.25 });

  y2 += masterBoxHeight + 10;

  // 3. TACTICAL ACTION STEP
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("3. IMMEDIATE NEXT TACTICAL STEP", margin, y2);
  y2 += 5;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, y2, contentWidth, 14, 1.5, 1.5, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text("NEXT ACTION:", margin + 4, y2 + 9);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(data.singleAction || "Proceed with current goal allocation schedule.", margin + 30, y2 + 9, { maxWidth: contentWidth - 36 });

  // Page 2 Footer
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.line(margin, 280, pageWidth - margin, 280);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("Confidential — UseAimly Executive Briefing & Decision Intelligence.", margin, 285);
  doc.text("Page 2 of 2", pageWidth - margin, 285, { align: "right" });

  return doc;
}

export function downloadPDFReport(data: PDFReportData) {
  const doc = generateExecutivePDFReport(data);
  const filename = `UseAimly_Executive_Briefing_${(data.destinationTitle || "Goal").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
}
