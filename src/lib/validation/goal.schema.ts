import { z } from "zod";
import { CurrencyCodeSchema } from "./finance.schema";

export const GoalCategorySchema = z.enum([
  "BUSINESS",
  "EMERGENCY_FUND",
  "REAL_ESTATE",
  "EDUCATION",
  "VEHICLE",
  "TRAVEL",
  "RETIREMENT",
  "MAJOR_PURCHASE",
  "OTHER",
]);

export const GoalPrioritySchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

export const FinancialGoalSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Goal title must be at least 2 characters"),
  description: z.string().optional(),
  category: GoalCategorySchema.default("BUSINESS"),
  priority: GoalPrioritySchema.default("HIGH"),
  targetAmount: z.number().positive("Target amount must be greater than 0"),
  currentAmount: z.number().min(0, "Current amount cannot be negative").default(0),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Target date must be YYYY-MM-DD"),
  currency: CurrencyCodeSchema.default("KES"),
  monthlyAllocation: z.number().min(0).optional(),
});

export type FinancialGoalInput = z.infer<typeof FinancialGoalSchema>;
