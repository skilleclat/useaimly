import { CurrencyCode } from "@/lib/types/finance";
import { formatCurrency } from "@/lib/utils/currency";

export type StressScenarioId =
  | "INCOME_SHOCK_30"
  | "INCOME_SHOCK_50"
  | "EXPENSE_INFLATION_20"
  | "EMERGENCY_OUTFLOW_100K"
  | "MULTI_STRESS_COMBINED";

export interface StressScenario {
  id: StressScenarioId;
  name: string;
  description: string;
  iconName: string;
  severity: "MODERATE" | "HIGH" | "CRITICAL";
  incomeChangePercentage: number;
  expenseChangePercentage: number;
  oneOffOutflow: number;
  durationMonths: number;
}

export interface StressTestResult {
  scenario: StressScenario;
  originalGrossIncome: number;
  stressedGrossIncome: number;
  originalLivingExpenses: number;
  stressedLivingExpenses: number;
  originalFreeCashFlow: number;
  stressedFreeCashFlow: number;
  originalLiquidSavings: number;
  stressedLiquidSavings: number;
  originalRunwayMonths: number;
  stressedRunwayMonths: number;
  resilienceScore: number; // 0 - 100
  resilienceVerdict: "IMMUNE" | "RESILIENT" | "VULNERABLE" | "HIGH_RISK";
  breakdownMonthIndex?: number;
  breakdownDateFormatted?: string;
  actionableShieldPlan: string[];
}

export const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: "INCOME_SHOCK_30",
    name: "30% Client Retainer / Income Drop",
    description: "Simulates a 30% reduction in gross monthly income for 4 consecutive months.",
    iconName: "TrendingDown",
    severity: "MODERATE",
    incomeChangePercentage: -30,
    expenseChangePercentage: 0,
    oneOffOutflow: 0,
    durationMonths: 4,
  },
  {
    id: "INCOME_SHOCK_50",
    name: "50% Income Shock (Severe Contract Loss)",
    description: "Simulates a major 50% income drop for 3 months.",
    iconName: "AlertTriangle",
    severity: "HIGH",
    incomeChangePercentage: -50,
    expenseChangePercentage: 0,
    oneOffOutflow: 0,
    durationMonths: 3,
  },
  {
    id: "EXPENSE_INFLATION_20",
    name: "20% Living Outflows & Inflation Surge",
    description: "Simulates a 20% increase in essential rent, food, transport & utility outflows.",
    iconName: "Flame",
    severity: "MODERATE",
    incomeChangePercentage: 0,
    expenseChangePercentage: 20,
    oneOffOutflow: 0,
    durationMonths: 6,
  },
  {
    id: "EMERGENCY_OUTFLOW_100K",
    name: "100,000 KES Emergency Outflow Shock",
    description: "Simulates an immediate 100,000 KES unexpected medical or repair emergency.",
    iconName: "Zap",
    severity: "HIGH",
    incomeChangePercentage: 0,
    expenseChangePercentage: 0,
    oneOffOutflow: 100000,
    durationMonths: 1,
  },
  {
    id: "MULTI_STRESS_COMBINED",
    name: "Combined Shock: -25% Income + 15% Inflation",
    description: "Simulates simultaneous income reduction and living cost inflation.",
    iconName: "ShieldAlert",
    severity: "CRITICAL",
    incomeChangePercentage: -25,
    expenseChangePercentage: 15,
    oneOffOutflow: 0,
    durationMonths: 6,
  },
];

