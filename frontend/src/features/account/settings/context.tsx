"use client";

import { createContext, useContext } from "react";

import { AccountDetails } from "@/features/account/type";

const SettingsContext = createContext<AccountDetails | null>(null);

export function SettingsProvider({
  children,
  accountDetails,
}: {
  children: React.ReactNode;
  accountDetails: AccountDetails;
}) {
  return (
    <SettingsContext.Provider value={accountDetails}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsAccount() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      "useSettingsAccount must be used within a SettingsProvider",
    );
  }
  return context;
}
