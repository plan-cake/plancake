import { useState, useEffect } from "react";

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
      setTimeout(() => {
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
      }, 300);
    }
  };

  // --- API FUNCTIONS ---
  const handleForgotPassword = async () => {
    clearAllErrors();
    try {
      await clientPost(ROUTES.account.startAuthedPasswordReset);
      setStep("OTP");
      addToast("success", "Password reset code sent to your email.");
    } catch (e) {
      handleError("toast", (e as ApiErrorResponse).formattedMessage);
    }
  };

  const handleVerifyOTP = async () => {
    clearAllErrors();
    if (!form.resetCode) {
      handleError("resetCode", "Please enter the code.");
      return false;
    }
    try {
      await clientPost(ROUTES.account.checkAuthedPasswordResetCode, {
        reset_code: form.resetCode,
      });
      setStep("RESET");
      return false;
    } catch (e) {
      const error = e as ApiErrorResponse;
      handleError(
        "resetCode",
        error.formattedMessage.split(": ")[1] || "Invalid code.",
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
      await clientPost(ROUTES.account.authedPasswordReset, {
        reset_code: form.resetCode,
        new_password: form.newPassword,
        prune_sessions: form.pruneSessions,
      });
      handleOpenChange(false);
      addToast("success", MESSAGES.SUCESSS_PASSWORD_CHANGED);
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
    if (!form.currentPassword)
      return (
        handleError("currentPassword", MESSAGES.ERROR_PASSWORD_MISSING),
        false
      );
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
      await clientPost(ROUTES.auth.changePassword, {
        password: form.currentPassword,
        new_password: form.newPassword,
        prune_sessions: form.pruneSessions,
      });
      handleOpenChange(false);
      addToast("success", MESSAGES.SUCESSS_PASSWORD_CHANGED);
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
