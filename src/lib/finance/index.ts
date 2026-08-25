/**
 * Useaimly Deterministic Financial Engine Module Exports
 * Pure TypeScript Financial Source of Truth
 */

// Core Domain Types
export * from "./types";

// Monthly Normalization
export * from "./normalization/frequency-normalizer";

// Incomes
export * from "./income/income-calculator";

// Expenses & Commitments
export * from "./expenses/expense-calculator";

// Debts & Liabilities
export * from "./debt/debt-calculator";

// Cash Flow
export * from "./cash-flow/cash-flow-calculator";

// Goals & Milestones
export * from "./goals/goal-calculator";
export * from "./goals/goal-intelligence-engine";

// Trajectories & Accumulation Curves
export * from "./trajectories/trajectory-calculator";

// Decision Simulations & 3-Pillar Affordability
export * from "./simulations/simulation-engine";

// Financial Health & Runway
export * from "./health/health-calculator";

// Decision Memory & Re-analysis
export * from "./decision-memory";

// Max Safe Price & Better Alternatives Engine
export * from "./max-safe-price";
export * from "./better-alternatives";

// Decision Stress Testing
export * from "./stress-test";

// Validation & Invariant Consistency Guards
export * from "./validation/consistency-guard";


// Legacy Specific Helpers & Adapters
export { calculateNetWorth } from "./calculations/net-worth";

export { calculateCashFlowSummary } from "./calculations/cash-flow";
export { evaluateGoal } from "./goal-logic/goal-evaluator";
export { allocateFreeCashFlowToGoals } from "./goal-logic/goal-prioritizer";
export { generateTrajectoryPoints } from "./projections/trajectory-engine";
export { buildDecisionContextPayload } from "./financial-context/context-builder";

