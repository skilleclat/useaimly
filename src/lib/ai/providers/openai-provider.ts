/**
 * OpenAI Provider Adapter
 */

import { DecisionExplanationPayload, AIExplanationResult } from "../../types/ai";
import { AIProvider } from "../provider-interface";
import { MockAIProvider } from "./mock-provider";

export class OpenAIProvider implements AIProvider {
  readonly providerName = "openai" as const;
  private apiKey: string | undefined;
  private model: string;
  private fallbackProvider = new MockAIProvider();

  constructor(apiKey?: string, model: string = "gpt-4o-mini") {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.model = model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  async generateDecisionExplanation(
    payload: DecisionExplanationPayload
  ): Promise<AIExplanationResult> {
    if (!this.apiKey) {
      const mockResult = await this.fallbackProvider.generateDecisionExplanation(payload);
      return { ...mockResult, providerUsed: "openai" };
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are Useaimly, a goal-aware personal finance decision intelligence engine. The philosophy is 'See tomorrow before deciding today' and 'Cash affordability != Plan affordability'. Output JSON only.",
            },
            {
              role: "user",
              content: JSON.stringify(payload),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      const parsed = JSON.parse(content);

      return {
        ...parsed,
        confidenceScore: 0.95,
        providerUsed: "openai",
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.warn("OpenAIProvider error, falling back to deterministic synthesis:", error);
      return {
        ...(await this.fallbackProvider.generateDecisionExplanation(payload)),
        providerUsed: "openai",
      };
    }
  }
}
