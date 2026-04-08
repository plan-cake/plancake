import { createContext, useContext } from "react";

import { AccountDetails, LoginState } from "@/features/account/type";

export const AccountContext = createContext<{
  loginState: LoginState;
  accountDetails: AccountDetails | null;
  login: (accountDetails: AccountDetails) => void;
  logout: () => void;
  refreshAccount: () => Promise<void>;
}>({
  loginState: "logged_out",
  accountDetails: null,
  login: () => {},
  logout: () => {},
  refreshAccount: async () => {},
});

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}

export default AccountContext;
