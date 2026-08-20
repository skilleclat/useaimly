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
    label: "TODAY",
    href: "/app",
    description: "Your current financial position.",
    icon: <Compass className="w-4 h-4" />,
  },
  {
    label: "DESTINATIONS",
    href: "/app/goals",
    description: "What your money is working toward.",
    icon: <Target className="w-4 h-4" />,
  },
  {
    label: "DECIDE",
    href: "/app/decide",
    description: "Ask before making a financial decision.",
    icon: <HelpCircle className="w-4 h-4" />,
  },
  {
    label: "WHAT IF?",
    href: "/app/what-if",
    description: "Explore hypothetical scenarios.",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    label: "MONEY",
    href: "/app/money",
    description: "Manage your financial reality.",
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    label: "INSIGHTS",
    href: "/app/insights",
    description: "See what Useaimly thinks you should know.",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    label: "ASK",
    href: "/app/ask",
    description: "Have a conversation with Useaimly.",
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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Authenticated Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link href="/app" className="flex items-center gap-2">
              <div className="hidden sm:block">
                <UseaimlyLogo size="sm" showTagline={false} />
              </div>
              <div className="block sm:hidden">
                <UseaimlyLogo size="xs" showTagline={false} />
              </div>
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
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
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

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* User Profile Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-border/80 bg-card px-2 sm:px-3 py-1 text-xs shadow-xs">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[10px] sm:text-[11px]">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-semibold text-foreground block leading-none text-xs truncate max-w-[100px]">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono font-medium">
                  {currency}
                </span>
              </div>
            </div>

            {/* Settings Link */}
            <Link
              href="/app/settings"
              title="Settings & Preferences"
              className={`p-1.5 sm:p-2 rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors ${
                pathname === "/app/settings" ? "text-primary border-primary/40 bg-primary/10" : ""
              }`}
            >
              <Settings className="w-4 h-4" />
            </Link>

            <ThemeToggle />

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-foreground/80 hover:text-foreground rounded-xl border border-border bg-card focus:outline-hidden"
              aria-label="Toggle App Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-primary" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-foreground">{displayName}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{currency} • Connected</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-destructive px-2 py-1 rounded-lg hover:bg-destructive/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sortir</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1">
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
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                      isActive
                        ? "bg-primary/15 text-primary font-bold border border-primary/30"
                        : "text-foreground hover:bg-secondary/70 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isActive ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground"}`}>
                        {item.icon}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-mono font-bold tracking-wider uppercase leading-tight">
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
