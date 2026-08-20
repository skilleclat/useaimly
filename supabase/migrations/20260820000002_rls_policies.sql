-- ==============================================================================
-- Useaimly Database Schema Migration: 02_rls_policies
-- Strict Row Level Security on Every User Table
-- "A user must never be able to read, modify, or delete another user's data"
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Enable RLS on ALL Tables
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_scenarios ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Profiles Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 3. Financial Goals Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own goals"
  ON public.financial_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON public.financial_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.financial_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.financial_goals FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. Income Sources Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own income sources"
  ON public.income_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income sources"
  ON public.income_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income sources"
  ON public.income_sources FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own income sources"
  ON public.income_sources FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. Expense Categories Policies (System default OR user custom)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view system and own categories"
  ON public.expense_categories FOR SELECT
  USING (is_default = TRUE OR user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own custom categories"
  ON public.expense_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can update own custom categories"
  ON public.expense_categories FOR UPDATE
  USING (auth.uid() = user_id AND is_default = FALSE)
  WITH CHECK (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can delete own custom categories"
  ON public.expense_categories FOR DELETE
  USING (auth.uid() = user_id AND is_default = FALSE);

-- ------------------------------------------------------------------------------
-- 6. Expenses Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 7. Savings Accounts Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own savings accounts"
  ON public.savings_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings accounts"
  ON public.savings_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings accounts"
  ON public.savings_accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings accounts"
  ON public.savings_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. Debts Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own debts"
  ON public.debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts"
  ON public.debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts"
  ON public.debts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts"
  ON public.debts FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 9. Financial Commitments Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own commitments"
  ON public.financial_commitments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own commitments"
  ON public.financial_commitments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commitments"
  ON public.financial_commitments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own commitments"
  ON public.financial_commitments FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 10. Financial Decisions Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own decisions"
  ON public.financial_decisions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions"
  ON public.financial_decisions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions"
  ON public.financial_decisions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own decisions"
  ON public.financial_decisions FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 11. Decision Simulations Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own simulations"
  ON public.decision_simulations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON public.decision_simulations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
  ON public.decision_simulations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON public.decision_simulations FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 12. Financial Snapshots Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own snapshots"
  ON public.financial_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots"
  ON public.financial_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own snapshots"
  ON public.financial_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 13. Conversations Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 14. Messages Policies (Scoped to conversation owner)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view messages in own conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages into own conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in own conversations"
  ON public.messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 15. Insights Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own insights"
  ON public.insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON public.insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON public.insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON public.insights FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 16. Saved Scenarios Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own saved scenarios"
  ON public.saved_scenarios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved scenarios"
  ON public.saved_scenarios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved scenarios"
  ON public.saved_scenarios FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved scenarios"
  ON public.saved_scenarios FOR DELETE
  USING (auth.uid() = user_id);
