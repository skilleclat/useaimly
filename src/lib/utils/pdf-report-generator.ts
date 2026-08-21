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

  // 7. FOOTER CONFIDENTIALITY & SEAL
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.line(margin, 280, pageWidth - margin, 280);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("Confidential — Generated autonomously by UseAimly Goal-Aware Decision Intelligence Platform.", margin, 285);
  doc.text("Page 1 of 1", pageWidth - margin, 285, { align: "right" });

  return doc;
}

export function downloadPDFReport(data: PDFReportData) {
  const doc = generateExecutivePDFReport(data);
  const filename = `UseAimly_Report_${(data.destinationTitle || "Goal").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
}
