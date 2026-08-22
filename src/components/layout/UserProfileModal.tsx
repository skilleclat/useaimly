"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
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
  Clock,
  ArrowRight,
  ShieldCheck,
  Compass,
  Wallet,
  BookOpen,
  Phone,
  Mail,
  Edit3,
  Trash2,
  Save,
  Check,
  Globe,
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, profile, displayName, signOut, refreshProfile } = useAuth();
  const { currency, setCurrency, format } = useCurrency();
  const { t, language } = useI18n();

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

  if (!isOpen) return null;

  const currentDisplayName = fullName || displayName;
  const userInitials = currentDisplayName ? currentDisplayName.charAt(0).toUpperCase() : "U";

  // CRUD Action 1: UPDATE Profile
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

  // CRUD Action 2: DELETE / Clear WhatsApp Phone
  const handleClearPhone = () => {
    setWhatsappPhone("");
    setIsDeletingField(true);
    setTimeout(() => setIsDeletingField(false), 2500);
  };

  // Mock Activity History items for Returning Users
  const activityHistory = [
    {
      id: "act-1",
      title: language === "fr" ? "Simulation : Achat d'un Smartphone" : "Simulation: Smartphone Purchase",
      date: language === "fr" ? "Aujourd'hui, 14:30" : "Today, 2:30 PM",
      status: "SAFE",
      statusLabel: language === "fr" ? "Couverte (Réserves Liquides)" : "Safe (Liquid Reserve Covered)",
      amount: 30000,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      id: "act-2",
      title: language === "fr" ? "Objectif Ancré : Lancer mon Entreprise" : "Goal Anchored: Start My Business",
      date: language === "fr" ? "Hier, 18:15" : "Yesterday, 6:15 PM",
      status: "ON_TRACK",
      statusLabel: language === "fr" ? "Dans les temps (Échéance Déc 2027)" : "On Track (Target Dec 2027)",
      amount: 500000,
      icon: <Target className="w-4 h-4 text-primary" />,
      badgeBg: "bg-primary/10 text-primary border-primary/20",
    },
    {
      id: "act-3",
      title: language === "fr" ? "Simulation : Prêt Véhicule d'Occasion" : "Simulation: Used Car Loan",
      date: language === "fr" ? "Il y a 3 jours" : "3 days ago",
      status: "HIGH_IMPACT",
      statusLabel: language === "fr" ? "+45 jours de retard sur l'objectif" : "+45 days goal delay",
      amount: 450000,
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      id: "act-4",
      title: language === "fr" ? "Rapport d'Échéance Exécutif PDF" : "Executive Trajectory PDF Report",
      date: language === "fr" ? "Il y a 5 jours" : "5 days ago",
      status: "EXPORTED",
      statusLabel: language === "fr" ? "Téléchargé" : "Downloaded",
      amount: 0,
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
  ];

  // Tailored Recommended Actions for New Users
  const recommendedActions = [
    {
      id: "rec-1",
      title: language === "fr" ? "1. Ancrer votre 1ère Destination de Vie" : "1. Anchor Your 1st Life Goal",
      desc: language === "fr" ? "Définissez un objectif prioritaire (Entreprise, Logement, Épargne)." : "Define a priority target (Business, Home, Emergency Fund).",
      href: "/onboarding",
      icon: <Target className="w-5 h-5 text-primary" />,
      cta: language === "fr" ? "Démarrer" : "Start Now",
      badge: language === "fr" ? "Essentiel" : "Essential",
    },
    {
      id: "rec-2",
      title: language === "fr" ? "2. Simuler une Décision d'Achat (Studio Decide)" : "2. Simulate Spending (Decide Studio)",
      desc: language === "fr" ? "Testez l'impact d'un achat à venir avant d'engager votre trésorerie." : "Evaluate future purchase impact on goal arrival date.",
      href: "/app/decide",
      icon: <HelpCircle className="w-5 h-5 text-emerald-500" />,
      cta: language === "fr" ? "Tester" : "Simulate",
      badge: language === "fr" ? "Instantané" : "Instant",
    },
    {
      id: "rec-3",
      title: language === "fr" ? "3. Laboratoire de Scénarios 'Et si ?'" : "3. 'What-If' Scenario Laboratory",
      desc: language === "fr" ? "Explorez l'impact d'une hausse de revenus ou d'une baisse de charges." : "Test life changes like salary hikes or expense reductions.",
      href: "/app/what-if",
      icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
      cta: language === "fr" ? "Explorer" : "Explore",
      badge: language === "fr" ? "Bac à sable" : "Sandbox",
    },
    {
      id: "rec-4",
      title: language === "fr" ? "4. Enregistrer vos Règles & Bloc-Notes IA" : "4. Set AI Strategic Rules & Notepad",
      desc: language === "fr" ? "Ajoutez des contraintes budgétaires prioritaires pour guider l'IA." : "Define custom financial constraints for AI advisor.",
      href: "/app/notes",
      icon: <BookOpen className="w-5 h-5 text-purple-500" />,
      cta: language === "fr" ? "Rédiger" : "Open Notes",
      badge: language === "fr" ? "Proactif" : "Proactive",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl z-10 space-y-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-start justify-between border-b border-border/60 pb-5 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-editorial text-foreground tracking-tight">
                  {displayName}
                </h3>
                <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-extrabold px-2.5 py-0.5 border border-emerald-500/30 uppercase">
                  {user ? "Pro Strategist" : "Guest / Live Demo"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {username} • {emailInput} • {preferredCurrency}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Bar (History vs Profile CRUD vs Actions) */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-secondary/30 p-1.5 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all whitespace-nowrap ${
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
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === "fr" ? "Mon Profil (CRUD)" : "Edit Profile"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("actions")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "actions"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>{language === "fr" ? "Guide & Possibilités" : "What You Can Do"}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1 no-scrollbar">
          {/* TAB 1: HISTORY LOG (READ) */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {language === "fr" ? "Vos Simulations & Actions Récentes" : "Recent Simulations & Activity"}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {activityHistory.length} {language === "fr" ? "éléments enregistrés" : "items logged"}
                </span>
              </div>

              <div className="space-y-2.5">
                {activityHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-border/80 bg-background hover:border-primary/40 transition-all flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-secondary/60 shrink-0">
                        {item.icon}
                      </div>
                      <div className="space-y-0.5 text-left">
                        <h4 className="text-xs font-bold text-foreground leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {item.date}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      {item.amount > 0 && (
                        <div className="text-xs font-bold font-mono text-foreground">
                          {format(item.amount, { fromCurrency: "KES" })}
                        </div>
                      )}
                      <span className={`inline-block rounded-full text-[10px] font-mono font-bold px-2 py-0.5 border ${item.badgeBg}`}>
                        {item.statusLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE EDIT & CRUD (CREATE, READ, UPDATE, DELETE) */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase text-foreground">
                    {language === "fr" ? "Éditeur de Profil & Coordonnées (CRUD)" : "Profile & Contact CRUD Management"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {language === "fr" ? "Consultez, modifiez ou mettez à jour vos identifiants et votre numéro WhatsApp." : "View, edit, or update your credentials and WhatsApp phone number."}
                  </p>
                </div>
                {isSavedSuccess && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === "fr" ? "Enregistré !" : "Saved!"}</span>
                  </span>
                )}
              </div>

              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>{language === "fr" ? "Nom Complet" : "Full Name"}</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-border/80 bg-background px-4 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none min-h-[42px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === "fr" ? "Nom d'Utilisateur" : "Username"}</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    required
                    className="w-full rounded-2xl border border-border/80 bg-background px-4 py-2.5 text-xs font-mono font-bold text-foreground focus:border-primary focus:outline-none min-h-[42px]"
                  />
                </div>
              </div>

              {/* Email & WhatsApp Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>{language === "fr" ? "Adresse Email" : "Email Address"}</span>
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-border/80 bg-background px-4 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none min-h-[42px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{language === "fr" ? "Téléphone / WhatsApp" : "WhatsApp Phone"}</span>
                    </label>
                    {whatsappPhone && (
                      <button
                        type="button"
                        onClick={handleClearPhone}
                        className="text-[10px] font-mono text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                        title="Effacer le numéro WhatsApp"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{language === "fr" ? "Effacer" : "Delete"}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="+254 700 000 000 / +33 6 00 00 00 00"
                    className="w-full rounded-2xl border border-border/80 bg-background px-4 py-2.5 text-xs font-mono font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-emerald-500 focus:outline-none min-h-[42px]"
                  />
                  {isDeletingField && (
                    <span className="text-[10px] font-mono text-rose-500 block">
                      {language === "fr" ? "Numéro WhatsApp supprimé du profil" : "WhatsApp phone removed from profile"}
                    </span>
                  )}
                </div>
              </div>

              {/* Preferred Currency & Timezone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-500" />
                  <span>{language === "fr" ? "Monnaie de Préférence (Régionale)" : "Preferred Regional Currency"}</span>
                </label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value as CurrencyCode)}
                  className="w-full rounded-2xl border border-border/80 bg-background px-4 py-2.5 text-xs font-mono font-bold text-foreground focus:border-primary focus:outline-none min-h-[42px] cursor-pointer"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="KES">KES - Kenya Shilling (KSh)</option>
                  <option value="CAD">CAD - Canadian Dollar (C$)</option>
                  <option value="NGN">NGN - Nigerian Naira (₦)</option>
                  <option value="ZAR">ZAR - South African Rand (R)</option>
                  <option value="XOF">XOF - Franc CFA (CFA)</option>
                </select>
              </div>

              {/* Submit / Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs font-extrabold px-6 py-2.5 shadow-md hover:opacity-95 transition-all cursor-pointer min-h-[42px]"
                >
                  <Save className="w-4 h-4" />
                  <span>{language === "fr" ? "Enregistrer les Modifications (Update)" : "Save Profile Changes"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: RECOMMENDED ACTIONS (NEW USERS) */}
          {activeTab === "actions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {language === "fr" ? "Ce Que Vous Pouvez Faire sur UseAimly" : "Recommended Actions & Capabilities"}
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {language === "fr" ? "4 Modules Disponibles" : "4 Core Modules Ready"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendedActions.map((action) => (
                  <div
                    key={action.id}
                    className="p-4 rounded-2xl border border-border/80 bg-background hover:border-primary/40 transition-all flex flex-col justify-between gap-3 text-left group shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-secondary/60 group-hover:scale-105 transition-transform">
                          {action.icon}
                        </div>
                        <span className="rounded-full bg-secondary text-muted-foreground text-[10px] font-mono font-semibold px-2 py-0.5">
                          {action.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {action.desc}
                      </p>
                    </div>

                    <Link
                      href={action.href}
                      onClick={onClose}
                      className="inline-flex items-center justify-between w-full pt-2 border-t border-border/60 text-xs font-bold text-primary group-hover:underline"
                    >
                      <span>{action.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/app/settings"
              onClick={onClose}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-secondary/40 px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{t("navSettings")}</span>
            </Link>

            <Link
              href="/pricing"
              onClick={onClose}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade Plan</span>
            </Link>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => {
                onClose();
                signOut();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t("navSignOut")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
