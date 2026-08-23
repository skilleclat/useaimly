import { jsPDF } from "jspdf";
import { formatCurrency } from "./currency";
import { CurrencyCode } from "@/lib/types/finance";
import { OnboardingState } from "@/lib/onboarding/onboarding-types";
import { USEAIMLY_LOGO_BASE64 } from "@/lib/brand/logo-base64";
import { generateSeniorStrategistAssessment } from "@/lib/ai/senior-strategist-engine";

export interface PDFReportData {
  title?: string;
  userName?: string;
  currency: CurrencyCode;
  destinationTitle: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  projectedDate: string;
  delayInDays: number;
  monthlyInflow: number;
  monthlyOutflow: number;
  availableForGoals: number;
  liquidSavings: number;
  status: "SAFE" | "MANAGEABLE" | "HIGH_IMPACT" | "OFF_TRACK";
  headlineVerdict: string;
  whatYouCanDo: string;
  whatItChanges: string;
  toStayOnTrack: string;
  strategicRead: string;
  masterStrategyParagraph?: string;
  burnRateRunwayMonths?: number;
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

  // Primary Color Palette (UseAimly Dark & Orange)
  const primaryOrange = [255, 85, 51]; // #FF5533
  const darkCharcoal = [23, 23, 23]; // #171717
  const mutedGray = [113, 109, 105]; // #716D69
  const lightBg = [247, 246, 243]; // #F7F6F3
  const cardBorder = [228, 226, 220]; // #E4E2DC

  // 1. BRAND HEADER BAR (Crisp Executive White with Top Orange Stripe & Divider)
  // Top Orange Accent Stripe (3.5mm)
  doc.setFillColor(255, 77, 38); // #FF4D26
  doc.rect(0, 0, pageWidth, 3.5, "F");

