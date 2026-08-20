import { CurrencyCode } from "@/lib/types/finance";
import { TrajectoryState } from "@/components/design-system/FinancialStatus";

export interface DestinationDecisionImpact {
  id: string;
  title: string;
  amount: number;
  date: string;
  impactType: "POSITIVE" | "NEGATIVE";
  shiftDays: number;
  description: string;
}

export interface DestinationContribution {
  id: string;
  date: string;
  amount: number;
  source: string;
  balanceAfter: number;
}

export interface DestinationItem {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // e.g. "2027-12-31"
  priority: "HIGH" | "MEDIUM" | "LOW";
  monthlyContribution: number;
  projectedCompletionDate: string; // e.g. "2027-11-15"
  status: TrajectoryState;
  isPaused?: boolean;
  isArchived?: boolean;
  notes?: string;
  decisionsAffecting: DestinationDecisionImpact[];
  upcomingRisks: { title: string; severity: "LOW" | "MEDIUM" | "HIGH"; description: string }[];
  contributionHistory: DestinationContribution[];
}

export const INITIAL_DESTINATIONS: DestinationItem[] = [
  {
    id: "dest-1",
    name: "Start my business",
    category: "BUSINESS",
    targetAmount: 500000,
    currentAmount: 180000,
    targetDate: "2027-12-31",
    priority: "HIGH",
    monthlyContribution: 45000,
    projectedCompletionDate: "2027-11-15",
    status: "ON_TRACK",
    notes: "Seed capital for product launch, tech setup, and 6-month operational buffer.",
    decisionsAffecting: [
      {
        id: "dec-1",
        title: "Ergonomic Studio Workstation",
        amount: 35000,
        date: "2026-08-14",
        impactType: "NEGATIVE",
        shiftDays: 12,
        description: "Delayed projected arrival by 12 days; absorbed through free cash flow.",
      },
      {
        id: "dec-2",
        title: "Client Windfall Bonus Deposit",
        amount: 50000,
        date: "2026-07-20",
        impactType: "POSITIVE",
        shiftDays: -35,
        description: "Accelerated arrival timeline by 35 days.",
      },
    ],
    upcomingRisks: [
      {
        title: "Discretionary Spending Creep",
        severity: "MEDIUM",
        description: "Unplanned dining/entertainment above KES 15k/mo could push arrival past Dec 2027.",
      },
      {
        title: "Annual Insurance Renewal",
        severity: "LOW",
        description: "KES 45,000 due in October 2026 is fully amortized.",
      },
    ],
    contributionHistory: [
      { id: "c-1", date: "2026-08-01", amount: 45000, source: "Monthly Salary Allocation", balanceAfter: 180000 },
      { id: "c-2", date: "2026-07-20", amount: 50000, source: "Consultancy Bonus", balanceAfter: 135000 },
      { id: "c-3", date: "2026-07-01", amount: 45000, source: "Monthly Salary Allocation", balanceAfter: 85000 },
      { id: "c-4", date: "2026-06-01", amount: 40000, source: "Initial Allocation", balanceAfter: 40000 },
    ],
  },
  {
    id: "dest-2",
    name: "Emergency Liquidity Cushion",
    category: "EMERGENCY_FUND",
    targetAmount: 300000,
    currentAmount: 240000,
    targetDate: "2026-12-31",
    priority: "HIGH",
    monthlyContribution: 15000,
    projectedCompletionDate: "2026-11-30",
    status: "AHEAD",
    notes: "6 months of essential housing, food, and family obligations in high-yield MMF.",
    decisionsAffecting: [
      {
        id: "dec-3",
        title: "Auto-sweep to Money Market Fund",
        amount: 15000,
        date: "2026-08-01",
        impactType: "POSITIVE",
        shiftDays: -10,
        description: "Consistent monthly funding ahead of planned December target.",
      },
    ],
    upcomingRisks: [
      {
        title: "Emergency Medical Drawdown",
        severity: "LOW",
        description: "Comprehensive health insurance covers major inpatient risks.",
      },
    ],
    contributionHistory: [
      { id: "c-5", date: "2026-08-01", amount: 15000, source: "Monthly MMF Transfer", balanceAfter: 240000 },
      { id: "c-6", date: "2026-07-01", amount: 15000, source: "Monthly MMF Transfer", balanceAfter: 225000 },
      { id: "c-7", date: "2026-06-01", amount: 20000, source: "MMF Initial Seed", balanceAfter: 210000 },
    ],
  },
  {
    id: "dest-3",
    name: "Vehicle Upgrade",
    category: "VEHICLE",
    targetAmount: 800000,
    currentAmount: 120000,
    targetDate: "2028-06-30",
    priority: "MEDIUM",
    monthlyContribution: 8000,
    projectedCompletionDate: "2029-04-15",
    status: "AT_RISK",
    notes: "Reliable crossover vehicle for regional travel and family.",
    decisionsAffecting: [
      {
        id: "dec-4",
        title: "Reduced Monthly Pace to Prioritize Business",
        amount: 12000,
        date: "2026-06-01",
        impactType: "NEGATIVE",
        shiftDays: 280,
        description: "Lower monthly contribution pace delayed completion to 2029.",
      },
    ],
    upcomingRisks: [
      {
        title: "Capital Competition",
        severity: "HIGH",
        description: "Business goal takes priority for 65% of free cash flow.",
      },
    ],
    contributionHistory: [
      { id: "c-8", date: "2026-08-01", amount: 8000, source: "Monthly Sinking Fund", balanceAfter: 120000 },
      { id: "c-9", date: "2026-07-01", amount: 8000, source: "Monthly Sinking Fund", balanceAfter: 112000 },
    ],
  },
];
