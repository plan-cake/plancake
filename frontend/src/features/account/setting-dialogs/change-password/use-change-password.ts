import { useEffect, useMemo, useState } from "react";

import { useSettingsAccount } from "@/features/account/settings/context";
import PasswordValidation from "@/features/auth/components/password-validation";
import { useToast } from "@/features/system-feedback";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export type AuthedChangePasswordStep = "CHANGE" | "OTP" | "RESET";

export type ChangePasswordStepProps = {
  flow: ReturnType<typeof useChangePasswordFlow>;
};

export function useChangePasswordFlow() {
  const { addToast } = useToast();
  const { errors, handleError, clearAllErrors } = useFormErrors();
  const { email } = useSettingsAccount();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<AuthedChangePasswordStep>("CHANGE");

  // 1. CONSOLIDATED FORM STATE
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    resetCode: "",
    pruneSessions: false,
  });

  // Helper to update form fields and auto-clear their specific errors
  const updateForm = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    handleError(field, "");
    handleError("api", "");
  };

  const [showCriteria, setShowCriteria] = useState(false);
  const [criteria, setCriteria] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCriteria(PasswordValidation(form.newPassword).criteria);
  }, [form.newPassword]);

  const passwordIsStrong = Object.values(criteria).every(Boolean);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        resetCode: "",
        pruneSessions: false,
      });
      setShowCriteria(false);
      setStep("CHANGE");
      clearAllErrors();
    }
  };

  const invalidForm = useMemo(() => {
    if (step === "CHANGE") {
      return !form.currentPassword || !form.newPassword
        ? MESSAGES.FORM_NOT_FILLED
        : !passwordIsStrong
          ? MESSAGES.ERROR_PASSWORD_WEAK
          : !form.confirmPassword
            ? MESSAGES.FORM_NOT_FILLED
            : form.newPassword !== form.confirmPassword
              ? MESSAGES.ERROR_PASSWORD_MISMATCH
              : Object.keys(errors).length
                ? MESSAGES.FORM_HAS_ERRORS
                : undefined;
    }
    if (step === "OTP") {
      return !form.resetCode
        ? "Please enter the reset code."
        : Object.keys(errors).length
          ? MESSAGES.FORM_HAS_ERRORS
          : undefined;
    }
    if (step === "RESET") {
      return !form.newPassword
        ? MESSAGES.FORM_NOT_FILLED
        : !passwordIsStrong
          ? MESSAGES.ERROR_PASSWORD_WEAK
          : !form.confirmPassword
            ? MESSAGES.FORM_NOT_FILLED
            : form.newPassword !== form.confirmPassword
              ? MESSAGES.ERROR_PASSWORD_MISMATCH
              : Object.keys(errors).length
                ? MESSAGES.FORM_HAS_ERRORS
                : undefined;
    }
    return undefined;
  }, [step, form, passwordIsStrong, errors]);

  // --- API FUNCTIONS ---
  const handleForgotPassword = async (resend: boolean) => {
    clearAllErrors();
    try {
      await clientPost(ROUTES.auth.startPasswordReset, { email });
      setStep("OTP");
      if (resend) {
        addToast("success", "Email resent.");
      }
      return true;
    } catch (e) {
      handleError("toast", (e as ApiErrorResponse).formattedMessage);
      return false;
    }
  };

  const handleVerifyOTP = async (code?: string) => {
    clearAllErrors();
    const codeToVerify = code ?? form.resetCode;

    if (!form.resetCode) {
      handleError("resetCode", "Please enter the code.");
      return false;
    }
    try {
      await clientPost(ROUTES.auth.checkPasswordResetCode, {
        email,
        reset_code: codeToVerify,
      });
      setStep("RESET");
      return false;
    } catch (e) {
      const error = e as ApiErrorResponse;
      handleError(
        "resetCode",
        error.formattedMessage.split("Reset Code: ")[1] ||
          error.formattedMessage,
      );
      return false;
    }
  };

  const handleAuthedReset = async () => {
    clearAllErrors();
    if (!form.newPassword)
      return (
        handleError("newPassword", MESSAGES.ERROR_PASSWORD_MISSING),
        false
      );
    if (!passwordIsStrong)
      return (handleError("newPassword", MESSAGES.ERROR_PASSWORD_WEAK), false);
    if (form.newPassword !== form.confirmPassword)
      return (
        handleError("confirmPassword", MESSAGES.ERROR_PASSWORD_MISMATCH),
        false
      );

    try {
      await clientPost(ROUTES.auth.resetPassword, {
        email,
        reset_code: form.resetCode,
        new_password: form.newPassword,
        prune_sessions: form.pruneSessions,
      });
      handleOpenChange(false);
      addToast("success", MESSAGES.SUCCESS_PASSWORD_CHANGED);
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.data?.error?.["new_password"])
        handleError("newPassword", MESSAGES.ERROR_PASSWORD_REUSE);
      else handleError("api", error.formattedMessage);
      return false;
    }
  };

  const handleChangePassword = async () => {
    clearAllErrors();
    if (!form.currentPassword) {
      handleError("currentPassword", MESSAGES.ERROR_PASSWORD_MISSING);
      return false;
    }
    if (!form.newPassword) {
      handleError("newPassword", MESSAGES.ERROR_PASSWORD_MISSING);
      return false;
    }
    if (!passwordIsStrong) {
      handleError("newPassword", MESSAGES.ERROR_PASSWORD_WEAK);
      return false;
    }
    if (form.newPassword !== form.confirmPassword) {
      handleError("confirmPassword", MESSAGES.ERROR_PASSWORD_MISMATCH);
      return false;
    }

    try {
      await clientPost(ROUTES.account.changePassword, {
        password: form.currentPassword,
        new_password: form.newPassword,
        prune_sessions: form.pruneSessions,
      });
      handleOpenChange(false);
      addToast("success", MESSAGES.SUCCESS_PASSWORD_CHANGED);
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.status === 404)
        handleError("api", MESSAGES.ERROR_RESET_TOKEN_INVALID);
      else if (error.data?.error?.["password"])
        handleError("currentPassword", MESSAGES.ERROR_PASSWORD_WRONG);
      else if (error.data?.error?.["new_password"])
        handleError("newPassword", MESSAGES.ERROR_PASSWORD_REUSE);
      else handleError("api", error.formattedMessage);
      return false;
    }
  };

  return {
    open,
    step,
    setStep,
    form,
    updateForm,
    invalidForm,
    errors,
    criteria,
    showCriteria,
    setShowCriteria,
    passwordIsStrong,
    handleOpenChange,
    handleForgotPassword,
    handleVerifyOTP,
    handleAuthedReset,
    handleChangePassword,
  };
}
