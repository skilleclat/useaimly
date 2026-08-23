/**
 * Useaimly SaaS Pricing & Subscription Tiers
 * "See tomorrow before deciding today"
 */

export type PlanTier = "free" | "pro" | "premium";

export interface PricingPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  badge?: string;
  isPopular?: boolean;
  priceMonthlyUSD: number;
  priceYearlyUSD: number; // monthly equivalent when billed annually
  totalYearlyUSD: number; // full annual bill amount
  priceMonthlyKES: number;
  priceYearlyKES: number;
  ctaText: string;
  ctaHref: string;
  features: {
    text: string;
    included: boolean;
    highlight?: boolean;
  }[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Explore decision intelligence and test your baseline trajectory.",
    priceMonthlyUSD: 0,
    priceYearlyUSD: 0,
    totalYearlyUSD: 0,
    priceMonthlyKES: 0,
    priceYearlyKES: 0,
    ctaText: "Get Started Free",
    ctaHref: "/signup?plan=free",
    features: [
      { text: "1 Primary Financial Destination", included: true },
      { text: "Monthly Cashflow & Free Balance Calculator", included: true },
      { text: "Basic Purchase Decision Simulation", included: true },
      { text: "Interactive Sandbox & Demo Data Mode", included: true },
      { text: "3-Strategy Decision Impact Studio (Spread, Postpone)", included: false },
      { text: "6 Proactive Insight Alert Rules", included: false },
      { text: "Dedicated AI Financial Advisor (Gemini / GPT-4)", included: false },
      { text: "Unlimited 'What-If' Scenario Laboratory", included: false },
      { text: "Financial Data Export (CSV & PDF)", included: false },
    ],
  },
  {
    id: "pro",
    name: "Aimly Pro",
    tagline: "For active decision makers looking to optimize every spend and stay ahead.",
    badge: "Special Test Offer",
    isPopular: true,
    priceMonthlyUSD: 1.00,
    priceYearlyUSD: 0.83,
    totalYearlyUSD: 10.00,
    priceMonthlyKES: 130,
    priceYearlyKES: 1300,
    ctaText: "Try Aimly Pro ($1)",
    ctaHref: "/checkout?plan=pro",
    features: [
      { text: "Unlimited Financial Destinations", included: true, highlight: true },
      { text: "Monthly Cashflow & Free Balance Calculator", included: true },
      { text: "3-Strategy Impact Studio (Cash, Spread, Postpone)", included: true, highlight: true },
      { text: "6 Proactive Insight Rules (60-Day Foresight)", included: true, highlight: true },
      { text: "AI Financial Notepad & Strategic Context Sync", included: true, highlight: true },
      { text: "Full 6 Financial Cash Flow Management", included: true },
      { text: "Data Export (CSV & Custom Reports)", included: true },
      { text: "Priority Email Support", included: true },
      { text: "Dedicated AI Financial Advisor (Gemini / GPT-4)", included: false },
      { text: "Unlimited 'What-If' Scenario Laboratory", included: false },
    ],
  },
  {
    id: "premium",
    name: "Aimly Premium",
    tagline: "For entrepreneurs, business owners, and high net-worth decision makers.",
    badge: "Complete Experience",
    priceMonthlyUSD: 9.99,
    priceYearlyUSD: 6.67,
    totalYearlyUSD: 79.99,
    priceMonthlyKES: 1300,
    priceYearlyKES: 10400,
    ctaText: "Unlock Aimly Premium",
    ctaHref: "/checkout?plan=premium",
    features: [
      { text: "Everything included in Aimly Pro", included: true },
      { text: "Interactive AI Financial Advisor (Gemini / GPT-4)", included: true, highlight: true },
      { text: "AI Financial Notepad & Unlimited Rules Engine", included: true, highlight: true },
      { text: "Unlimited 'What-If' Scenario Laboratory", included: true, highlight: true },
      { text: "Custom Debt Elimination Strategies", included: true, highlight: true },
      { text: "Multi-Account & Currency Aggregation", included: true },
      { text: "1-on-1 VIP Strategy Orientation Session", included: true },
      { text: "24/7 Priority WhatsApp & Email Support", included: true },
    ],
  },
];

export const PRICING_FAQS = [
  {
    question: "Can I change or upgrade my plan anytime?",
    answer: "Yes, absolutely. You can upgrade, downgrade, or switch between plans at any time directly from your dashboard settings. Pricing adjustments are prorated.",
  },
  {
    question: "How does the Pro 14-day free trial work?",
    answer: "The Pro plan includes a 14-day risk-free trial. No credit card is required to start testing Pro features during your onboarding.",
  },
  {
    question: "Is my financial data secure?",
    answer: "Yes, 100%. UseAimly does not require bank credentials or sensitive account logins. All calculations are executed deterministically and privately on your end.",
  },
  {
    question: "What is the difference between Pro and Premium?",
    answer: "The Pro plan provides the complete 3-strategy decision studio and 6 proactive insight rules. Premium adds our interactive AI Advisor (Gemini/OpenAI), unlimited 'What-If' scenario testing, and 1-on-1 VIP support.",
  },
];
