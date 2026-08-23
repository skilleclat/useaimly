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

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/app",
    description: "Before you spend big, ask UseAimly.",
    icon: <Compass className="w-4 h-4" />,
  },
  {
    label: "Studio",
    href: "/app/decide",
    description: "Current and past financial decision simulations.",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    label: "Vault",
    href: "/app/decisions",
    description: "Decision memory and re-analysis vault.",
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    label: "Goals",
    href: "/app/goals",
    description: "Financial objectives and progress timeline.",
    icon: <Target className="w-4 h-4" />,
  },
  {
    label: "Account",
    href: "/app/settings",
    description: "Financial profile, preferences, rules, and settings.",
    icon: <User className="w-4 h-4" />,
  },
];


export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, displayName, isLoading, signOut } = useAuth();
  const { currency } = useCurrency();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/15 pb-16 lg:pb-0">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link href="/app" className="flex items-center gap-2">
              <UseaimlyLogo size="sm" showTagline={false} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
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
            {!isLoading && !user ? (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 rounded-full border border-border/80 bg-card hover:border-primary/40 px-3 py-1 text-xs shadow-xs transition-colors cursor-pointer"
                title="View Profile"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary via-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-foreground max-w-[120px] truncate text-xs hidden sm:inline">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono font-medium border-l border-border/60 pl-1.5">
                  {currency}
                </span>
              </button>
            )}

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
