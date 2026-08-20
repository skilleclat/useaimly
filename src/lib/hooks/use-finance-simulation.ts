"use client";

/**
 * Hook: useFinanceSimulation
 * Connects the deterministic simulation engine to React components.
 */

import { useState, useMemo, useTransition } from "react";
import { FinancialProfile } from "../types/finance";
import { FinancialGoal } from "../types/goal";
import { FinancialDecision, DecisionSimulationResult } from "../types/decision";
import { AIExplanationResult } from "../types/ai";
import { simulateDecision } from "../finance/decision-simulations/decision-engine";
import { buildDecisionContextPayload } from "../finance/financial-context/context-builder";
import { INITIAL_DEMO_PROFILE, INITIAL_DEMO_GOALS, INITIAL_DEMO_DECISION } from "../finance/demo-data";

export { INITIAL_DEMO_PROFILE, INITIAL_DEMO_GOALS, INITIAL_DEMO_DECISION };

export function useFinanceSimulation() {
  const [profile, setProfile] = useState<FinancialProfile>(INITIAL_DEMO_PROFILE);
  const [goals, setGoals] = useState<FinancialGoal[]>(INITIAL_DEMO_GOALS);
  const [decision, setDecision] = useState<FinancialDecision>(INITIAL_DEMO_DECISION);
  const [userQuery, setUserQuery] = useState<string>("Can I spend KES 30,000 on a new phone?");
  const [aiExplanation, setAiExplanation] = useState<AIExplanationResult | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Deterministic simulation is recalculated instantaneously whenever inputs change
  const simulationResult: DecisionSimulationResult = useMemo(() => {
    return simulateDecision(profile, goals, decision);
  }, [profile, goals, decision]);

  const runAiExplanation = async () => {
    setIsExplaining(true);
    try {
      const payload = buildDecisionContextPayload(profile, goals, simulationResult, userQuery);
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to generate AI explanation");
      }

      const data: AIExplanationResult = await res.json();
      setAiExplanation(data);
    } catch (err) {
      console.error("AI explanation error:", err);
    } finally {
      setIsExplaining(false);
    }
  };

  const updateDecisionAmount = (amount: number) => {
    startTransition(() => {
      setDecision((prev) => ({ ...prev, amount }));
    });
  };

  const updateDecisionType = (type: FinancialDecision["type"]) => {
    startTransition(() => {
      setDecision((prev) => ({ ...prev, type }));
    });
  };

  return {
    profile,
    setProfile,
    goals,
    setGoals,
    decision,
    setDecision,
    userQuery,
    setUserQuery,
    simulationResult,
    aiExplanation,
    isExplaining,
    isPending,
    runAiExplanation,
    updateDecisionAmount,
    updateDecisionType,
  };
}
