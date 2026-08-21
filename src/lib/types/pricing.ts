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
    name: "Starter / Gratuit",
    tagline: "Pour découvrir l'intelligence décisionnelle et tester le moteur.",
    priceMonthlyUSD: 0,
    priceYearlyUSD: 0,
    priceMonthlyKES: 0,
    priceYearlyKES: 0,
    ctaText: "Commencer Gratuitement",
    ctaHref: "/signup?plan=free",
    features: [
      { text: "1 Objectif de vie principal (Destination)", included: true },
      { text: "Calculateur de Cashflow Mensuel & Solde", included: true },
      { text: "Simulations d'achat basiques (1 option)", included: true },
      { text: "Données de démonstration & sandbox", included: true },
      { text: "Studio d'impact multi-stratégies (Spread, Postpone)", included: false },
      { text: "6 Règles d'Insights Proactifs 60 jours", included: false },
      { text: "Assistant IA Financier dédié (Gemini / GPT-4)", included: false },
      { text: "Laboratoire 'What-If' Scenarios illimités", included: false },
      { text: "Exportation des données (CSV / PDF)", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro Strategist",
    tagline: "Pour les décideurs actifs voulant optimiser chaque dépense et conserver l'avance.",
    badge: "Plus Populaire",
    isPopular: true,
    priceMonthlyUSD: 19,
    priceYearlyUSD: 15,
    priceMonthlyKES: 2500,
    priceYearlyKES: 2000,
    ctaText: "Essayer Pro Gratuitement",
    ctaHref: "/signup?plan=pro",
    features: [
      { text: "Objectifs de vie illimités (Multi-Destinations)", included: true, highlight: true },
      { text: "Calculateur de Cashflow Mensuel & Solde", included: true },
      { text: "Studio d'impact 3 Stratégies (Cash, Spread, Postpone)", included: true, highlight: true },
      { text: "6 Règles d'Insights Proactifs 60 jours", included: true, highlight: true },
      { text: "Gestion complète des 6 flux financiers", included: true },
      { text: "Exportation des données (CSV & Rapports)", included: true },
      { text: "Support prioritaire par e-mail", included: true },
      { text: "Assistant IA Financier dédié (Gemini / GPT-4)", included: false },
      { text: "Laboratoire 'What-If' Scenarios illimités", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium / Élite",
    tagline: "Pour les entrepreneurs, investisseurs et gestionnaires de patrimoine exigeants.",
    badge: "Expérience Complète",
    priceMonthlyUSD: 49,
    priceYearlyUSD: 39,
    priceMonthlyKES: 6500,
    priceYearlyKES: 5200,
    ctaText: "Débloquer l'Élite",
    ctaHref: "/signup?plan=premium",
    features: [
      { text: "Tout ce qui est inclus dans le Plan Pro", included: true },
      { text: "Assistant IA Financier interactif (Gemini / GPT-4)", included: true, highlight: true },
      { text: "Laboratoire 'What-If' Scenarios illimités", included: true, highlight: true },
      { text: "Stratégies d'extinction de dettes sur mesure", included: true, highlight: true },
      { text: "Agrégation multi-comptes & devises", included: true },
      { text: "Session d'orientation 1-on-1 VIP", included: true },
      { text: "Support prioritaire WhatsApp & e-mail 24/7", included: true },
    ],
  },
];

export const PRICING_FAQS = [
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer: "Oui, absolument. Vous pouvez passer d'un plan gratuit à Pro ou Premium à tout moment depuis votre tableau de bord. La différence de prix est proratisée.",
  },
  {
    question: "Comment fonctionne l'essai gratuit du plan Pro ?",
    answer: "Le plan Pro propose 14 jours d'essai sans engagement. Aucune carte de crédit n'est requise pour démarrer la période d'essai.",
  },
  {
    question: "Mes données bancaires sont-elles en sécurité ?",
    answer: "Absolument. UseAimly n'a pas besoin de vos identifiants bancaires secrets. Vous saisissez ou importez vos données de trésorerie en toute confidentialité.",
  },
  {
    question: "Quelle est la différence entre le plan Pro et Premium ?",
    answer: "Le plan Pro inclut le moteur déterministe complet et les simulations 3 stratégies. Le plan Premium y ajoute l'Assistant IA conversationnel avancé (Gemini/OpenAI), le Laboratoire What-If sans limite et un support VIP.",
  },
];
