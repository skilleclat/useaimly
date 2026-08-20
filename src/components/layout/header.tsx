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

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Strategist";

  const NAV_LINKS = [
    {
      label: "Destinations",
      href: "/app/goals",
      icon: <Target className="w-4 h-4" />,
      desc: "Suivi des objectifs de vie",
    },
    {
      label: "Simulateur Decide",
      href: "/app/decide",
      icon: <HelpCircle className="w-4 h-4" />,
      desc: "Simulez l'impact avant de dépenser",
    },
    {
      label: "What If?",
      href: "/app/what-if",
      icon: <TrendingUp className="w-4 h-4" />,
      desc: "Laboratoire d'hypothèses financières",
    },
    {
      label: "Design System",
      href: "/design-system",
      icon: <Layers className="w-4 h-4" />,
      desc: "Catalogue de composants UI",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-xl transition-colors duration-200">
      <Container className="flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo (Responsive sizing) */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden sm:block">
            <UseaimlyLogo size="md" />
          </div>
          <div className="block sm:hidden">
            <UseaimlyLogo size="sm" showTagline={false} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`transition-colors font-medium hover:text-foreground ${
                    isActive ? "text-primary font-bold" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 sm:px-4 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{displayName}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF6B4A] to-[#FF3820] px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-orange-500/20 transition-all"
              >
                <span>Accéder à l&apos;App</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          <ThemeToggle />

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-foreground/80 hover:text-foreground rounded-xl border border-border bg-card focus:outline-hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-primary" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </Container>

      {/* Mobile Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-fadeIn shadow-2xl">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2">
            Navigation Rapide
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary font-bold border border-primary/30"
                      : "text-foreground hover:bg-secondary/70 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isActive ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground"}`}>
                      {link.icon}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold leading-tight">{link.label}</span>
                      <span className="text-[11px] text-muted-foreground">{link.desc}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border/70 flex flex-col gap-2">
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B4A] to-[#FF3820] py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20"
            >
              <Compass className="w-4 h-4" />
              <span>Ouvrir le Tableau de Bord</span>
            </Link>

            <Link
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-2.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Recommencer l&apos;Onboarding</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
