"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./container";
import { UseaimlyLogo } from "../design-system/UseaimlyLogo";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Compass,
  Target,
  HelpCircle,
  TrendingUp,
  Layers,
  LogIn,
  LogOut,
  ArrowRight,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If inside the authenticated app shell, the AppLayout renders the top navigation
  if (pathname.startsWith("/app")) {
    return null;
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Strategist";

  const NAV_LINKS = [
    {
      label: "Destinations",
      href: "/app/goals",
      icon: <Target className="w-4 h-4" />,
      desc: "Life goals & target timelines",
    },
    {
      label: "Simulate Decision",
      href: "/app/decide",
      icon: <HelpCircle className="w-4 h-4" />,
      desc: "Test purchase impact before spending",
    },
    {
      label: "What If?",
      href: "/app/what-if",
      icon: <TrendingUp className="w-4 h-4" />,
      desc: "Financial scenario laboratory",
    },
    {
      label: "Design System",
      href: "/design-system",
      icon: <Layers className="w-4 h-4" />,
      desc: "UI component foundation",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md transition-colors duration-200">
      <Container className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <UseaimlyLogo size="md" showTagline={false} />
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{displayName}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/onboarding"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs shrink-0 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try Live Demo</span>
              </Link>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-xs transition-all shrink-0 whitespace-nowrap"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <ThemeToggle />

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-foreground/80 hover:text-foreground rounded-xl border border-border/80 bg-card focus:outline-hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-primary" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </Container>

      {/* Mobile Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/60 bg-background/98 backdrop-blur-2xl px-4 py-4 space-y-3 animate-fadeIn shadow-xl max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Quick Navigation
          </div>

          <div className="grid grid-cols-1 gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold border border-primary/20"
                      : "text-foreground hover:bg-secondary/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? "bg-primary text-primary-foreground" : "bg-card border border-border/80 text-muted-foreground"}`}>
                      {link.icon}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold leading-tight">{link.label}</span>
                      <span className="text-[11px] text-muted-foreground font-normal">{link.desc}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border/60 flex flex-col gap-2">
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try Live Demo (No Login Needed)</span>
            </Link>

            <Link
              href={user ? "/app" : "/signup"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-xs transition-opacity"
            >
              <Compass className="w-4 h-4" />
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
