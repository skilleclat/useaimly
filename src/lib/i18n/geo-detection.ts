import { LanguageCode } from "./translations";
import { CurrencyCode } from "../types/finance";

export interface GeoLocalizationProfile {
  suggestedLanguage: LanguageCode;
  suggestedCurrency: CurrencyCode;
  detectedCountryName: string;
  detectedCountryCode: string;
  detectedCountryFlag: string;
  confidence: "high" | "medium" | "fallback";
}

/**
 * Intelligent Geographic & Locale Detection Engine
 * Combines Timezone and Navigator signals to suggest sensible defaults.
 * Never locks the user: Always allows independent override.
 */
export function detectGeoDefaults(): GeoLocalizationProfile {
  if (typeof window === "undefined") {
    return {
      suggestedLanguage: "en",
      suggestedCurrency: "USD",
      detectedCountryName: "United States / Global",
      detectedCountryCode: "US",
      detectedCountryFlag: "🇺🇸",
      confidence: "fallback",
    };
  }

  let tz = "";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch (e) {
    tz = "";
  }

  const browserLang = (navigator?.language || "").toLowerCase();

  // 1. East Africa / Kenya
  if (tz.includes("Nairobi") || tz.includes("Mombasa") || browserLang.includes("-ke") || browserLang.startsWith("sw")) {
    const isSwahiliPreferred = browserLang.startsWith("sw");
    return {
      suggestedLanguage: isSwahiliPreferred ? "sw" : "en",
      suggestedCurrency: "KES",
      detectedCountryName: "Kenya",
      detectedCountryCode: "KE",
      detectedCountryFlag: "🇰🇪",
      confidence: "high",
    };
  }

  // 2. Democratic Republic of Congo
  if (tz.includes("Kinshasa") || tz.includes("Lubumbashi") || browserLang.includes("-cd")) {
    return {
      suggestedLanguage: "fr",
      suggestedCurrency: "CDF", // or USD commonly used
      detectedCountryName: "République Démocratique du Congo",
      detectedCountryCode: "CD",
      detectedCountryFlag: "🇨🇩",
      confidence: "high",
    };
  }

  // 3. Tanzania
  if (tz.includes("Dar_es_Salaam") || tz.includes("Zanzibar") || browserLang.includes("-tz")) {
    return {
      suggestedLanguage: "sw",
      suggestedCurrency: "TZS",
      detectedCountryName: "Tanzania",
      detectedCountryCode: "TZ",
      detectedCountryFlag: "🇹🇿",
      confidence: "high",
    };
  }

  // 4. Uganda
  if (tz.includes("Kampala") || browserLang.includes("-ug")) {
    return {
      suggestedLanguage: "en",
      suggestedCurrency: "UGX",
      detectedCountryName: "Uganda",
      detectedCountryCode: "UG",
      detectedCountryFlag: "🇺🇬",
      confidence: "high",
    };
  }

  // 5. Rwanda
  if (tz.includes("Kigali") || browserLang.includes("-rw")) {
    return {
      suggestedLanguage: browserLang.startsWith("fr") ? "fr" : "en",
      suggestedCurrency: "RWF",
      detectedCountryName: "Rwanda",
      detectedCountryCode: "RW",
      detectedCountryFlag: "🇷🇼",
      confidence: "high",
    };
  }

  // Spain & Spanish-speaking regions
  if (
    tz.includes("Madrid") ||
    tz.includes("Mexico") ||
    tz.includes("Bogota") ||
    tz.includes("Buenos_Aires") ||
    tz.includes("Santiago") ||
    tz.includes("Lima") ||
    browserLang.startsWith("es")
  ) {
    const isSpain = tz.includes("Madrid");
    return {
      suggestedLanguage: "es",
      suggestedCurrency: isSpain ? "EUR" : "USD",
      detectedCountryName: isSpain ? "España" : "Hispanoamérica",
      detectedCountryCode: isSpain ? "ES" : "ES",
      detectedCountryFlag: "🇪🇸",
      confidence: "high",
    };
  }

  // 6. France & Eurozone
  if (
    tz.includes("Paris") ||
    tz.includes("Brussels") ||
    tz.includes("Berlin") ||
    tz.includes("Rome") ||
    tz.includes("Amsterdam")
  ) {
    const isFr = tz.includes("Paris") || tz.includes("Brussels") || browserLang.startsWith("fr");
    return {
      suggestedLanguage: isFr ? "fr" : "en",
      suggestedCurrency: "EUR",
      detectedCountryName: isFr ? "France / Europe" : "Europe",
      detectedCountryCode: "FR",
      detectedCountryFlag: "🇪🇺",
      confidence: "high",
    };
  }

  // 7. United Kingdom
  if (tz.includes("London") || browserLang.includes("-gb")) {
    return {
      suggestedLanguage: "en",
      suggestedCurrency: "GBP",
      detectedCountryName: "United Kingdom",
      detectedCountryCode: "GB",
      detectedCountryFlag: "🇬🇧",
      confidence: "high",
    };
  }

  // 8. Canada
  if (tz.includes("Toronto") || tz.includes("Vancouver") || tz.includes("Montreal") || tz.includes("Edmonton")) {
    const isFr = browserLang.startsWith("fr") || tz.includes("Montreal");
    return {
      suggestedLanguage: isFr ? "fr" : "en",
      suggestedCurrency: "CAD",
      detectedCountryName: "Canada",
      detectedCountryCode: "CA",
      detectedCountryFlag: "🇨🇦",
      confidence: "high",
    };
  }

  // 9. West Africa (Francophone: Senegal, Ivory Coast, Cameroon, etc.)
  if (tz.includes("Dakar") || tz.includes("Abidjan") || tz.includes("Douala") || tz.includes("Bamako")) {
    return {
      suggestedLanguage: "fr",
      suggestedCurrency: "XOF",
      detectedCountryName: "Afrique de l'Ouest",
      detectedCountryCode: "SN",
      detectedCountryFlag: "🇸🇳",
      confidence: "high",
    };
  }

  // 10. South Africa
  if (tz.includes("Johannesburg") || browserLang.includes("-za")) {
    return {
      suggestedLanguage: "en",
      suggestedCurrency: "ZAR",
      detectedCountryName: "South Africa",
      detectedCountryCode: "ZA",
      detectedCountryFlag: "🇿🇦",
      confidence: "high",
    };
  }

  // 11. Nigeria
  if (tz.includes("Lagos") || browserLang.includes("-ng")) {
    return {
      suggestedLanguage: "en",
      suggestedCurrency: "NGN",
      detectedCountryName: "Nigeria",
      detectedCountryCode: "NG",
      detectedCountryFlag: "🇳🇬",
      confidence: "high",
    };
  }

  // 12. Generic Browser Language Fallback
  if (browserLang.startsWith("fr")) {
    return {
      suggestedLanguage: "fr",
      suggestedCurrency: "USD",
      detectedCountryName: "Francophonie",
      detectedCountryCode: "FR",
      detectedCountryFlag: "🇫🇷",
      confidence: "medium",
    };
  }

  if (browserLang.startsWith("sw")) {
    return {
      suggestedLanguage: "sw",
      suggestedCurrency: "KES",
      detectedCountryName: "Afrika Mashariki",
      detectedCountryCode: "KE",
      detectedCountryFlag: "🇰🇪",
      confidence: "medium",
    };
  }

  // Default Fallback
  return {
    suggestedLanguage: "en",
    suggestedCurrency: "USD",
    detectedCountryName: "Global / United States",
    detectedCountryCode: "US",
    detectedCountryFlag: "🇺🇸",
    confidence: "fallback",
  };
}
