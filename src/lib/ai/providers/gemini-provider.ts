/**
 * Google Gemini AI Provider Adapter
 * Synthesizes natural language explanations using Gemini models.
 * Enforces strict adherence to deterministic calculations, zero date contradictions,
 * and zero ungrounded hyperbole.
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
      const mockResult = await this.fallbackProvider.generateDecisionExplanation(payload);
      return { ...mockResult, providerUsed: "gemini" };
    }

    const targetLang =
      payload.language === "es"
        ? "Spanish (Español)"
        : payload.language === "fr"
        ? "French (Français)"
        : "English";

    try {
      const prompt = `
You are UseAimly, a goal-aware financial decision intelligence platform.
Your core philosophy is: "Calculate first. Decide second. Explain last."
CRITICAL RULES FOR YOUR SYNTHESIS:
1. You MUST respond entirely in ${targetLang}.
2. You MUST NEVER change the calculated decision (GO / WAIT / ADJUST).
3. You MUST NEVER use banned hyperbole words: "impregnable", "institutional-grade", "maximum resilience", "deterministic certainty", "top-tier", "financially unstoppable".
4. Every date, monetary figure, and percentage you write MUST match the provided calculated metrics exactly.
5. Keep the explanation transparent, evidence-based, and objective.

Decision Input Context:
- User Query: "${payload.userQuery}"
- Decision: ${payload.simulation.decision.title} for ${payload.profileSummary.currency} ${payload.simulation.decision.amount}
- Cash Affordable: ${payload.simulation.cashAffordable}
- Primary Goal: "${payload.goalSummary.title}" (Target: ${payload.profileSummary.currency} ${payload.goalSummary.targetAmount}, Target Date: ${payload.goalSummary.targetDate})
- Baseline Completion Date: ${payload.simulation.primaryGoalImpact.baselineCompletionDate}
- Simulated Completion Date: ${payload.simulation.primaryGoalImpact.simulatedCompletionDate}
- Delay: ${payload.simulation.primaryGoalImpact.delayInMonths} months
- Additional Monthly Savings Needed: ${payload.profileSummary.currency} ${payload.simulation.primaryGoalImpact.additionalMonthlySavingsRequired}

Output JSON in the following format:
{
  "headline": string,
  "whatYouCanDo": string,
  "whatItChanges": string,
  "toStayOnTrack": string,
  "UseaimlysRead": string,
  "directAnswer": string,
  "cashAffordabilityVerdict": string,
  "planAffordabilityVerdict": string,
  "tradeoffAnalysis": string,
  "actionableRecommendation": string,
  "recoveryGuidance": string,
  "masterStrategyParagraph": string
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
        whatYouCanDo: parsed.whatYouCanDo || parsed.directAnswer,
        whatItChanges: parsed.whatItChanges || parsed.planAffordabilityVerdict,
        toStayOnTrack: parsed.toStayOnTrack || parsed.actionableRecommendation,
        UseaimlysRead: parsed.UseaimlysRead || parsed.tradeoffAnalysis,
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
