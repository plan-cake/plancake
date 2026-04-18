"use client";

import { LogOutIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import KebabMenu from "@/components/kebab-menu";
import { getSession } from "@/features/account/get-session";
import ActionButton from "@/features/button/components/action";
import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";
import ShrinkingHeaderButton from "@/features/header/components/shrinking-header-button";
import { useHeaderSize } from "@/features/header/context";
import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export default function AccountButton() {
  const { activeMenu, setActiveMenu } = useHeaderSize();
  const { loginState, logout, accountDetails } = useAccount();
  const router = useRouter();
  const { addToast } = useToast();

  const isMenuOpen = activeMenu === "account";

  const signOut = async () => {
    try {
      await clientPost(ROUTES.auth.logout);
      redirect("/login");
      // cannot use toast after redirect bc toast does not work on server components
    } catch (e) {
      const error = e as ApiErrorResponse;
      console.error("Logout error:", error);
      // addToast("error", error.formattedMessage);
      return false;
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

  if (accountDetails) {
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

  return (
    <ShrinkingHeaderButton buttonStyle="frosted glass inset" label="Log In">
      <LinkButton
        className="relative z-10"
        buttonStyle="frosted glass inset"
        label="Log In"
        href="/login"
      />
    </ShrinkingHeaderButton>
  );
}
