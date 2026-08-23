"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, Target, FileText } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      label: "Home",
      href: "/app",
      icon: <Home className="w-5 h-5" />,
      exact: true,
    },
    {
      label: "History",
      href: "/app/decide",
      icon: <Clock className="w-5 h-5" />,
      exact: false,
    },
    {
      label: "Goals",
      href: "/app/goals",
      icon: <Target className="w-5 h-5" />,
      exact: false,
    },
    {
      label: "Insights",
      href: "/app/insights",
      icon: <FileText className="w-5 h-5" />,
      exact: false,
    },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-md bg-[#062317] text-white rounded-3xl px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] border border-emerald-900/30">
        <div className="grid grid-cols-4 items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === "/app"
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 transition-all duration-200 ${
                  isActive
                    ? "text-[#00A859] font-bold scale-105"
                    : "text-gray-400 hover:text-white font-medium"
                }`}
              >
                <div className={`p-1.5 rounded-full ${isActive ? "bg-white/10" : ""}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
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
