"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./container";
import { UseaimlyLogo } from "../design-system/UseaimlyLogo";
import { ThemeToggle } from "./theme-toggle";
import { LanguageCurrencySelector } from "./LanguageCurrencySelector";
import { UserProfileModal } from "./UserProfileModal";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  Target,
  HelpCircle,
  LogOut,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  User,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { user, profile, displayName, signOut } = useAuth();
  const { t, language } = useI18n();
  const isFr = language === "fr";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // If inside the authenticated app shell (/app/*), AppLayout handles top navigation
  if (pathname.startsWith("/app")) {
    return null;
  }

  const NAV_LINKS = [
    {
      label: isFr ? "Moteur de Décision" : "Decision Engine",
      href: "/app/decide",
      icon: <HelpCircle className="w-4 h-4 text-[#FF5533]" />,
      desc: "Test purchase impact before spending",
    },
    {
      label: isFr ? "Objectifs de Vie" : "Life Goals",
      href: "/app/goals",
      icon: <Target className="w-4 h-4" />,
      desc: "Life goals & target timelines",
    },
    {
      label: t("navPricing"),
      href: "/pricing",
      icon: <Sparkles className="w-4 h-4 text-[#FF5533]" />,
      desc: "Plans & options",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all duration-200">
      <Container size="hero" className="flex h-16 lg:h-20 items-center justify-between px-4 sm:px-6 lg:px-10 2xl:px-16">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <UseaimlyLogo size="md" showTagline={false} />
          </Link>
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs lg:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3.5 lg:gap-4">
          {/* OMNIPRESENT PRIMARY CTA: + Analyze a Decision */}
          <Link
            href="/app/decide"
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white px-4.5 py-2.5 lg:px-5 lg:py-2.5 text-xs lg:text-sm font-extrabold shadow-md shadow-orange-500/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
            title="Test a purchase or spending decision"
          >
            <span className="text-sm leading-none font-black">+</span>
            <span>{isFr ? "Analyser une Décision" : "Analyze a Decision"}</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground border border-border font-bold text-xs lg:text-sm px-4 py-2 lg:px-4.5 lg:py-2.5 shadow-2xs transition-all"
              >
                <span>Dashboard</span>
              </Link>

              {/* User Avatar Pill */}
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
                title="Account Settings & Profile"
              >
                <User className="w-4 h-4 text-background" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-xs lg:text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
              >
                {t("navSignIn")}
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground border border-border font-bold text-xs lg:text-sm px-4 py-2 lg:px-4.5 lg:py-2.5 shadow-2xs transition-all"
              >
                <span>{t("navGetStarted")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <LanguageCurrencySelector />
          <ThemeToggle />

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-foreground/80 rounded-xl border border-border bg-card focus:outline-hidden cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#FF5533]" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </Container>

      {/* Mobile Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card/98 backdrop-blur-2xl px-4 py-4 space-y-3 animate-fadeIn shadow-xl">
          <div className="grid grid-cols-1 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/60 text-foreground text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary border border-border text-[#FF5533]">
                    {link.icon}
                  </div>
                  <span>{link.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link
              href={user ? "/app" : "/signup"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] py-2.5 text-xs font-bold text-white shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>{user ? "Go to App" : t("navGetStarted")}</span>
            </Link>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </header>
  );
}
