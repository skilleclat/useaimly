import { GoalPriority } from "../types/goal";

export interface DestinationPreset {
  key: string;
  title: string;
  category: string;
  description: string;
  defaultAmount: number;
  defaultMonthsAhead: number;
  priority: GoalPriority;
  iconName: string;
  tag: string;
}

export const DESTINATION_PRESETS: DestinationPreset[] = [
  {
    key: "start-business",
    title: "Start a business",
    category: "BUSINESS",
    description: "Launch a consultancy, venture, or digital studio capital reserve.",
    defaultAmount: 500000,
    defaultMonthsAhead: 24,
    priority: "HIGH",
    iconName: "Briefcase",
    tag: "Venture",
  },
  {
    key: "emergency-fund",
    title: "Emergency fund",
    category: "SECURITY",
    description: "3 to 6 months of living expenses safely preserved in liquid MMF.",
    defaultAmount: 350000,
    defaultMonthsAhead: 12,
    priority: "CRITICAL",
    iconName: "Shield",
    tag: "Resilience",
  },
  {
    key: "buy-car",
    title: "Buy a car",
    category: "ASSET",
    description: "Vehicle purchase or down payment for personal or business mobility.",
    defaultAmount: 850000,
    defaultMonthsAhead: 18,
    priority: "MEDIUM",
    iconName: "Car",
    tag: "Mobility",
  },
  {
    key: "buy-home",
    title: "Buy a home",
    category: "PROPERTY",
    description: "Land deposit, construction fund, or home purchase down payment.",
    defaultAmount: 1500000,
    defaultMonthsAhead: 36,
    priority: "HIGH",
    iconName: "Home",
    tag: "Property",
  },
  {
    key: "education",
    title: "Education",
    category: "EDUCATION",
    description: "Postgraduate degree, professional certifications, or specialized bootcamps.",
    defaultAmount: 400000,
    defaultMonthsAhead: 14,
    priority: "HIGH",
    iconName: "GraduationCap",
    tag: "Growth",
  },
  {
    key: "debt-free",
    title: "Become debt-free",
    category: "DEBT_REDUCTION",
    description: "Accelerated payoff of bank loans, SACCO balances, and credit lines.",
    defaultAmount: 300000,
    defaultMonthsAhead: 12,
    priority: "CRITICAL",
    iconName: "TrendingDown",
    tag: "Freedom",
  },
  {
    key: "travel",
    title: "Travel",
    category: "LIFESTYLE",
    description: "Major international exploration, safari expedition, or sabbatical retreat.",
    defaultAmount: 250000,
    defaultMonthsAhead: 10,
    priority: "LOW",
    iconName: "Plane",
    tag: "Experience",
  },
  {
    key: "build-savings",
    title: "Build savings",
    category: "SAVINGS",
    description: "Disciplined capital accumulation to build long-term wealth cushion.",
    defaultAmount: 600000,
    defaultMonthsAhead: 20,
    priority: "HIGH",
    iconName: "PiggyBank",
    tag: "Accumulation",
  },
  {
    key: "invest",
    title: "Invest",
    category: "INVESTMENT",
    description: "Treasury bonds, equities, real estate syndicates, or commercial paper.",
    defaultAmount: 1000000,
    defaultMonthsAhead: 24,
    priority: "HIGH",
    iconName: "LineChart",
    tag: "Compounding",
  },
  {
    key: "custom",
    title: "Custom goal",
    category: "CUSTOM",
    description: "Define your own unique financial aspiration and timeline.",
    defaultAmount: 500000,
    defaultMonthsAhead: 18,
    priority: "HIGH",
    iconName: "Compass",
    tag: "Personal",
  },
];
