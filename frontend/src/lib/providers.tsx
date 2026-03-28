"use client";

import { ThemeProvider } from "next-themes";

import AccountProvider from "@/features/account/provider";
import HeaderSizeProvider from "@/features/header/provider";
import { ToastProvider } from "@/features/system-feedback";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AccountProvider>
        <HeaderSizeProvider>
          <ToastProvider>{children}</ToastProvider>
        </HeaderSizeProvider>
      </AccountProvider>
    </ThemeProvider>
  );
}
