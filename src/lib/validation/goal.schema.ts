import { z } from "zod";
import { CurrencyCodeSchema } from "./finance.schema";

export const GoalTypeSchema = z.enum([
  "BUY_A_HOUSE",
  "BUY_A_CAR",
  "START_A_BUSINESS",
  "EMERGENCY_FUND",
  "INVESTMENT_TARGET",
  "EDUCATION",
  "TRAVEL",
  "RETIREMENT",
  "CUSTOM_GOAL",
  // Legacy categories
  "BUSINESS",
  "REAL_ESTATE",
  "VEHICLE",
  "MAJOR_PURCHASE",
  "OTHER",
]);

export const GoalCategorySchema = GoalTypeSchema;

export const GoalPrioritySchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

export const GoalFlexibilitySchema = z.enum(["STRICT", "MODERATE", "FLEXIBLE"]);

export const ContributionFrequencySchema = z.enum([
  "MONTHLY",
  "WEEKLY",
  "BIWEEKLY",
  "QUARTERLY",
  "YEARLY",
  "ONE_OFF",
]);

export const GoalStatusSchema = z.enum([
  "ACTIVE",
  "COMPLETED",
  "PAUSED",
  "CANCELLED",
  "ARCHIVED",
]);

export const FinancialGoalSchema = z.object({
  id: z.string().optional(),
  goal_id: z.string().optional(),
  userId: z.string().optional(),
  user_id: z.string().optional(),
  title: z.string().min(2, "Goal title must be at least 2 characters").optional(),
  customGoalName: z.string().optional(),
  custom_goal_name: z.string().optional(),
  description: z.string().optional(),
  category: GoalCategorySchema.default("START_A_BUSINESS"),
  goalType: GoalTypeSchema.optional(),
  goal_type: GoalTypeSchema.optional(),
  priority: GoalPrioritySchema.default("HIGH"),
  targetAmount: z.number().positive("Target amount must be greater than 0").optional(),
  target_amount: z.number().positive().optional(),
  currentAmount: z.number().min(0, "Current amount cannot be negative").optional(),
  current_amount: z.number().min(0).optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Target date must be YYYY-MM-DD").optional(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD").optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  currency: CurrencyCodeSchema.default("KES"),
  monthlyAllocation: z.number().min(0).optional(),
  monthlyContribution: z.number().min(0).optional(),
  monthly_contribution: z.number().min(0).optional(),
  contributionFrequency: ContributionFrequencySchema.default("MONTHLY").optional(),
  contribution_frequency: ContributionFrequencySchema.optional(),
  flexibilityOfDeadline: GoalFlexibilitySchema.default("MODERATE").optional(),
  flexibility_of_deadline: GoalFlexibilitySchema.optional(),
  minimumRequiredAmount: z.number().min(0).optional(),
  minimum_required_amount: z.number().min(0).optional(),
  expectedGrowthRate: z.number().min(0).max(1).optional(),
  expected_growth_rate: z.number().min(0).max(1).optional(),
  goalStatus: GoalStatusSchema.default("ACTIVE").optional(),
  goal_status: GoalStatusSchema.optional(),
  status: GoalStatusSchema.optional(),
  isPrimary: z.boolean().optional(),
  isLocked: z.boolean().optional(),
}).transform((data) => {
  const title = data.title || data.customGoalName || data.custom_goal_name || "Financial Goal";
  const targetAmount = data.target_amount !== undefined ? data.target_amount : (data.targetAmount ?? 1000);
  const currentAmount = data.current_amount !== undefined ? data.current_amount : (data.currentAmount ?? 0);
  const targetDate = data.targetDate || data.target_date || new Date().toISOString().split("T")[0];
  const category = (data.category || data.goalType || data.goal_type || "CUSTOM_GOAL") as any;
  const monthlyAllocation = data.monthlyAllocation ?? data.monthlyContribution ?? data.monthly_contribution ?? 0;

  return {
    ...data,
    id: data.id || data.goal_id,
    userId: data.userId || data.user_id,
    title,
    customGoalName: data.customGoalName || data.custom_goal_name || title,
    targetAmount,
    currentAmount,
    targetDate,
    category,
    goalType: category,
    monthlyAllocation,
    monthlyContribution: monthlyAllocation,
  };
});

export type FinancialGoalInput = z.infer<typeof FinancialGoalSchema>;

