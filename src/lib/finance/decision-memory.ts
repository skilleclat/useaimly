import { BaselineFinancialProfile } from "./types";
import { simulateDecision, DecisionSimulationResult } from "./simulations/simulation-engine";

export interface FinancialDecisionRecord {
  id: string;
  title: string;
  amount: number;
  currency: string;
  isRecurring: boolean;
  verdict: "SAFE" | "MANAGEABLE" | "OFF_TRACK";
  executiveDecision: "GO" | "ADJUST" | "WAIT";
  createdAt: string; // ISO date
  lastAnalyzedAt: string; // ISO date
  notes?: string;
  baselineSnapshot: {
    liquidSavings: number;
    monthlyFreeCashFlow: number;
  };
  simulationResult: DecisionSimulationResult;
}

const STORAGE_KEY = "useaimly_decision_memory";

/**
 * Saves a decision record to persistent decision memory (Local Storage & Supabase ready).
 */
export function saveDecisionRecord(
  baseline: BaselineFinancialProfile,
  title: string,
  amount: number,
  isRecurring: boolean = false,
  notes?: string
): FinancialDecisionRecord {
  const simulation = simulateDecision(baseline, { decisionTitle: title, amount, isRecurring });

  const record: FinancialDecisionRecord = {
    id: `dec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title,
    amount,
    currency: "KES",
    isRecurring,
    verdict: simulation.status as any,
    executiveDecision: simulation.executiveDecision,
    createdAt: new Date().toISOString(),
    lastAnalyzedAt: new Date().toISOString(),
    notes,
    baselineSnapshot: {
      liquidSavings: baseline.liquidSavings,
      monthlyFreeCashFlow: simulation.baseline.monthlyFreeCashFlow,
    },
    simulationResult: simulation,
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getSavedDecisions();
      const updated = [record, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist decision record to LocalStorage:", e);
    }
  }

  return record;
}

/**
 * Retrieves all stored decision records from memory.
 */
export function getSavedDecisions(): FinancialDecisionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Re-evaluates a previously saved decision against the user's latest financial profile.
 * Answers: "Is this still a good decision?"
 */
export function reevaluateDecision(
  record: FinancialDecisionRecord,
  currentBaseline: BaselineFinancialProfile
): {
  updatedRecord: FinancialDecisionRecord;
  hasChanged: boolean;
  statusShiftText: string;
} {
  const newSimulation = simulateDecision(currentBaseline, {
    decisionTitle: record.title,
    amount: record.amount,
    isRecurring: record.isRecurring,
  });

  const previousDecision = record.executiveDecision;
  const newDecision = newSimulation.executiveDecision;
  const hasChanged = previousDecision !== newDecision;

  let statusShiftText = "Your financial position remains consistent with the original verdict.";
  if (hasChanged) {
    if (newDecision === "GO" && previousDecision !== "GO") {
      statusShiftText = `Great news! Your increased savings now make this ${record.title} fully affordable (Verdict upgraded to GO).`;
    } else if (newDecision === "WAIT" && previousDecision !== "WAIT") {
      statusShiftText = `Caution: Recent cash flow adjustments indicate this decision requires pausing (Verdict changed to WAIT).`;
    } else {
      statusShiftText = `Verdict updated from ${previousDecision} to ${newDecision}.`;
    }
  }

  const updatedRecord: FinancialDecisionRecord = {
    ...record,
    lastAnalyzedAt: new Date().toISOString(),
    verdict: newSimulation.status as any,
    executiveDecision: newDecision,
    simulationResult: newSimulation,
  };

  return {
    updatedRecord,
    hasChanged,
    statusShiftText,
  };
}
