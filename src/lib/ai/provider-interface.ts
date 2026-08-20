/**
 * AI Provider Interface
 * Standard contract across all AI providers (Mock, Gemini, OpenAI, Anthropic).
 * Guarantees that AI is isolated to natural language synthesis and decision explanation,
 * while never being the source of truth for financial calculations.
 */

import { DecisionExplanationPayload, AIExplanationResult, AIProviderType } from "../types/ai";

export interface AIProvider {
  readonly providerName: AIProviderType;
  generateDecisionExplanation(
    payload: DecisionExplanationPayload
  ): Promise<AIExplanationResult>;
}
