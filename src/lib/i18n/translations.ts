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

  // Landing Hero Section
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
    navLiveDemo: "Try Live Demo",
    quickNav: "Quick Navigation",

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

    // Landing Hero Section
    heroBadge: "Goal-Aware Decision Intelligence",
    heroTitlePrefix: "See ",
    heroTitleTomorrow: "tomorrow",
    heroTitleSuffix: " before deciding today.",
    heroMainSubtitle: "UseAimly shows you how your financial decisions today impact your future goals.",
    btnTryRealDecision: "Try a Real Decision",
    noAccountNeeded: "(No account needed)",
    btnCreateFreeAccount: "Create Free Account",
    signupTime: "(30 seconds)",
    socialProofRating: "5.0",
    socialProofCount: "Trusted by 1,000+ smart decision makers",

    // Hero Interactive Simulator Widget
    widgetHeaderTitle: "Try a real decision",
    widgetLiveDemoTag: "LIVE DEMO",
    widgetQueryLabel: "Decision Query",
    widgetImmediateImpact: "IMMEDIATE IMPACT",
    widgetCushionText: "Your emergency cushion decreases by",
    widgetFutureConsequence: "FUTURE CONSEQUENCE",
    widgetGoalDelayText: "Your Business Goal moves",
    widgetStayOnTrack: "STAY ON TRACK",
    widgetSaveAdditionalText: "Save an additional",
    widgetSeeFullAnalysis: "See Full Analysis",

    // "Why UseAimly?" Section
    whyTitleTag: "Why UseAimly?",
    whyMainTitle: "Because life moves forward.",
    whyMainTitleLine2: "Your decisions should too.",
    whyCard1Title: "Look Forward",
    whyCard1Desc: "We show future impact, not just past transactions.",
    whyCard2Title: "Understand Impact",
    whyCard2Desc: "See what changes now and what changes later.",
    whyCard3Title: "Make Better Choices",
    whyCard3Desc: "Decide with clarity, not guesswork.",
    whyCard4Title: "Stay on Track",
    whyCard4Desc: "Adjust your path and reach your goals faster.",

    // "How UseAimly Works" Section
    howTitle: "How UseAimly Works",
    howSubtitle: "Four simple steps to financial clarity",
    howStep1Title: "Add Your Picture",
    howStep1Text: "Tell us about your income, expenses, goals and commitments.",
    howStep2Title: "Set Your Destinations",
    howStep2Text: "Choose what you're working toward and when you want to achieve them.",
    howStep3Title: "Ask About a Decision",
    howStep3Text: "Type any financial decision you're considering.",
    howStep4Title: "See the Impact",
    howStep4Text: "Understand what changes now, what changes later, and what to do next.",

    // Testimonials & Trust
    trustedByTag: "Trusted by people who plan ahead",
    quote1: "UseAimly changed the way I make decisions. I no longer guess — I see the impact first.",
    quote2: "Before buying a laptop or booking a trip, I type it into UseAimly. It saved me 6 months of goal delay.",
    quote3: "The 3-pillar breakdown and WhatsApp weekly dispatches give me absolute clarity on my financial future.",
    role1: "Business Owner",
    role2: "Senior Software Engineer",
    role3: "Digital Nomad & Consultant",

    // Scenario Cards Grid Section
    scenariosSectionTitle: "See what your decisions do to your future",
    scenariosSectionSubtitle: "Real decisions. Real impact. Real clarity.",
    scenarioPopularTag: "Popular",
    scenarioImpactNowLabel: "Impact Now",
    scenarioFutureConsequenceLabel: "Future Consequence",
    scenarioStayOnTrackLabel: "Stay on Track",
    scenarioTryBtn: "Try this decision",

    scenario1Title: "Buy a phone for {amount}",
    scenario1Impact: "-8% Emergency Cushion",
    scenario1Future: "Business goal delayed by 31 days",
    scenario1Track: "Save {amount} more per month",

    scenario2Title: "Take a loan of {amount}",
    scenario2Impact: "+22% Debt Pressure",
    scenario2Future: "Goal delayed by 2.8 months",
    scenario2Track: "Increase income or reduce fixed costs",

    scenario3Title: "Move to a better apartment",
    scenario3Impact: "-18% Free Cash Flow",
    scenario3Future: "Goal delayed by 45 days",
    scenario3Track: "Review housing budget or increase income",

    scenario4Title: "Take a vacation for {amount}",
    scenario4Impact: "-12% Emergency Cushion",
    scenario4Future: "Goal delayed by 22 days",
    scenario4Track: "Delay or save more this month",

    // Pricing Section
    pricingSectionTitle: "Simple, transparent pricing",
    pricingSectionSubtitle: "Start free. Upgrade when you're ready to protect your trajectory.",
    monthlyBilling: "Monthly Billing",
    annualBilling: "Annual Billing",
    discountBadge: "-20%",
    perYear: "/year",
    perMonth: "/month",
    includedFeatures: "INCLUDED FEATURES:",
    freePriceLabel: "Free",
    currentPlanLabel: "Current Plan",
    billedAnnuallyEquiv: "Just {price}/month equivalent (Billed annually)",

    // Pricing Plans
    planFreeTagline: "Explore decision intelligence and test your baseline trajectory.",
    planFreeCta: "Get Started Free",

    planProTagline: "For active decision makers looking to optimize every spend and stay ahead.",
    planProBadge: "Most Popular",
    planProCta: "Try Aimly Pro",

    planPremiumTagline: "For entrepreneurs, business owners, and high net-worth decision makers.",
    planPremiumBadge: "Complete Experience",
    planPremiumCta: "Unlock Aimly Premium",

    // Final Conversion Banner
    bannerTitle: "Stop guessing.\nSee what your decisions really do.",
    bannerSubtitle: "Try a real decision now — no account needed.",
    bannerCta: "See My Decision's Impact",
    bannerNoCard: "No credit card required",

    // Decision Studio
    decideHeroTitle: "Before You Decide",
    decideSubtitle: "Simulate any purchase impact on your future life goal arrival timeline before spending.",
    askPlaceholder: "e.g. Can I buy a laptop for $1,200?",
    simulateBtn: "Simulate Decision",
    strategyCash: "Pay Cash",
    strategySpread: "Spread (3 Months)",
    strategyPostpone: "Postpone & Save",

    // Goal Wizard
    wizardTitle: "Create a Goal",
    wizardStepOf: "Step",
    whatsYourGoal: "What's your goal?",
    monthlySavingsNeeded: "Monthly savings needed",
    monthsToGoal: "Months to goal",
    shareOfIncome: "Share of monthly income",

    // System & Footer
    systemOperational: "System Operational",
    deterministicMath: "100% Deterministic Financial Engine",
    rightsReserved: "All rights reserved.",
    footerTagline: "See tomorrow before deciding today",
    footerBriefingTitle: "Decision Intelligence Teardowns",
    footerBriefingTag: "Monthly Briefing",
    footerSubscribePlaceholder: "Enter your executive email",
    footerSubscribeBtn: "Subscribe",
    footerSubscribedSuccess: "Subscribed! You'll receive monthly strategic teardowns.",
    footerSystemHealth: "System Health",
    footerCorePlatform: "Core Platform",
    footerMonetization: "Monetization",
    footerSecurity: "Security & Privacy",
    footerBackToTop: "Back to Top",
  },

  fr: {
    // Navigation
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
    navLiveDemo: "Démo en direct",
    quickNav: "Navigation Rapide",

    // Hero & Dashboard
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

    // Landing Hero Section
    heroBadge: "Intelligence Décisionnelle Orientée Objectifs",
    heroTitlePrefix: "Voyez ",
    heroTitleTomorrow: "demain",
    heroTitleSuffix: " avant de décider aujourd'hui.",
    heroMainSubtitle: "UseAimly vous montre l'impact de vos décisions financières actuelles sur vos objectifs futurs.",
    btnTryRealDecision: "Tester une Vraie Décision",
    noAccountNeeded: "(Sans compte requis)",
    btnCreateFreeAccount: "Créer un Compte Gratuit",
    signupTime: "(30 secondes)",
    socialProofRating: "5.0",
    socialProofCount: "Recommandé par plus de 1 000 décideurs avisés",

    // Hero Interactive Simulator Widget
    widgetHeaderTitle: "Essayer une vraie décision",
    widgetLiveDemoTag: "DÉMO EN DIRECT",
    widgetQueryLabel: "Question Décisionnelle",
    widgetImmediateImpact: "IMPACT IMMÉDIAT",
    widgetCushionText: "Votre réserve de sécurité diminue de",
    widgetFutureConsequence: "CONSÉQUENCE FUTURE",
    widgetGoalDelayText: "Votre objectif d'Entreprise est décalé de",
    widgetStayOnTrack: "RESTER SUR LA TRAJECTOIRE",
    widgetSaveAdditionalText: "Épargnez un supplément de",
    widgetSeeFullAnalysis: "Voir l'Analyse Complète",

    // "Why UseAimly?" Section
    whyTitleTag: "Pourquoi UseAimly ?",
    whyMainTitle: "Parce que la vie avance.",
    whyMainTitleLine2: "Vos décisions doivent avancer aussi.",
    whyCard1Title: "Anticiper l'Avenir",
    whyCard1Desc: "Nous affichons l'impact futur, pas seulement vos transactions passées.",
    whyCard2Title: "Comprendre l'Impact",
    whyCard2Desc: "Visualisez clairement ce qui change maintenant et ce qui change plus tard.",
    whyCard3Title: "Faire de Meilleurs Choix",
    whyCard3Desc: "Décidez avec clarté et précision, sans spéculation ni doute.",
    whyCard4Title: "Rester sur la Trajectoire",
    whyCard4Desc: "Ajustez votre plan d'action et atteignez vos projets plus rapidement.",

    // "How UseAimly Works" Section
    howTitle: "Comment Fonctionne UseAimly",
    howSubtitle: "Quatre étapes simples vers la clarté financière",
    howStep1Title: "Renseignez Votre Situation",
    howStep1Text: "Indiquez vos revenus, charges fixes, objectifs et engagements.",
    howStep2Title: "Fixez Vos Destinations",
    howStep2Text: "Définissez les projets de vie que vous visez et leurs dates d'échéance.",
    howStep3Title: "Posez Votre Question",
    howStep3Text: "Tapez n'importe quel achat ou engagement financier envisagé.",
    howStep4Title: "Visualisez l'Impact",
    howStep4Text: "Comprenez ce qui change immédiatement et la stratégie à suivre.",

    // Testimonials & Trust
    trustedByTag: "Approuvé par ceux qui planifient l'avenir",
    quote1: "UseAimly a transformé ma façon de décider. Je ne devine plus — je vois l'impact direct avant d'acheter.",
    quote2: "Avant d'acheter un ordinateur ou réserver un voyage, je simule sur UseAimly. Cela m'a évité 6 mois de retard.",
    quote3: "L'analyse sur 3 piliers et les rapports hebdomadaires me donnent une vision limpide de mon futur financier.",
    role1: "Chef d'Entreprise",
    role2: "Ingénieur Logiciel Senior",
    role3: "Consultante & Nomade Digital",

    // Scenario Cards Grid Section
    scenariosSectionTitle: "Voyez l'impact réel de vos décisions sur votre futur",
    scenariosSectionSubtitle: "Vraies décisions. Vrai impact. Clarté absolue.",
    scenarioPopularTag: "Populaire",
    scenarioImpactNowLabel: "Impact Immédiat",
    scenarioFutureConsequenceLabel: "Conséquence Future",
    scenarioStayOnTrackLabel: "Rester sur la Trajectoire",
    scenarioTryBtn: "Tester cette décision",

    scenario1Title: "Acheter un téléphone pour {amount}",
    scenario1Impact: "-8% Réserve d'Urgence",
    scenario1Future: "Objectif Entreprise décalé de 31 jours",
    scenario1Track: "Épargner {amount} de plus par mois",

    scenario2Title: "Contracter un crédit de {amount}",
    scenario2Impact: "+22% Pression d'Endettement",
    scenario2Future: "Objectif décalé de 2,8 mois",
    scenario2Track: "Augmenter les revenus ou réduire les charges",

    scenario3Title: "Déménager dans un nouvel appartement",
    scenario3Impact: "-18% Trésorerie Libre Mensuelle",
    scenario3Future: "Objectif décalé de 45 jours",
    scenario3Track: "Ajuster le budget logement ou accroître les revenus",

    scenario4Title: "Partir en vacances pour {amount}",
    scenario4Impact: "-12% Réserve d'Urgence",
    scenario4Future: "Objectif décalé de 22 jours",
    scenario4Track: "Reporter ou épargner davantage ce mois-ci",

    // Pricing Section
    pricingSectionTitle: "Tarification simple et transparente",
    pricingSectionSubtitle: "Commencez gratuitement. Évoluez quand vous êtes prêt à protéger votre trajectoire.",
    monthlyBilling: "Facturation Mensuelle",
    annualBilling: "Facturation Annuelle",
    discountBadge: "-20%",
    perYear: "/an",
    perMonth: "/mois",
    includedFeatures: "FONCTIONNALITÉS INCLUSES :",
    freePriceLabel: "Gratuit",
    currentPlanLabel: "Plan Actuel",
    billedAnnuallyEquiv: "Soit seulement {price}/mois (Facturé annuellement)",

    // Pricing Plans
    planFreeTagline: "Explorez l'intelligence décisionnelle et testez votre trajectoire de base.",
    planFreeCta: "Commencer Gratuitement",

    planProTagline: "Pour les décideurs actifs souhaitant optimiser chaque dépense et anticiper.",
    planProBadge: "Le Plus Populaire",
    planProCta: "Essayer Aimly Pro",

    planPremiumTagline: "Pour les entrepreneurs, dirigeants et décideurs à haut patrimoine.",
    planPremiumBadge: "Expérience Complète",
    planPremiumCta: "Débloquer Aimly Premium",

    // Final Conversion Banner
    bannerTitle: "Arrêtez de deviner.\nVoyez ce que vos décisions changent vraiment.",
    bannerSubtitle: "Essayez une vraie décision maintenant — sans aucun compte.",
    bannerCta: "Voir l'Impact de Ma Décision",
    bannerNoCard: "Aucune carte bancaire requise",

    // Decision Studio
    decideHeroTitle: "Avant de Décider",
    decideSubtitle: "Simulez l'impact exact de chaque achat sur la date d'arrivée de vos projets futurs.",
    askPlaceholder: "ex: Puis-je acheter un ordinateur à 1 200 $ ?",
    simulateBtn: "Simuler la Décision",
    strategyCash: "Payer Comptant",
    strategySpread: "Échelonner (3 Mois)",
    strategyPostpone: "Reporter & Épargner",

    // Goal Wizard
    wizardTitle: "Créer un Objectif",
    wizardStepOf: "Étape",
    whatsYourGoal: "Quel est votre objectif ?",
    monthlySavingsNeeded: "Épargne mensuelle requise",
    monthsToGoal: "Durée en mois",
    shareOfIncome: "Part du revenu mensuel",

    // System & Footer
    systemOperational: "Système Opérationnel",
    deterministicMath: "Moteur Financier 100% Déterministe",
    rightsReserved: "Tous droits réservés.",
    footerTagline: "Voyez demain avant de décider aujourd'hui",
    footerBriefingTitle: "Décryptages d'Intelligence Décisionnelle",
    footerBriefingTag: "Rapport Mensuel",
    footerSubscribePlaceholder: "Entrez votre email professionnel",
    footerSubscribeBtn: "S'abonner",
    footerSubscribedSuccess: "Abonné ! Vous recevrez nos analyses stratégiques mensuelles.",
    footerSystemHealth: "État du Système",
    footerCorePlatform: "Plateforme Principale",
    footerMonetization: "Tarifs & Offres",
    footerSecurity: "Sécurité & Confidentialité",
    footerBackToTop: "Haut de page",
  },
};
