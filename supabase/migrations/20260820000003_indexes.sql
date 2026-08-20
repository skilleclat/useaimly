-- ==============================================================================
-- Useaimly Database Schema Migration: 03_indexes
-- Performance & Optimization Indexes
-- ==============================================================================

-- 1. Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_currency ON public.profiles(preferred_currency);

-- 2. Financial Goals
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON public.financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_status ON public.financial_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_financial_goals_target_date ON public.financial_goals(user_id, target_date);
CREATE INDEX IF NOT EXISTS idx_financial_goals_priority ON public.financial_goals(user_id, priority);

-- 3. Income Sources
CREATE INDEX IF NOT EXISTS idx_income_sources_user_id ON public.income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_income_sources_active ON public.income_sources(user_id, is_active);

-- 4. Expense Categories
CREATE INDEX IF NOT EXISTS idx_expense_categories_user_id ON public.expense_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_default ON public.expense_categories(is_default);

-- 5. Expenses
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_fixed ON public.expenses(user_id, is_fixed);

-- 6. Savings Accounts
CREATE INDEX IF NOT EXISTS idx_savings_accounts_user_id ON public.savings_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_accounts_goal_id ON public.savings_accounts(goal_id);

-- 7. Debts
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON public.debts(user_id, due_date);

-- 8. Financial Commitments
CREATE INDEX IF NOT EXISTS idx_financial_commitments_user_id ON public.financial_commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_commitments_dates ON public.financial_commitments(user_id, start_date, end_date);

-- 9. Financial Decisions
CREATE INDEX IF NOT EXISTS idx_financial_decisions_user_id ON public.financial_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_decisions_status ON public.financial_decisions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_financial_decisions_type ON public.financial_decisions(user_id, decision_type);
CREATE INDEX IF NOT EXISTS idx_financial_decisions_date ON public.financial_decisions(user_id, proposed_date DESC);

-- 10. Decision Simulations
CREATE INDEX IF NOT EXISTS idx_decision_simulations_user_id ON public.decision_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_simulations_decision_id ON public.decision_simulations(decision_id);
CREATE INDEX IF NOT EXISTS idx_decision_simulations_goal_id ON public.decision_simulations(goal_id);
CREATE INDEX IF NOT EXISTS idx_decision_simulations_status ON public.decision_simulations(user_id, affordability_status);

-- 11. Financial Snapshots
CREATE INDEX IF NOT EXISTS idx_financial_snapshots_user_date ON public.financial_snapshots(user_id, snapshot_date DESC);

-- 12. Conversations & Messages
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id, created_at ASC);

-- 13. Insights
CREATE INDEX IF NOT EXISTS idx_insights_user_unread ON public.insights(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_user_type ON public.insights(user_id, type);

-- 14. Saved Scenarios
CREATE INDEX IF NOT EXISTS idx_saved_scenarios_user_id ON public.saved_scenarios(user_id);
