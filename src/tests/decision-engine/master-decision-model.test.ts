import { describe, it, expect } from "vitest";
import {
  createFact,
  createUserProvided,
  createUserEstimate,
  createAssumption,
  createDerived,
  createExternalData,
  createUnknown,
  createBlankDecisionIntelligenceObject,
  DecisionIntelligenceObject,
} from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 1: Master Decision Intelligence Object & Epistemic Classification Architecture", () => {
  describe("Group B: Information Source Classification & Epistemic Factories", () => {
    it("creates a VERIFIED_FACT with 1.0 confidence and fact tags", () => {
      const fact = createFact(5000, "Bank statement 2026-08-01");
      expect(fact.classification).toBe("VERIFIED_FACT");
      expect(fact.confidenceLevel).toBe(1.0);
      expect(fact.isUnknown).toBe(false);
      expect(fact.isEstimate).toBe(false);
      expect(fact.sourceNotes).toBe("Bank statement 2026-08-01");
      expect(fact.lastVerifiedAt).toBeDefined();
    });

    it("creates a USER_PROVIDED with 0.9 confidence", () => {
      const item = createUserProvided("Laptop for design work", "User form field");
      expect(item.classification).toBe("USER_PROVIDED");
      expect(item.confidenceLevel).toBe(0.9);
      expect(item.isUnknown).toBe(false);
      expect(item.isEstimate).toBe(false);
    });

    it("creates a USER_ESTIMATE with bounded confidence and estimate flag", () => {
      const estimate = createUserEstimate(12000, 0.65, "Anticipated client bonus");
      expect(estimate.classification).toBe("USER_ESTIMATE");
      expect(estimate.confidenceLevel).toBe(0.65);
      expect(estimate.isEstimate).toBe(true);
      expect(estimate.isUnknown).toBe(false);
    });

    it("creates an ASSUMPTION with proper tags", () => {
      const assumption = createAssumption(8.5, "Standard auto loan APR in region", 0.5);
      expect(assumption.classification).toBe("ASSUMPTION");
      expect(assumption.confidenceLevel).toBe(0.5);
      expect(assumption.isEstimate).toBe(true);
    });

    it("creates a DERIVED_CALCULATION with 1.0 confidence", () => {
      const derived = createDerived(345.67, "Exact annuity formula result");
      expect(derived.classification).toBe("DERIVED_CALCULATION");
      expect(derived.confidenceLevel).toBe(1.0);
    });

    it("creates an UNKNOWN with 0.0 confidence and isUnknown flag", () => {
      const unknownVal = createUnknown(0, "Insurance quote pending");
      expect(unknownVal.classification).toBe("UNKNOWN");
      expect(unknownVal.confidenceLevel).toBe(0.0);
      expect(unknownVal.isUnknown).toBe(true);
    });
  });

  describe("Master Decision Intelligence Object Structure (Groups A to G)", () => {
    let obj: DecisionIntelligenceObject;

    it("initializes a valid Decision Intelligence Object spanning all required sections", () => {
      obj = createBlankDecisionIntelligenceObject({
        category: "BUY_A_CAR",
        action: "Purchase certified pre-owned sedan",
        currency: "USD",
        locale: "en",
      });

      expect(obj.version).toBe("1.0.0");
      expect(obj.stage).toBe(1);

      // Section A: Decision Definition
      expect(obj.definition.decision_id).toMatch(/^aimly-dec-/);
      expect(obj.definition.decision_category).toBe("BUY_A_CAR");
      expect(obj.definition.proposed_action).toBe("Purchase certified pre-owned sedan");
      expect(obj.definition.financial_amount.value).toBe(2000);
      expect(obj.definition.currency).toBe("USD");
      expect(obj.definition.decision_time_horizon).toBe("SHORT_TERM");
      expect(obj.definition.reversibility_level).toBe("MODERATELY_REVERSIBLE");

      // Section C: Financial Context
      expect(obj.context.available_cash.value).toBe(4840);
      expect(obj.context.available_cash.classification).toBe("VERIFIED_FACT");
      expect(obj.context.monthly_income.value).toBe(4500);
      expect(obj.context.essential_expenses.value).toBe(2300);
      expect(obj.context.income_stability.value).toBe("HIGHLY_STABLE");
      expect(obj.context.currency_exposure.value.primaryCurrency).toBe("USD");

      // Section D: Decision Economics
      expect(obj.economics.upfront_cost.value).toBe(2000);
      expect(obj.economics.interest_rate.classification).toBe("ASSUMPTION");
      expect(obj.economics.maintenance.classification).toBe("UNKNOWN");

      // Section E: Decision Priorities
      expect(obj.priorities.liquidity_preservation).toBeGreaterThan(0);
      expect(obj.priorities.downside_protection).toBeGreaterThan(0);
      expect(obj.priorities.primary_priority_code).toBe("PROTECT_CASH");

      // Section F: Analysis Results container
      expect(obj.analysis).toBeDefined();

      // Section G: Confidence and Quality
      expect(obj.confidence.data_completeness).toBe(75);
      expect(obj.confidence.data_quality).toBe(80);
      expect(obj.confidence.outcome_uncertainty).toBe(20);
      expect(obj.confidence.decision_robustness).toBe(85);
      expect(obj.confidence.analysis_confidence).toBe(90);
      expect(obj.confidence.recommendation_confidence).toBe(85);
      expect(obj.confidence.audit.factCount).toBeGreaterThan(0);
      expect(obj.confidence.audit.unknownCount).toBeGreaterThan(0);
    });

    it("supports attaching structured analysis results without schema breakage", () => {
      obj = createBlankDecisionIntelligenceObject();

      obj.analysis.cash_flow_analysis = {
        baselineMonthlyNetInflow: 4500,
        baselineFreeCashFlow: 1800,
        postDecisionMonthlyOutflows: 2500,
        postDecisionFreeCashFlow: 1600,
        deltaFreeCashFlow: -200,
        fcfBurnRatePercentage: 11.1,
        monthsOfSurplusRemaining: 24,
        isCashFlowNegative: false,
      };

      obj.analysis.affordability_analysis = {
        isCashAffordableImmediately: true,
        isMonthlyAffordable: true,
        endingReservesAfterUpfront: 2840,
        postDecisionRunwayMonths: 3.8,
        runwayMonthsLost: 0.7,
        meetsEmergencyBufferStandard: true,
        affordabilityStatus: "COMFORTABLY_AFFORDABLE",
      };

      obj.analysis.pre_mortem = {
        headline: "Key risks that could derail this purchase",
        potentialFailureScenarios: [
          {
            failureMode: "Unplanned repair cost surge",
            likelihood: "MEDIUM",
            severity: "MODERATE",
            rootCause: "Out of warranty electronics failure",
            earlyWarningSignal: "Diagnostic warning light",
            preventionTactic: "Set aside dedicated $500 repair reserve upfront",
          },
        ],
      };

      expect(obj.analysis.cash_flow_analysis.postDecisionFreeCashFlow).toBe(1600);
      expect(obj.analysis.affordability_analysis.meetsEmergencyBufferStandard).toBe(true);
      expect(obj.analysis.pre_mortem.potentialFailureScenarios).toHaveLength(1);
    });
  });
});
