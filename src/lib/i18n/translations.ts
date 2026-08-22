export type LanguageCode = "en" | "fr";

export interface TranslationDictionary {
  // Navigation
  navDestinations: string;
  navDecide: string;
  navWhatIf: string;
  navNotes: string;
  navMoney: string;
  navInvestments: string;
  navSettings: string;
  navPricing: string;
  navDesignSystem: string;
  navGetStarted: string;
  navSignIn: string;
  navSignOut: string;

  // Hero & Dashboard
  greetingPrefix: string;
  heroSubtitle: string;
  totalSaved: string;
  totalTargetGoals: string;
  progress: string;
  myActiveGoals: string;
  createGoal: string;
  onTrack: string;
  needsAttention: string;
  offTrack: string;

  // Decision Studio
  decideHeroTitle: string;
  decideSubtitle: string;
  askPlaceholder: string;
  simulateBtn: string;
  strategyCash: string;
  strategySpread: string;
  strategyPostpone: string;

  // Goal Wizard
  wizardTitle: string;
  wizardStepOf: string;
  whatsYourGoal: string;
  monthlySavingsNeeded: string;
  monthsToGoal: string;
  shareOfIncome: string;

  // System & Footer
  systemOperational: string;
  deterministicMath: string;
  rightsReserved: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    navDestinations: "Destinations",
    navDecide: "Decide",
    navWhatIf: "What If?",
    navNotes: "Notes",
    navMoney: "Money",
    navInvestments: "Investments",
    navSettings: "Settings",
    navPricing: "Pricing",
    navDesignSystem: "Design System",
    navGetStarted: "Get Started",
    navSignIn: "Sign In",
    navSignOut: "Sign Out",

    greetingPrefix: "Hello",
    heroSubtitle: "Every dollar saved is one step closer to your dreams.",
    totalSaved: "Total Saved",
    totalTargetGoals: "Total Target Goals",
    progress: "Progress",
    myActiveGoals: "My Active Goals",
    createGoal: "Create Goal",
    onTrack: "On track",
    needsAttention: "Needs attention",
    offTrack: "Off track",

    decideHeroTitle: "Before You Decide",
    decideSubtitle: "Simulate any purchase impact on your future life goal arrival timeline before spending.",
    askPlaceholder: "e.g. Can I buy a laptop for $1,200?",
    simulateBtn: "Simulate Decision",
    strategyCash: "Pay Cash",
    strategySpread: "Spread (3 Months)",
    strategyPostpone: "Postpone & Save",

    wizardTitle: "Create a Goal",
    wizardStepOf: "Step",
    whatsYourGoal: "What's your goal?",
    monthlySavingsNeeded: "Monthly savings needed",
    monthsToGoal: "Months to goal",
    shareOfIncome: "Share of monthly income",

    systemOperational: "System Operational",
    deterministicMath: "100% Deterministic Financial Engine",
    rightsReserved: "All rights reserved.",
  },

  fr: {
    navDestinations: "Objectifs",
    navDecide: "Décider",
    navWhatIf: "Et si ?",
    navNotes: "Bloc-Notes",
    navMoney: "Trésorerie",
    navInvestments: "Patrimoine",
    navSettings: "Paramètres",
    navPricing: "Tarifs",
    navDesignSystem: "Design System",
    navGetStarted: "Commencer",
    navSignIn: "Se Connecter",
    navSignOut: "Se Déconnecter",

    greetingPrefix: "Bonjour",
    heroSubtitle: "Chaque franc/dollar épargné est un pas de plus vers vos projets.",
    totalSaved: "Total Épargné",
    totalTargetGoals: "Objectifs Totaux",
    progress: "Progression",
    myActiveGoals: "Mes Objectifs Actifs",
    createGoal: "Créer un Objectif",
    onTrack: "Dans les temps",
    needsAttention: "À surveiller",
    offTrack: "En retard",

    decideHeroTitle: "Avant de Décider",
    decideSubtitle: "Simulez l'impact exact de chaque achat sur la date d'arrivée de vos projets futurs.",
    askPlaceholder: "ex: Puis-je acheter un ordinateur à 1 200 $ ?",
    simulateBtn: "Simuler la Décision",
    strategyCash: "Payer Comptant",
    strategySpread: "Échelonner (3 Mois)",
    strategyPostpone: "Reporter & Épargner",

    wizardTitle: "Créer un Objectif",
    wizardStepOf: "Étape",
    whatsYourGoal: "Quel est votre objectif ?",
    monthlySavingsNeeded: "Épargne mensuelle requise",
    monthsToGoal: "Durée en mois",
    shareOfIncome: "Part du revenu mensuel",

    systemOperational: "Système Opérationnel",
    deterministicMath: "Moteur Financier 100% Déterministe",
    rightsReserved: "Tous droits réservés.",
  },
};
