import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Supabase Schema & Security Architecture", () => {
  const migrationsDir = path.resolve(__dirname, "../../../supabase/migrations");
  const schemaFile = path.resolve(__dirname, "../../../supabase/schema.sql");

  const requiredTables = [
    "profiles",
    "financial_goals",
    "income_sources",
    "expense_categories",
    "expenses",
    "savings_accounts",
    "debts",
    "financial_commitments",
    "financial_decisions",
    "decision_simulations",
    "financial_snapshots",
    "conversations",
    "messages",
    "insights",
    "saved_scenarios",
  ];

  it("has all migration files present", () => {
    const files = fs.readdirSync(migrationsDir);
    expect(files).toContain("20260820000001_initial_schema.sql");
    expect(files).toContain("20260820000002_rls_policies.sql");
    expect(files).toContain("20260820000003_indexes.sql");
    expect(files).toContain("20260820000004_seed_data.sql");
  });

  it("contains consolidated schema.sql for one-click setup", () => {
    expect(fs.existsSync(schemaFile)).toBe(true);
    const sql = fs.readFileSync(schemaFile, "utf8");

    // All 15 tables are declared in schema.sql
    for (const table of requiredTables) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
    }
  });

  it("enforces Row Level Security (RLS) on all 15 tables", () => {
    const rlsSql = fs.readFileSync(path.join(migrationsDir, "20260820000002_rls_policies.sql"), "utf8");

    for (const table of requiredTables) {
      expect(rlsSql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
      expect(rlsSql).toContain(`CREATE POLICY`);
    }
  });

  it("ensures conversation-scoped protection for messages", () => {
    const rlsSql = fs.readFileSync(path.join(migrationsDir, "20260820000002_rls_policies.sql"), "utf8");

    // Messages must check that the parent conversation belongs to auth.uid()
    expect(rlsSql).toMatch(/conversations(\s+c)?[\s\S]*?(c|conversations)\.user_id\s*=\s*auth\.uid\(\)/);
  });

  it("contains updated_at automatic triggers for mutable entities", () => {
    const sql = fs.readFileSync(schemaFile, "utf8");

    const mutableTables = [
      "profiles",
      "financial_goals",
      "income_sources",
      "expenses",
      "savings_accounts",
      "debts",
      "financial_commitments",
      "financial_decisions",
      "conversations",
      "saved_scenarios",
    ];

    for (const table of mutableTables) {
      expect(sql).toContain(`CREATE TRIGGER set_${table}_updated_at`);
    }
  });

  it("contains default system expense categories", () => {
    const seedSql = fs.readFileSync(path.join(migrationsDir, "20260820000004_seed_data.sql"), "utf8");
    expect(seedSql).toContain("Housing & Rent");
    expect(seedSql).toContain("Food & Groceries");
    expect(seedSql).toContain("Transport & Fuel");
    expect(seedSql).toContain("Business & Studio Venture");
  });
});
