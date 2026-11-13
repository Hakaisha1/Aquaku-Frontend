"use client";

import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="aquaku-theme-v1"
    >
      {children}
    </NextThemeProvider>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      className="icon-button"
      aria-label="Ganti mode terang atau gelap"
      title="Ganti mode terang atau gelap"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Moon size={19} className="dark:hidden" aria-hidden="true" />
      <Sun size={19} className="hidden dark:block" aria-hidden="true" />
    </button>
  );
}
