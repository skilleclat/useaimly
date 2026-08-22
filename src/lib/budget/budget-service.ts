import { createClient } from "@/lib/supabase/client";
import { BudgetTarget, CreateBudgetTargetPayload, BudgetSummary } from "@/lib/types/budget";
import { INITIAL_DEMO_BUDGETS } from "./budget-data";

const STORAGE_KEY = "useaimly_budget_targets";

export async function fetchBudgetTargets(): Promise<BudgetTarget[]> {
  try {
    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();
    
    if (session?.session?.user) {
      const { data, error } = await supabase
        .from("budget_targets")
        .select("*")
        .order("category_name", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as BudgetTarget[];
      }
    }
  } catch (err) {
    console.warn("Supabase fetch failed for budget targets, using local fallback", err);
  }

  // Local Storage Fallback
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored budgets", e);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_BUDGETS));
  }

  return INITIAL_DEMO_BUDGETS;
}

export async function saveBudgetTarget(payload: CreateBudgetTargetPayload): Promise<BudgetTarget> {
  const newBudget: BudgetTarget = {
    id: `b-${Date.now()}`,
    category_name: payload.category_name,
    monthly_target: payload.monthly_target,
    current_actual: payload.current_actual || 0,
    period: payload.period || "2026-08",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();

    if (session?.session?.user) {
      const { data, error } = await supabase
        .from("budget_targets")
        .insert({
          user_id: session.session.user.id,
          category_name: payload.category_name,
          monthly_target: payload.monthly_target,
          current_actual: payload.current_actual || 0,
          period: payload.period || "2026-08",
        })
        .select()
        .single();

      if (!error && data) {
        return data as BudgetTarget;
      }
    }
  } catch (err) {
    console.warn("Supabase insert budget target failed, fallback to local storage", err);
  }

  // Fallback local storage update
  const current = await fetchBudgetTargets();
  const updated = [newBudget, ...current.filter((b) => b.category_name !== payload.category_name)];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return newBudget;
}

export async function deleteBudgetTarget(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();

    if (session?.session?.user) {
      await supabase.from("budget_targets").delete().eq("id", id);
    }
  } catch (err) {
    console.warn("Supabase delete budget target failed", err);
  }

  const current = await fetchBudgetTargets();
  const updated = current.filter((b) => b.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return true;
}

export function computeBudgetSummary(budgets: BudgetTarget[]): BudgetSummary {
  const totalTarget = budgets.reduce((acc, b) => acc + b.monthly_target, 0);
  const totalActual = budgets.reduce((acc, b) => acc + b.current_actual, 0);
  const totalRemaining = Math.max(0, totalTarget - totalActual);
  const overallPercent = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

  const goalProtectionStatus =
    overallPercent <= 90
      ? "ALIGNED"
      : overallPercent <= 100
      ? "WARNING"
      : "BREACHED";

  return {
    totalTarget,
    totalActual,
    totalRemaining,
    overallPercent,
    goalProtectionStatus,
    recommendedRebalance:
      overallPercent > 90
        ? {
            categoryToTrim: "Dining Out & Leisure",
            amountToTrim: 3500,
            categoryToCover: "Groceries & Household",
          }
        : undefined,
  };
}
