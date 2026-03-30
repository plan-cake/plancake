"use client";

import { useState } from "react";

import { CheckIcon } from "@radix-ui/react-icons";

import TextInputField from "@/components/text-input-field";
import { MAX_DEFAULT_NAME_LENGTH } from "@/features/account/constants";
import { useSettingsAccount } from "@/features/account/settings/context";
import ActionButton from "@/features/button/components/action";
import { useToast } from "@/features/system-feedback/toast/context";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { cn } from "@/lib/utils/classname";

export default function Page() {
  const accountDetails = useSettingsAccount();
  const { addToast } = useToast();

  const [defaultName, setDefaultName] = useState(
    accountDetails?.defaultName || "",
  );
  const [defaultNameError, setDefaultNameError] = useState("");

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

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-panel flex flex-col gap-4 rounded-3xl border-none p-6 md:p-8">
        <div>
          <h2 className="text-lg font-bold">Profile Details</h2>
          <p className="mt-1 leading-tight opacity-75">
            Your email address is{" "}
            <span className="text-foreground font-semibold">
              {accountDetails?.email}
            </span>
          </p>
        </div>

        <div className="bg-foreground/10 my-2 h-px w-full" />

        <div className="flex flex-col gap-2">
          <h3 className="font-bold">Nickname</h3>
          <p className="mb-2 text-sm leading-tight opacity-75">
            This name will be autofilled when filling out your availability.
            Change or remove it anytime!
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex">
            <div className="flex-1">
              <TextInputField
                id="defaultName"
                label="Nickname"
                value={defaultName}
                type="text"
                onChange={handleDefaultNameChange}
                error={defaultNameError}
                outlined
              />
            </div>
            <div
              className={cn(
                "flex shrink-0 gap-2 overflow-hidden rounded-r-full transition-[width] duration-300 ease-in-out",
                isEditingDefaultName ? "w-12" : "w-0",
              )}
            >
              <div />
              <ActionButton
                type="submit"
                buttonStyle="primary"
                icon={<CheckIcon />}
                onClick={async () => await applyDefaultName()}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
