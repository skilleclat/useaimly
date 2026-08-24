"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UseaimlyLogo } from "@/components/design-system/UseaimlyLogo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageCurrencySelector } from "@/components/layout/LanguageCurrencySelector";
import { UserProfileModal } from "@/components/layout/UserProfileModal";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import {
  Compass,
  Target,
  CheckCircle2,
  Settings,
  LogOut,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  description: string;
  icon: React.ReactNode;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/app",
    description: "Financial standing & quick decision readiness.",
    icon: <Compass className="w-4 h-4" />,
  },
  {
    label: "Decisions",
    href: "/app/decide",
    description: "The Aimly Decision Engine & Strategy Comparison.",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    label: "Goals",
    href: "/app/goals",
    description: "Life milestones protected against decisions.",
    icon: <Target className="w-4 h-4" />,
  },
  {
    label: "Ask Aimly",
    href: "/app/ask",
    description: "Decision scenario intelligence & mentor evaluation.",
    icon: <Sparkles className="w-4 h-4" />,
  },
];

const SECONDARY_TOOLS = [
  {
    label: "Money & Cashflow",
    href: "/app/money",
    description: "Detailed income, fixed charges & savings streams",
    icon: <Wallet className="w-4 h-4 text-emerald-500" />,
  },
  {
    label: "What-If Sandbox",
    href: "/app/what-if",
    description: "Hypothetical income & expense adjustments",
    icon: <Sparkles className="w-4 h-4 text-purple-500" />,
  },
  {
    label: "Strategy Notes & Rules",
    href: "/app/notes",
    description: "Financial rules and decision constraints",
    icon: <User className="w-4 h-4 text-amber-500" />,
  },
  {
    label: "Proactive Insights",
    href: "/app/insights",
    description: "Pace shortfalls & cash cushion radar",
    icon: <Compass className="w-4 h-4 text-blue-500" />,
  },
  {
    label: "Decision Vault (History)",
    href: "/app/decisions",
    description: "Past analyzed decisions memory & re-evaluation",
    icon: <CheckCircle2 className="w-4 h-4 text-teal-500" />,
  },
  {
    label: "Account & Settings",
    href: "/app/settings",
    description: "Preferences, currency, security & plan",
    icon: <Settings className="w-4 h-4 text-muted-foreground" />,
  },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, displayName, isLoading, signOut } = useAuth();
  const { currency } = useCurrency();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/15 pb-16 lg:pb-0">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link href="/app" className="flex items-center gap-2">
              <UseaimlyLogo size="sm" showTagline={false} />
            </Link>

            {/* Desktop Navigation: 4 Core Pillars Only */}
            <nav className="hidden md:flex items-center gap-1">
              {PRIMARY_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/app"
                    ? pathname === "/app"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    title={item.description}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary font-bold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Contextual More Dropdown */}
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  onBlur={() => setTimeout(() => setIsMoreMenuOpen(false), 200)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                    pathname.startsWith("/app/money") ||
                    pathname.startsWith("/app/what-if") ||
                    pathname.startsWith("/app/notes") ||
                    pathname.startsWith("/app/insights") ||
                    pathname.startsWith("/app/decisions")
                      ? "text-primary bg-primary/10 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <span>More</span>
                  <span className="text-[10px] opacity-70">▾</span>
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-border/80 bg-card p-2 shadow-xl z-50 animate-fadeIn">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2.5 py-1 block font-bold">
                      Secondary Tools
                    </span>
                    <div className="space-y-0.5">
                      {SECONDARY_TOOLS.map((tool) => (
                        <Link
                          key={tool.label}
                          href={tool.href}
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-foreground hover:bg-secondary/70 transition-colors"
                        >
                          <div className="p-1 rounded-lg bg-secondary/80">
                            {tool.icon}
                          </div>
                          <div>
                            <span className="font-semibold block">{tool.label}</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1">
                              {tool.description}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* THE PRIMARY OMNIPRESENT ACTION: + Analyze a Decision */}
            <Link
              href="/app/decide"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-extrabold shadow-md shadow-orange-500/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
              title="Test a purchase, loan, investment or spending decision before you commit"
            >
              <span className="text-sm leading-none font-black">+</span>
              <span className="hidden sm:inline">Analyze a Decision</span>
              <span className="sm:hidden">Analyze</span>
            </Link>

            {!isLoading && !user ? (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 rounded-full border border-border/80 bg-card hover:border-primary/40 px-2.5 sm:px-3 py-1 text-xs shadow-2xs transition-colors cursor-pointer"
                title="View Profile & Limits"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary via-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-foreground max-w-[100px] truncate text-xs hidden lg:inline">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono font-medium border-l border-border/60 pl-1.5">
                  {currency}
                </span>
              </button>
            )}

            <LanguageCurrencySelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Visible on mobile < md) */}
      <MobileBottomNav />

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
}
