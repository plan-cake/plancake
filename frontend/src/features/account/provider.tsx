"use client";

import { useCallback, useState } from "react";

import AccountContext from "@/features/account/context";
import { AccountDetails, LoginState } from "@/features/account/type";
import { clientGet } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";

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

  const refreshAccount = useCallback(async () => {
    try {
      const data = await clientGet(ROUTES.auth.checkAccountAuth);
      setAccountDetails({
        email: data.email,
        defaultName: data.default_display_name,
      });
      setLoginState("logged_in");
    } catch {
      setAccountDetails(null);
      setLoginState("logged_out");
    }
  }, []);

  return (
    <AccountContext.Provider
      value={{ loginState, accountDetails, login, logout, refreshAccount }}
    >
      {children}
    </AccountContext.Provider>
  );
}
