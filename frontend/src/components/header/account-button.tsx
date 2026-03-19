"use client";

import { useState } from "react";

import { PersonIcon } from "@radix-ui/react-icons";

import { useAccount } from "@/features/account/context";
import AccountSettings from "@/features/account/settings/selector";
import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";

export default function AccountButton() {
  const { loginState } = useAccount();

  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

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
