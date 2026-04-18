"use client";

import { LucideProvider } from "lucide-react";
import { ThemeProvider } from "next-themes";

import HeaderSizeProvider from "@/features/header/provider";
import { ToastProvider } from "@/features/system-feedback";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LucideProvider absoluteStrokeWidth={true} strokeWidth={1.5}>
        <HeaderSizeProvider>
          <ToastProvider>{children}</ToastProvider>
        </HeaderSizeProvider>
      </LucideProvider>
    </ThemeProvider>
  );
}
