import { z } from "zod";

export const CashFlowTypeSchema = z.enum([
  "INCOME",
  "FIXED_EXPENSE",
  "VARIABLE_EXPENSE",
  "DEBT_SERVICE",
]);

export const FrequencySchema = z.enum([
  "MONTHLY",
  "ANNUAL",
  "ONE_OFF",
  "BI_WEEKLY",
  "WEEKLY",
]);

export const AccountCategorySchema = z.enum([
  "LIQUID_CASH",
  "SAVINGS",
  "INVESTMENT",
  "LOCKED_RETIREMENT",
  "DEBT",
]);

export const CurrencyCodeSchema = z.enum([
  "KES",
  "USD",
  "EUR",
  "GBP",
  "UGX",
  "TZS",
  "RWF",
]);

export const CashFlowItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  frequency: FrequencySchema.default("MONTHLY"),
  type: CashFlowTypeSchema,
  category: z.string().optional(),
  isDiscretionary: z.boolean().default(false),
});

export const FinancialAccountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Account name is required"),
  category: AccountCategorySchema,
  balance: z.number(),
  interestRate: z.number().min(0).max(1).optional(),
  isAccessibleForGoals: z.boolean().default(true),
});

export const FinancialProfileSchema = z.object({
  currency: CurrencyCodeSchema.default("KES"),
  accounts: z.array(FinancialAccountSchema),
  cashFlowItems: z.array(CashFlowItemSchema),
  emergencyFundTargetMonths: z.number().min(1).default(6),
});

export type CashFlowItemInput = z.infer<typeof CashFlowItemSchema>;
export type FinancialAccountInput = z.infer<typeof FinancialAccountSchema>;
export type FinancialProfileInput = z.infer<typeof FinancialProfileSchema>;
