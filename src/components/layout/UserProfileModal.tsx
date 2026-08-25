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
  History,
  Sparkles,
  Target,
  HelpCircle,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Phone,
  Edit3,
  Trash2,
  Save,
  Check,
  Globe,
  Loader2,
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, profile, displayName, signOut, refreshProfile } = useAuth();
  const { currency, setCurrency, format } = useCurrency();
  const { t, language } = useI18n();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "profile" | "actions">("history");

  // CRUD Form State for User Profile
  const initialName = displayName !== "Strategist" ? displayName : (profile?.full_name || user?.email?.split("@")[0] || "");
  const [fullName, setFullName] = useState(initialName);
  const [username, setUsername] = useState(
    initialName ? `@${initialName.toLowerCase().replace(/\s+/g, "_")}` : "@user"
  );
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [whatsappPhone, setWhatsappPhone] = useState("+254 700 123 456");
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>(currency);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [isDeletingField, setIsDeletingField] = useState(false);
  const [isSwitchingTier, setIsSwitchingTier] = useState(false);
  const [tierMsg, setTierMsg] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
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

  if (!isOpen || !mounted) return null;

  const currentDisplayName = fullName || displayName;
  const userInitials = currentDisplayName ? currentDisplayName.charAt(0).toUpperCase() : "U";

  const handleSwitchPlanTier = async (targetTier: PlanTier) => {
    setIsSwitchingTier(true);
    setTierMsg(null);
    try {
      const res = await upgradePlanAction(targetTier);
      if (res.success) {
        setTierMsg(`Formule ${targetTier.toUpperCase()} activée avec succès !`);
        await refreshProfile();
      } else if (user) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.auth.updateUser({ data: { plan_tier: targetTier } });
        await (supabase.from("profiles") as any)
          .update({ plan_tier: targetTier })
          .eq("id", user.id);
        await refreshProfile();
        setTierMsg(`Formule ${targetTier.toUpperCase()} activée avec succès !`);
      }
    } catch (e) {
      console.warn("Plan tier switch error:", e);
    } finally {
      setIsSwitchingTier(false);
      setTimeout(() => setTierMsg(null), 4000);
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
        console.warn("Error saving profile to Supabase:", err);
      }
    }
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  const handleClearPhone = () => {
    setWhatsappPhone("");
    setIsDeletingField(true);
    setTimeout(() => setIsDeletingField(false), 2500);
  };

  const activityHistory = [
    {
      id: "act-1",
      title: language === "fr" ? "Simulation : Achat d'un Smartphone" : "Simulation: Smartphone Purchase",
      date: language === "fr" ? "Aujourd'hui, 14:30" : "Today, 2:30 PM",
      statusLabel: language === "fr" ? "Couverte (Réserves)" : "Safe (Covered)",
      amount: 30000,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      id: "act-2",
      title: language === "fr" ? "Objectif Ancré : Lancer mon Entreprise" : "Goal Anchored: Start My Business",
      date: language === "fr" ? "Hier, 18:15" : "Yesterday, 6:15 PM",
      statusLabel: language === "fr" ? "Dans les temps (Déc 2027)" : "On Track (Dec 2027)",
      amount: 500000,
      icon: <Target className="w-4 h-4 text-primary" />,
      badgeBg: "bg-primary/10 text-primary border-primary/20",
    },
    {
      id: "act-3",
      title: language === "fr" ? "Simulation : Prêt Véhicule d'Occasion" : "Simulation: Used Car Loan",
      date: language === "fr" ? "Il y a 3 jours" : "3 days ago",
      statusLabel: language === "fr" ? "+45j de retard" : "+45d delay",
      amount: 450000,
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      id: "act-4",
      title: language === "fr" ? "Rapport d'Échéance Exécutif PDF" : "Executive Trajectory PDF Report",
      date: language === "fr" ? "Il y a 5 jours" : "5 days ago",
      statusLabel: language === "fr" ? "Téléchargé" : "Downloaded",
      amount: 0,
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
  ];

  const recommendedActions = [
    {
      id: "rec-1",
      title: language === "fr" ? "1. Ancrer votre 1ère Destination" : "1. Anchor Your 1st Goal",
      desc: language === "fr" ? "Définissez un objectif prioritaire (Entreprise, Logement, Épargne)." : "Define a priority target (Business, Home, Emergency Fund).",
      href: "/onboarding",
      icon: <Target className="w-4 h-4 text-primary" />,
      cta: language === "fr" ? "Démarrer" : "Start Now",
      badge: language === "fr" ? "Essentiel" : "Essential",
    },
    {
      id: "rec-2",
      title: language === "fr" ? "2. Simuler une Décision d'Achat" : "2. Simulate Spending",
      desc: language === "fr" ? "Testez l'impact d'un achat à venir avant d'engager votre trésorerie." : "Evaluate future purchase impact on goal arrival date.",
      href: "/app/decide",
      icon: <HelpCircle className="w-4 h-4 text-emerald-500" />,
      cta: language === "fr" ? "Tester" : "Simulate",
      badge: language === "fr" ? "Instantané" : "Instant",
    },
    {
      id: "rec-3",
      title: language === "fr" ? "3. Laboratoire 'Et si ?'" : "3. 'What-If' Sandbox",
      desc: language === "fr" ? "Explorez l'impact d'une hausse de revenus ou d'une baisse de charges." : "Test life changes like salary hikes or expense reductions.",
      href: "/app/what-if",
      icon: <TrendingUp className="w-4 h-4 text-amber-500" />,
      cta: language === "fr" ? "Explorer" : "Explore",
      badge: language === "fr" ? "Bac à sable" : "Sandbox",
    },
    {
      id: "rec-4",
      title: language === "fr" ? "4. Règles Stratégiques & Bloc-Notes" : "4. AI Strategic Rules",
      desc: language === "fr" ? "Ajoutez des contraintes budgétaires prioritaires pour guider l'IA." : "Define custom financial constraints for AI advisor.",
      href: "/app/notes",
      icon: <BookOpen className="w-4 h-4 text-purple-500" />,
      cta: language === "fr" ? "Rédiger" : "Open Notes",
      badge: language === "fr" ? "Proactif" : "Proactive",
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 md:p-6 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-card border-t sm:border border-border/80 rounded-t-[28px] sm:rounded-3xl p-4 sm:p-6 shadow-2xl z-10 flex flex-col h-[85dvh] max-h-[85dvh] sm:h-auto sm:max-h-[85vh] transition-all">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto -mt-1 mb-2.5 sm:hidden shrink-0" />

        {/* 1. Header Bar (Pinned top - shrink-0) */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3 shrink-0 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-base shadow-md shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold font-editorial text-foreground tracking-tight truncate max-w-[140px] sm:max-w-[240px]">
                  {displayName}
                </h3>
                <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-extrabold px-2 py-0.5 border border-emerald-500/30 uppercase shrink-0">
                  {profile?.plan_tier === "premium"
                    ? "Elite"
                    : profile?.plan_tier === "pro"
                    ? "Aimly Pro"
                    : user
                    ? "Free"
                    : "Live Demo"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                {username} • {emailInput} • {preferredCurrency}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Tab Selector Bar (Pinned - shrink-0) */}
        <div className="flex items-center gap-1 rounded-2xl border border-border/80 bg-secondary/40 p-1 shrink-0 mt-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "history"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-3.5 h-3.5 text-primary" />
            <span>{language === "fr" ? "Historique" : "History"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "profile"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === "fr" ? "Profil" : "Edit Profile"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("actions")}
            className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "actions"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>{language === "fr" ? "Guide" : "Roadmap"}</span>
          </button>
        </div>

        {/* 3. Scrollable Content Body (Flex-1 + Min-h-0 + Overflow-y-auto) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 py-3 space-y-3">
          {/* TAB 1: HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {language === "fr" ? "Simulations Récentes" : "Recent Activity"}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {activityHistory.length} {language === "fr" ? "enregistrés" : "items"}
                </span>
              </div>

              {activityHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl border border-border/80 bg-background hover:border-primary/40 transition-all flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 w-full xs:w-auto">
                    <div className="p-2 rounded-xl bg-secondary/60 shrink-0">
                      {item.icon}
                    </div>
                    <div className="space-y-0.5 text-left min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {item.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex xs:flex-col items-center xs:items-end justify-between xs:justify-center w-full xs:w-auto shrink-0 gap-1 pl-8 xs:pl-0 pt-1 xs:pt-0 border-t xs:border-t-0 border-border/40">
                    {item.amount > 0 && (
                      <div className="text-xs font-bold font-mono text-foreground">
                        {format(item.amount, { fromCurrency: "KES" })}
                      </div>
                    )}
                    <span className={`inline-block rounded-full text-[9px] font-mono font-bold px-2 py-0.5 border ${item.badgeBg}`}>
                      {item.statusLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-left">
              {tierMsg && (
                <div className="p-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{tierMsg}</span>
                </div>
              )}

              {isAdminUser(user) && (
                <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{language === "fr" ? "Accès Propriétaire" : "Owner License"}</span>
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {profile?.plan_tier || "free"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={isSwitchingTier}
                      onClick={() => handleSwitchPlanTier("free")}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        profile?.plan_tier === "free" || !profile?.plan_tier
                          ? "border-border bg-secondary text-foreground font-extrabold"
                          : "border-border/60 bg-background text-muted-foreground"
                      }`}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      disabled={isSwitchingTier}
                      onClick={() => handleSwitchPlanTier("pro")}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        profile?.plan_tier === "pro"
                          ? "border-primary bg-primary text-primary-foreground font-extrabold"
                          : "border-border/60 bg-background text-muted-foreground"
                      }`}
                    >
                      Pro
                    </button>
                    <button
                      type="button"
                      disabled={isSwitchingTier}
                      onClick={() => handleSwitchPlanTier("premium")}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        profile?.plan_tier === "premium"
                          ? "border-amber-500 bg-amber-500 text-white font-extrabold"
                          : "border-border/60 bg-background text-muted-foreground"
                      }`}
                    >
                      Elite
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">
                  {language === "fr" ? "Nom Complet" : "Full Name"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Samuel Kibet"
                    className="w-full rounded-2xl border border-border bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              {/* WhatsApp Phone */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{language === "fr" ? "WhatsApp" : "WhatsApp"}</span>
                  </label>
                  {whatsappPhone && (
                    <button
                      type="button"
                      onClick={handleClearPhone}
                      className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{language === "fr" ? "Effacer" : "Clear"}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="+254 700 000 000"
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden font-mono"
                />
              </div>

              {/* Currency */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>{language === "fr" ? "Devise" : "Currency"}</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["KES", "USD", "EUR", "GBP"] as CurrencyCode[]).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setPreferredCurrency(curr)}
                      className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        preferredCurrency === curr
                          ? "border-primary bg-primary/10 text-primary font-mono font-black"
                          : "border-border/60 bg-background text-muted-foreground font-mono"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-1 flex items-center justify-between">
                {isSavedSuccess ? (
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
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
                  <span>{language === "fr" ? "Sauvegarder" : "Save"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ROADMAP ACTIONS */}
          {activeTab === "actions" && (
            <div className="space-y-2.5">
              {recommendedActions.map((action) => (
                <div
                  key={action.id}
                  className="p-3 rounded-2xl border border-border/80 bg-background hover:border-primary/40 transition-all space-y-1.5 text-left group shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-secondary/60 shrink-0">
                        {action.icon}
                      </div>
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {action.title}
                      </h4>
                    </div>
                    <span className="rounded-full bg-secondary text-foreground text-[9px] font-mono font-bold px-2 py-0.5 border border-border shrink-0">
                      {action.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-7">
                    {action.desc}
                  </p>

                  <Link
                    href={action.href}
                    onClick={onClose}
                    className="inline-flex items-center justify-between w-full pt-1.5 border-t border-border/60 text-xs font-bold text-primary group-hover:underline"
                  >
                    <span>{action.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Footer Bar (Pinned bottom - shrink-0) */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 shrink-0 mt-1">
          <div className="flex items-center gap-2 flex-1">
            <Link
              href="/app/settings"
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-secondary/50 py-2 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{t("navSettings")}</span>
            </Link>

            <Link
              href="/pricing"
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade</span>
            </Link>
          </div>

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
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSigningOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>{isSigningOut ? "..." : (t("navSignOut") || "Sign Out")}</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
