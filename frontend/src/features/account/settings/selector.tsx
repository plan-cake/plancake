import { useState } from "react";

import { CheckIcon, ExitIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

import TextInputField from "@/components/text-input-field";
import { useAccount } from "@/features/account/context";
import AccountSettingsDrawer from "@/features/account/settings/drawer";
import { MAX_DEFAULT_NAME_LENGTH } from "@/features/account/settings/lib/constants";
import AccountSettingsPopover from "@/features/account/settings/popover";
import ActionButton from "@/features/button/components/action";
import { useToast } from "@/features/system-feedback";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { cn } from "@/lib/utils/classname";

export default function AccountSettings({
  children,
  open,
  setOpenChange,
}: {
  children: React.ReactNode;
  open: boolean;
  setOpenChange: (open: boolean) => void;
}) {
  const isMobile = useCheckMobile();

  if (isMobile) {
    return (
      <AccountSettingsDrawer
        content={<SettingsContent />}
        open={open}
        setOpen={setOpenChange}
      >
        {children}
      </AccountSettingsDrawer>
    );
  }

  return (
    <AccountSettingsPopover
      content={<SettingsContent />}
      open={open}
      setOpen={setOpenChange}
    >
      {children}
    </AccountSettingsPopover>
  );
}

function SettingsContent() {
  const { login, logout, accountDetails } = useAccount();
  const router = useRouter();

  const [defaultName, setDefaultName] = useState(
    accountDetails?.defaultName || "",
  );
  const [defaultNameError, setDefaultNameError] = useState("");

  // editing states
  const isEditingDefaultName =
    defaultName !== (accountDetails?.defaultName || "");

  const applyDefaultName = async () => {
    if (!isEditingDefaultName) return true;
    setDefaultNameError("");
    try {
      if (defaultName) {
        try {
          await clientPost(ROUTES.account.setDefaultName, {
            display_name: defaultName,
          });
          login({ ...accountDetails!, defaultName: defaultName });
          addToast("success", MESSAGES.SUCCESS_DEFAULT_NAME_SAVED);
          return true;
        } catch (e) {
          const error = e as ApiErrorResponse;
          addToast("error", error.formattedMessage);
          return false;
        }
      } else {
        try {
          await clientPost(ROUTES.account.removeDefaultName);
          login({ ...accountDetails!, defaultName: "" });
          setDefaultName("");
          addToast("success", MESSAGES.SUCCESS_DEFAULT_NAME_REMOVED);
          return true;
        } catch (e) {
          const error = e as ApiErrorResponse;
          addToast("error", error.formattedMessage);
          return false;
        }
      }
    } catch (e) {
      console.error("Fetch error:", e);
      addToast("error", MESSAGES.ERROR_GENERIC);
      return false;
    }
  };

  const handleDefaultNameChange = (value: string) => {
    if (value.length > MAX_DEFAULT_NAME_LENGTH) {
      setDefaultNameError(MESSAGES.ERROR_DEFAULT_NAME_LENGTH);
    } else {
      setDefaultNameError("");
      setDefaultName(value);
    }
  };

  // TOASTS AND ERROR STATES
  const { addToast } = useToast();

  const signOut = async () => {
    try {
      await clientPost(ROUTES.auth.logout);
      logout();
      addToast("success", MESSAGES.SUCCESS_LOGOUT);
      router.push("/login");
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      addToast("error", error.formattedMessage);
      return false;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-foreground text-center font-bold">
        {accountDetails?.email}
      </h2>

      <div className="frosted-glass-inset flex flex-col gap-2 rounded-3xl border-none p-4">
        <form onSubmit={(e) => e.preventDefault()} className="flex">
          <TextInputField
            id="defaultName"
            label="Nickname"
            value={defaultName}
            type="text"
            onChange={(newValue) => {
              handleDefaultNameChange(newValue);
            }}
            error={defaultNameError}
            outlined
          />
          <div
            className={cn(
              "flex shrink-0 gap-2 overflow-hidden rounded-r-full",
              "transition-[width] duration-300 ease-in-out",
              isEditingDefaultName ? "w-12" : "w-0",
            )}
          >
            {/* This div is a placeholder to maintain spacing */}
            <div />
            <ActionButton
              type="submit"
              buttonStyle="primary"
              icon={<CheckIcon />}
              onClick={async () => await applyDefaultName()}
            />
          </div>
        </form>
        <div className="text-sm leading-tight opacity-75">
          This name will be autofilled when filling out your availability.
          Change or remove it anytime!
        </div>
      </div>

      <div className="flex justify-center">
        <ActionButton
          buttonStyle="primary"
          icon={<ExitIcon />}
          label="Sign Out"
          onClick={signOut}
          loadOnSuccess
        />
      </div>
    </div>
  );
}
