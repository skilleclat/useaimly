import { z } from "zod";
import { CurrencyCodeSchema } from "./finance.schema";

export const DecisionTypeSchema = z.enum([
  "ONE_OFF_PURCHASE",
  "RECURRING_EXPENSE",
  "INCOME_CHANGE",
  "WINDFALL",
  "DEBT_ACCELERATION",
  "GOAL_CONTRIBUTION_CHANGE",
]);

export const FinancialDecisionSchema = z.object({
  title: z.string().min(2, "Decision title must be at least 2 characters"),
  type: DecisionTypeSchema.default("ONE_OFF_PURCHASE"),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: CurrencyCodeSchema.default("KES"),
  recurringFrequency: z.enum(["MONTHLY", "ANNUAL"]).optional(),
  targetGoalId: z.string().optional(),
  notes: z.string().optional(),
});

export const DecisionSimulateRequestSchema = z.object({
  userQuery: z.string().optional(),
  decision: FinancialDecisionSchema,
});

export type FinancialDecisionInput = z.infer<typeof FinancialDecisionSchema>;
export type DecisionSimulateRequestInput = z.infer<typeof DecisionSimulateRequestSchema>;
