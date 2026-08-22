-- ==============================================================================
-- Useaimly Complete Supabase PostgreSQL Schema (Idempotent / Safe Re-run)
-- "See tomorrow before deciding today"
-- Multi-User Goal-Aware Decision Intelligence Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Helper function for updated_at timestamps
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. Profiles Table (Linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  preferred_currency TEXT NOT NULL DEFAULT 'KES',
  timezone TEXT NOT NULL DEFAULT 'Africa/Nairobi',
  locale TEXT NOT NULL DEFAULT 'en',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'premium')),
  plan_status TEXT NOT NULL DEFAULT 'active' CHECK (plan_status IN ('active', 'trial', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile trigger when user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, preferred_currency)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'preferred_currency', 'KES')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. Financial Goals Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'BUSINESS',
  target_amount NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'HIGH' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_financial_goals_updated_at ON public.financial_goals;
CREATE TRIGGER set_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. Income Sources Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  frequency TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (frequency IN ('MONTHLY', 'ANNUAL', 'WEEKLY', 'BI_WEEKLY', 'ONE_OFF', 'IRREGULAR')),
  reliability TEXT NOT NULL DEFAULT 'STABLE' CHECK (reliability IN ('STABLE', 'VARIABLE', 'ONE_OFF')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  next_expected_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_income_sources_updated_at ON public.income_sources;
CREATE TRIGGER set_income_sources_updated_at
  BEFORE UPDATE ON public.income_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. Expense Categories Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'FIXED' CHECK (type IN ('FIXED', 'VARIABLE', 'DISCRETIONARY', 'DEBT_SERVICE')),
  icon TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. Expenses Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  frequency TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (frequency IN ('MONTHLY', 'ANNUAL', 'WEEKLY', 'BI_WEEKLY', 'ONE_OFF', 'IRREGULAR')),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_fixed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_expenses_updated_at ON public.expenses;
CREATE TRIGGER set_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 7. Savings Accounts Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.savings_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  goal_id UUID REFERENCES public.financial_goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_savings_accounts_updated_at ON public.savings_accounts;
CREATE TRIGGER set_savings_accounts_updated_at
  BEFORE UPDATE ON public.savings_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 8. Debts Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_amount NUMERIC(14,2) NOT NULL CHECK (original_amount > 0),
  current_balance NUMERIC(14,2) NOT NULL CHECK (current_balance >= 0),
  monthly_payment NUMERIC(14,2) NOT NULL CHECK (monthly_payment >= 0),
  interest_rate NUMERIC(6,4),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_debts_updated_at ON public.debts;
CREATE TRIGGER set_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 9. Financial Commitments Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  frequency TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (frequency IN ('MONTHLY', 'ANNUAL', 'WEEKLY', 'BI_WEEKLY', 'ONE_OFF')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_financial_commitments_updated_at ON public.financial_commitments;
CREATE TRIGGER set_financial_commitments_updated_at
  BEFORE UPDATE ON public.financial_commitments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 10. Financial Decisions Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  decision_type TEXT NOT NULL DEFAULT 'ONE_OFF_PURCHASE' CHECK (
    decision_type IN (
      'ONE_OFF_PURCHASE',
      'RECURRING_EXPENSE',
      'INCOME_CHANGE',
      'WINDFALL',
      'DEBT_ACCELERATION',
      'GOAL_CONTRIBUTION_CHANGE'
    )
  ),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'KES',
  proposed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('PROPOSED', 'EXECUTED', 'CANCELLED', 'SIMULATED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_financial_decisions_updated_at ON public.financial_decisions;
CREATE TRIGGER set_financial_decisions_updated_at
  BEFORE UPDATE ON public.financial_decisions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 11. Decision Simulations Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.decision_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL REFERENCES public.financial_decisions(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.financial_goals(id) ON DELETE SET NULL,
  baseline_projected_date DATE NOT NULL,
  projected_date_after_decision DATE NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  additional_monthly_required NUMERIC(14,2) NOT NULL DEFAULT 0,
  impact_percentage NUMERIC(6,2) NOT NULL DEFAULT 0,
  affordability_status TEXT NOT NULL DEFAULT 'AFFORDABLE_NO_IMPACT' CHECK (
    affordability_status IN (
      'AFFORDABLE_NO_IMPACT',
      'AFFORDABLE_NEGLIGIBLE_DELAY',
      'AFFORDABLE_NOTICEABLE_DELAY',
      'PLAN_DISRUPTIVE_SEVERE_DELAY',
      'UNAFFORDABLE_CASH_DEFICIT'
    )
  ),
  calculation_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. Financial Snapshots Table (Time Series Trajectory Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_income NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_expenses NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_debt NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_savings NUMERIC(14,2) NOT NULL DEFAULT 0,
  monthly_free_cashflow NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. Conversations Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_conversations_updated_at ON public.conversations;
CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 14. Messages Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  structured_context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 15. Insights Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'TRAJECTORY_SHIFT',
  severity TEXT NOT NULL DEFAULT 'INFO' CHECK (severity IN ('INFO', 'POSITIVE', 'WARNING', 'CRITICAL')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 16. Saved Scenarios Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL DEFAULT 'PURCHASE_SIMULATION',
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_saved_scenarios_updated_at ON public.saved_scenarios;
CREATE TRIGGER set_saved_scenarios_updated_at
  BEFORE UPDATE ON public.saved_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 17. Financial Notes Table (Personal Notepad / Strategic Rules)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'GENERAL' CHECK (
    category IN ('GENERAL', 'RULES_CONSTRAINTS', 'UPCOMING_EXPENSES', 'INCOME_NOTES', 'GOAL_STRATEGY')
  ),
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_financial_notes_updated_at ON public.financial_notes;
CREATE TRIGGER set_financial_notes_updated_at
  BEFORE UPDATE ON public.financial_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 17.5 Budget Targets Table (Goal-Aware Category Caps & Outflow Guardrails)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budget_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  monthly_target NUMERIC(14,2) NOT NULL CHECK (monthly_target >= 0),
  current_actual NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_actual >= 0),
  period TEXT NOT NULL DEFAULT '2026-08',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_budget_targets_updated_at ON public.budget_targets;
CREATE TRIGGER set_budget_targets_updated_at
  BEFORE UPDATE ON public.budget_targets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 18. Row Level Security Policies on ALL Tables
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
ALTER TABLE public.financial_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_targets ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Financial Goals Policies
DROP POLICY IF EXISTS "Users can view own goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can create own goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.financial_goals;
CREATE POLICY "Users can view own goals" ON public.financial_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON public.financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.financial_goals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.financial_goals FOR DELETE USING (auth.uid() = user_id);

-- Income Sources Policies
DROP POLICY IF EXISTS "Users can view own income sources" ON public.income_sources;
DROP POLICY IF EXISTS "Users can insert own income sources" ON public.income_sources;
DROP POLICY IF EXISTS "Users can update own income sources" ON public.income_sources;
DROP POLICY IF EXISTS "Users can delete own income sources" ON public.income_sources;
CREATE POLICY "Users can view own income sources" ON public.income_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own income sources" ON public.income_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own income sources" ON public.income_sources FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own income sources" ON public.income_sources FOR DELETE USING (auth.uid() = user_id);

-- Expense Categories Policies
DROP POLICY IF EXISTS "Users can view system and own categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Users can insert own custom categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Users can update own custom categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Users can delete own custom categories" ON public.expense_categories;
CREATE POLICY "Users can view system and own categories" ON public.expense_categories FOR SELECT USING (is_default = TRUE OR user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can insert own custom categories" ON public.expense_categories FOR INSERT WITH CHECK (auth.uid() = user_id AND is_default = FALSE);
CREATE POLICY "Users can update own custom categories" ON public.expense_categories FOR UPDATE USING (auth.uid() = user_id AND is_default = FALSE) WITH CHECK (auth.uid() = user_id AND is_default = FALSE);
CREATE POLICY "Users can delete own custom categories" ON public.expense_categories FOR DELETE USING (auth.uid() = user_id AND is_default = FALSE);

-- Expenses Policies
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Savings Accounts Policies
DROP POLICY IF EXISTS "Users can view own savings accounts" ON public.savings_accounts;
DROP POLICY IF EXISTS "Users can insert own savings accounts" ON public.savings_accounts;
DROP POLICY IF EXISTS "Users can update own savings accounts" ON public.savings_accounts;
DROP POLICY IF EXISTS "Users can delete own savings accounts" ON public.savings_accounts;
CREATE POLICY "Users can view own savings accounts" ON public.savings_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own savings accounts" ON public.savings_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own savings accounts" ON public.savings_accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own savings accounts" ON public.savings_accounts FOR DELETE USING (auth.uid() = user_id);

-- Debts Policies
DROP POLICY IF EXISTS "Users can view own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can insert own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can update own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can delete own debts" ON public.debts;
CREATE POLICY "Users can view own debts" ON public.debts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own debts" ON public.debts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own debts" ON public.debts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own debts" ON public.debts FOR DELETE USING (auth.uid() = user_id);

-- Financial Commitments Policies
DROP POLICY IF EXISTS "Users can view own commitments" ON public.financial_commitments;
DROP POLICY IF EXISTS "Users can insert own commitments" ON public.financial_commitments;
DROP POLICY IF EXISTS "Users can update own commitments" ON public.financial_commitments;
DROP POLICY IF EXISTS "Users can delete own commitments" ON public.financial_commitments;
CREATE POLICY "Users can view own commitments" ON public.financial_commitments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own commitments" ON public.financial_commitments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own commitments" ON public.financial_commitments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own commitments" ON public.financial_commitments FOR DELETE USING (auth.uid() = user_id);

-- Financial Decisions Policies
DROP POLICY IF EXISTS "Users can view own decisions" ON public.financial_decisions;
DROP POLICY IF EXISTS "Users can insert own decisions" ON public.financial_decisions;
DROP POLICY IF EXISTS "Users can update own decisions" ON public.financial_decisions;
DROP POLICY IF EXISTS "Users can delete own decisions" ON public.financial_decisions;
CREATE POLICY "Users can view own decisions" ON public.financial_decisions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own decisions" ON public.financial_decisions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decisions" ON public.financial_decisions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own decisions" ON public.financial_decisions FOR DELETE USING (auth.uid() = user_id);

-- Decision Simulations Policies
DROP POLICY IF EXISTS "Users can view own simulations" ON public.decision_simulations;
DROP POLICY IF EXISTS "Users can insert own simulations" ON public.decision_simulations;
DROP POLICY IF EXISTS "Users can update own simulations" ON public.decision_simulations;
DROP POLICY IF EXISTS "Users can delete own simulations" ON public.decision_simulations;
CREATE POLICY "Users can view own simulations" ON public.decision_simulations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own simulations" ON public.decision_simulations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own simulations" ON public.decision_simulations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own simulations" ON public.decision_simulations FOR DELETE USING (auth.uid() = user_id);

-- Financial Snapshots Policies
DROP POLICY IF EXISTS "Users can view own snapshots" ON public.financial_snapshots;
DROP POLICY IF EXISTS "Users can insert own snapshots" ON public.financial_snapshots;
DROP POLICY IF EXISTS "Users can delete own snapshots" ON public.financial_snapshots;
CREATE POLICY "Users can view own snapshots" ON public.financial_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own snapshots" ON public.financial_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own snapshots" ON public.financial_snapshots FOR DELETE USING (auth.uid() = user_id);

-- Conversations Policies
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages Policies (Scoped to conversation owner)
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages into own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages in own conversations" ON public.messages;
CREATE POLICY "Users can view messages in own conversations" ON public.messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()));
CREATE POLICY "Users can insert messages into own conversations" ON public.messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()));
CREATE POLICY "Users can delete messages in own conversations" ON public.messages FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()));

