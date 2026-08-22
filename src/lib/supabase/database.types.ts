/**
 * Supabase PostgreSQL Database Schema Types for Useaimly
 * Generated for full type safety across Server and Client Components.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
        Relationships: GenericRelationship[];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          preferred_currency: string;
          timezone: string;
          locale: string;
          onboarding_completed: boolean;
          plan_tier: "free" | "pro" | "premium";
          plan_status: "active" | "trial" | "canceled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_currency?: string;
          timezone?: string;
          locale?: string;
          onboarding_completed?: boolean;
          plan_tier?: "free" | "pro" | "premium";
          plan_status?: "active" | "trial" | "canceled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_currency?: string;
          timezone?: string;
          locale?: string;
          onboarding_completed?: boolean;
          plan_tier?: "free" | "pro" | "premium";
          plan_status?: "active" | "trial" | "canceled";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      financial_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          target_amount: number;
          current_amount: number;
          target_date: string;
          priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
          status: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string;
          target_amount: number;
          current_amount?: number;
          target_date: string;
          priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
          status?: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          target_amount?: number;
          current_amount?: number;
          target_date?: string;
          priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
          status?: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      income_sources: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          frequency: "MONTHLY" | "ANNUAL" | "WEEKLY" | "BI_WEEKLY" | "ONE_OFF" | "IRREGULAR";
          reliability: "STABLE" | "VARIABLE" | "ONE_OFF";
          is_active: boolean;
          next_expected_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          frequency?: "MONTHLY" | "ANNUAL" | "WEEKLY" | "BI_WEEKLY" | "ONE_OFF" | "IRREGULAR";
          reliability?: "STABLE" | "VARIABLE" | "ONE_OFF";
          is_active?: boolean;
          next_expected_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          frequency?: "MONTHLY" | "ANNUAL" | "WEEKLY" | "BI_WEEKLY" | "ONE_OFF" | "IRREGULAR";
          reliability?: "STABLE" | "VARIABLE" | "ONE_OFF";
          is_active?: boolean;
          next_expected_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      expense_categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          type: "FIXED" | "VARIABLE" | "DISCRETIONARY" | "DEBT_SERVICE";
          icon: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          type?: "FIXED" | "VARIABLE" | "DISCRETIONARY" | "DEBT_SERVICE";
          icon?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          type?: "FIXED" | "VARIABLE" | "DISCRETIONARY" | "DEBT_SERVICE";
          icon?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          description: string;
          amount: number;
          frequency: "MONTHLY" | "ANNUAL" | "WEEKLY" | "BI_WEEKLY" | "ONE_OFF" | "IRREGULAR";
          expense_date: string;
          is_fixed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          description: string;
          amount: number;
          frequency?: "MONTHLY" | "ANNUAL" | "WEEKLY" | "BI_WEEKLY" | "ONE_OFF" | "IRREGULAR";
          expense_date?: string;
          is_fixed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          description?: string;
          amount?: number;
          frequency?: "MONTHLY" | "ANNUAL" | "WEEKLY" | "BI_WEEKLY" | "ONE_OFF" | "IRREGULAR";
          expense_date?: string;
          is_fixed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      savings_accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          current_balance: number;
          goal_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          current_balance?: number;
          goal_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          current_balance?: number;
          goal_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      debts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          original_amount: number;
          current_balance: number;
          monthly_payment: number;
          interest_rate: number | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          original_amount: number;
          current_balance?: number;
          monthly_payment?: number;
          interest_rate?: number | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          original_amount?: number;
          current_balance?: number;
          monthly_payment?: number;
          interest_rate?: number | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      financial_commitments: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          amount: number;
          frequency: "MONTHLY" | "ANNUAL" | "WEEKLY" | "BI_WEEKLY" | "ONE_OFF";
          start_date: string;
          end_date: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          amount: number;
          frequency?: "MONTHLY" | "ANNUAL" | "WEEKLY" | "BI_WEEKLY" | "ONE_OFF";
          start_date?: string;
          end_date?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          amount?: number;
          frequency?: "MONTHLY" | "ANNUAL" | "WEEKLY" | "BI_WEEKLY" | "ONE_OFF";
          start_date?: string;
          end_date?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      financial_decisions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          decision_type: "ONE_OFF_PURCHASE" | "RECURRING_EXPENSE" | "INCOME_CHANGE" | "WINDFALL" | "DEBT_ACCELERATION" | "GOAL_CONTRIBUTION_CHANGE";
          amount: number;
          currency: string;
          proposed_date: string;
          status: "PROPOSED" | "EXECUTED" | "CANCELLED" | "SIMULATED";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          decision_type?: "ONE_OFF_PURCHASE" | "RECURRING_EXPENSE" | "INCOME_CHANGE" | "WINDFALL" | "DEBT_ACCELERATION" | "GOAL_CONTRIBUTION_CHANGE";
          amount: number;
          currency?: string;
          proposed_date?: string;
          status?: "PROPOSED" | "EXECUTED" | "CANCELLED" | "SIMULATED";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          decision_type?: "ONE_OFF_PURCHASE" | "RECURRING_EXPENSE" | "INCOME_CHANGE" | "WINDFALL" | "DEBT_ACCELERATION" | "GOAL_CONTRIBUTION_CHANGE";
          amount?: number;
          currency?: string;
          proposed_date?: string;
          status?: "PROPOSED" | "EXECUTED" | "CANCELLED" | "SIMULATED";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      decision_simulations: {
        Row: {
          id: string;
          user_id: string;
          decision_id: string;
          goal_id: string | null;
          baseline_projected_date: string;
          projected_date_after_decision: string;
          delay_days: number;
          additional_monthly_required: number;
          impact_percentage: number;
          affordability_status: "AFFORDABLE_NO_IMPACT" | "AFFORDABLE_NEGLIGIBLE_DELAY" | "AFFORDABLE_NOTICEABLE_DELAY" | "PLAN_DISRUPTIVE_SEVERE_DELAY" | "UNAFFORDABLE_CASH_DEFICIT";
          calculation_snapshot: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          decision_id: string;
          goal_id?: string | null;
          baseline_projected_date: string;
          projected_date_after_decision: string;
          delay_days?: number;
          additional_monthly_required?: number;
          impact_percentage?: number;
          affordability_status?: "AFFORDABLE_NO_IMPACT" | "AFFORDABLE_NEGLIGIBLE_DELAY" | "AFFORDABLE_NOTICEABLE_DELAY" | "PLAN_DISRUPTIVE_SEVERE_DELAY" | "UNAFFORDABLE_CASH_DEFICIT";
          calculation_snapshot?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          decision_id?: string;
          goal_id?: string | null;
          baseline_projected_date?: string;
          projected_date_after_decision?: string;
          delay_days?: number;
          additional_monthly_required?: number;
          impact_percentage?: number;
          affordability_status?: "AFFORDABLE_NO_IMPACT" | "AFFORDABLE_NEGLIGIBLE_DELAY" | "AFFORDABLE_NOTICEABLE_DELAY" | "PLAN_DISRUPTIVE_SEVERE_DELAY" | "UNAFFORDABLE_CASH_DEFICIT";
          calculation_snapshot?: Json;
          created_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      financial_snapshots: {
        Row: {
          id: string;
          user_id: string;
          snapshot_date: string;
          total_income: number;
          total_expenses: number;
          total_debt: number;
          total_savings: number;
          monthly_free_cashflow: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          snapshot_date?: string;
          total_income?: number;
          total_expenses?: number;
          total_debt?: number;
          total_savings?: number;
          monthly_free_cashflow?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          snapshot_date?: string;
          total_income?: number;
          total_expenses?: number;
          total_debt?: number;
          total_savings?: number;
          monthly_free_cashflow?: number;
          created_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          structured_context: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          structured_context?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: "user" | "assistant" | "system";
          content?: string;
          structured_context?: Json | null;
          created_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      insights: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          severity: "INFO" | "POSITIVE" | "WARNING" | "CRITICAL";
          title: string;
          description: string;
          metadata: Json;
          is_read: boolean;
          dismissed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: string;
          severity?: "INFO" | "POSITIVE" | "WARNING" | "CRITICAL";
          title: string;
          description: string;
          metadata?: Json;
          is_read?: boolean;
          dismissed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          severity?: "INFO" | "POSITIVE" | "WARNING" | "CRITICAL";
          title?: string;
          description?: string;
          metadata?: Json;
          is_read?: boolean;
          dismissed_at?: string | null;
          created_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      saved_scenarios: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          scenario_type: string;
          input: Json;
          result: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          scenario_type?: string;
          input?: Json;
          result?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          scenario_type?: string;
          input?: Json;
          result?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      budget_targets: {
        Row: {
          id: string;
          user_id: string;
          category_name: string;
          monthly_target: number;
          current_actual: number;
          period: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_name: string;
          monthly_target: number;
          current_actual?: number;
          period?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_name?: string;
          monthly_target?: number;
          current_actual?: number;
          period?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      goal_notification_settings: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          goal_title: string;
          target_date: string;
          lead_time_days: number;
          frequency: string;
          notify_via_app: boolean;
          notify_via_whatsapp: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id: string;
          goal_title: string;
          target_date: string;
          lead_time_days?: number;
          frequency?: string;
          notify_via_app?: boolean;
          notify_via_whatsapp?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string;
          goal_title?: string;
          target_date?: string;
          lead_time_days?: number;
          frequency?: string;
          notify_via_app?: boolean;
          notify_via_whatsapp?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      investment_assets: {
        Row: {
          id: string;
          user_id: string;
          asset_name: string;
          asset_class: string;
          initial_invested: number;
          current_market_value: number;
          annual_yield_percent: number;
          monthly_income_generated: number;
          institution_name?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset_name: string;
          asset_class: string;
          initial_invested: number;
          current_market_value: number;
          annual_yield_percent?: number;
          monthly_income_generated?: number;
          institution_name?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          asset_name?: string;
          asset_class?: string;
          initial_invested?: number;
          current_market_value?: number;
          annual_yield_percent?: number;
          monthly_income_generated?: number;
          institution_name?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      financial_notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          is_pinned: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          category?: string;
          is_pinned?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          category?: string;
          is_pinned?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      whatsapp_dispatches: {
        Row: {
          id: string;
          user_id: string;
          phone_number: string;
          goal_title: string;
          digest_message: string;
          status: string;
          provider: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phone_number: string;
          goal_title: string;
          digest_message: string;
          status?: string;
          provider?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          phone_number?: string;
          goal_title?: string;
          digest_message?: string;
          status?: string;
          provider?: string;
          created_at?: string;
        };
        Relationships: GenericRelationship[];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
