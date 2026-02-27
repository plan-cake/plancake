"use client";

import { useEffect, useState } from "react";

import { PersonIcon } from "@radix-ui/react-icons";

import { useAccount } from "@/features/account/context";
import AccountSettings from "@/features/account/settings/selector";
import ActionButton from "@/features/button/components/action";
import LinkButton from "@/features/button/components/link";
import { clientGet } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";

export default function AccountButton() {
  const { loginState, login, logout } = useAccount();

  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const handleOpenChange = () => {
    setAccountSettingsOpen((prev) => !prev);
    return true;
  };

  // 1. Check Login Status
  useEffect(() => {
    const checkLogin = async () => {
      if (loginState === "logged_in") return;

      // always close account settings when logging out
      setAccountSettingsOpen(false);

      try {
        const data = await clientGet(ROUTES.auth.checkAccountAuth);
        login({
          email: data.email,
          defaultName: data.default_display_name,
        });
      } catch {
        logout();
        setAccountSettingsOpen(false);
      }
    };
    checkLogin();
  }, [loginState, login, logout]);

  if (loginState === "logged_in") {
    return (
      <AccountSettings
        open={accountSettingsOpen}
        setOpenChange={setAccountSettingsOpen}
      >
        <ActionButton
          buttonStyle="frosted glass inset"
          icon={<PersonIcon />}
          onClick={handleOpenChange}
        />
      </AccountSettings>
    );
  }

  return (
    <LinkButton
      buttonStyle="frosted glass inset"
      label="Log In"
      href="/login"
      loading={loginState === "loading"}
    />
  );
}
