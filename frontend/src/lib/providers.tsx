"use client";

import { ThemeProvider } from "next-themes";

import AccountProvider from "@/features/account/provider";
import { AccountDetails } from "@/features/account/type";
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
      <AccountProvider accountDetails={accountDetails}>
        <ToastProvider>{children}</ToastProvider>
      </AccountProvider>
    </ThemeProvider>
  );
}
