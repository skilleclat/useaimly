/**
 * Financial Notepad ("Bloc-Notes Financier AI Context") Types
 * Enables users to write personal notes, custom financial rules, and planned expenses
 * that are fed directly into UseAimly AI Decision Intelligence engines.
 */

export type NoteCategory =
  | "GENERAL"
  | "RULES_CONSTRAINTS"
  | "UPCOMING_EXPENSES"
  | "INCOME_NOTES"
  | "GOAL_STRATEGY";

export interface FinancialNote {
  id: string;
  userId?: string;
  title: string;
  content: string;
  category: NoteCategory;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  category: NoteCategory;
  isPinned?: boolean;
  tags?: string[];
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  category?: NoteCategory;
  isPinned?: boolean;
  tags?: string[];
}

export const NOTE_CATEGORY_LABELS: Record<NoteCategory, { label: string; description: string; badgeColor: string }> = {
  RULES_CONSTRAINTS: {
    label: "Rule & Constraint",
    description: "Hard limits and safety rules for AI to enforce (e.g. min buffer lock, spend caps).",
    badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  UPCOMING_EXPENSES: {
    label: "Upcoming Planned Expense",
    description: "Future planned non-recurring purchases or investments.",
    badgeColor: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  GOAL_STRATEGY: {
    label: "Goal Strategy Note",
    description: "Strategic directives for primary & secondary life destinations.",
    badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  INCOME_NOTES: {
    label: "Income & Inflow Context",
    description: "Notes about variable client retainers, bonuses, or side income.",
    badgeColor: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  GENERAL: {
    label: "General Thought",
    description: "Personal reflections and financial diary entries.",
    badgeColor: "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
};
