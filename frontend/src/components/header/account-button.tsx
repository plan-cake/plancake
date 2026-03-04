"use client";

import { useEffect, useState } from "react";

import { PersonIcon } from "@radix-ui/react-icons";

import { useAccount } from "@/features/account/context";
import AccountSettings from "@/features/account/settings/selector";
import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";

export default function AccountButton() {
  const { loginState, login, logout } = useAccount();

  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  // 1. Check Login Status
  useEffect(() => {
    const checkLogin = async () => {
      if (loginState === "logged_in") return;

      // always close account settings when logging out
      setAccountSettingsOpen(false);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/check-account-auth/`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          },
        );
        if (res.ok) {
          const data = await res.json();
          login({
            email: data.email,
            defaultName: data.default_display_name,
          });
        } else {
          logout();
          setAccountSettingsOpen(false);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        logout();
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
        <EmptyButton
          buttonStyle="frosted glass inset"
          icon={<PersonIcon />}
          aria-label="Account settings"
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
