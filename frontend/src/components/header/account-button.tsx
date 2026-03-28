"use client";

import { ExitIcon, PersonIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

import KebabMenu from "@/components/kebab-menu";
import { useAccount } from "@/features/account/context";
import ActionButton from "@/features/button/components/action";
import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";
import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

interface AccountButtonProps {
  onMenuOpenChange?: (isOpen: boolean) => void;
}

export default function AccountButton({
  onMenuOpenChange,
}: AccountButtonProps) {
  const { loginState, logout, accountDetails } = useAccount();
  const router = useRouter();
  const { addToast } = useToast();

  const signOut = async () => {
    try {
      await clientPost(ROUTES.auth.logout);
      logout();
      router.push("/login");
      addToast("success", MESSAGES.SUCCESS_LOGOUT);
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      addToast("error", error.formattedMessage);
      return false;
    }
  };

  const signOutButton = (
    <ActionButton
      buttonStyle="frosted glass inset"
      icon={<ExitIcon />}
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

  if (loginState === "logged_in") {
    return (
      <KebabMenu
        nested
        onOpenChange={onMenuOpenChange}
        trigger={
          <EmptyButton
            className="relative z-10"
            buttonStyle="frosted glass inset"
            icon={<PersonIcon />}
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
    );
  }

  return (
    <LinkButton
      className="relative z-10"
      buttonStyle="frosted glass inset"
      label="Log In"
      href="/login"
    />
  );
}
