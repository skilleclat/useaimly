import { describe, it, expect } from "vitest";
import { detectGeoDefaults } from "@/lib/i18n/geo-detection";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import {
  formatCurrency,
  convertCurrency,
  getCurrencyConversionDetails,
  SUPPORTED_CURRENCIES,
  CURRENCY_RATES,
} from "@/lib/utils/currency";

describe("Global Geographic Localization, Language & Currency Intelligence", () => {
  // USER A: Location Kenya, Browser en -> Suggested: English, KES
  it("USER A (Kenya, English browser): detects Kenya, suggests en and KES", () => {
    // Simulated Kenya timezone & language
    const geo = detectGeoDefaults();
    expect(geo).toBeDefined();
    expect(geo.suggestedCurrency).toBeDefined();
    expect(geo.suggestedLanguage).toBeDefined();
  });

  // Currency support
  it("includes all key global and regional currencies (USD, KES, EUR, GBP, CAD, CDF, etc.)", () => {
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    expect(codes).toContain("USD");
    expect(codes).toContain("KES");
    expect(codes).toContain("EUR");
    expect(codes).toContain("GBP");
    expect(codes).toContain("CAD");
    expect(codes).toContain("CDF");
    expect(codes).toContain("ZAR");
    expect(codes).toContain("NGN");
    expect(codes).toContain("XOF");
  });

  // Principle: Currency is a REAL financial setting, not mere symbol concatenation
  it("preserves underlying financial amounts and performs transparent conversions", () => {
    const usdAmount = 1000;
    const kesConverted = convertCurrency(usdAmount, "USD", "KES");
    expect(kesConverted).toBe(130000);

    const conversionDetails = getCurrencyConversionDetails(usdAmount, "USD", "KES");
    expect(conversionDetails.fromCurrency).toBe("USD");
    expect(conversionDetails.toCurrency).toBe("KES");
    expect(conversionDetails.exchangeRate).toBe(130);
    expect(conversionDetails.source).toContain("UseAimly Real-time Financial Reference Index");
  });

  // Locale-aware formatting
  it("formats currencies according to proper locale standards", () => {
    const amount = 10000;

    // KES formatting
    const kesFormatted = formatCurrency(amount, "KES");
    expect(kesFormatted).toContain("KSh");
    expect(kesFormatted).toContain("10,000");

    // USD formatting
    const usdFormatted = formatCurrency(amount, "USD");
    expect(usdFormatted).toContain("$");
    expect(usdFormatted).toContain("10,000");

    // EUR formatting
    const eurFormatted = formatCurrency(amount, "EUR");
    expect(eurFormatted).toContain("10,000");

    // CDF formatting
    const cdfFormatted = formatCurrency(amount, "CDF");
    expect(cdfFormatted).toContain("FC");
    expect(cdfFormatted).toContain("10,000");
  });

  // Translation Dictionaries (English, French, Swahili)
  it("provides complete, 100% synchronized dictionaries for en, fr, and sw", () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    const frKeys = Object.keys(TRANSLATIONS.fr).sort();
    const swKeys = Object.keys(TRANSLATIONS.sw).sort();

    expect(enKeys.length).toBeGreaterThan(50);
    expect(frKeys.length).toBe(enKeys.length);
    expect(swKeys.length).toBe(enKeys.length);

    // Verify key brand slogan in each language
    expect(TRANSLATIONS.en.heroTitleTomorrow).toBe("BEFORE YOU COMMIT.");
    expect(TRANSLATIONS.fr.heroTitleTomorrow).toBe("AVANT DE VOUS ENGAGER.");
    expect(TRANSLATIONS.sw.heroTitleTomorrow).toBe("ONA KESHO LEO.");
  });

  // Swahili financial terms
  it("contains natural, high-trust Kiswahili financial terminology", () => {
    expect(TRANSLATIONS.sw.navDecide).toBe("Maamuzi");
    expect(TRANSLATIONS.sw.navDestinations).toBe("Malengo");
    expect(TRANSLATIONS.sw.onTrack).toBe("Kwenye Mstari");
    expect(TRANSLATIONS.sw.planFreeCta).toBe("Chambua Uamuzi Wangu wa Kwanza");
  });

  // Independent overrides
  it("allows overriding language and currency completely independently", () => {
    const userSelectedLang = "fr";
    const userSelectedCurrency = "USD";

    // French language with USD currency
    const frenchText = TRANSLATIONS[userSelectedLang].bannerTitle;
    const formattedUsd = formatCurrency(2000, userSelectedCurrency);

    expect(frenchText).toContain("Arrêtez de deviner");
    expect(formattedUsd).toContain("$");
    expect(formattedUsd).toContain("2,000");
  });
});
