"use client";

import { ThemeProvider } from "next-themes";

import HeaderSizeProvider from "@/features/header/provider";
import { ToastProvider } from "@/features/system-feedback";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider>{children}</ToastProvider>
      <HeaderSizeProvider>
        <ToastProvider>{children}</ToastProvider>
      </HeaderSizeProvider>
    </ThemeProvider>
  );
}
