import { useState, useEffect } from "react";

import Checkbox from "@/components/checkbox";
import LinkText from "@/components/link-text";
import TextInputField from "@/components/text-input-field";
import { useAccount } from "@/features/account/context";
import PasswordValidation from "@/features/auth/components/password-validation";
import EmptyButton from "@/features/button/components/empty";
import { ConfirmationDialog, useToast } from "@/features/system-feedback";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export default function ChangePasswordDialog() {
  const isMobile = useCheckMobile();

  // TOASTS AND ERROR STATES
  const { addToast } = useToast();
  const { errors, handleError, clearAllErrors } = useFormErrors();

  // FORM STATES
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({});
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
  const [pruneSessions, setPruneSessions] = useState(false);

  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setConfirmationOpen(open);
    if (!open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordCriteria(false);
      clearAllErrors();
    }
  };

  function passwordIsStrong() {
    return Object.values(passwordCriteria).every((value) => value === true);
  }

  const handleConfirmPasswordChange = (value: string) => {
    handleError("confirmPassword", "");
    handleError("api", "");
    setConfirmPassword(value);
  };

  const { accountDetails } = useAccount();

  const handleForgotPassword = async () => {
    if (!accountDetails?.email) {
      addToast("error", "No email associated with this account.");
      return;
    }

    try {
      await clientPost(ROUTES.auth.startPasswordReset, {
        email: accountDetails?.email,
      });

      handleOpenChange(false);
      addToast("success", MESSAGES.SUCCESS_PASSWORD_RESET_EMAIL_SENT);
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.rateLimited) {
        handleError("toast", error.formattedMessage);
      } else {
        handleError("toast", error.formattedMessage);
      }
      return false;
    }
  };

  useEffect(() => {
    const { criteria } = PasswordValidation(newPassword);
    setPasswordCriteria(criteria);
  }, [newPassword]);

  const handleSubmit = async () => {
    clearAllErrors();

    if (!currentPassword) {
      handleError("currentPassword", MESSAGES.ERROR_PASSWORD_MISSING);
      return false;
    }

    if (!newPassword) {
      handleError("newPassword", MESSAGES.ERROR_PASSWORD_MISSING);
      return false;
    }
    if (!passwordIsStrong()) {
      handleError("newPassword", MESSAGES.ERROR_PASSWORD_WEAK);
      return false;
    }
    if (newPassword !== confirmPassword) {
      handleError("confirmPassword", MESSAGES.ERROR_PASSWORD_MISMATCH);
      return false;
    }

    try {
      await clientPost(ROUTES.auth.changePassword, {
        password: currentPassword,
        new_password: newPassword,
        prune_sessions: pruneSessions,
      });
      handleOpenChange(false);
      addToast("success", MESSAGES.SUCESSS_PASSWORD_CHANGED);
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.status === 404) {
        handleError("api", MESSAGES.ERROR_RESET_TOKEN_INVALID);
      } else if (error.data.error?.["password"]) {
        handleError("currentPassword", MESSAGES.ERROR_PASSWORD_WRONG);
      } else if (error.data.error?.["new_password"]) {
        handleError("newPassword", MESSAGES.ERROR_PASSWORD_REUSE);
      } else {
        handleError("api", error.formattedMessage);
      }
      return false;
    }
  };

  return (
    <ConfirmationDialog
      type="info"
      asNestedDrawer={isMobile}
      title="Change your password"
      description={
        <div>
          <p>
            Enter your current password and the new one you would like to
            replace it with.
          </p>
          <div className="mt-[25px] flex flex-col justify-center gap-4">
            <TextInputField
              key="password"
              id="password"
              type="password"
              label="Current Password*"
              value={currentPassword}
              onChange={(value) => {
                setCurrentPassword(value);
              }}
              outlined
              error={errors.currentPassword || errors.api}
            />

            <TextInputField
              key="newPassword"
              id="newPassword"
              type="password"
              label="New Password*"
              value={newPassword}
              onChange={(value) => {
                setNewPassword(value);
              }}
              onFocus={() => setShowPasswordCriteria(true)}
              onBlur={() => {
                if (!newPassword || passwordIsStrong()) {
                  setShowPasswordCriteria(false);
                }
              }}
              outlined
              error={errors.newPassword || errors.api}
              showPasswordCriteria={showPasswordCriteria}
              passwordCriteria={passwordCriteria}
            />

            <TextInputField
              key="confirmPassword"
              id="confirmPassword"
              type="password"
              label="Retype Password*"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              outlined
              error={errors.confirmPassword || errors.api}
            />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div className="m-0 flex flex-col gap-2">
              <Checkbox
                label="Logout of all other devices"
                checked={pruneSessions}
                onChange={() => setPruneSessions(!pruneSessions)}
              />
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="cursor-pointer border-none bg-transparent p-0"
            >
              <LinkText>Forgot password?</LinkText>
            </button>
          </div>
        </div>
      }
      open={confirmationOpen}
      onOpenChange={handleOpenChange}
      onConfirm={handleSubmit}
    >
      <EmptyButton buttonStyle="primary" label="Change Password" />
    </ConfirmationDialog>
  );
}
