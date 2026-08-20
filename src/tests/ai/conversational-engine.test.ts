import { describe, it, expect } from "vitest";
import {
  getFinancialSummary,
  getDestinationStatus,
  getDebtSummary,
  getUpcomingCommitments,
  getRecentDecisions,
  getGoalConflicts,
  simulateDecision,
  buildConversationalContext,
} from "@/lib/ai/conversational-context";
import { ConversationalIntelligenceEngine } from "@/lib/ai/conversational-engine";

describe("Conversational Intelligence Layer", () => {
  it("builds structured financial context without raw database dumps", () => {
    const context = buildConversationalContext("KES");
    expect(context.profile.monthlyGrossIncome).toBe(180000);
    expect(context.profile.monthlyFreeCashFlow).toBeGreaterThan(0);
    expect(context.primaryDestination.title).toBe("Start my business");
    expect(context.debtSummary.totalBalance).toBeGreaterThan(0);
    expect(context.upcomingCommitments.length).toBeGreaterThan(0);
  });

  it("handles decision simulations in conversation (e.g. KES 12,000 spend)", async () => {
    const engine = new ConversationalIntelligenceEngine();
    const reply = await engine.processUserMessage("I want to spend KES 12,000 this weekend.", [], "KES");

    expect(reply.sender).toBe("Useaimly");
    expect(reply.content).toContain("KES 12,000");
    expect(reply.structuredCard).toBeDefined();
    expect(reply.structuredCard?.type).toBe("DECISION_SIMULATION");
    expect(reply.structuredCard?.verdict).toBe("SAFE");
  });

  it("answers destination velocity checks with deterministic milestones", async () => {
    const engine = new ConversationalIntelligenceEngine();
    const reply = await engine.processUserMessage("How is my business goal looking?", [], "KES");

    expect(reply.sender).toBe("Useaimly");
    expect(reply.content).toContain("Start my business");
    expect(reply.structuredCard?.type).toBe("DESTINATION_STATUS");
    expect(reply.structuredCard?.verdict).toBe("ON_TRACK");
  });

  it("answers debt and liability inquiries", async () => {
    const engine = new ConversationalIntelligenceEngine();
    const reply = await engine.processUserMessage("What is my current debt status?", [], "KES");

    expect(reply.sender).toBe("Useaimly");
    expect(reply.content).toContain("loan facility");
  });
});
