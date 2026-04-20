"use client";

import { LogOutIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import KebabMenu from "@/components/kebab-menu";
import { AccountDetails } from "@/features/account/type";
import ActionButton from "@/features/button/components/action";
import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";
import ShrinkingHeaderButton from "@/features/header/components/buttons/shrinking-header";
import { useHeaderSize } from "@/features/header/context";
import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export default function AccountButton({
  accountDetails,
}: {
  accountDetails: AccountDetails;
}) {
  const { activeMenu, setActiveMenu } = useHeaderSize();
  const router = useRouter();
  const { addToast } = useToast();

  const isMenuOpen = activeMenu === "account";

  const signOut = async () => {
    try {
      await clientPost(ROUTES.auth.logout);
      addToast("success", MESSAGES.SUCCESS_LOGOUT);

      router.push("/login");
      router.refresh();
    } catch (e) {
      const error = e as ApiErrorResponse;
      console.error("Logout error:", error);
      addToast("error", error.formattedMessage);
    }
  };

  const signOutButton = (
    <ActionButton
      buttonStyle="frosted glass inset"
      icon={<LogOutIcon />}
      label="Sign Out"
      onClick={signOut}
      loadOnSuccess
    />
  );

  const accountSettingsButton = (
    <LinkButton
      buttonStyle="frosted glass inset"
      label="Account Settings"
      href="/settings"
    />
  );

  return (
    <ShrinkingHeaderButton
      buttonStyle="frosted glass inset"
      icon={<UserIcon />}
    >
      <KebabMenu
        nested
        open={isMenuOpen}
        onOpenChange={(isOpen) => setActiveMenu(isOpen ? "account" : null)}
        trigger={
          <EmptyButton
            className="relative z-10"
            buttonStyle="frosted glass inset"
            icon={<UserIcon />}
            aria-label="Account settings"
          />
        }
      >
        <h2 className="text-foreground text-center font-bold">
          {accountDetails?.email}
        </h2>
        {accountSettingsButton}
        {signOutButton}
      </KebabMenu>
    </ShrinkingHeaderButton>
  );
}
