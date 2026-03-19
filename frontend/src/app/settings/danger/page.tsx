"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import TextInputField from "@/components/text-input-field";
import EmptyButton from "@/features/button/components/empty";
import { ConfirmationDialog, useToast } from "@/features/system-feedback";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export default function Page() {
  const router = useRouter();
  const { addToast } = useToast();
  const { errors, handleError, clearAllErrors } = useFormErrors();

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
      await clientPost(ROUTES.auth.deleteAccount, {
        password: currentPassword,
      });
      router.push("/login");
      addToast("success", MESSAGES.SUCCESS_ACCOUNT_DELETE);
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
    <div className="flex flex-col gap-6">
      <div className="border-error/20 bg-error/10 flex flex-col gap-4 rounded-3xl border p-6 md:p-8">
        <div>
          <h2 className="text-error text-lg font-bold">Account Removal</h2>
          <p className="mt-1 text-sm opacity-80">
            Deleting your account{" "}
            <span className="font-bold underline">cannot</span> be undone.
          </p>
          <p className="mt-1 text-sm opacity-80">
            All your events and availabilities will be permanently deleted.
          </p>
        </div>

        <div className="mt-2">
          <ConfirmationDialog
            type="error"
            showIcon
            title="WARNING: DELETING ACCOUNT"
            description={
              <div className="flex flex-col items-center gap-4">
                <div>
                  <p>
                    Are you <span className="font-bold">absolutely</span> sure
                    you want to delete your account?
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
              </div>
            }
            open={confirmationOpen}
            onOpenChange={handleOpenChange}
            onConfirm={handleDeleteAccount}
          >
            <EmptyButton buttonStyle="danger" label="Delete Account" />
          </ConfirmationDialog>
        </div>
      </div>
    </div>
  );
}
