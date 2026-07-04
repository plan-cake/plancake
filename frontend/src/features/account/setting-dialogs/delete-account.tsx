"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import TextInputField from "@/components/text-input-field";
import EmptyButton from "@/features/button/components/empty";
import { FormDialog, useToast } from "@/features/system-feedback";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export default function DeleteAccountDialog() {
  const router = useRouter();

  // TOASTS AND ERROR STATES
  const { addToast } = useToast();
  const { errors, handleError, clearAllErrors } = useFormErrors();

  // FORM STATES
  const [currentPassword, setCurrentPassword] = useState("");

  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setConfirmationOpen(open);
    if (!open) {
      setCurrentPassword("");
      clearAllErrors();
    }
  };

  const handleDeleteAccount = async () => {
    clearAllErrors();

    if (!currentPassword) {
      handleError("currentPassword", MESSAGES.ERROR_PASSWORD_MISSING);
      return false;
    }

    try {
      await clientPost(ROUTES.account.deleteAccount, {
        password: currentPassword,
      });
      addToast("success", MESSAGES.SUCCESS_ACCOUNT_DELETE);
      router.push("/login");
      router.refresh();
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.status === 400) {
        handleError("currentPassword", MESSAGES.ERROR_PASSWORD_WRONG);
        addToast("error", "Bro doesn't even know the password :p");
      }
      return false;
    }
  };

  return (
    <FormDialog
      type="error"
      title="WARNING: DELETING ACCOUNT"
      description={"Delete Account Confirmation"}
      trigger={
        <EmptyButton
          buttonStyle="danger"
          label="Delete Account"
          tooltip="Woah... be careful!"
        />
      }
      open={confirmationOpen}
      onOpenChange={handleOpenChange}
      onSubmit={handleDeleteAccount}
      submitLabel="Delete Account"
    >
      <div className="text-center">
        <p>
          Are you <span className="font-bold">absolutely</span> sure you want to
          delete your account?
        </p>
        <p className="text-error font-bold underline">
          This action cannot be undone.
        </p>
      </div>

      <TextInputField
        key="password"
        id="password"
        type="password"
        label="Enter your password*"
        value={currentPassword}
        onChange={(value) => {
          setCurrentPassword(value);
        }}
        outlined
        error={errors.currentPassword || errors.api}
      />
    </FormDialog>
  );
}
