"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { CurrencyCode } from "@/lib/types/finance";
import { WhatsAppDispatchCard } from "@/components/finance/WhatsAppDispatchCard";
import { PayPalCheckoutModal } from "@/components/finance/PayPalCheckoutModal";
import { PRICING_PLANS, PricingPlan, PlanTier } from "@/lib/types/pricing";
import { upgradePlanAction } from "@/lib/auth/actions";
import { isAdminUser } from "@/lib/auth/admin-check";
import {
  Settings as SettingsIcon,
  User,
  Globe,
  Bell,
  Shield,
  Download,
  Check,
  CheckCircle2,
  Lock,
  Compass,
  ArrowRight,
  Sparkles,
  Smartphone,
  LogOut,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const paymentSuccessParam = searchParams.get("payment_success");
  const planParam = searchParams.get("plan");

  const { user, profile, displayName, refreshProfile, signOut } = useAuth();
  const { language, setLanguage } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>(currency);
  const [upgradePlanModal, setUpgradePlanModal] = useState<PricingPlan | null>(null);

  const initialName = displayName !== "Strategist" ? displayName : (profile?.full_name || user?.email?.split("@")[0] || "");
  const [fullName, setFullName] = useState(initialName);
  const [username, setUsername] = useState(
    initialName ? `@${initialName.toLowerCase().replace(/\s+/g, "_")}` : "@user"
  );
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [whatsappPhone, setWhatsappPhone] = useState("+254 700 123 456");
  const [thresholdAmount, setThresholdAmount] = useState<number>(15000);
  const [notifyShortfall, setNotifyShortfall] = useState(true);
  const [notifyCommitments, setNotifyCommitments] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSwitchingTier, setIsSwitchingTier] = useState(false);
  const [tierSuccessMsg, setTierSuccessMsg] = useState<string | null>(null);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    const { verifyAdminPasscode } = await import("@/lib/auth/admin-check");
    if (verifyAdminPasscode(adminPasscode)) {
      setIsAdminUnlocked(true);
      setPasscodeError(null);
    } else {
      setPasscodeError("Code secret administrateur incorrect. Accès refusé.");
    }
  };

  const handleSwitchPlanTier = async (targetTier: PlanTier) => {
    setIsSwitchingTier(true);
    setTierSuccessMsg(null);
    try {
      const res = await upgradePlanAction(targetTier, adminPasscode);
      if (res.success) {
        setTierSuccessMsg(
          targetTier === "premium"
            ? "Accès Owner / Administrateur Aimly Premium (Elite) activé !"
            : targetTier === "pro"
            ? "Accès Aimly Pro Strategist activé avec succès !"
            : "Compte repassé en version Starter Free."
        );
        await refreshProfile();
      } else {
        setPasscodeError(res.message || "Erreur de mise à jour du plan.");
      }
    } catch (err) {
      console.warn("Plan tier switch warning:", err);
    } finally {
      setIsSwitchingTier(false);
      setTimeout(() => setTierSuccessMsg(null), 5000);
    }
  };

  React.useEffect(() => {
    if (paymentSuccessParam === "true") {
      refreshProfile().catch((e) => console.warn("Settings profile sync note:", e));
    }
  }, [paymentSuccessParam, refreshProfile]);

  React.useEffect(() => {
    if (displayName && displayName !== "Strategist") {
      setFullName(displayName);
      setUsername(`@${displayName.toLowerCase().replace(/\s+/g, "_")}`);
    } else if (profile?.full_name && !profile.full_name.toLowerCase().includes("demo")) {
      setFullName(profile.full_name);
      setUsername(`@${profile.full_name.toLowerCase().replace(/\s+/g, "_")}`);
    }
    if (user?.email) {
      setEmailInput(user.email);
    }
    setPreferredCurrency(currency);
  }, [profile, user, displayName, currency]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrency(preferredCurrency);
    if (user) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.auth.updateUser({
          data: { full_name: fullName },
        });
        await (supabase.from("profiles") as any).upsert({
          id: user.id,
          full_name: fullName,
          preferred_currency: preferredCurrency,
          updated_at: new Date().toISOString(),
        });
        await refreshProfile();
      } catch (err) {
        console.warn("Error saving settings profile:", err);
      }
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="max-w-6xl 2xl:max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-10 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1.5 border-b border-border/70 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
          <Compass className="w-4 h-4" />
          <span>System Preferences & CRUD Profile</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Manage your account profile, username, email, WhatsApp phone, preferred currency, and proactive notification rules.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Your profile, credentials, and system settings have been updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* 0. SUBSCRIPTION & PLAN TIER */}
        <div className="rounded-[2.5rem] border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card p-6 sm:p-9 space-y-6 shadow-elevation-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>Subscription & Owner License Control</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-mono font-bold text-emerald-500 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACTIVE STATUS</span>
            </div>
          </div>

          {tierSuccessMsg && (
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{tierSuccessMsg}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-foreground uppercase tracking-tight">
                  {profile?.plan_tier ? profile.plan_tier.toUpperCase() : "FREE"} PLAN
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30">
                  {profile?.plan_tier === "premium" ? "Aimly Elite (Owner)" : profile?.plan_tier === "pro" ? "Pro Strategist" : "Starter Free"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {profile?.plan_tier === "premium"
                  ? "Formule Premium Élite active : Accès illimité au moteur déterministe, Conseiller IA (Gemini / GPT-4), Bloc-Notes IA et Laboratoire Scénarios."
                  : profile?.plan_tier === "pro"
                  ? "Formule Pro active : Studio 3-Stratégies, Destinations multiples, et Alertes proactives."
                  : "Formule Starter Gratuite : 1 Destination principale & simulateur de base."}
              </p>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground font-bold text-xs px-4 py-2.5 shadow-xs transition-all shrink-0 border border-border/80"
            >
              <span>Voir Tarifs & FAQ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* EXCLUSIVE OWNER & ADMIN LICENSE CONTROL (skilleclat@gmail.com ONLY) */}
          {isAdminUser(user) && (
            <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Shield className="w-4 h-4" />
                  <span>Espace Propriétaire Exclusif — (skilleclat@gmail.com)</span>
                </div>
                <span className="text-[10px] font-mono font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  OWNER VERIFIED
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Vous êtes identifié en tant que propriétaire du site (<strong>skilleclat@gmail.com</strong>). Vous pouvez basculer le niveau de votre licence ou attribuer une formule Pro/Premium d&apos;un seul clic.
              </p>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isSwitchingTier}
                  onClick={() => handleSwitchPlanTier("free")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    profile?.plan_tier === "free" || !profile?.plan_tier
                      ? "border-border bg-secondary text-foreground ring-2 ring-border font-extrabold"
                      : "border-border/60 bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Free (Starter)</span>
                </button>

                <button
                  type="button"
                  disabled={isSwitchingTier}
                  onClick={() => handleSwitchPlanTier("pro")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    profile?.plan_tier === "pro"
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30 font-extrabold"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aimly Pro</span>
                </button>

                <button
                  type="button"
                  disabled={isSwitchingTier}
                  onClick={() => handleSwitchPlanTier("premium")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    profile?.plan_tier === "premium"
                      ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/40 font-extrabold shadow-md"
                      : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Aimly Premium (Elite)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 1. PROFILE & IDENTITY CRUD */}
        <div className="rounded-[2.5rem] border border-border/80 bg-card p-6 sm:p-9 space-y-6 shadow-elevation-1">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <User className="w-4 h-4 text-primary" />
            <span>Profile & Contact Identity (CRUD)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-mono font-bold text-foreground">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:border-primary focus:outline-none transition-colors min-h-[42px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono font-bold text-foreground">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="@username"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs font-mono font-bold text-foreground focus:border-primary focus:outline-none transition-colors min-h-[42px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono font-bold text-foreground">Email Address</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:border-primary focus:outline-none transition-colors min-h-[42px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono font-bold text-foreground">WhatsApp Phone Number</label>
              <input
                type="tel"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="+254 700 000 000 / +33 6 00 00 00 00"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs font-mono font-bold text-foreground focus:border-emerald-500 focus:outline-none transition-colors min-h-[42px]"
              />
            </div>
          </div>
        </div>

        {/* 2. REGIONAL & CURRENCY INTELLIGENCE */}
        <div className="rounded-[2.5rem] border border-border/80 bg-card p-6 sm:p-9 space-y-6 shadow-elevation-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Globe className="w-4 h-4 text-primary" />
              <span>Language, Currency & Geographic Localization</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            UseAimly adapts intelligently to your geographic context. You can customize your language and financial currency independently at any time.
          </p>

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-foreground block">
              Interface Language
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { code: "en", label: "English", badge: "EN" },
                { code: "fr", label: "Français", badge: "FR" },
                { code: "es", label: "Español", badge: "ES" },
              ].map((l) => {
                const isSelected = language === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-[#FF5533] bg-[#FF5533]/10 text-foreground ring-1 ring-[#FF5533] font-bold"
                        : "border-border bg-background text-muted-foreground hover:border-[#FF5533]/40 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-secondary text-[#FF5533]">
                        {l.badge}
                      </span>
                      <span className="text-xs font-semibold">{l.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#FF5533]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-foreground">
                Main Financial Currency
              </label>
              <span className="text-[11px] text-muted-foreground font-mono">
                Original entries preserved
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { code: "USD", name: "US Dollar", symbol: "$" },
                { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
                { code: "EUR", name: "Euro", symbol: "€" },
                { code: "GBP", name: "British Pound", symbol: "£" },
                { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
                { code: "CDF", name: "Franc Congolais", symbol: "FC" },
                { code: "ZAR", name: "South African Rand", symbol: "R" },
                { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
                { code: "XOF", name: "Franc CFA", symbol: "CFA" },
                { code: "UGX", name: "Ugandan Shilling", symbol: "USh" },
                { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh" },
                { code: "RWF", name: "Rwandan Franc", symbol: "FRw" },
              ].map((c) => {
                const isSelected = preferredCurrency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setPreferredCurrency(c.code as CurrencyCode)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#FF5533] bg-[#FF5533]/10 text-foreground ring-1 ring-[#FF5533] font-bold shadow-xs"
                        : "border-border bg-background text-muted-foreground hover:border-[#FF5533]/40 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-foreground">{c.code}</span>
                      <span className="text-xs font-mono font-bold text-muted-foreground bg-secondary/80 px-1.5 py-0.2 rounded">{c.symbol}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 truncate">
                      {c.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. PROACTIVE INSIGHT ALERTS */}
        <div className="rounded-[2.5rem] border border-border/80 bg-card p-6 sm:p-9 space-y-6 shadow-elevation-1">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Bell className="w-4 h-4 text-primary" />
            <span>Proactive Insight Rules</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/60">
              <div>
                <div className="font-bold text-foreground">Pace Shortfall Alerts</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Notify when monthly savings fall behind the pace needed to hit target dates.
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyShortfall}
                onChange={(e) => setNotifyShortfall(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#FF5533]"
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/60">
              <div>
                <div className="font-bold text-foreground">Large Commitment Reminders</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Proactively warn 30 days before annual or quarterly obligations are due.
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyCommitments}
                onChange={(e) => setNotifyCommitments(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#FF5533]"
              />
            </div>
          </div>
        </div>

        {/* 4. SUBSCRIPTION & PAYMENT PLAN (M-PESA / PAYPAL) */}
        <div className="rounded-[2.5rem] border border-border/80 bg-card p-6 sm:p-9 space-y-6 shadow-elevation-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Subscription & Membership Tier</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 uppercase">
              Current Plan: {profile?.plan_tier?.toUpperCase() || "FREE"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-foreground">Aimly Pro</span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">650 KES / mo</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Moteur déterministe complet, Studio 3-Stratégies et Alertes IA proactives.
              </p>
              <button
                type="button"
                onClick={() => setUpgradePlanModal(PRICING_PLANS.find((p) => p.id === "pro") || null)}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Souscrire via M-Pesa ou PayPal</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-foreground">Aimly Premium</span>
                <span className="text-xs font-mono font-bold text-primary">1 950 KES / mo</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Destinations illimitées, Bloc-Notes IA et accompagnement prioritaire.
              </p>
              <button
                type="button"
                onClick={() => setUpgradePlanModal(PRICING_PLANS.find((p) => p.id === "premium") || null)}
                className="w-full rounded-xl bg-primary hover:opacity-95 text-primary-foreground text-xs font-bold py-2.5 px-4 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Souscrire via M-Pesa ou PayPal</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5. WHATSAPP PRO DISPATCH INTELLIGENCE */}
        <WhatsAppDispatchCard
          initialPhone="+254 712 345 678"
          destinationTitle="Launch my business"
          targetDate="Dec 2027"
          projectedDate="Dec 2027"
          delayInDays={0}
          monthlyGoalCapacity={68000}
          currency={preferredCurrency}
        />

        {/* 6. ACCOUNT SESSION & LOGOUT */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>{language === "fr" ? "Sécurité & Session Active" : "Account Session & Security"}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {user?.email || "Current active session"}
              </p>
            </div>

            <button
              type="button"
              disabled={isSigningOut}
              onClick={async () => {
                setIsSigningOut(true);
                await signOut();
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSigningOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>
                {isSigningOut
                  ? (language === "fr" ? "Déconnexion..." : "Signing out...")
                  : (language === "fr" ? "Se Déconnecter" : "Sign Out")}
              </span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white font-bold text-xs sm:text-sm px-8 py-3.5 shadow-lg shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Upgrade Checkout Modal */}
      <PayPalCheckoutModal
        isOpen={Boolean(upgradePlanModal)}
        onClose={() => setUpgradePlanModal(null)}
        plan={upgradePlanModal}
        isYearly={false}
      />
    </div>
  );
}
