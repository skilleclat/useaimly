"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UseaimlyLogo } from "@/components/design-system/UseaimlyLogo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageCurrencySelector } from "@/components/layout/LanguageCurrencySelector";
import { UserProfileModal } from "@/components/layout/UserProfileModal";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import {
  Compass,
  Target,
  HelpCircle,
  TrendingUp,
  Wallet,
  FileText,
  Sparkles,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  description: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/app",
    description: "Your financial trajectory & daily briefing.",
    icon: <Compass className="w-4 h-4" />,
  },
  {
    label: "Decide",
    href: "/app/decide",
    description: "Test any decision or scenario before committing.",
    icon: <HelpCircle className="w-4 h-4" />,
  },
  {
    label: "Goals",
    href: "/app/goals",
    description: "Your life destinations & arrival timelines.",
    icon: <Target className="w-4 h-4" />,
  },
  {
    label: "What-If",
    href: "/app/what-if",
    description: "Sandbox to simulate life events & income changes.",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    label: "Ask AI",
    href: "/app/ask",
    description: "Your deterministic AI financial co-pilot.",
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    label: "Notes",
    href: "/app/notes",
    description: "Your handwritten rules & financial journal (AI Synced).",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    label: "Money",
    href: "/app/money",
    description: "Your liquid cash, fixed costs & reserves.",
    icon: <Wallet className="w-4 h-4" />,
  },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { currency } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Strategist";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/15">
      {/* Live Demo Conversion Banner (Visible when unauthenticated) */}
      {!user && (
        <div className="w-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 px-4 py-2 text-white text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-sm z-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
            <span>You are exploring UseAimly in Live Demo Mode with sample data.</span>
          </div>
          <Link
            href="/signup"
            className="rounded-full bg-white text-primary px-3.5 py-1 text-[11px] font-extrabold hover:bg-slate-100 transition-colors shadow-xs"
          >
            Create Free Account to Save Trajectories →
          </Link>
        </div>
      )}

      {/* Authenticated Top Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 lg:gap-8">
            <Link href="/app" className="flex items-center gap-2">
              <UseaimlyLogo size="sm" showTagline={false} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/app"
                    ? pathname === "/app"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    title={item.description}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Profile Pill / Demo Badge */}
            {!user ? (
              <Link
                href="/signup"
                className="hidden sm:flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Mode • Save Data</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="hidden sm:flex items-center gap-2 rounded-full border border-border/80 bg-card hover:border-primary/40 px-3 py-1 text-xs shadow-xs transition-colors cursor-pointer"
                title="View Profile & Simulation History"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary via-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-foreground max-w-[90px] truncate text-xs">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono font-medium border-l border-border/60 pl-1.5">
                  {currency}
                </span>
              </button>
            )}

            {/* Settings Icon Button */}
            <Link
              href="/app/settings"
              title="Settings & Preferences"
              className={`p-2 rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors ${
                pathname === "/app/settings" ? "text-primary border-primary/40 bg-primary/10" : ""
              }`}
            >
              <Settings className="w-4 h-4" />
            </Link>

            <LanguageCurrencySelector />
            <ThemeToggle />

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-foreground/80 hover:text-foreground rounded-xl border border-border/80 bg-card focus:outline-hidden"
              aria-label="Toggle App Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-primary" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/60 bg-background/98 backdrop-blur-2xl px-4 py-4 space-y-4 animate-fadeIn shadow-xl max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            {/* User Profile Summary */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-foreground">{displayName}</div>
                  <div className="text-[10px] text-muted-foreground font-medium">{currency} • Goal Strategist</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>

            {/* Nav Items List */}
            <div className="grid grid-cols-1 gap-1 text-left">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/app"
                    ? pathname === "/app"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary font-bold border border-primary/20"
                        : "text-foreground hover:bg-secondary/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? "bg-primary text-primary-foreground" : "bg-card border border-border/80 text-muted-foreground"}`}>
                        {item.icon}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold leading-tight">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-normal">
                          {item.description}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 lg:pb-16">{children}</main>

      {/* Persistent Mobile Bottom Navigation Bar (Quiet Luxury Dock) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/80 px-3 py-2 flex items-center justify-around shadow-2xl">
        <Link
          href="/app"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all ${
            pathname === "/app" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/app/goals"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all ${
            pathname.startsWith("/app/goals") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Goals</span>
        </Link>

        {/* Central Primary Action CTA */}
        <Link
          href="/app/decide"
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-105 transition-all">
            <HelpCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-extrabold text-primary mt-1">Decide</span>
        </Link>

        <Link
          href="/app/notes"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all ${
            pathname.startsWith("/app/notes") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notes</span>
        </Link>

        <Link
          href="/app/what-if"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all ${
            pathname.startsWith("/app/what-if") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>What-If</span>
        </Link>

        <Link
          href="/app/settings"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all ${
            pathname.startsWith("/app/settings") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </nav>

      {/* User Profile & Activity History Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
