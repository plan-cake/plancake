"use client";

import { LucideProvider } from "lucide-react";
import { ThemeProvider } from "next-themes";

import AccountProvider from "@/features/account/provider";
import { AccountDetails } from "@/features/account/type";
import HeaderSizeProvider from "@/features/header/provider";
import { ToastProvider } from "@/features/system-feedback";

export function Providers({
  children,
  accountDetails,
}: {
  children: React.ReactNode;
  accountDetails: AccountDetails | null;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LucideProvider absoluteStrokeWidth={true} strokeWidth={1.5}>
        <AccountProvider accountDetails={accountDetails}>
          <HeaderSizeProvider>
            <ToastProvider>{children}</ToastProvider>
          </HeaderSizeProvider>
        </AccountProvider>
      </LucideProvider>
    </ThemeProvider>
  );
}