-- Insights Policies
DROP POLICY IF EXISTS "Users can view own insights" ON public.insights;
DROP POLICY IF EXISTS "Users can insert own insights" ON public.insights;
DROP POLICY IF EXISTS "Users can update own insights" ON public.insights;
DROP POLICY IF EXISTS "Users can delete own insights" ON public.insights;
CREATE POLICY "Users can view own insights" ON public.insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.insights FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON public.insights FOR DELETE USING (auth.uid() = user_id);

-- Saved Scenarios Policies
DROP POLICY IF EXISTS "Users can view own saved scenarios" ON public.saved_scenarios;
DROP POLICY IF EXISTS "Users can insert own saved scenarios" ON public.saved_scenarios;
DROP POLICY IF EXISTS "Users can update own saved scenarios" ON public.saved_scenarios;
DROP POLICY IF EXISTS "Users can delete own saved scenarios" ON public.saved_scenarios;
CREATE POLICY "Users can view own saved scenarios" ON public.saved_scenarios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved scenarios" ON public.saved_scenarios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved scenarios" ON public.saved_scenarios FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved scenarios" ON public.saved_scenarios FOR DELETE USING (auth.uid() = user_id);

-- Financial Notes Policies
DROP POLICY IF EXISTS "Users can view own financial notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Users can insert own financial notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Users can update own financial notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Users can delete own financial notes" ON public.financial_notes;
CREATE POLICY "Users can view own financial notes" ON public.financial_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own financial notes" ON public.financial_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own financial notes" ON public.financial_notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own financial notes" ON public.financial_notes FOR DELETE USING (auth.uid() = user_id);

