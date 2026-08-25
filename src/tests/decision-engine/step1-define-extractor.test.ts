import { describe, it, expect } from "vitest";
import {
  extractStructuredDecisionStep1,
  STEP1_DEFINE_SYSTEM_PROMPT,
} from "../../lib/decision-engine/step1-define-extractor";

describe("PROMPT 2: Step 1 Define — Structured Extraction & Epistemic Separation", () => {
  it("includes a strict AI system prompt requiring epistemic separation", () => {
    expect(STEP1_DEFINE_SYSTEM_PROMPT).toContain("Step1StructuredDecision");
    expect(STEP1_DEFINE_SYSTEM_PROMPT).toContain("NEVER just summarize");
    expect(STEP1_DEFINE_SYSTEM_PROMPT).toContain("INITIAL DECISION HYPOTHESIS");
  });

  it("extracts a laptop purchase decision with underlying problem, reversibility, and critical unknowns", () => {
    const res = extractStructuredDecisionStep1(
      "I am thinking of buying a $2,000 laptop for my business.",
      "BUY_SOMETHING",
      "USD"
    );

    expect(res.financialAmount.value).toBe(2000);
    expect(res.currency).toBe("USD");
    expect(res.commitmentType).toBe("UPFRONT_ONLY");
    expect(res.reversibilityLevel).toBe("MODERATELY_REVERSIBLE");
    expect(res.timeHorizon).toBe("MEDIUM_TERM");
    expect(res.underlyingProblem).toContain("computing hardware");
    expect(res.underlyingGoal).toContain("throughput");

    // Epistemic pillars
    expect(res.knownFacts.length).toBeGreaterThan(0);
    expect(res.possibleAssumptions.length).toBeGreaterThan(0);
    expect(res.criticalUnknownVariables.length).toBeGreaterThan(0);
    expect(res.criticalUnknownVariables.some((v) => v.toLowerCase().includes("warranty") || v.toLowerCase().includes("ancillary"))).toBe(true);
    expect(res.initialDecisionHypothesis).toContain("2,000");
  });

  it("handles estimated / approximated amounts properly", () => {
    const res = extractStructuredDecisionStep1(
      "I'm considering spending about 15k EUR on a new car",
      "BUY_A_CAR",
      "EUR"
    );

    expect(res.financialAmount.value).toBe(15000);
    expect(res.financialAmount.classification).toBe("USER_ESTIMATE");
    expect(res.financialAmount.isEstimate).toBe(true);
    expect(res.currency).toBe("EUR");
    expect(res.reversibilityLevel).toBe("COSTLY_TO_REVERSE");
    expect(res.timeHorizon).toBe("LONG_TERM");
    expect(res.criticalUnknownVariables.some((v) => v.toLowerCase().includes("insurance"))).toBe(true);
  });

  it("identifies recurring commitments and rent adjustments", () => {
    const res = extractStructuredDecisionStep1(
      "What happens if my rent increases by 1,800 USD per month?",
      "MOVE_HOME",
      "USD"
    );

    expect(res.commitmentType).toBe("RECURRING_ONLY");
    expect(res.recurringAmount.value).toBe(1800);
    expect(res.reversibilityLevel).toBe("COSTLY_TO_REVERSE");
    expect(res.initialDecisionHypothesis).toContain("1,800/month");
  });

  it("identifies loan borrowing facilities and interest rate unknowns", () => {
    const res = extractStructuredDecisionStep1(
      "What happens if I take a 10,000 USD loan with 1,000 down payment?",
      "TAKE_A_LOAN",
      "USD"
    );

    expect(res.commitmentType).toBe("DEBT_FINANCED");
    expect(res.reversibilityLevel).toBe("COSTLY_TO_REVERSE");
    expect(res.criticalUnknownVariables.some((v) => v.toLowerCase().includes("annual percentage rate") || v.toLowerCase().includes("apr"))).toBe(true);
  });
});
