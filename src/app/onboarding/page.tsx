"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StepIndicator } from "./components/StepIndicator";
import { Step1Destination } from "./components/Step1Destination";
import { Step2Income } from "./components/Step2Income";
import { Step3Expenses } from "./components/Step3Expenses";
import { Step4Debt } from "./components/Step4Debt";
import { Step5Savings } from "./components/Step5Savings";
import { Step6Commitments } from "./components/Step6Commitments";
import { Step7TrajectoryReveal } from "./components/Step7TrajectoryReveal";
import { OnboardingState } from "@/lib/onboarding/onboarding-types";
import { calculateOnboardingPath } from "@/lib/onboarding/onboarding-calculator";
import { saveFullOnboardingAction } from "@/lib/auth/actions";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { CurrencyCode } from "@/lib/types/finance";
import { addMonths, formatDateToISO } from "@/lib/utils/date";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import { DESTINATION_PRESETS } from "@/lib/onboarding/onboarding-presets";
import { AlertCircle } from "lucide-react";

export default function OnboardingWizardPage() {
  const { profile, refreshProfile } = useAuth();
  const { currency } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  // Read query params q and preset to populate Step 1 Destination
  useEffect(() => {
    const qParam = searchParams.get("q");
    const presetParam = searchParams.get("preset");

    if (qParam || presetParam) {
      if (qParam) {
        const parsed = parseDecisionQuery(qParam, currency);
        const titleText = parsed.isValid && parsed.extractedTitle ? parsed.extractedTitle : qParam;
        const amountVal = parsed.isValid && parsed.extractedAmount > 0 ? parsed.extractedAmount : 500000;

        setOnboardingState((prev) => ({
          ...prev,
          destination: {
            ...prev.destination,
            title: titleText,
            targetAmount: amountVal,
            presetKey: presetParam || "custom",
          },
        }));
      } else if (presetParam) {
        const matchedPreset = DESTINATION_PRESETS.find((p) => p.key === presetParam);
        if (matchedPreset) {
          setOnboardingState((prev) => ({
            ...prev,
            destination: {
              ...prev.destination,
              presetKey: matchedPreset.key,
              title: matchedPreset.title,
              targetAmount: matchedPreset.defaultAmount,
              category: matchedPreset.category,
            },
          }));
        }
      }
    }
  }, [searchParams, currency]);


  // Smooth scroll to top whenever step changes on mobile/desktop
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  // Keep onboarding currency synced with active global currency context
  useEffect(() => {
    setOnboardingState((prev) => ({ ...prev, currency }));
  }, [currency]);

  // Comprehensive initial state with realistic defaults
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    currency,
    destination: {
      presetKey: "start-business",
      title: "Start my business",
      description: "Launch consultancy & digital studio capital reserve.",
      category: "BUSINESS",
      targetAmount: 500000,
      currentAmount: 120000,
      targetDate: formatDateToISO(addMonths(new Date(), 24)),
      priority: "HIGH",
    },
    income: [
      {
        id: "inc-1",
        name: "Primary Salary / Main Inflow",
        amount: 180000,
        frequency: "MONTHLY",
        reliability: "STABLE",
      },
    ],
    expenses: [
      { id: "exp-1", name: "Rent & Housing", category: "FIXED", amount: 45000, frequency: "MONTHLY", isFixed: true },
      { id: "exp-2", name: "Food & Groceries", category: "FIXED", amount: 25000, frequency: "MONTHLY", isFixed: true },
      { id: "exp-3", name: "Transport & Fuel", category: "VARIABLE", amount: 15000, frequency: "MONTHLY", isFixed: false },
      { id: "exp-4", name: "Utilities & Electricity", category: "FIXED", amount: 8000, frequency: "MONTHLY", isFixed: true },
      { id: "exp-5", name: "Internet & Phone", category: "FIXED", amount: 5000, frequency: "MONTHLY", isFixed: true },
      { id: "exp-6", name: "Family Support & Remittances", category: "FIXED", amount: 15000, frequency: "MONTHLY", isFixed: true },
      { id: "exp-7", name: "Digital Subscriptions", category: "FIXED", amount: 4000, frequency: "MONTHLY", isFixed: true },
    ],
    hasDebt: false,
    debts: [],
    savings: [
      { id: "sav-1", name: "Checking / M-Pesa Buffer", balance: 85000, type: "CHECKING", isAssignedToPrimaryGoal: false },
      { id: "sav-2", name: "Money Market Fund (MMF)", balance: 120000, type: "MMF", isAssignedToPrimaryGoal: true },
    ],
    commitments: [
      {
        id: "com-1",
        title: "Annual Health & Motor Insurance",
        amount: 45000,
        frequency: "ANNUAL",
        nextDueDate: formatDateToISO(addMonths(new Date(), 6)),
        category: "INSURANCE",
      },
    ],
  });

  // Calculate deterministic path instantaneously whenever state updates
  const calculatedPath = useMemo(() => {
    return calculateOnboardingPath(onboardingState);
  }, [onboardingState]);

  const handleNext = () => {
    setServerError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const handleBack = () => {
    setServerError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinish = () => {
    setServerError(null);
    startTransition(async () => {
      const result = await saveFullOnboardingAction(onboardingState, calculatedPath);
      if (result.success) {
        await refreshProfile();
        router.push("/app");
        router.refresh();
      } else {
        setServerError(result.message || "Failed to save your financial profile.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto space-y-6">

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={7}
          onStepClick={(step) => setCurrentStep(step)}
        />

        {serverError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Active Step Content */}
        <div className="pt-2">
          {currentStep === 1 && (
            <Step1Destination
              destination={onboardingState.destination}
              currency={currency}
              onChange={(dest) => setOnboardingState((s) => ({ ...s, destination: dest }))}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <Step2Income
              income={onboardingState.income}
              currency={currency}
              onChange={(inc) => setOnboardingState((s) => ({ ...s, income: inc }))}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <Step3Expenses
              expenses={onboardingState.expenses}
              currency={currency}
              onChange={(exp) => setOnboardingState((s) => ({ ...s, expenses: exp }))}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <Step4Debt
              hasDebt={onboardingState.hasDebt}
              debts={onboardingState.debts}
              currency={currency}
              onToggleHasDebt={(hasDebt) => setOnboardingState((s) => ({ ...s, hasDebt }))}
              onDebtsChange={(debts) => setOnboardingState((s) => ({ ...s, debts }))}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 5 && (
            <Step5Savings
              savings={onboardingState.savings}
              destinationTitle={onboardingState.destination.title}
              currency={currency}
              onChange={(savings) => setOnboardingState((s) => ({ ...s, savings }))}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 6 && (
            <Step6Commitments
              commitments={onboardingState.commitments}
              currency={currency}
              onChange={(commitments) => setOnboardingState((s) => ({ ...s, commitments }))}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 7 && (
            <Step7TrajectoryReveal
              state={onboardingState}
              calculatedPath={calculatedPath}
              onFinish={handleFinish}
              onBack={handleBack}
              onEditStep={(step) => setCurrentStep(step)}
              isPending={isPending}
            />
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center text-xs font-mono text-muted-foreground pb-6">
        Useaimly • See tomorrow before deciding today
      </div>
    </div>
  );
}
