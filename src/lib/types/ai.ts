/**
 * Useaimly AI Contract Types
 * Defines the contract for the AI explanation layer.
 * Note: AI is purely descriptive & empathetic; calculations are 100% deterministic.
 */

import { DecisionSimulationResult } from "./decision";

export type AIProviderType = "mock" | "openai" | "anthropic" | "gemini";

export interface DecisionExplanationPayload {
  userQuery: string;
  simulation: DecisionSimulationResult;
  profileSummary: {
    currency: string;
    monthlyFreeCashFlow: number;
    savingsRate: number;
    liquidRunwayMonths: number;
  };
  goalSummary: {
    title: string;
    targetAmount: number;
    targetDate: string;
    currentAmount: number;
  };
}

export type AIExplanationPayload = DecisionExplanationPayload;

export interface AIExplanationResult {
  // The 4 Signature Useaimly Verdict Pillars
  whatYouCanDo: string;
  whatItChanges: string;
  toStayOnTrack: string;
  UseaimlysRead: string;

  // Additional detail fields
  headline: string;
  directAnswer: string;
  cashAffordabilityVerdict: string;
  planAffordabilityVerdict: string;
  tradeoffAnalysis: string;
  actionableRecommendation: string;
  recoveryGuidance?: string;
  confidenceScore: number;
  providerUsed: AIProviderType;
  generatedAt: string;
}