-- Budget Targets Policies
DROP POLICY IF EXISTS "Users can view own budget targets" ON public.budget_targets;
DROP POLICY IF EXISTS "Users can insert own budget targets" ON public.budget_targets;
DROP POLICY IF EXISTS "Users can update own budget targets" ON public.budget_targets;
DROP POLICY IF EXISTS "Users can delete own budget targets" ON public.budget_targets;
CREATE POLICY "Users can view own budget targets" ON public.budget_targets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budget targets" ON public.budget_targets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budget targets" ON public.budget_targets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own budget targets" ON public.budget_targets FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 18. Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_currency ON public.profiles(preferred_currency);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON public.financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_status ON public.financial_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_financial_goals_target_date ON public.financial_goals(user_id, target_date);
CREATE INDEX IF NOT EXISTS idx_income_sources_user_id ON public.income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_user_id ON public.expense_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_savings_accounts_user_id ON public.savings_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_targets_user_id ON public.budget_targets(user_id, period);
CREATE INDEX IF NOT EXISTS idx_financial_commitments_user_id ON public.financial_commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_decisions_user_id ON public.financial_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_notes_user_id ON public.financial_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_notes_category ON public.financial_notes(user_id, category);
CREATE INDEX IF NOT EXISTS idx_financial_decisions_date ON public.financial_decisions(user_id, proposed_date DESC);
CREATE INDEX IF NOT EXISTS idx_decision_simulations_user_id ON public.decision_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_simulations_decision_id ON public.decision_simulations(decision_id);
CREATE INDEX IF NOT EXISTS idx_financial_snapshots_user_date ON public.financial_snapshots(user_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_insights_user_unread ON public.insights(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_scenarios_user_id ON public.saved_scenarios(user_id);

-- ------------------------------------------------------------------------------
-- 19. Seed System Default Categories
-- ------------------------------------------------------------------------------
INSERT INTO public.expense_categories (id, user_id, name, type, icon, is_default)
VALUES
  ('00000000-0000-0000-0000-000000000001', NULL, 'Housing & Rent', 'FIXED', 'Home', TRUE),
  ('00000000-0000-0000-0000-000000000002', NULL, 'Utilities & Internet', 'FIXED', 'Zap', TRUE),
  ('00000000-0000-0000-0000-000000000003', NULL, 'Food & Groceries', 'FIXED', 'ShoppingBag', TRUE),
  ('00000000-0000-0000-0000-000000000004', NULL, 'Transport & Fuel', 'VARIABLE', 'Car', TRUE),
  ('00000000-0000-0000-0000-000000000005', NULL, 'Dining & Leisure', 'DISCRETIONARY', 'Coffee', TRUE),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Digital Subscriptions', 'FIXED', 'CreditCard', TRUE),
  ('00000000-0000-0000-0000-000000000007', NULL, 'Healthcare & Medical', 'FIXED', 'Heart', TRUE),
  ('00000000-0000-0000-0000-000000000008', NULL, 'Debt & Loan Servicing', 'DEBT_SERVICE', 'TrendingDown', TRUE),
  ('00000000-0000-0000-0000-000000000009', NULL, 'Business & Studio Venture', 'DISCRETIONARY', 'Briefcase', TRUE),
  ('00000000-0000-0000-0000-000000000010', NULL, 'Family & Remittances', 'FIXED', 'Users', TRUE)
ON CONFLICT (id) DO NOTHING;
