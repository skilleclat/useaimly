"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { CurrencyCode } from "@/lib/types/finance";
import { PlanTier } from "@/lib/types/pricing";
import { upgradePlanAction } from "@/lib/auth/actions";
import { isAdminUser } from "@/lib/auth/admin-check";
import {
  User,
  LayoutDashboard,
  CheckCircle2,
  Target,
  Sparkles,
  Settings,
  LogOut,
  X,
  CreditCard,
  Edit3,
  Save,
  Check,
  Globe,
  Loader2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, profile, displayName, signOut, refreshProfile } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { t, language } = useI18n();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"nav" | "profile" | "plan">("nav");

  // Profile Form State
  const initialName =
    displayName !== "Strategist"
      ? displayName
      : profile?.full_name || user?.email?.split("@")[0] || "";
  const [fullName, setFullName] = useState(initialName);
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>(currency);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [isSwitchingTier, setIsSwitchingTier] = useState(false);
  const [tierMsg, setTierMsg] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSyncingPlan, setIsSyncingPlan] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      refreshProfile().catch(() => {});
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, refreshProfile]);

  useEffect(() => {
    if (displayName && displayName !== "Strategist") {
      setFullName(displayName);
    } else if (profile?.full_name && !profile.full_name.toLowerCase().includes("demo")) {
      setFullName(profile.full_name);
    }
    setPreferredCurrency(currency);
  }, [profile, displayName, currency]);

  if (!isOpen || !mounted) return null;

  const currentDisplayName = fullName || displayName || "Utilisateur";
  const userInitials = currentDisplayName ? currentDisplayName.charAt(0).toUpperCase() : "U";
  const userEmail = user?.email || profile?.email || "Compte Visiteur";
  const isPro = profile?.plan_tier === "pro" || profile?.plan_tier === "premium";

  const handleSyncSubscription = async () => {
    setIsSyncingPlan(true);
    try {
      await refreshProfile();
    } catch {
      // Ignore
    } finally {
      setIsSyncingPlan(false);
    }
  };

  const handleSwitchPlanTier = async (targetTier: PlanTier) => {
    setIsSwitchingTier(true);
    setTierMsg(null);
    try {
      const res = await upgradePlanAction(targetTier);
      if (res.success) {
        setTierMsg(`Formule ${targetTier.toUpperCase()} activée !`);
        await refreshProfile();
      } else if (user) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.auth.updateUser({ data: { plan_tier: targetTier } });
        await (supabase.from("profiles") as any)
          .update({ plan_tier: targetTier })
          .eq("id", user.id);
        await refreshProfile();
        setTierMsg(`Formule ${targetTier.toUpperCase()} activée !`);
      }
    } catch (e) {
      console.warn("Plan tier switch error:", e);
    } finally {
      setIsSwitchingTier(false);
      setTimeout(() => setTierMsg(null), 3500);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
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
        console.warn("Error saving profile:", err);
      }
    }
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2500);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 font-sans"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100dvh",
      }}
    >
      {/* Dark Blurred Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[#16161A] text-white border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl z-10 flex flex-col max-h-[85dvh] overflow-hidden animate-scaleUp">
        {/* 1. Header (Avatar, Name, Plan, Close) */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white flex items-center justify-center font-bold text-base shadow-md shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-[180px]">
                  {currentDisplayName}
                </h3>
                <button
                  type="button"
                  onClick={handleSyncSubscription}
                  disabled={isSyncingPlan}
                  className={`rounded-full text-[10px] font-mono font-extrabold px-2.5 py-0.5 border uppercase shrink-0 transition-all inline-flex items-center gap-1 cursor-pointer ${
                    isPro
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-white/10 text-gray-300 border-white/20 hover:bg-white/20"
                  }`}
                  title="Cliquez pour synchroniser votre abonnement Stripe"
                >
                  {isSyncingPlan ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-2.5 h-2.5 opacity-70" />
                  )}
                  <span>
                    {profile?.plan_tier === "premium"
                      ? "Elite"
                      : profile?.plan_tier === "pro"
                      ? "Aimly Pro"
                      : user
                      ? "Free"
                      : "Demo"}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                {userEmail} • {currency}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Compact Tabs Bar */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white/5 border border-white/10 p-1 shrink-0 mt-3">
          <button
            type="button"
            onClick={() => setActiveTab("nav")}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "nav"
                ? "bg-white/15 text-white shadow-xs"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#FF5533]" />
            <span>Navigation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-white/15 text-white shadow-xs"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Profil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("plan")}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "plan"
                ? "bg-white/15 text-white shadow-xs"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Formule</span>
          </button>
        </div>

        {/* 3. Scrollable Tab Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3 pr-1 space-y-2.5">
          {/* TAB 1: NAVIGATION & SHORTCUTS */}
          {activeTab === "nav" && (
            <div className="space-y-1.5 text-left">
              <Link
                href="/app"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/20 text-[#FF5533]">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#FF5533] transition-colors">
                      {language === "fr" ? "Tableau de bord" : "Dashboard"}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {language === "fr" ? "Vue d'ensemble et trajectoire" : "Overview & trajectory"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/app/decide"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                      {language === "fr" ? "Studio de Décision" : "Decide Studio"}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {language === "fr" ? "Simuler un achat ou investissement" : "Test purchase or spending"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/app/goals"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {language === "fr" ? "Mes Objectifs de Vie" : "Life Goals"}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {language === "fr" ? "Entreprise, immobilier, épargne" : "Targets & timelines"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/app/settings"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gray-500/20 text-gray-300">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-gray-200 transition-colors">
                      {language === "fr" ? "Paramètres du Compte" : "Account Settings"}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {language === "fr" ? "Devise, sécurité, profil" : "Preferences & security"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-3 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  {language === "fr" ? "Nom Complet" : "Full Name"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Hétier Djuma"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-xs text-white focus:border-[#FF5533] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>{language === "fr" ? "Devise Préférée" : "Preferred Currency"}</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["KES", "USD", "EUR", "GBP"] as CurrencyCode[]).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setPreferredCurrency(curr)}
                      className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        preferredCurrency === curr
                          ? "border-[#FF5533] bg-[#FF5533]/20 text-[#FF5533] font-mono font-black"
                          : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between">
                {isSavedSuccess ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === "fr" ? "Enregistré !" : "Saved!"}</span>
                  </span>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs font-bold px-4 py-2 shadow-sm hover:opacity-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === "fr" ? "Sauvegarder" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SUBSCRIPTION / PLAN */}
          {activeTab === "plan" && (
            <div className="space-y-3 text-left">
              {tierMsg && (
                <div className="p-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{tierMsg}</span>
                </div>
              )}

              <div className="p-3.5 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-bold">
                      {language === "fr" ? "Statut Actuel" : "Current Tier"}
                    </span>
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{isPro ? "UseAimly Pro (Actif)" : "Formule Gratuite (Free)"}</span>
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={handleSyncSubscription}
                    disabled={isSyncingPlan}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Synchroniser avec Stripe"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPlan ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {isPro
                    ? (language === "fr" ? "Toutes les simulations de décisions illimitées et analyses IA sont débloquées." : "Unlimited decision simulations and AI strategist analyses are unlocked.")
                    : (language === "fr" ? "Passez à UseAimly Pro pour débloquer les simulations illimitées et les exports PDF exécutifs." : "Upgrade to UseAimly Pro for unlimited decision simulations and executive PDF exports.")}
                </p>
              </div>

              {isAdminUser(user) && (
                <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Accès Administrateur / Licence</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      disabled={isSwitchingTier}
                      onClick={() => handleSwitchPlanTier("free")}
                      className="py-1.5 px-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-gray-300 hover:bg-white/10 cursor-pointer"
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      disabled={isSwitchingTier}
                      onClick={() => handleSwitchPlanTier("pro")}
                      className="py-1.5 px-2 rounded-xl border border-[#FF5533] bg-[#FF5533] text-xs font-bold text-white cursor-pointer"
                    >
                      Pro
                    </button>
                    <button
                      type="button"
                      disabled={isSwitchingTier}
                      onClick={() => handleSwitchPlanTier("premium")}
                      className="py-1.5 px-2 rounded-xl border border-amber-500 bg-amber-500 text-xs font-bold text-white cursor-pointer"
                    >
                      Elite
                    </button>
                  </div>
                </div>
              )}

              {!isPro && (
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === "fr" ? "Activer UseAimly Pro ($4.99/mois)" : "Upgrade to Pro ($4.99/mo)"}</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 4. Footer (Sign Out Button) */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 shrink-0">
          <Link
            href="/app/settings"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-gray-400" />
            <span>{t("navSettings") || "Paramètres"}</span>
          </Link>

          {(user || profile) && (
            <button
              type="button"
              disabled={isSigningOut}
              onClick={async () => {
                setIsSigningOut(true);
                try {
                  await signOut();
                } finally {
                  onClose();
                }
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSigningOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>{isSigningOut ? "Déconnexion..." : (t("navSignOut") || "Déconnexion")}</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
