"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckCircle2, Target, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { language } = useI18n();
  const isFr = language === "fr";
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted || !isMobile) {
    return null;
  }

  const NAV_ITEMS = [
    {
      label: isFr ? "Accueil" : "Home",
      href: "/app",
      icon: <Home className="w-4 h-4" />,
      exact: true,
    },
    {
      label: isFr ? "Décisions" : "Decisions",
      href: "/app/decide",
      icon: <CheckCircle2 className="w-4 h-4" />,
      exact: false,
    },
    {
      label: isFr ? "Objectifs" : "Goals",
      href: "/app/goals",
      icon: <Target className="w-4 h-4" />,
      exact: false,
    },
    {
      label: isFr ? "Ask Aimly" : "Ask Aimly",
      href: "/app/ask",
      icon: <Sparkles className="w-4 h-4" />,
      exact: false,
    },
  ];

  return (
    <div className="fixed bottom-2.5 left-2.5 right-2.5 z-50 flex justify-center pointer-events-none md:hidden pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="pointer-events-auto w-full max-w-md bg-[#0F172A]/95 dark:bg-[#0B0F17]/95 text-white rounded-3xl p-1 px-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.45)] border border-white/10 backdrop-blur-xl">
        <div className="grid grid-cols-4 items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === "/app"
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 min-h-[46px] touch-manipulation active:scale-95 ${
                  isActive
                    ? "text-[#FF5533] font-bold"
                    : "text-gray-400 hover:text-white font-medium"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive ? "bg-[#FF5533]/15 text-[#FF5533]" : ""
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-[10px] tracking-tight font-bold leading-none mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
