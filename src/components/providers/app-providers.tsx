"use client";

import React, { type ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "@/lib/auth/auth-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        <QueryProvider>{children}</QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
