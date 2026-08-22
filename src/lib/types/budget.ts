export interface BudgetTarget {
  id: string;
  user_id?: string;
  category_name: string;
  monthly_target: number;
  current_actual: number;
  period: string; // e.g. "2026-08"
  created_at?: string;
  updated_at?: string;
}

export interface CreateBudgetTargetPayload {
  category_name: string;
  monthly_target: number;
  current_actual?: number;
  period?: string;
}

export interface BudgetSummary {
  totalTarget: number;
  totalActual: number;
  totalRemaining: number;
  overallPercent: number;
  goalProtectionStatus: "ALIGNED" | "WARNING" | "BREACHED";
  recommendedRebalance?: {
    categoryToTrim: string;
    amountToTrim: number;
    categoryToCover: string;
  };
}
