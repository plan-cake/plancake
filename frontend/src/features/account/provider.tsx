"use client";

import { useCallback, useState } from "react";

import AccountContext from "@/features/account/context";
import { AccountDetails, LoginState } from "@/features/account/type";

export default function AccountProvider({
  children,
  accountDetails: initialAccountDetails,
}: {
  children: React.ReactNode;
  accountDetails: AccountDetails | null;
}) {
  const [accountDetails, setAccountDetails] = useState(initialAccountDetails);
  const [loginState, setLoginState] = useState<LoginState>(
    initialAccountDetails ? "logged_in" : "logged_out",
  );

  const login = useCallback((accountDetails: AccountDetails) => {
    setAccountDetails(accountDetails);
    setLoginState("logged_in");
  }, []);

  const logout = useCallback(() => {
    setAccountDetails(null);
    setLoginState("logged_out");
  }, []);

  return (
    <AccountContext.Provider
      value={{ loginState, accountDetails, login, logout }}
    >
      {children}
    </AccountContext.Provider>
  );
}
