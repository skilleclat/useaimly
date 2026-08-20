-- ==============================================================================
-- Useaimly Database Schema Migration: 04_seed_data
-- Default System Categories and Seed Templates
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Default Expense Categories (Accessible by all users via RLS policy)
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
