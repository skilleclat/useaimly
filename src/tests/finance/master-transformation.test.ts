import { describe, it, expect } from "vitest";
import {
  calculateMaxSafePrice,
  generateBetterAlternatives,
  runDecisionStressTest,
  saveDecisionRecord,
  reevaluateDecision,
  BaselineFinancialProfile,
} from "../../lib/finance";
import { parseOfferDocument } from "../../lib/nlp/document-offer-parser";

describe("Master Product Transformation Engine", () => {
  const sampleBaseline: BaselineFinancialProfile = {
    liquidSavings: 180000,
    incomes: [
      { name: "Salary", amount: 180000, frequency: "MONTHLY", reliability: "STABLE", isActive: true },
    ],
    expenses: [
      { name: "Living Expenses", amount: 112000, frequency: "MONTHLY", isFixed: true },
    ],
    debts: [],
    commitments: [],
    goals: [
      {
        id: "goal-1",
        title: "Home Deposit",
        targetAmount: 500000,
        currentAmount: 180000,
        targetDate: "2027-12-31",
        priority: "HIGH",
        status: "ACTIVE",
      },
    ],
  };

  it("1. Max Safe Price Engine calculates correct safety ceilings", () => {
    // Fixed expenses = 112,000 KES.
    // 3-month reserve floor = 336,000 KES.
    // 1.5-month reserve floor = 168,000 KES.
    // Liquid savings = 180,000 KES.
    // Comfortable lump sum = 0 KES (since savings < 3-month floor).
    // Absolute upper lump sum = 12,000 KES (180k - 168k).
    const bounds = calculateMaxSafePrice(sampleBaseline, 500000);

    expect(bounds.requestedPrice).toBe(500000);
    expect(bounds.comfortablePrice).toBe(0);
    expect(bounds.absoluteUpperPrice).toBe(12000);
    expect(bounds.verdict).toBe("EXCEEDS_UPPER");
    expect(bounds.explanation).toContain("exceeds your absolute safe upper limit");
  });

  it("2. Better Alternatives Engine generates 3 actionable safer choices", () => {
    const alternatives = generateBetterAlternatives(sampleBaseline, 500000, "Vehicle");

    expect(alternatives.length).toBe(3);

    const alt1 = alternatives.find((a) => a.id === "ALT_LOWER_PRICE");
    expect(alt1).toBeDefined();
    expect(alt1?.safetyRating).toBe("OPTIMAL");

    const alt2 = alternatives.find((a) => a.id === "ALT_STRUCTURED_PAYMENT");
    expect(alt2).toBeDefined();
    expect(alt2?.safetyRating).toBe("SAFE");

    const alt3 = alternatives.find((a) => a.id === "ALT_SAVE_FIRST");
    expect(alt3).toBeDefined();
    expect(alt3?.safetyRating).toBe("MANAGEABLE");
  });

  it("3. Decision Stress Test engine evaluates 5 adverse scenarios", () => {
    const stressTest = runDecisionStressTest(sampleBaseline, 200000, "Business Investment");

    expect(stressTest.scenarios.length).toBe(5);
    expect(stressTest.overallResilienceScore).toBeGreaterThanOrEqual(0);
    expect(stressTest.overallResilienceScore).toBeLessThanOrEqual(100);

    const baseScen = stressTest.scenarios.find((s) => s.scenarioId === "BASE");
    expect(baseScen).toBeDefined();

    const incDropScen = stressTest.scenarios.find((s) => s.scenarioId === "INCOME_DROP");
    expect(incDropScen).toBeDefined();

    const emergencyScen = stressTest.scenarios.find((s) => s.scenarioId === "EMERGENCY_EXPENSE");
    expect(emergencyScen).toBeDefined();
  });

  it("4. Document Offer Parser extracts structured financial terms with high confidence", () => {
    const sampleOffer = `
      CAR FINANCING QUOTE
      Vehicle Total Price: KES 650,000
      Deposit Required: KES 150,000
      Monthly Payment: KES 22,000
      Duration: 36 Months
    `;

    const parsed = parseOfferDocument(sampleOffer);



    expect(parsed.documentType).toBe("VEHICLE_FINANCING");
    expect(parsed.totalPrice).toBe(650000);
    expect(parsed.downPayment).toBe(150000);
    expect(parsed.monthlyPayment).toBe(22000);

    expect(parsed.termMonths).toBe(36);
    expect(parsed.requiresUserConfirmation).toBe(true);
  });

  it("5. Decision Memory re-evaluates decisions when baseline profile updates", () => {
    const record = saveDecisionRecord(sampleBaseline, "Laptop Purchase", 120000);

    expect(record.id).toBeDefined();
    expect(record.amount).toBe(120000);

    // Profile updates with higher savings
    const upgradedBaseline: BaselineFinancialProfile = {
      ...sampleBaseline,
      liquidSavings: 500000, // 500k savings protects reserve floor
    };

    const reeval = reevaluateDecision(record, upgradedBaseline);

    expect(reeval.updatedRecord.lastAnalyzedAt).toBeDefined();
    expect(reeval.statusShiftText).toBeDefined();
  });
});
