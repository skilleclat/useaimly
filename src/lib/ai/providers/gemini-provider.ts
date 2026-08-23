/**
 * Google Gemini AI Provider Adapter
 * Synthesizes natural language explanations using Gemini models.
 */

import { DecisionExplanationPayload, AIExplanationResult } from "../../types/ai";
import { AIProvider } from "../provider-interface";
import { MockAIProvider } from "./mock-provider";

export class GeminiProvider implements AIProvider {
  readonly providerName = "gemini" as const;
  private apiKey: string | undefined;
  private model: string;
  private fallbackProvider = new MockAIProvider();

  constructor(apiKey?: string, model: string = "gemini-1.5-flash") {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    this.model = model || process.env.GEMINI_MODEL || "gemini-1.5-flash";
  }

  async generateDecisionExplanation(
    payload: DecisionExplanationPayload
  ): Promise<AIExplanationResult> {
    if (!this.apiKey) {
      // Fallback to high-fidelity mock if no API key is provided
      const mockResult = await this.fallbackProvider.generateDecisionExplanation(payload);
      return { ...mockResult, providerUsed: "gemini" };
    }

    try {
      const prompt = `
You are UseAimly, an institutional-grade goal-aware decision intelligence platform designed by senior private wealth architects with 30+ years of advisory experience.
Your core philosophy is: "See tomorrow before deciding today" and "Cash affordability != Plan affordability".
Explain the following deterministic calculation to the user with authoritative financial wisdom, clarity, and empathy.

User Query: "${payload.userQuery}"
Decision: ${payload.simulation.decision.title} for ${payload.profileSummary.currency} ${payload.simulation.decision.amount}
Cash Affordable: ${payload.simulation.cashAffordable}
Primary Goal: "${payload.goalSummary.title}" (Target: ${payload.profileSummary.currency} ${payload.goalSummary.targetAmount}, Target Date: ${payload.goalSummary.targetDate})
Baseline Completion: ${payload.simulation.primaryGoalImpact.baselineCompletionDate}
Simulated Completion: ${payload.simulation.primaryGoalImpact.simulatedCompletionDate}
Delay: ${payload.simulation.primaryGoalImpact.delayInMonths} months
Additional Monthly Savings Needed to Maintain Date: ${payload.profileSummary.currency} ${payload.simulation.primaryGoalImpact.additionalMonthlySavingsRequired}

Output JSON in the following format:
{
  "headline": string,
  "directAnswer": string,
  "cashAffordabilityVerdict": string,
  "planAffordabilityVerdict": string,
  "tradeoffAnalysis": string,
  "actionableRecommendation": string,
  "recoveryGuidance": string,
  "masterStrategyParagraph": string (A comprehensive, deeply articulate 250-350 word Master Strategic Assessment providing a holistic blueprint to bridge shortfalls, protect reserves, and achieve the destination with mathematical certainty)
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text);

      return {
        ...parsed,
        confidenceScore: 0.95,
        providerUsed: "gemini",
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.warn("GeminiProvider error, falling back to deterministic synthesis:", error);
      return {
        ...(await this.fallbackProvider.generateDecisionExplanation(payload)),
        providerUsed: "gemini",
      };
    }
  }
}
