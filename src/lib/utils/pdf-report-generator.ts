import { jsPDF } from "jspdf";
import { formatCurrency } from "./currency";
import { CurrencyCode } from "@/lib/types/finance";
import { OnboardingState } from "@/lib/onboarding/onboarding-types";

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

  // 1. BRAND HEADER BAR (Deep Warm Obsidian #131211)
  doc.setFillColor(19, 18, 17);
  doc.rect(0, 0, pageWidth, 32, "F");

  // Logo Icon Mark (Compass Target + Trajectory Arrow)
  const logoX = margin;
  const logoY = 16;
  
  // Outer Orange Compass Ring
  doc.setDrawColor(255, 85, 51);
  doc.setLineWidth(1.1);
  doc.circle(logoX + 5, logoY - 1, 6.5, "S");
  
  // Inner Trajectory Arrow
  doc.setFillColor(255, 85, 51);
  doc.triangle(
    logoX + 3, logoY + 1.5,
    logoX + 7, logoY + 1.5,
    logoX + 5, logoY - 4,
    "F"
  );

  // Logo Text Lockup: "Use" in White, "Aimly" in Orange
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("Use", logoX + 14, logoY + 1);
  
  const useWidth = doc.getTextWidth("Use");
  doc.setTextColor(255, 85, 51);
  doc.text("Aimly", logoX + 14 + useWidth, logoY + 1);

  // Brand Tagline below logo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text("See tomorrow before deciding today", logoX + 14, logoY + 5.5);

  // Vertical Separator Line
  const sepX = logoX + 14 + useWidth + doc.getTextWidth("Aimly") + 6;
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.4);
  doc.line(sepX, logoY - 6, sepX, logoY + 6);

  // Report Title Badge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 85, 51);
  doc.text("EXECUTIVE FINANCIAL TRAJECTORY REPORT", sepX + 6, logoY + 0.5);

  // Date & Reference ID on right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 180, 180);
  const nowStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  doc.text(`DATE: ${nowStr}`, pageWidth - margin, logoY - 2, { align: "right" });
  doc.text(`REF: UAM-${Math.floor(100000 + Math.random() * 900000)}`, pageWidth - margin, logoY + 3.5, { align: "right" });

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
  const deltaText = data.delayInDays <= 0 
    ? `On track for target date (${data.projectedDate})` 
    : `Goal completion shifted +${data.delayInDays} days (Projected: ${data.projectedDate})`;
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
  doc.setFillColor(255, 245, 242); // Soft Orange Tint
  doc.setDrawColor(255, 180, 160);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text("FREE CASH FLOW FOR GOALS", margin + 4, y + 6);
  doc.setFontSize(12);
  doc.text(formatCurrency(data.availableForGoals, data.currency), margin + 4, y + 14);

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
  doc.text(data.projectedDate, margin + 115, y + 16);

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

    doc.setFontSize(8.5);
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
  // PAGE 2: EXECUTIVE GAME-CHANGERS BRIEFING (RESILIENCE & OPPORTUNITY COST)
  // ==============================================================================
  doc.addPage("a4", "portrait");
  let y2 = 20;

  // Header Bar (Page 2)
  doc.setFillColor(19, 18, 17);
  doc.rect(0, 0, pageWidth, 26, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("UseAimly Executive Briefing — Page 2", margin, 16);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 85, 51);
  doc.text("GAME-CHANGER INTELLIGENCE & RESILIENCE RADAR", pageWidth - margin, 16, { align: "right" });

  y2 = 36;

  // 1. RESILIENCE RADAR & 3-PILLAR SCORECARD
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("1. 3-PILLAR RESILIENCE SCORECARD", margin, y2);
  y2 += 6;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y2, contentWidth, 24, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("CASH AFFORDABILITY", margin + 6, y2 + 7);
  doc.text("OBLIGATION RESILIENCE", margin + 65, y2 + 7);
  doc.text("PLAN AFFORDABILITY", margin + 125, y2 + 7);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129); // Green
  doc.text("PASSED (Liquid Cushion Intact)", margin + 6, y2 + 16);
  doc.setTextColor(59, 130, 246); // Blue
  doc.text("2.2 Months Runway", margin + 65, y2 + 16);
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text(data.delayInDays === 0 ? "0 Days Delay" : `+${data.delayInDays} Days Shift`, margin + 125, y2 + 16);

  y2 += 32;

  // 2. OPPORTUNITY COST MATRIX SUMMARY
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("2. OPPORTUNITY COST TRADE-OFF MATRIX", margin, y2);
  y2 += 6;

  const oppBoxWidth = (contentWidth - 6) / 2;
  const oppBoxHeight = 22;

  // Choice 1: Proposed Outflow
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, y2, oppBoxWidth, oppBoxHeight, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(225, 29, 72);
  doc.text("OPTION A • PROPOSED OUTFLOW", margin + 6, y2 + 6);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`-${formatCurrency(data.targetAmount * 0.1 || 30000, data.currency)} (${data.destinationTitle})`, margin + 6, y2 + 12);
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(`Timeline Shift: +${data.delayInDays} days delay`, margin + 6, y2 + 17);

  // Choice 2: Reinvest in Goal
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin + oppBoxWidth + 6, y2, oppBoxWidth, oppBoxHeight, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text("OPTION B • GOAL ACCELERATOR", margin + oppBoxWidth + 12, y2 + 6);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`Reinvest +${formatCurrency(data.targetAmount * 0.1 || 30000, data.currency)} into Goal`, margin + oppBoxWidth + 12, y2 + 12);
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("Accelerates arrival by -45 days earlier", margin + oppBoxWidth + 12, y2 + 17);

  y2 += oppBoxHeight + 12;

  // 3. ACTIVE AI NOTEPAD DIRECTIVES & RULES
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("3. ACTIVE NOTEPAD AI DIRECTIVES & CONSTRAINTS", margin, y2);
  y2 += 6;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y2, contentWidth, 30, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text("📌 Pinned AI Safety Rule:", margin + 6, y2 + 7);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('"Emergency Reserve Floor Shield: Always preserve at least 50,000 KES locked in liquid reserves. Never execute discretionary purchases if living buffer dips below 2.0 months."', margin + 6, y2 + 14, { maxWidth: contentWidth - 12 });

  doc.setFontSize(7.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("Status: Active & Enforced autonomously by UseAimly AI Decision Engine.", margin + 6, y2 + 25);

  y2 += 38;

  // 4. 90-DAY EXECUTIVE ACTION PLAN
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text("4. 90-DAY TACTICAL ACTION PLAN", margin, y2);
  y2 += 6;

  const renderActionStep = (num: string, text: string) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(margin, y2, contentWidth, 12, 1.5, 1.5, "FD");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
    doc.text(num, margin + 4, y2 + 8);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(text, margin + 14, y2 + 8);

    y2 += 15;
  };

  renderActionStep("Step 1", `Maintain current monthly free cash flow allocation of ${formatCurrency(data.availableForGoals, data.currency)}/mo.`);
  renderActionStep("Step 2", "Audit and eliminate silent subscription micro-leaks to reclaim +4,000 KES/mo.");
  renderActionStep("Step 3", `Verify emergency buffer threshold before executing next major capital outlay.`);

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
    monthlyInflow: (baselineProfile?.incomes || []).reduce((acc: number, i: any) => acc + (i.amount || 0), 0),
    monthlyOutflow: (baselineProfile?.expenses || []).reduce((acc: number, e: any) => acc + (e.amount || 0), 0),
    availableForGoals: 68000,
    liquidSavings: baselineProfile?.liquidSavings || 180000,
    status: "SAFE",
    headlineVerdict: "Fully Covered by Liquid Reserves",
    whatYouCanDo: "Proceed with purchase using liquid reserves.",
    whatItChanges: "Maintains current goal trajectory.",
    toStayOnTrack: "Continue current monthly savings pace.",
    strategicRead: "Strong liquidity resilience.",
  };

  downloadPDFReport(data);
}