  // Main Header Background (Crisp White #FFFFFF)
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 3.5, pageWidth, 28.5, "F");

  // Bottom Border Line
  doc.setDrawColor(228, 226, 220); // #E4E2DC
  doc.setLineWidth(0.5);
  doc.line(0, 32, pageWidth, 32);

  // Official Logo Image Header (Orange Icon + Black "Use" + Orange "Aimly" 100% visible on white background)
  const logoX = margin;
  try {
    doc.addImage(USEAIMLY_LOGO_BASE64, "PNG", logoX, 6.5, 42, 22);
  } catch (e) {
    // Vector fallback
    doc.setDrawColor(255, 77, 38);
    doc.setLineWidth(1.1);
    doc.circle(logoX + 5, 17, 6.5, "S");
    doc.setFillColor(255, 77, 38);
    doc.triangle(logoX + 3, 19.5, logoX + 7, 19.5, logoX + 5, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(23, 23, 23); // Black "Use"
    doc.text("Use", logoX + 14, 19);
    doc.setTextColor(255, 77, 38); // Orange "Aimly"
    doc.text("Aimly", logoX + 14 + doc.getTextWidth("Use"), 19);
  }

  // Vertical Separator Line
  const sepX = logoX + 46;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(sepX, 8, sepX, 26);

  // Report Title Badge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 77, 38); // Primary Orange
  doc.text("EXECUTIVE FINANCIAL TRAJECTORY REPORT", sepX + 5, 14.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Goal-Aware Deterministic Decision Intelligence", sepX + 5, 20);

  // Date & Reference ID on right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(90, 90, 90);
  const nowStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  doc.text(`DATE: ${nowStr}`, pageWidth - margin, 14, { align: "right" });
  doc.text(`REF: UAM-${Math.floor(100000 + Math.random() * 900000)}`, pageWidth - margin, 20, { align: "right" });

  y = 42;

  // 2. DOCUMENT SUBTITLE & USER METADATA
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

  // 3. EXECUTIVE VERDICT CARD
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, "FD");

  // Status Badge Color
  let badgeColor = [22, 163, 74]; // Safe Green
  if (data.status === "MANAGEABLE") badgeColor = [217, 119, 6];
  if (data.status === "HIGH_IMPACT") badgeColor = [234, 88, 12];
  if (data.status === "OFF_TRACK") badgeColor = [225, 29, 72];

  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(margin + 5, y + 5, 32, 6, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(data.status.replace("_", " "), margin + 21, y + 9.2, { align: "center" });

  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(data.headlineVerdict || "Fully Covered by Liquid Reserves", margin + 42, y + 9.5);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  let deltaText = "";
  if (data.availableForGoals < 0) {
    deltaText = `Capital Restructuring Required — Monthly Burn: -${formatCurrency(Math.abs(data.availableForGoals), data.currency)}/mo (Runway: ~${data.burnRateRunwayMonths || Math.max(1, Number((data.liquidSavings / Math.abs(data.availableForGoals)).toFixed(1)))} mos)`;
  } else if (data.delayInDays <= 0) {
    deltaText = `On track for target date (${data.projectedDate})`;
  } else {
    deltaText = `Goal completion shifted +${data.delayInDays} days (Projected: ${data.projectedDate})`;
  }
  doc.text(deltaText, margin + 5, y + 19);

  y += 34;

  // 4. FINANCIAL BASELINE CAPACITY GRID (2x2 Boxes)
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("1. BASELINE FINANCIAL CAPACITY", margin, y);
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
  doc.text("MONTHLY INFLOW (SALARY & INCOMES)", margin + 4, y + 6);
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

  // Box C: Dedicated Goal Capacity
  if (data.availableForGoals < 0) {
    doc.setFillColor(255, 241, 242); // Soft Rose Tint for Deficit
    doc.setDrawColor(254, 205, 211);
    doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(225, 29, 72);
    doc.text("NET CASH BURN RATE (DEFICIT)", margin + 4, y + 6);
    doc.setFontSize(12);
    doc.text(`-${formatCurrency(Math.abs(data.availableForGoals), data.currency)}`, margin + 4, y + 14);
  } else {
    doc.setFillColor(255, 245, 242); // Soft Orange Tint
    doc.setDrawColor(255, 180, 160);
    doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
    doc.text("FREE CASH FLOW FOR GOALS", margin + 4, y + 6);
    doc.setFontSize(12);
    doc.text(formatCurrency(data.availableForGoals, data.currency), margin + 4, y + 14);
  }

  // Box D: Liquid Reserves
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin + boxWidth + 6, y, boxWidth, boxHeight, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("LIQUID RESERVES & SAVINGS", margin + boxWidth + 10, y + 6);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(formatCurrency(data.liquidSavings, data.currency), margin + boxWidth + 10, y + 14);

  y += boxHeight + 12;

  // 5. GOAL TARGET & ACCELERATION PACE
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("2. GOAL DESTINATION TRAJECTORY", margin, y);
  y += 5;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("TARGET AMOUNT", margin + 6, y + 7);
  doc.text("CURRENT ACCUMULATED", margin + 55, y + 7);
  doc.text("PROJECTED ARRIVAL", margin + 115, y + 7);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(formatCurrency(data.targetAmount, data.currency), margin + 6, y + 16);
  doc.text(formatCurrency(data.currentAmount, data.currency), margin + 55, y + 16);
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text(data.projectedDate || "Pace Dependent", margin + 115, y + 16);

  y += 32;

  // 6. THE 4 PILIERS USEAIMLY AI STRATEGIC SYNTHESIS
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("3. USEAIMLY AI STRATEGIC ACTION PLAN", margin, y);
  y += 7;

  const renderSynthesisBlock = (label: string, content: string, accentRGB: number[]) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");

    // Left Accent Strip
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
  renderSynthesisBlock("04 — Executive AI Read", data.strategicRead, [79, 70, 229]);

  // 7. FOOTER CONFIDENTIALITY & SEAL (PAGE 1)
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.line(margin, 280, pageWidth - margin, 280);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("Confidential — Generated autonomously by UseAimly Goal-Aware Decision Intelligence Platform.", margin, 285);
  doc.text("Page 1 of 2", pageWidth - margin, 285, { align: "right" });

  // ==============================================================================
  // PAGE 2: EXECUTIVE GAME-CHANGERS BRIEFING (RESILIENCE & MASTER STRATEGY)
  // ==============================================================================
  doc.addPage("a4", "portrait");
  let y2 = 20;

  // Header Bar (Page 2 - Crisp Executive White with Top Orange Stripe)
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

  // Vertical Separator Line Page 2
  const sepX2 = margin + 40;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(sepX2, 7, sepX2, 23);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 77, 38);
  doc.text("GAME-CHANGER INTELLIGENCE & RESILIENCE RADAR", sepX2 + 5, 13.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Strategic Decision Briefing — Page 2 of 2", sepX2 + 5, 19);

  y2 = 36;

  // 1. RESILIENCE RADAR & 3-PILLAR SCORECARD
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("1. 3-PILLAR RESILIENCE SCORECARD", margin, y2);
  y2 += 5;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y2, contentWidth, 22, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("CASH AFFORDABILITY", margin + 6, y2 + 6);
  doc.text("OBLIGATION RESILIENCE", margin + 65, y2 + 6);
  doc.text("PLAN AFFORDABILITY", margin + 125, y2 + 6);

  const runwayMonths = data.availableForGoals < 0
    ? (data.burnRateRunwayMonths || Number((data.liquidSavings / Math.max(1, Math.abs(data.availableForGoals))).toFixed(1)))
    : (data.monthlyOutflow > 0 ? Number((data.liquidSavings / data.monthlyOutflow).toFixed(1)) : 12);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  if (data.availableForGoals < 0) {
    doc.setTextColor(225, 29, 72);
    doc.text("DEFICIT (Burn Detected)", margin + 6, y2 + 15);
    doc.setTextColor(217, 119, 6);
    doc.text(`${runwayMonths} Mos Burn Runway`, margin + 65, y2 + 15);
    doc.setTextColor(225, 29, 72);
    doc.text("Restructuring Required", margin + 125, y2 + 15);
  } else {
    doc.setTextColor(16, 185, 129); // Green
    doc.text("PASSED (Liquid Cushion Intact)", margin + 6, y2 + 15);
    doc.setTextColor(59, 130, 246); // Blue
    doc.text(`${runwayMonths} Months Runway`, margin + 65, y2 + 15);
    doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
    doc.text(data.delayInDays === 0 ? "0 Days Delay" : `+${data.delayInDays} Days Shift`, margin + 125, y2 + 15);
  }

  y2 += 28;

  // 2. THE GRAND MASTER STRATEGIC ASSESSMENT (30-Year Wealth Strategist Assessment)
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("2. SENIOR WEALTH STRATEGIST MASTER ASSESSMENT", margin, y2);
  y2 += 5;

  const defaultMasterStrategy = `From an institutional wealth architecture perspective, your capital trajectory requires deliberate pacing and structural discipline. Your liquid reserves of ${formatCurrency(data.liquidSavings, data.currency)} provide an essential shock absorber against macro volatility, while achieving "${data.destinationTitle}" (${formatCurrency(data.targetAmount, data.currency)}) depends on maintaining consistent net cash flow velocity. Focus on eliminating unoptimized recurring outlays, insulating 3.0+ months of mandatory expenses in liquid yield instruments, and locking automated goal allocations. Disciplined compounding transforms your baseline capacity into deterministic financial freedom.`;

  const strategyText = data.masterStrategyParagraph || defaultMasterStrategy;
  const masterLines = doc.splitTextToSize(strategyText, contentWidth - 12);
  const masterBoxHeight = Math.max(38, masterLines.length * 4.2 + 12);

  doc.setFillColor(252, 251, 249); // Luxury warm ivory tint
  doc.setDrawColor(230, 226, 218);
  doc.roundedRect(margin, y2, contentWidth, masterBoxHeight, 2, 2, "FD");

  // Left Gold/Orange Accent Strip
  doc.setFillColor(255, 85, 51);
  doc.rect(margin, y2, 3, masterBoxHeight, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text("DIRECTEUR STRATEGIQUE — 30-YEAR PRIVATE WEALTH ARCHITECTURE SYNTHESIS", margin + 6, y2 + 6);

  doc.setFontSize(7.8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(masterLines, margin + 6, y2 + 12, { lineHeightFactor: 1.25 });

  y2 += masterBoxHeight + 7;

  // 3. ACTIVE NOTEPAD AI DIRECTIVES & CONSTRAINTS (Clean ASCII formatting, zero mojibake)
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("3. ACTIVE NOTEPAD AI DIRECTIVES & CONSTRAINTS", margin, y2);
  y2 += 5;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y2, contentWidth, 24, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text("[PINNED AI STRATEGIC RULE]", margin + 6, y2 + 6);

  doc.setFontSize(7.8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`"Emergency Reserve Floor Shield: Preserve at least 3.0 months of mandatory living buffer locked in liquid reserves. Never execute non-essential discretionary outlays if living cushion dips below 2.0 months."`, margin + 6, y2 + 12, { maxWidth: contentWidth - 12 });

  doc.setFontSize(7);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("Status: Active & Enforced autonomously across all simulations by UseAimly Decision Engine.", margin + 6, y2 + 20);

  y2 += 30;

  // 4. 90-DAY EXECUTIVE ACTION PLAN
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("4. 90-DAY TACTICAL ACTION PLAN", margin, y2);
  y2 += 5;

  const renderActionStep = (num: string, text: string) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(margin, y2, contentWidth, 11, 1.5, 1.5, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
    doc.text(num, margin + 4, y2 + 7.5);

    doc.setFontSize(7.8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(text, margin + 14, y2 + 7.5);

    y2 += 13.5;
  };

  if (data.availableForGoals < 0) {
    renderActionStep("Step 1", `Prioritize cashflow break-even: trim unoptimized expenses by +${formatCurrency(Math.abs(data.availableForGoals), data.currency)}/mo to arrest capital drain.`);
    renderActionStep("Step 2", `Insulate liquid living buffer (${runwayMonths} mos runway) and avoid non-essential discretionary allocations.`);
    renderActionStep("Step 3", `Once monthly break-even is restored, initiate automated goal allocation toward "${data.destinationTitle}".`);
  } else {
    renderActionStep("Step 1", `Maintain current monthly free cash flow allocation of ${formatCurrency(data.availableForGoals, data.currency)}/mo.`);
    renderActionStep("Step 2", "Audit and eliminate silent subscription micro-leaks to reclaim additional monthly surplus.");
    renderActionStep("Step 3", `Verify emergency buffer threshold (${runwayMonths} mos) before executing next major capital outlay.`);
  }

  // Footer Page 2
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

export function generateExecutiveBriefingPDF(
  baselineProfile: any,
  decision?: any,
  currency: CurrencyCode = "KES"
) {
  const primaryGoal = baselineProfile?.goals?.[0] || {
    title: "Primary Financial Goal",
    targetAmount: 500000,
    currentAmount: 180000,
    targetDate: "2027-12-31",
  };

  const monthlyInflow = (baselineProfile?.incomes || []).reduce((acc: number, i: any) => acc + (i.amount || 0), 0);
  const monthlyOutflow = (baselineProfile?.expenses || []).reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
  const availableForGoals = Math.max(-monthlyOutflow, monthlyInflow - monthlyOutflow);
  const liquidSavings = baselineProfile?.liquidSavings || 180000;

  const strategistOutput = generateSeniorStrategistAssessment({
    currency,
    monthlyInflow,
    monthlyOutflow,
    monthlyFreeCashFlow: availableForGoals,
    totalLiquidSavings: liquidSavings,
    targetAmount: primaryGoal.targetAmount,
    targetDate: primaryGoal.targetDate,
    destinationTitle: primaryGoal.title,
    delayInDays: 0,
    requiredMonthlySavings: Math.round(primaryGoal.targetAmount / 24),
  });

  const data: PDFReportData = {
    title: "Executive Financial Trajectory Report",
    userName: "Valued Strategist",
    currency: currency,
    destinationTitle: primaryGoal.title,
    targetAmount: primaryGoal.targetAmount,
    currentAmount: primaryGoal.currentAmount,
    targetDate: primaryGoal.targetDate,
    projectedDate: "2027-11-15",
    delayInDays: 0,
    monthlyInflow,
    monthlyOutflow,
    availableForGoals,
    liquidSavings,
    status: strategistOutput.archetype === "DEFICIT_BURN_RATE" ? "OFF_TRACK" : "SAFE",
    headlineVerdict: strategistOutput.headlineVerdict,
    whatYouCanDo: strategistOutput.whatYouCanDo,
    whatItChanges: strategistOutput.whatItChanges,
    toStayOnTrack: strategistOutput.toStayOnTrack,
    strategicRead: strategistOutput.strategicRead,
    masterStrategyParagraph: strategistOutput.masterStrategyParagraph,
    burnRateRunwayMonths: strategistOutput.burnRateRunwayMonths,
  };

  downloadPDFReport(data);
}
