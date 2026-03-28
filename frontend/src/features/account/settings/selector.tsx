import { useState, startTransition, useOptimistic } from "react";

import { CheckIcon, ExitIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

import TextInputField from "@/components/text-input-field";
import AccountSettingsDrawer from "@/features/account/settings/drawer";
import { MAX_DEFAULT_NAME_LENGTH } from "@/features/account/settings/lib/constants";
import AccountSettingsPopover from "@/features/account/settings/popover";
import { AccountDetails } from "@/features/account/type";
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
  accountDetails,
}: {
  children: React.ReactNode;
  open: boolean;
  setOpenChange: (open: boolean) => void;
  accountDetails: AccountDetails;
}) {
  const isMobile = useCheckMobile();

  if (isMobile) {
    return (
      <AccountSettingsDrawer
        content={
          <SettingsContent
            setOpenChange={setOpenChange}
            accountDetails={accountDetails}
          />
        }
        open={open}
        setOpen={setOpenChange}
      >
        {children}
      </AccountSettingsDrawer>
    );
  }

  return (
    <AccountSettingsPopover
      content={
        <SettingsContent
          setOpenChange={setOpenChange}
          accountDetails={accountDetails}
        />
      }
      open={open}
      setOpen={setOpenChange}
    >
      {children}
    </AccountSettingsPopover>
  );
}

function SettingsContent({
  setOpenChange,
  accountDetails,
}: {
  setOpenChange: (open: boolean) => void;
  accountDetails: AccountDetails;
}) {
  const router = useRouter();

  const [defaultName, setDefaultName] = useState(
    accountDetails?.defaultName || "",
  );
  const [defaultNameError, setDefaultNameError] = useState("");

  const [optimisticBaseName, setOptimisticBaseName] = useOptimistic(
    accountDetails?.defaultName || "",
    (newName: string) => newName,
  );

  // editing states
  const isEditingDefaultName = defaultName !== optimisticBaseName;

  const applyDefaultName = async (): Promise<boolean> => {
    if (!isEditingDefaultName) return true;
    setDefaultNameError("");

    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        // UI update
        setOptimisticBaseName(defaultName);

        try {
          if (defaultName) {
            await clientPost(ROUTES.account.setDefaultName, {
              display_name: defaultName,
            });
            addToast("success", MESSAGES.SUCCESS_DEFAULT_NAME_SAVED);
          } else {
            await clientPost(ROUTES.account.removeDefaultName);
            addToast("success", MESSAGES.SUCCESS_DEFAULT_NAME_REMOVED);
          }

          router.refresh();
          resolve(true);
        } catch (e) {
          console.error("Fetch error:", e);
          const error = e as ApiErrorResponse;
          addToast("error", error?.formattedMessage || MESSAGES.ERROR_GENERIC);
          resolve(false);
        }
      });
    });
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
      router.push("/login");
      router.refresh();
      addToast("success", MESSAGES.SUCCESS_LOGOUT);
      setOpenChange(false);
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
