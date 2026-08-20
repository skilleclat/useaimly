/**
 * AI Explanation Engine
 * Selects and orchestrates AI providers based on environment configuration.
 */

import { DecisionExplanationPayload, AIExplanationResult, AIProviderType } from "../types/ai";
import { AIProvider } from "./provider-interface";
import { GeminiProvider } from "./providers/gemini-provider";
import { MockAIProvider } from "./providers/mock-provider";
import { OpenAIProvider } from "./providers/openai-provider";

export class ExplanationEngine {
  private provider: AIProvider;

  constructor(providerType?: AIProviderType) {
    const selected = providerType || (process.env.AI_PROVIDER as AIProviderType) || "mock";

    switch (selected) {
      case "gemini":
        this.provider = new GeminiProvider();
        break;
      case "openai":
        this.provider = new OpenAIProvider();
        break;
      case "mock":
      default:
        this.provider = new MockAIProvider();
        break;
    }
  }

  async explainDecision(payload: DecisionExplanationPayload): Promise<AIExplanationResult> {
    return this.provider.generateDecisionExplanation(payload);
  }

  getProviderName(): AIProviderType {
    return this.provider.providerName;
  }
}

export const defaultExplanationEngine = new ExplanationEngine();
