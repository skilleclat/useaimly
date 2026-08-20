-- ==============================================================================
-- Useaimly Database Schema Migration: 01_initial_schema
-- "See tomorrow before deciding today"
-- ==============================================================================

-- Enable UUID extension if not already enabled
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE OR REPLACE TRIGGER on_auth_user_created
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

CREATE TRIGGER set_income_sources_updated_at
  BEFORE UPDATE ON public.income_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. Expense Categories Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL if system default
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
  interest_rate NUMERIC(6,4), -- e.g. 0.1200 for 12%
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TRIGGER set_saved_scenarios_updated_at
  BEFORE UPDATE ON public.saved_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
