import { describe, it, expect } from "vitest";
import { generateSeniorStrategistAssessment } from "@/lib/ai/senior-strategist-engine";
import { formatMonthYear, parseDate } from "@/lib/utils/date";

describe("Senior Wealth Strategist Intelligence Engine (30-Year Advisory Caliber)", () => {
  it("diagnoses structural deficit/burn-rate and provides a 3-phase stabilization roadmap", () => {
    const assessment = generateSeniorStrategistAssessment({
      currency: "USD",
      monthlyInflow: 108333,
      monthlyOutflow: 129000,
      monthlyFreeCashFlow: -24417,
      totalLiquidSavings: 205000,
      targetAmount: 500000,
      targetDate: "2028-12-31",
      destinationTitle: "Emergency fund",
    });

    expect(assessment.archetype).toBe("DEFICIT_BURN_RATE");
    expect(assessment.headlineVerdict).toContain("Burn Rate");
    expect(assessment.burnRateRunwayMonths).toBeCloseTo(8.4, 1);
    expect(assessment.masterStrategyParagraph).toContain("From a 30-year wealth architecture perspective");
    expect(assessment.masterStrategyParagraph).toContain("capital contraction");
    expect(assessment.masterStrategyParagraph).toContain("Emergency fund");
    expect(assessment.whatYouCanDo).toContain("Halt discretionary");
    expect(assessment.toStayOnTrack).toContain("Reclaim");
  });

  it("handles decision purchase simulations with precision and 30-year wisdom", () => {
    const assessment = generateSeniorStrategistAssessment({
      currency: "KES",
      monthlyInflow: 180000,
      monthlyOutflow: 112000,
      monthlyFreeCashFlow: 68000,
      totalLiquidSavings: 180000,
      targetAmount: 500000,
      targetDate: "2027-12-31",
      destinationTitle: "Start my business",
      delayInDays: 45,
      decisionContext: {
        title: "Smartphone Purchase",
        amount: 30000,
        isRecurring: false,
      },
    });

    expect(assessment.archetype).toBe("DECISION_PURCHASE_IMPACT");
    expect(assessment.headlineVerdict).toContain("+45 Days Delay");
    expect(assessment.masterStrategyParagraph).toContain("cash availability does not equal plan availability");
    expect(assessment.masterStrategyParagraph).toContain("Start my business");
  });

  it("generates pace shortfall acceleration recommendations", () => {
    const assessment = generateSeniorStrategistAssessment({
      currency: "EUR",
      monthlyInflow: 5000,
      monthlyOutflow: 3800,
      monthlyFreeCashFlow: 1200,
      totalLiquidSavings: 15000,
      targetAmount: 60000,
      targetDate: "2027-06-30",
      destinationTitle: "Down Payment",
      requiredMonthlySavings: 2500,
    });

    expect(assessment.archetype).toBe("TIGHT_MARGIN_SHORTFALL");
    expect(assessment.headlineVerdict).toContain("Pace Shortfall Detected");
    expect(assessment.masterStrategyParagraph).toContain("velocity gap");
    expect(assessment.masterStrategyParagraph).toContain("Down Payment");
  });

  it("handles date formatting safely without producing 'Invalid Date'", () => {
    expect(formatMonthYear("Trajectory does not arrive")).toBe("Pace Dependent");
    expect(formatMonthYear("Invalid Date")).toBe("Pace Dependent");
    expect(formatMonthYear(null)).toBe("Pace Dependent");
    expect(formatMonthYear("2027-12-31")).toContain("2027");
  });
});
