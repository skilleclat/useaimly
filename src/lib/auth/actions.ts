"use server";

import { createClient } from "@/lib/supabase/server";
import {
  LoginSchema,
  SignupSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  LoginInput,
  SignupInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/lib/validation/auth.schema";
import { redirect } from "next/navigation";

export interface AuthActionResult {
  success: boolean;
  message?: string;
  redirectTo?: string;
  errors?: Record<string, string[]>;
}

export async function signInWithGoogleAction(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to initiate Google authentication.",
    };
  }

  if (data?.url) {
    return {
      success: true,
      redirectTo: data.url,
    };
  }

  return {
    success: false,
    message: "Google login URL could not be generated.",
  };
}

export async function loginAction(data: LoginInput): Promise<AuthActionResult> {
  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your login details.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let friendlyMessage = "Invalid email or password.";
    if (error.message.toLowerCase().includes("email not confirmed")) {
      friendlyMessage = "Please verify your email address before logging in.";
    } else if (error.message.toLowerCase().includes("network")) {
      friendlyMessage = "Network error. Please try again in a few moments.";
    }

    return {
      success: false,
      message: friendlyMessage,
    };
  }

  if (!authData.user) {
    return { success: false, message: "Authentication failed." };
  }

  // Check onboarding status
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", authData.user.id)
    .single();

  const isCompleted = (profile as { onboarding_completed?: boolean } | null)?.onboarding_completed;
  const redirectTo = isCompleted ? "/app" : "/onboarding";

  return {
    success: true,
    redirectTo,
  };
}

export async function signupAction(data: SignupInput): Promise<AuthActionResult> {
  const parsed = SignupSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the errors in the form.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password, fullName, preferredCurrency } = parsed.data;
  const supabase = await createClient();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        preferred_currency: preferredCurrency,
      },
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    let friendlyMessage = error.message || "Unable to create account. Please try again.";
    if (error.message.toLowerCase().includes("already registered") || error.status === 422) {
      friendlyMessage = "An account with this email address already exists.";
    }
    return {
      success: false,
      message: friendlyMessage,
    };
  }

  // Ensure profile row exists in public.profiles
  if (authData.user) {
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      full_name: fullName,
      preferred_currency: preferredCurrency,
      onboarding_completed: false,
    } as any);
  }

  // If signUp created the user without an active session (e.g. email confirmation requirement), attempt instant sign in
  if (authData.user && !authData.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError && signInError.message.toLowerCase().includes("email not confirmed")) {
      return {
        success: false,
        message: "Account created! Please check your email inbox to confirm your account before logging in.",
      };
    }
  }

  return {
    success: true,
    redirectTo: "/onboarding",
  };
}