export function runStressTest(
  scenarioId: StressScenarioId,
  grossIncome: number = 180000,
  livingExpenses: number = 97000,
  debtService: number = 10000,
  commitmentsAmortized: number = 3750,
  liquidSavings: number = 240000,
  currency: CurrencyCode = "KES"
): StressTestResult {
  const scenario = STRESS_SCENARIOS.find((s) => s.id === scenarioId) || STRESS_SCENARIOS[0];

  const totalFixedOutflows = livingExpenses + debtService + commitmentsAmortized;
  const originalFCF = grossIncome - totalFixedOutflows;
  const originalRunway = Number((liquidSavings / totalFixedOutflows).toFixed(1));

  // Calculate Stressed Values
  const incomeMultiplier = 1 + scenario.incomeChangePercentage / 100;
  const expenseMultiplier = 1 + scenario.expenseChangePercentage / 100;

  const stressedGross = grossIncome * incomeMultiplier;
  const stressedLiving = livingExpenses * expenseMultiplier;
  const stressedTotalOutflows = stressedLiving + debtService + commitmentsAmortized;
  const stressedFCF = stressedGross - stressedTotalOutflows;

  // Calculate Liquid Savings after scenario duration & one-off outflow
  const monthlyDrain = stressedFCF < 0 ? Math.abs(stressedFCF) : 0;
  const totalDurationDrain = monthlyDrain * scenario.durationMonths + scenario.oneOffOutflow;

  const stressedSavings = Math.max(0, liquidSavings - totalDurationDrain);
  const stressedRunway = Number((stressedSavings / stressedTotalOutflows).toFixed(1));

  // Resilience Score Calculation (0 to 100)
  // Weighted: 40% Runway Months, 40% FCF Margin, 20% Net Savings preservation
  const runwayFactor = Math.min(40, (stressedRunway / 6) * 40);
  const fcfFactor = stressedFCF >= 0 ? 40 : Math.max(0, 40 - (Math.abs(stressedFCF) / grossIncome) * 80);
  const savingsFactor = Math.min(20, (stressedSavings / liquidSavings) * 20);

  const resilienceScore = Math.min(100, Math.max(0, Math.round(runwayFactor + fcfFactor + savingsFactor)));

  let resilienceVerdict: StressTestResult["resilienceVerdict"] = "IMMUNE";
  if (resilienceScore < 35) resilienceVerdict = "HIGH_RISK";
  else if (resilienceScore < 60) resilienceVerdict = "VULNERABLE";
  else if (resilienceScore < 85) resilienceVerdict = "RESILIENT";

  // Liquidity breakdown date calculation if negative cash flow
  let breakdownMonthIndex: number | undefined;
  let breakdownDateFormatted: string | undefined;

  if (stressedFCF < 0 && liquidSavings > 0) {
    const monthsUntilZero = Math.floor(liquidSavings / Math.abs(stressedFCF));
    if (monthsUntilZero <= 24) {
      breakdownMonthIndex = monthsUntilZero;
      const breakdownDate = new Date();
      breakdownDate.setMonth(breakdownDate.getMonth() + monthsUntilZero);
      breakdownDateFormatted = breakdownDate.toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      });
    }
  }

  // Generate actionable shield recommendations
  const actionableShieldPlan: string[] = [];
  if (stressedFCF < 0) {
    actionableShieldPlan.push(
      `Temporarily pause discretionary secondary goal contributions to save ${formatCurrency(Math.abs(stressedFCF), currency)}/month.`
    );
  }
  if (stressedRunway < 3) {
    actionableShieldPlan.push(
      `Boost liquid cash reserves to at least ${formatCurrency(stressedTotalOutflows * 3, currency)} before executing major capital purchases.`
    );
  }
  if (debtService > 0 && resilienceScore < 60) {
    actionableShieldPlan.push(
      `Consider refinancing active debt facilities to lower monthly payment below ${formatCurrency(debtService * 0.7, currency)}.`
    );
  }
  if (actionableShieldPlan.length === 0) {
    actionableShieldPlan.push("Your profile is rock-solid. Maintain current savings allocations with zero adjustment.");
  }

  return {
    scenario,
    originalGrossIncome: grossIncome,
    stressedGrossIncome: stressedGross,
    originalLivingExpenses: livingExpenses,
    stressedLivingExpenses: stressedLiving,
    originalFreeCashFlow: originalFCF,
    stressedFreeCashFlow: stressedFCF,
    originalLiquidSavings: liquidSavings,
    stressedLiquidSavings: stressedSavings,
    originalRunwayMonths: originalRunway,
    stressedRunwayMonths: stressedRunway,
    resilienceScore,
    resilienceVerdict,
    breakdownMonthIndex,
    breakdownDateFormatted,
    actionableShieldPlan,
  };
}
