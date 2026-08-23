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
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // If inside the authenticated app shell (/app/*), AppLayout handles top navigation
  if (pathname.startsWith("/app")) {
    return null;
  }

  const NAV_LINKS = [
    {
      label: t("navPricing"),
      href: "/pricing",
      icon: <Sparkles className="w-4 h-4 text-[#00A859]" />,
      desc: "Plans & options",
    },
    {
      label: t("navDecide"),
      href: "/app/decide",
      icon: <HelpCircle className="w-4 h-4" />,
      desc: "Test purchase impact before spending",
    },
    {
      label: t("navDestinations"),
      href: "/app/goals",
      icon: <Target className="w-4 h-4" />,
      desc: "Life goals & target timelines",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-border bg-white/95 dark:bg-background/95 backdrop-blur-md transition-all duration-200">
      <Container className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <UseaimlyLogo size="md" showTagline={false} />
          </Link>
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs font-semibold text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#00A859] hover:bg-[#00964F] text-white font-bold text-xs px-4 py-2 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Go to App</span>
              </Link>

              {/* Black Circular User Avatar Pill (Matching Reference UI) */}
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
                title="Account Settings & Profile"
              >
                <User className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-xs font-bold text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors px-2.5 py-1.5"
              >
                {t("navSignIn")}
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#00A859] hover:bg-[#00964F] text-white font-bold text-xs px-4 py-2 shadow-sm transition-all"
              >
                <span>{t("navGetStarted")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Black Circular User Account Icon (Matching Reference UI Image) */}
              <Link
                href="/login"
                className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                title="Account Sign In"
              >
                <User className="w-4 h-4 text-white" />
              </Link>
            </div>
          )}

          <LanguageCurrencySelector />
          <ThemeToggle />

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-foreground hover:text-gray-900 rounded-xl border border-gray-200 dark:border-border bg-card focus:outline-hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#00A859]" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </Container>

      {/* Mobile Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-border bg-white/98 dark:bg-background/98 backdrop-blur-2xl px-4 py-4 space-y-3 animate-fadeIn shadow-xl">
          <div className="grid grid-cols-1 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-secondary/50 text-gray-900 dark:text-foreground text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-card border border-gray-200 dark:border-border text-[#00A859]">
                    {link.icon}
                  </div>
                  <span>{link.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-border flex flex-col gap-2">
            <Link
              href={user ? "/app" : "/signup"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00A859] py-2.5 text-xs font-bold text-white shadow-xs"
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
