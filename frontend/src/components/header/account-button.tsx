"use client";

import { useState } from "react";

import { PersonIcon } from "@radix-ui/react-icons";

import AccountSettings from "@/features/account/settings/selector";
import { AccountDetails } from "@/features/account/type";
import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";

export default function AccountButton({
  accountDetails,
}: {
  accountDetails: AccountDetails | null;
}) {
  console.log("AccountButton received account details:", accountDetails); // Debug log to check received account details
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  if (accountDetails) {
    return (
      <AccountSettings
        open={accountSettingsOpen}
        setOpenChange={setAccountSettingsOpen}
        accountDetails={accountDetails}
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
    />
  );
}
