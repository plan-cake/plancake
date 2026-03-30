import { useState, useEffect } from "react";

import Checkbox from "@/components/checkbox";
import LinkText from "@/components/link-text";
import OTPField from "@/components/otp-field";
import TextInputField from "@/components/text-input-field";
import PasswordValidation from "@/features/auth/components/password-validation";
import EmptyButton from "@/features/button/components/empty";
import { ConfirmationDialog, useToast } from "@/features/system-feedback";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { cn } from "@/lib/utils/classname";

type Step = "change" | "otp" | "reset";

export default function ChangePasswordDialog() {
  const isMobile = useCheckMobile();

  // TOASTS AND ERROR STATES
  const { addToast } = useToast();
  const { errors, handleError, clearAllErrors } = useFormErrors();

  // FORM STATES
  const [step, setStep] = useState<Step>("change");
  const [resetCode, setResetCode] = useState("");

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
      setTimeout(() => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setResetCode("");
        setShowPasswordCriteria(false);
        setStep("change");
        clearAllErrors();
      }, 300);
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

  useEffect(() => {
    const { criteria } = PasswordValidation(newPassword);
    setPasswordCriteria(criteria);
  }, [newPassword]);

  // --- STEP 1 -> 2: Start Authed Password Reset ---
  const handleForgotPassword = async () => {
    clearAllErrors();
    try {
      await clientPost(ROUTES.account.startAuthedPasswordReset);
      setStep("otp");
      addToast("success", "Password reset code sent to your email.");
    } catch (e) {
      const error = e as ApiErrorResponse;
      handleError("toast", error.formattedMessage);
    }
  };

  // --- STEP 2 -> 3: Verify OTP ---
  const handleVerifyOTP = async () => {
    clearAllErrors();
    if (!resetCode) {
      handleError("resetCode", "Please enter the code.");
      return false;
    }

    try {
      await clientPost(ROUTES.account.checkAuthedPasswordResetCode, {
        reset_code: resetCode,
      });
      setStep("reset");
      return false;
    } catch (e) {
      const error = e as ApiErrorResponse;
      console.log(error.formattedMessage);
      handleError(
        "resetCode",
        error.formattedMessage.split(": ")[1] || "Invalid code.",
      );
      return false;
    }
  };

  // --- STEP 3: Complete Authed Reset ---
  const handleAuthedReset = async () => {
    clearAllErrors();

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
      await clientPost(ROUTES.account.authedPasswordReset, {
        reset_code: resetCode,
        new_password: newPassword,
        prune_sessions: pruneSessions,
      });

      handleOpenChange(false);
      addToast("success", MESSAGES.SUCESSS_PASSWORD_CHANGED);
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.data?.error?.["new_password"]) {
        handleError("newPassword", MESSAGES.ERROR_PASSWORD_REUSE);
      } else {
        handleError("api", error.formattedMessage);
      }
      return false;
    }
  };

  // --- STANDARD FLOW: Regular Password Change ---
  const handleChangePassword = async () => {
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
      } else if (error.data?.error?.["password"]) {
        handleError("currentPassword", MESSAGES.ERROR_PASSWORD_WRONG);
      } else if (error.data?.error?.["new_password"]) {
        handleError("newPassword", MESSAGES.ERROR_PASSWORD_REUSE);
      } else {
        handleError("api", error.formattedMessage);
      }
      return false;
    }
  };

  // --- RENDER LOGIC BY STEP ---
  let dialogTitle = "";
  let dialogDescription = null;
  let onConfirmHandler = async () => false;

  if (step === "change") {
    dialogTitle = "Change your password";
    onConfirmHandler = handleChangePassword;
    // Removed <motion.div> and layout props from the inner content
    dialogDescription = (
      <div>
        <p>
          Enter your current password and the new one you would like to replace
          it with.
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
              handleError("currentPassword", "");
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
              handleError("newPassword", "");
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
    );
  } else if (step === "otp") {
    dialogTitle = "Enter Reset Code";
    onConfirmHandler = handleVerifyOTP;
    dialogDescription = (
      <div>
        <p>
          We sent a password reset code to your email. Enter the code below!
        </p>
        <div className="mb-6 flex flex-col justify-center gap-2">
          <p
            className={cn(
              "text-error h-5 text-center text-sm",
              !errors.resetCode && "invisible",
            )}
          >
            {errors.resetCode}
          </p>

          <OTPField
            length={6}
            value={resetCode}
            error={!!errors.resetCode}
            onKeyDown={() => {
              if (errors.resetCode) {
                handleError("resetCode", "");
              }
            }}
            onValueChange={(value) => {
              setResetCode(value);
              if (errors.resetCode) {
                handleError("resetCode", "");
              }
            }}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <button
            type="button"
            onClick={() => setStep("change")}
            className="cursor-pointer border-none bg-transparent p-0"
          >
            <LinkText>Remembered Password?</LinkText>
          </button>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="cursor-pointer border-none bg-transparent p-0"
          >
            <LinkText>Resend Code</LinkText>
          </button>
        </div>
      </div>
    );
  } else if (step === "reset") {
    dialogTitle = "Reset Password";
    onConfirmHandler = handleAuthedReset;
    dialogDescription = (
      <div>
        <p>Enter your new password!</p>
        <div className="mt-[25px] flex flex-col justify-center gap-4">
          <TextInputField
            key="newPassword"
            id="newPassword"
            type="password"
            label="New Password*"
            value={newPassword}
            onChange={(value) => {
              setNewPassword(value);
              handleError("newPassword", "");
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
        <div className="mt-4 flex justify-start text-sm">
          <div className="m-0 flex flex-col gap-2">
            <Checkbox
              label="Logout of all other devices"
              checked={pruneSessions}
              onChange={() => setPruneSessions(!pruneSessions)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ConfirmationDialog
      type="info"
      asNestedDrawer={isMobile}
      title={dialogTitle}
      description={dialogDescription}
      open={confirmationOpen}
      onOpenChange={handleOpenChange}
      onConfirm={onConfirmHandler}
    >
      <EmptyButton buttonStyle="primary" label="Change Password" />
    </ConfirmationDialog>
  );
}
