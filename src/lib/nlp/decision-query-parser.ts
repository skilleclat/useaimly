import { z } from "zod";
import { FinancialDecisionSchema, FinancialDecisionInput } from "@/lib/validation/decision.schema";
import { CurrencyCode } from "@/lib/types/finance";

export interface ParsedDecisionIntent {
  rawQuery: string;
  extractedTitle: string;
  extractedAmount: number;
  extractedCurrency: CurrencyCode;
  isRecurring: boolean;
  recurringFrequency?: "MONTHLY" | "ANNUAL";
  decisionType:
    | "ONE_OFF_PURCHASE"
    | "RECURRING_EXPENSE"
    | "INCOME_CHANGE"
    | "WINDFALL"
    | "DEBT_ACCELERATION"
    | "GOAL_CONTRIBUTION_CHANGE";
  confidence: number;
  isValid: boolean;
  validationErrors?: Record<string, string[]>;
}

/**
 * Deterministic Natural Language Parser for Financial Queries.
 * Extracts amounts, intent categories, and recurrence rules without AI hallucinations.
 */
export function parseDecisionQuery(
  query: string,
  defaultCurrency: CurrencyCode = "KES"
): ParsedDecisionIntent {
  const trimmed = query.trim();

  // 1. Amount Extraction (handles KES 30,000, 30k, $500, 15000)
  let extractedAmount = 0;

  // Check for 'k' suffix, e.g. 30k or 15.5k
  const kMatch = trimmed.match(/(?:kes|usd|eur|gbp|\$|sh)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    extractedAmount = Math.round(parseFloat(kMatch[1]) * 1000);
  } else {
    // Standard number with commas or spaces: e.g. 30,000 or 150000
    const numMatch = trimmed.match(/(?:kes|usd|eur|gbp|\$|sh)?\s*([\d,]+(?:\.\d+)?)/i);
    if (numMatch) {
      const cleanNum = numMatch[1].replace(/,/g, "");
      const parsed = parseFloat(cleanNum);
      if (!isNaN(parsed)) {
        extractedAmount = parsed;
      }
    }
  }

  // 2. Currency Extraction
  let extractedCurrency = defaultCurrency;
  if (/usd|\$/i.test(trimmed)) extractedCurrency = "USD";
  else if (/eur|€/i.test(trimmed)) extractedCurrency = "EUR";
  else if (/gbp|£/i.test(trimmed)) extractedCurrency = "GBP";
  else if (/kes|ksh|sh/i.test(trimmed)) extractedCurrency = "KES";

  // 3. Recurrence Detection
  const isRecurring =
    /monthly|per month|\/mo|a month|every month|rent|subscription|membership|retainer/i.test(trimmed);
  const recurringFrequency = isRecurring ? "MONTHLY" : undefined;

  // 4. Intent Category & Title Extraction
  let decisionType: ParsedDecisionIntent["decisionType"] = isRecurring
    ? "RECURRING_EXPENSE"
    : "ONE_OFF_PURCHASE";
  let extractedTitle = "Proposed Expenditure";

  const lower = trimmed.toLowerCase();

  if (/phone|iphone|samsung|device|laptop|macbook/i.test(lower)) {
    extractedTitle = "New Phone / Tech Purchase";
    decisionType = "ONE_OFF_PURCHASE";
  } else if (/loan|borrow|debt|sacco loan|repayment/i.test(lower)) {
    extractedTitle = "Loan Facility / Borrowing";
    decisionType = isRecurring ? "RECURRING_EXPENSE" : "ONE_OFF_PURCHASE";
  } else if (/invest|business|startup|venture|equity/i.test(lower)) {
    extractedTitle = "Business Investment";
    decisionType = "ONE_OFF_PURCHASE";
  } else if (/trip|travel|holiday|vacation|flight|getaway/i.test(lower)) {
    extractedTitle = "Travel & Leisure";
    decisionType = "ONE_OFF_PURCHASE";
  } else if (/rent|housing|apartment|lease/i.test(lower)) {
    extractedTitle = "Rent Adjustment";
    decisionType = "RECURRING_EXPENSE";
  } else if (/bonus|windfall|gift|inheritance/i.test(lower)) {
    extractedTitle = "Windfall / Inflow";
    decisionType = "WINDFALL";
  } else if (/salary|raise|promotion|new job/i.test(lower)) {
    extractedTitle = "Income Increase";
    decisionType = "INCOME_CHANGE";
  } else {
    // Generate clean title from sentence
    const cleanWords = trimmed
      .replace(/can i afford|should i|i want to|i am thinking about|a|the|to|buy|spend|take/gi, "")
      .trim();
    if (cleanWords.length > 2) {
      extractedTitle = cleanWords.charAt(0).toUpperCase() + cleanWords.slice(1);
    }
  }

  // 5. Zod Validation
  const zodValidation = FinancialDecisionSchema.safeParse({
    title: extractedTitle,
    type: decisionType,
    amount: extractedAmount > 0 ? extractedAmount : 1000,
    currency: extractedCurrency,
    recurringFrequency,
  });

  return {
    rawQuery: trimmed,
    extractedTitle,
    extractedAmount: extractedAmount > 0 ? extractedAmount : 0,
    extractedCurrency,
    isRecurring,
    recurringFrequency,
    decisionType,
    confidence: extractedAmount > 0 ? 0.95 : 0.6,
    isValid: zodValidation.success && extractedAmount > 0,
    validationErrors: zodValidation.success ? undefined : zodValidation.error.flatten().fieldErrors,
  };
}