export async function forgotPasswordAction(data: ForgotPasswordInput): Promise<AuthActionResult> {
  const parsed = ForgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please enter a valid email address.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email } = parsed.data;
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?type=recovery`,
  });

  if (error) {
    return {
      success: true,
      message: "If an account exists with this email, a recovery link has been sent.",
    };
  }

  return {
    success: true,
    message: "If an account exists with this email, a recovery link has been sent.",
  };
}

export async function resetPasswordAction(data: ResetPasswordInput): Promise<AuthActionResult> {
  const parsed = ResetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please ensure your passwords match and are at least 8 characters.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      success: false,
      message: "Your reset link may have expired. Please request a new link.",
    };
  }

  return {
    success: true,
    message: "Your password has been reset successfully.",
    redirectTo: "/login?message=password_reset_success",
  };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function saveFullOnboardingAction(
  state: import("../onboarding/onboarding-types").OnboardingState,
  calculatedPath: import("../onboarding/onboarding-types").OnboardingCalculatedPath
): Promise<AuthActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User session not found. Please log in." };
  }

  try {
    // 1. Insert Primary Goal
    const { data: goal } = await supabase
      .from("financial_goals")
      .insert({
        user_id: user.id,
        title: state.destination.title || "Primary Destination",
        category: state.destination.category || "BUSINESS",
        target_amount: state.destination.targetAmount,
        current_amount: calculatedPath.assignedGoalCapital || 0,
        target_date: state.destination.targetDate,
        priority: state.destination.priority || "HIGH",
        status: "ACTIVE",
      } as any)
      .select()
      .single();

    // 2. Insert Income Sources
    if (state.income.length > 0) {
      const incomeRows = state.income.map((inc) => ({
        user_id: user.id,
        name: inc.name,
        amount: inc.amount,
        frequency: inc.frequency,
        reliability: inc.reliability,
        is_active: true,
      }));
      await supabase.from("income_sources").insert(incomeRows as any);
    }

    // 3. Insert Recurring Expenses
    if (state.expenses.length > 0) {
      const expenseRows = state.expenses.map((exp) => ({
        user_id: user.id,
        description: exp.name,
        amount: exp.amount,
        frequency: exp.frequency,
        is_fixed: exp.isFixed,
      }));
      await supabase.from("expenses").insert(expenseRows as any);
    }

    // 4. Insert Debts
    if (state.hasDebt && state.debts.length > 0) {
      const debtRows = state.debts.map((d) => ({
        user_id: user.id,
        name: d.name,
        original_amount: d.originalAmount || d.currentBalance,
        current_balance: d.currentBalance,
        monthly_payment: d.monthlyPayment,
        interest_rate: d.interestRate ? d.interestRate / 100 : null,
      }));
      await supabase.from("debts").insert(debtRows as any);
    }

    // 5. Insert Savings Accounts
    if (state.savings.length > 0) {
      const savingsRows = state.savings.map((s) => ({
        user_id: user.id,
        name: s.name,
        current_balance: s.balance,
        goal_id: s.isAssignedToPrimaryGoal ? (goal as any)?.id || null : null,
      }));
      await supabase.from("savings_accounts").insert(savingsRows as any);
    }

    // 6. Insert Commitments
    if (state.commitments.length > 0) {
      const commitmentRows = state.commitments.map((c) => ({
        user_id: user.id,
        title: c.title,
        amount: c.amount,
        frequency: c.frequency,
        category: c.category,
      }));
      await supabase.from("financial_commitments").insert(commitmentRows as any);
    }

    // 7. Insert Initial Financial Snapshot
    await supabase.from("financial_snapshots").insert({
      user_id: user.id,
      total_income: calculatedPath.monthlyGrossIncome,
      total_expenses: calculatedPath.monthlyEssentialExpenses,
      total_debt: state.hasDebt
        ? state.debts.reduce((sum, d) => sum + d.currentBalance, 0)
        : 0,
      total_savings: calculatedPath.totalLiquidSavings,
      monthly_free_cashflow: calculatedPath.monthlyFreeCashFlow,
    } as any);

    // 8. Update Profile: Mark Onboarding Completed
    await (supabase.from("profiles") as any)
      .update({
        preferred_currency: state.currency,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    return {
      success: true,
      redirectTo: "/app",
    };
  } catch (err: any) {
    console.error("Onboarding persistence error:", err);
    return {
      success: false,
      message: "An error occurred saving your trajectory. Please try again.",
    };
  }
}

export async function completeOnboardingAction(goalData: {
  title: string;
  targetAmount: number;
  targetDate: string;
  initialSavings: number;
  monthlyFreeCashFlow: number;
}): Promise<AuthActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User session not found." };
  }

  // 1. Create primary goal
  const { data: goal } = await supabase
    .from("financial_goals")
    .insert({
      user_id: user.id,
      title: goalData.title || "Primary Financial Destination",
      target_amount: goalData.targetAmount,
      current_amount: goalData.initialSavings || 0,
      target_date: goalData.targetDate,
      priority: "CRITICAL",
      status: "ACTIVE",
    } as any)
    .select()
    .single();

  // 2. Create initial liquid savings account
  if (goalData.initialSavings > 0) {
    await supabase.from("savings_accounts").insert({
      user_id: user.id,
      name: "Primary Savings Buffer",
      current_balance: goalData.initialSavings,
      goal_id: (goal as any)?.id || null,
    } as any);
  }

  // 3. Mark onboarding as completed
  await (supabase.from("profiles") as any)
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  return {
    success: true,
    redirectTo: "/app",
  };
}

