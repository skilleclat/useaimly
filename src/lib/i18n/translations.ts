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
  navLiveDemo: string;
  quickNav: string;
  openDashboard: string;
  openEliteDashboard: string;
  openProDashboard: string;
  decisionStudio: string;
  eliteTier: string;
  proTier: string;
  starterTier: string;

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

  // Landing Hero Section (Romain Bouvet Copywriting Style)
  heroBadge: string;
  heroTitlePrefix: string;
  heroTitleTomorrow: string;
  heroTitleSuffix: string;
  heroMainSubtitle: string;
  btnTryRealDecision: string;
  noAccountNeeded: string;
  btnCreateFreeAccount: string;
  signupTime: string;
  socialProofRating: string;
  socialProofCount: string;

  // Hero Interactive Simulator Widget
  widgetHeaderTitle: string;
  widgetLiveDemoTag: string;
  widgetQueryLabel: string;
  widgetImmediateImpact: string;
  widgetCushionText: string;
  widgetFutureConsequence: string;
  widgetGoalDelayText: string;
  widgetStayOnTrack: string;
  widgetSaveAdditionalText: string;
  widgetSeeFullAnalysis: string;

  // "Why UseAimly?" Section
  whyTitleTag: string;
  whyMainTitle: string;
  whyMainTitleLine2: string;
  whyCard1Title: string;
  whyCard1Desc: string;
  whyCard2Title: string;
  whyCard2Desc: string;
  whyCard3Title: string;
  whyCard3Desc: string;
  whyCard4Title: string;
  whyCard4Desc: string;

  // "How UseAimly Works" Section
  howTitle: string;
  howSubtitle: string;
  howStep1Title: string;
  howStep1Text: string;
  howStep2Title: string;
  howStep2Text: string;
  howStep3Title: string;
  howStep3Text: string;
  howStep4Title: string;
  howStep4Text: string;

  // Testimonials & Trust
  trustedByTag: string;
  quote1: string;
  quote2: string;
  quote3: string;
  role1: string;
  role2: string;
  role3: string;

  // Scenario Cards Grid Section
  scenariosSectionTitle: string;
  scenariosSectionSubtitle: string;
  scenarioPopularTag: string;
  scenarioImpactNowLabel: string;
  scenarioFutureConsequenceLabel: string;
  scenarioStayOnTrackLabel: string;
  scenarioTryBtn: string;

  scenario1Title: string;
  scenario1Impact: string;
  scenario1Future: string;
  scenario1Track: string;

  scenario2Title: string;
  scenario2Impact: string;
  scenario2Future: string;
  scenario2Track: string;

  scenario3Title: string;
  scenario3Impact: string;
  scenario3Future: string;
  scenario3Track: string;

  scenario4Title: string;
  scenario4Impact: string;
  scenario4Future: string;
  scenario4Track: string;

  // Pricing Section
  pricingSectionTitle: string;
  pricingSectionSubtitle: string;
  monthlyBilling: string;
  annualBilling: string;
  discountBadge: string;
  perYear: string;
  perMonth: string;
  includedFeatures: string;
  freePriceLabel: string;
  currentPlanLabel: string;
  billedAnnuallyEquiv: string;

  // Pricing Plans (Free, Pro, Premium)
  planFreeTagline: string;
  planFreeCta: string;

  planProTagline: string;
  planProBadge: string;
  planProCta: string;

  planPremiumTagline: string;
  planPremiumBadge: string;
  planPremiumCta: string;

  // Final Conversion Banner
  bannerTitle: string;
  bannerSubtitle: string;
  bannerCta: string;
  bannerNoCard: string;

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
  footerTagline: string;
  footerBriefingTitle: string;
  footerBriefingTag: string;
  footerSubscribePlaceholder: string;
  footerSubscribeBtn: string;
  footerSubscribedSuccess: string;
  footerSystemHealth: string;
  footerCorePlatform: string;
  footerMonetization: string;
  footerSecurity: string;
  footerBackToTop: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    // Navigation
    navDestinations: "Goals",
    navDecide: "Decide",
    navWhatIf: "What If?",
    navNotes: "Notes",
    navMoney: "Money",
    navInvestments: "Investments",
    navSettings: "Account",
    navPricing: "Pricing",
    navDesignSystem: "Design System",
    navGetStarted: "Get Started Free",
    navSignIn: "Sign In",
    navSignOut: "Sign Out",
    navLiveDemo: "Try Live Demo",
    quickNav: "Quick Navigation",
    openDashboard: "Open Dashboard →",
    openEliteDashboard: "Open Elite Dashboard →",
    openProDashboard: "Open Pro Dashboard →",
    decisionStudio: "Decision Studio",
    eliteTier: "Elite",
    proTier: "Pro",
    starterTier: "Starter",

    // Hero & Dashboard
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

    // Landing Hero Section (Romain Bouvet Style)
    heroBadge: "Before you commit",
    heroTitlePrefix: "ONE DECISION. ",
    heroTitleTomorrow: "BEFORE YOU COMMIT.",
    heroTitleSuffix: "",
    heroMainSubtitle: "See what a major financial decision could do to your future before you make it.",

    btnTryRealDecision: "Analyze a Real Decision",
    noAccountNeeded: "(Instant result)",
    btnCreateFreeAccount: "Get Started Free",
    signupTime: "(30 seconds)",
    socialProofRating: "5.0",
    socialProofCount: "Trusted by 1,000+ smart decision makers",

    // Hero Interactive Simulator Widget
    widgetHeaderTitle: "Simulate any decision",
    widgetLiveDemoTag: "INSTANT VERDICT",
    widgetQueryLabel: "Financial Decision Query",
    widgetImmediateImpact: "IMMEDIATE IMPACT",
    widgetCushionText: "Your emergency cushion decreases by",
    widgetFutureConsequence: "FUTURE CONSEQUENCE",
    widgetGoalDelayText: "Your primary goal shifts by",
    widgetStayOnTrack: "RECOVERY TIMELINE",
    widgetSaveAdditionalText: "Save an additional",
    widgetSeeFullAnalysis: "See Full Verdict",

    // "Why UseAimly?" Section
    whyTitleTag: "Why UseAimly?",
    whyMainTitle: "Budgeting tools guilt you over past coffees.",
    whyMainTitleLine2: "UseAimly predicts the future before you sign the check.",
    whyCard1Title: "Frictionless Analysis",
    whyCard1Desc: "Type any purchase or life event in plain English. Get an answer in 5 seconds.",
    whyCard2Title: "Zero Buyer's Remorse",
    whyCard2Desc: "Know whether a spend threatens your emergency reserve before you commit.",
    whyCard3Title: "Clear Actionable Verdicts",
    whyCard3Desc: "Get simple plain-language answers: You Can Afford It, Adjust, or Not Yet.",
    whyCard4Title: "Protected Destinations",
    whyCard4Desc: "Never let impulse purchases delay your house, business, or dream goals.",

    // "How UseAimly Works" Section
    howTitle: "How UseAimly Works",
    howSubtitle: "Four simple steps to absolute financial clarity",
    howStep1Title: "1. Tell UseAimly about your plan",
    howStep1Text: "Type any decision: buying a car, taking a loan, moving, or taking a trip.",
    howStep2Title: "2. Instant Verdict Calculation",
    howStep2Text: "Our deterministic engine calculates your exact liquidity and goal deltas.",
    howStep3Title: "3. Understand the 3 Reasons",
    howStep3Text: "Get 3 plain-language explanations without confusing financial jargon.",
    howStep4Title: "4. Follow Your Recovery Path",
    howStep4Text: "Follow a step-by-step visual timeline to stay on track to reach your goals.",

    // Testimonials & Trust
    trustedByTag: "Trusted by people who plan ahead",
    quote1: "UseAimly changed how I spend. Before buying a car or taking a loan, I ask UseAimly first.",
    quote2: "No more spreadsheets or guilt. UseAimly tells me in 3 seconds if a big spend breaks my timeline.",
    quote3: "Absolute peace of mind. I know exactly what every major purchase does to my business goal.",
    role1: "Business Owner",
    role2: "Senior Software Engineer",
    role3: "Digital Nomad & Consultant",

    // Scenario Cards Grid Section
    scenariosSectionTitle: "What are you planning?",
    scenariosSectionSubtitle: "Select a decision to pre-fill instantly",
    scenarioPopularTag: "Popular",
    scenarioImpactNowLabel: "Impact Now",
    scenarioFutureConsequenceLabel: "Future Consequence",
    scenarioStayOnTrackLabel: "Stay on Track",
    scenarioTryBtn: "Test this decision",

    scenario1Title: "Buy a vehicle for {amount}",
    scenario1Impact: "-8% Reserve Cushion",
    scenario1Future: "Business goal shifted +31 days",
    scenario1Track: "Save {amount} extra per month",

    scenario2Title: "Take a loan of {amount}",
    scenario2Impact: "+22% Debt Outflow",
    scenario2Future: "Goal delayed by 2.8 months",
    scenario2Track: "Increase monthly allocation",

    scenario3Title: "Move to a new apartment",
    scenario3Impact: "-18% Monthly Free Cash Flow",
    scenario3Future: "Goal delayed by 45 days",
    scenario3Track: "Review fixed commitments",

    scenario4Title: "Take a trip for {amount}",
    scenario4Impact: "-12% Emergency Cushion",
    scenario4Future: "Goal delayed by 22 days",
    scenario4Track: "Spread over 3 months",

    // Pricing Section
    pricingSectionTitle: "Simple, transparent pricing",
    pricingSectionSubtitle: "Start free. Upgrade anytime for unlimited decision simulations.",
    monthlyBilling: "Monthly Billing",
    annualBilling: "Annual Billing",
    discountBadge: "Save 20%",
    perYear: "/year",
    perMonth: "/month",
    includedFeatures: "INCLUDED FEATURES:",
    freePriceLabel: "Free",
    currentPlanLabel: "Current Plan",
    billedAnnuallyEquiv: "Just {price}/month equivalent (Billed annually)",

    // Pricing Plans
    planFreeTagline: "Test real financial decisions with instant 5-second verdicts.",
    planFreeCta: "Get Started Free",

    planProTagline: "For active decision makers seeking unlimited simulations and full analysis.",
    planProBadge: "Most Popular",
    planProCta: "Try Aimly Pro",

    planPremiumTagline: "For entrepreneurs, business owners, and high net-worth decision makers.",
    planPremiumBadge: "Complete Experience",
    planPremiumCta: "Unlock Aimly Elite",

    // Final Conversion Banner
    bannerTitle: "Stop guessing.\nKnow before you spend big.",
    bannerSubtitle: "Simulate your next financial decision right now in under 5 seconds.",
    bannerCta: "Analyze My Decision",
    bannerNoCard: "No credit card required",

    // Decision Studio
    decideHeroTitle: "Decision Studio",
    decideSubtitle: "Test any purchase, loan, or life event before committing.",
    askPlaceholder: "e.g. Can I afford a KES 500,000 car?",
    simulateBtn: "Analyze My Decision",
    strategyCash: "Pay Cash Today",
    strategySpread: "Spread Over 3 Months",
    strategyPostpone: "Save First & Postpone",

    // Goal Wizard
    wizardTitle: "Create a Goal",
    wizardStepOf: "Step",
    whatsYourGoal: "What's your goal?",
    monthlySavingsNeeded: "Monthly savings needed",
    monthsToGoal: "Months to goal",
    shareOfIncome: "Share of monthly income",

    // System & Footer
    systemOperational: "System Operational",
    deterministicMath: "100% Pure Financial Engine",
    rightsReserved: "All rights reserved.",
    footerTagline: "Know before you spend big.",
    footerBriefingTitle: "Decision Intelligence Teardowns",
    footerBriefingTag: "Monthly Briefing",
    footerSubscribePlaceholder: "Enter your email",
    footerSubscribeBtn: "Subscribe",
    footerSubscribedSuccess: "Subscribed! You'll receive decision teardowns.",
    footerSystemHealth: "System Health",
    footerCorePlatform: "Core Platform",
    footerMonetization: "Monetization",
    footerSecurity: "Security & Privacy",
    footerBackToTop: "Back to Top",
  },

  fr: {
    // Navigation (Style Romain Bouvet : percutant, précis, professionnel)
    navDestinations: "Objectifs",
    navDecide: "Décider",
    navWhatIf: "Et si ?",
    navNotes: "Règles & Notes",
    navMoney: "Trésorerie",
    navInvestments: "Patrimoine",
    navSettings: "Compte",
    navPricing: "Tarifs",
    navDesignSystem: "Design System",
    navGetStarted: "Commencer Gratuitement",
    navSignIn: "Se Connecter",
    navSignOut: "Se Déconnecter",
    navLiveDemo: "Essayer la Démo",
    quickNav: "Navigation Rapide",
    openDashboard: "Ouvrir mon Dashboard →",
    openEliteDashboard: "Ouvrir Dashboard Élite →",
    openProDashboard: "Ouvrir Dashboard Pro →",
    decisionStudio: "Studio de Décision",
    eliteTier: "Élite",
    proTier: "Pro",
    starterTier: "Starter",

    // Hero & Dashboard
    greetingPrefix: "Bonjour",
    heroSubtitle: "Chaque décision financière d'aujourd'hui façonne votre liberté de demain.",
    totalSaved: "Épargne Disponible",
    totalTargetGoals: "Objectifs de Vie",
    progress: "Progression",
    myActiveGoals: "Mes Objectifs Actifs",
    createGoal: "Fixer un Objectif",
    onTrack: "Dans les temps",
    needsAttention: "À ajuster",
    offTrack: "En retard",

    // Landing Hero Section (Romain Bouvet Style : Accroche psychologique & déclic)
    heroBadge: "Sachez avant de vous engager",
    heroTitlePrefix: "UNE DÉCISION. ",
    heroTitleTomorrow: "AVANT DE VOUS ENGAGER.",
    heroTitleSuffix: "",
    heroMainSubtitle: "Découvrez l'impact d'une décision financière majeure sur votre avenir avant de la prendre.",

    btnTryRealDecision: "Analyser une Vraie Décision",
    noAccountNeeded: "(Verdict immédiat sans carte)",
    btnCreateFreeAccount: "Créer un Compte Gratuit",
    signupTime: "(en 30 secondes)",
    socialProofRating: "5.0",
    socialProofCount: "Utilisé par plus de 1 000 décideurs avisés",

    // Hero Interactive Simulator Widget
    widgetHeaderTitle: "Testez une vraie décision",
    widgetLiveDemoTag: "VERDICT IMMÉDIAT",
    widgetQueryLabel: "Votre Question Financière",
    widgetImmediateImpact: "IMPACT IMMÉDIAT",
    widgetCushionText: "Votre matelas d'urgence s'ajuste de",
    widgetFutureConsequence: "CONSÉQUENCE FUTURE",
    widgetGoalDelayText: "Votre objectif principal se décale de",
    widgetStayOnTrack: "PLAN DE RÉCUPÉRATION",
    widgetSaveAdditionalText: "Épargnez un supplément de",
    widgetSeeFullAnalysis: "Voir le Verdict Complet",

    // "Why UseAimly?" Section (Romain Bouvet : Anti-budget culpabilisant & Déclic futurist)
    whyTitleTag: "Pourquoi UseAimly ?",
    whyMainTitle: "Les applis de budget comptabilisent le passé.",
    whyMainTitleLine2: "UseAimly simule le futur avant que vous ne signiez le chèque.",
    whyCard1Title: "Zéro Culpabilité, 100% Maîtrise",
    whyCard1Desc: "Posez votre question en français courant. Obtenez une réponse claire en 5 secondes.",
    whyCard2Title: "Zéro Regret d'Achat",
    whyCard2Desc: "Sachez immédiatement si une dépense menace vos trésoreries ou votre sécurité.",
    whyCard3Title: "Verdicts Clairs & Sans Jargon",
    whyCard3Desc: "Pas de graphiques inutiles. Une réponse directe : Vous Pouvez l'Acheter, Ajuster, ou Pas Encore.",
    whyCard4Title: "Objectifs de Vie Protégés",
    whyCard4Desc: "Ne laissez plus des achats impulsifs retarder l'achat de votre logement ou votre entreprise.",

    // "How UseAimly Works" Section
    howTitle: "Comment Fonctionne UseAimly",
    howSubtitle: "Quatre étapes simples vers une clarté financière absolue",
    howStep1Title: "1. Posez votre question",
    howStep1Text: "Achat de voiture, prêt, déménagement ou voyage : décrivez votre projet.",
    howStep2Title: "2. Calcul Immédiat du Verdict",
    howStep2Text: "Notre moteur financier déterministe calcule le reste à vivre et le décalage d'objectif.",
    howStep3Title: "3. Comprenez les 3 Raisons",
    howStep3Text: "Obtenez 3 explications concrètes sans jargon technique ou termes d'IA abstraits.",
    howStep4Title: "4. Suivez la Chronologie",
    howStep4Text: "Suivez un plan d'action étape par étape pour sécuriser votre décision sans dévier.",

    // Testimonials & Trust
    trustedByTag: "Recommandé par des décideurs qui anticipent",
    quote1: "UseAimly a changé ma façon de dépenser. Avant d'acheter une voiture ou de signer un prêt, j'interroge UseAimly.",
    quote2: "Fini les tableurs complexes et la peur de regretter. En 3 secondes, je sais si un achat détruit mon planning.",
    quote3: "Une sérénité totale. Je sais exactement ce que chaque dépense importante implique pour mon entreprise.",
    role1: "Chef d'Entreprise",
    role2: "Ingénieur Software Senior",
    role3: "Consultante & Nomade Digital",

    // Scenario Cards Grid Section
    scenariosSectionTitle: "Quels sont vos projets ?",
    scenariosSectionSubtitle: "Sélectionnez une catégorie pour pré-remplir la simulation",
    scenarioPopularTag: "Populaire",
    scenarioImpactNowLabel: "Impact Immédiat",
    scenarioFutureConsequenceLabel: "Conséquence Future",
    scenarioStayOnTrackLabel: "Plan de Récupération",
    scenarioTryBtn: "Tester cette décision",

    scenario1Title: "Acheter un véhicule pour {amount}",
    scenario1Impact: "-8% Matelas de Sécurité",
    scenario1Future: "Objectif entreprise décalé de 31 jours",
    scenario1Track: "Épargner {amount} de plus par mois",

    scenario2Title: "Prendre un crédit de {amount}",
    scenario2Impact: "+22% Sortie Mensuelle",
    scenario2Future: "Objectif décalé de 2,8 mois",
    scenario2Track: "Ajuster votre allocation mensuelle",

    scenario3Title: "Déménager dans un nouvel appartement",
    scenario3Impact: "-18% Cash-flow Mensuel",
    scenario3Future: "Objectif décalé de 45 jours",
    scenario3Track: "Revoir vos charges fixes",

    scenario4Title: "S'offrir un voyage pour {amount}",
    scenario4Impact: "-12% Matelas de Sécurité",
    scenario4Future: "Objectif décalé de 22 jours",
    scenario4Track: "Étalonner sur 3 mois",

    // Pricing Section
    pricingSectionTitle: "Une tarification simple et transparente",
    pricingSectionSubtitle: "Commencez gratuitement. Évoluez pour simuler des décisions illimitées.",
    monthlyBilling: "Facturation Mensuelle",
    annualBilling: "Facturation Annuelle",
    discountBadge: "-20% de réduction",
    perYear: "/an",
    perMonth: "/mois",
    includedFeatures: "FONCTIONNALITÉS INCLUSES :",
    freePriceLabel: "Gratuit",
    currentPlanLabel: "Plan Actuel",
    billedAnnuallyEquiv: "Soit {price}/mois seulement (facturé annuellement)",

    // Pricing Plans
    planFreeTagline: "Simulez vos décisions financières réelles et obtenez un verdict en 5 secondes.",
    planFreeCta: "Commencer Gratuitement",

    planProTagline: "Pour les décideurs actifs souhaitant des simulations illimitées et des analyses complètes.",
    planProBadge: "Le Plus Populaire",
    planProCta: "Essayer Aimly Pro",

    planPremiumTagline: "Pour entrepreneurs, dirigeants et décideurs à fort patrimoine.",
    planPremiumBadge: "Expérience Élite Complète",
    planPremiumCta: "Débloquer Aimly Élite",

    // Final Conversion Banner
    bannerTitle: "Arrêtez de deviner.\nSachez avant de dépenser.",
    bannerSubtitle: "Simulez votre prochaine décision financière en moins de 5 secondes.",
    bannerCta: "Analyser Ma Décision",
    bannerNoCard: "Aucune carte de crédit requise",

    // Decision Studio
    decideHeroTitle: "Studio de Décision",
    decideSubtitle: "Testez n'importe quel achat, crédit ou projet de vie avant de vous engager.",
    askPlaceholder: "Ex. Puis-je m'offrir un véhicule à 500 000 KES ?",
    simulateBtn: "Analyser Ma Décision",
    strategyCash: "Payer Comptant Aujourd'hui",
    strategySpread: "Étaler sur 3 Mois",
    strategyPostpone: "Épargner & Différer",

    // Goal Wizard
    wizardTitle: "Créer un Objectif",
    wizardStepOf: "Étape",
    whatsYourGoal: "Quel est votre objectif ?",
    monthlySavingsNeeded: "Épargne mensuelle nécessaire",
    monthsToGoal: "Mois jusqu'à l'objectif",
    shareOfIncome: "Part du revenu mensuel",

    // System & Footer
    systemOperational: "Système Opérationnel",
    deterministicMath: "100% Moteur Financier Déterministe",
    rightsReserved: "Tous droits réservés.",
    footerTagline: "Sachez avant de engager vos finances.",
    footerBriefingTitle: "Analyses Décisionnelles Mensuelles",
    footerBriefingTag: "Briefing Mensuel",
    footerSubscribePlaceholder: "Entrez votre email",
    footerSubscribeBtn: "S'abonner",
    footerSubscribedSuccess: "Abonné ! Vous recevrez nos briefings stratégiques.",
    footerSystemHealth: "Santé du Système",
    footerCorePlatform: "Plateforme Principale",
    footerMonetization: "Offres",
    footerSecurity: "Sécurité & Confidentialité",
    footerBackToTop: "Haut de page",
  },
};
