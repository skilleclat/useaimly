"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UseaimlyLogo } from "@/components/design-system/UseaimlyLogo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Compass,
  Target,
  HelpCircle,
  TrendingUp,
  Wallet,
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
    label: "Overview",
    href: "/app",
    description: "Your financial trajectory & briefing.",
    icon: <Compass className="w-4 h-4" />,
  },
  {
    label: "Destinations",
    href: "/app/goals",
    description: "What your money is working toward.",
    icon: <Target className="w-4 h-4" />,
  },
  {
    label: "Decide",
    href: "/app/decide",
    description: "Test spending impact before committing.",
    icon: <HelpCircle className="w-4 h-4" />,
  },
  {
    label: "What If?",
    href: "/app/what-if",
    description: "Explore hypothetical scenarios.",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    label: "Money Ledger",
    href: "/app/money",
    description: "Manage your cash flows & reserves.",
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    label: "Insights",
    href: "/app/insights",
    description: "Proactive warnings & observations.",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    label: "Assistant",
    href: "/app/ask",
    description: "Financial decision conversation.",
    icon: <MessageSquare className="w-4 h-4" />,
  },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Strategist";
  const currency = profile?.preferred_currency || "KES";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/15">
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
            {/* User Profile Pill (Visible on sm+ screens) */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1 text-xs shadow-xs">
              <div className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[10px]">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-foreground max-w-[90px] truncate text-xs">
                {displayName}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono font-medium border-l border-border/60 pl-1.5">
                {currency}
              </span>
            </div>

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
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
