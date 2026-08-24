/**
 * UseAimly SaaS Pricing & Monetization Strategy
 * Pure Scalable SaaS: Two Plans Only (FREE & PRO)
 * "See tomorrow before deciding today"
 */

export type PlanTier = "free" | "pro";

export interface PricingPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  badge?: string;
  isPopular?: boolean;
  priceMonthlyUSD: number;
  priceYearlyUSD: number; // monthly equivalent when billed annually ($3.25/mo)
  totalYearlyUSD: number; // full annual bill amount ($39/yr)
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
    name: "Try Before You Trust",
    tagline: "Experience the decision engine on your initial financial choices.",
    priceMonthlyUSD: 0,
    priceYearlyUSD: 0,
    totalYearlyUSD: 0,
    priceMonthlyKES: 0,
    priceYearlyKES: 0,
    ctaText: "Analyze My First Decision",
    ctaHref: "/app/decide",
    features: [
      { text: "3 Decision Analyses per month", included: true, highlight: true },
      { text: "1 Active Financial Goal", included: true },
      { text: "Basic Decision Verdict (Recommended / Caution / Not Recommended)", included: true },
      { text: "Buy Now vs Wait comparison", included: true },
      { text: "Basic financial profile & cash cushion monitor", included: true },
      { text: "Unlimited Decision Analyses", included: false },
      { text: "Unlimited Financial Goals", included: false },
      { text: "Full Financial Impact & Emergency Risk Analysis", included: false },
      { text: "Multi-Option Comparison & Decision History Vault", included: false },
      { text: "Monthly Financial Trajectory Review", included: false },
    ],
  },
  {
    id: "pro",
    name: "UseAimly Pro",
    tagline: "Make every major financial decision with clarity.",
    badge: "Continuous Decision System",
    isPopular: true,
    priceMonthlyUSD: 4.99,
    priceYearlyUSD: 3.25, // $39 / 12 months = $3.25/mo (35% savings)
    totalYearlyUSD: 39.00,
    priceMonthlyKES: 650,
    priceYearlyKES: 5000,
    ctaText: "Upgrade to Pro",
    ctaHref: "/checkout?plan=pro",
    features: [
      { text: "Unlimited Decision Analyses", included: true, highlight: true },
      { text: "Unlimited Financial Goals & Destinations", included: true, highlight: true },
      { text: "Full Financial Impact Analysis", included: true, highlight: true },
      { text: "Compare Multiple Options Side-by-Side", included: true, highlight: true },
      { text: "Buy vs Wait vs Finance Scenarios", included: true, highlight: true },
      { text: "Advanced Goal Impact & Exact Timeline Shifts", included: true, highlight: true },
      { text: "Emergency Runway & Risk Vulnerability Analysis", included: true },
      { text: "Complete Decision History & Vault Memory", included: true },
      { text: "Advanced Scenarios & What-If Sandbox", included: true },
      { text: "Monthly Financial Trajectory Review", included: true },
      { text: "Saved decision assumptions and comparisons", included: true },
    ],
  },
];

export const PRICING_FAQS = [
  {
    question: "Why does UseAimly charge for a decision engine rather than AI chat?",
    answer: "Generic AI chatbots give vague opinions without doing deterministic math. UseAimly is a continuous financial decision engine connected directly to your personal profile, calculating exact delay days and runway impact before you commit.",
  },
  {
    question: "What is included in the Free 'Try Before You Trust' plan?",
    answer: "Free gives you 3 complete decision analyses per month, 1 active goal, and basic Buy vs Wait comparison so you can experience the clarity of the engine before upgrading.",
  },
  {
    question: "How does the $39/year annual billing work?",
    answer: "When billed annually at $39/year, you pay the equivalent of just $3.25/month—saving 35% compared to month-to-month billing ($4.99/mo). You can cancel renewal anytime with a single click.",
  },
  {
    question: "Is my financial data secure?",
    answer: "Yes, 100%. UseAimly does not require bank credentials or sensitive account logins. All calculations are executed privately and deterministically.",
  },
];
