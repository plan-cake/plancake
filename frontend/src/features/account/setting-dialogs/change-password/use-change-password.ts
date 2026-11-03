import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { errors, handleError, clearAllErrors } = useFormErrors();
  const { email } = useSettingsAccount();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<AuthedChangePasswordStep>("CHANGE");

  // CONSOLIDATED FORM STATE
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

  // CAPTCHA STATES
  // Only the forgot password flow needs a token, since it sends an email
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaInitError, setCaptchaInitError] = useState(false);
  // Tokens are single-use, so changing the key remounts the widget for a fresh one
  const [captchaKey, setCaptchaKey] = useState(0);
  const refreshCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaKey((key) => key + 1);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // The widget unmounts with the dialog, so its token and errors go with it
      setCaptchaToken(null);
      setCaptchaInitError(false);
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
    if (captchaInitError) {
      handleError("captcha", MESSAGES.ERROR_CAPTCHA_BLOCKED);
      return false;
    }
    if (!captchaToken) {
      handleError("captcha", MESSAGES.ERROR_CAPTCHA_FAILED);
      return false;
    }
    clearAllErrors();

    try {
      await clientPost(ROUTES.auth.startPasswordReset, {
        email,
        captcha_token: captchaToken,
      });
      refreshCaptcha();
      setStep("OTP");
      if (resend) {
        addToast("success", "Email resent.");
      }
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.captchaFailed) {
        // The widget opens its own challenge dialog, which provides a new token
        handleError("captcha", MESSAGES.ERROR_CAPTCHA_FAILED);
      } else {
        refreshCaptcha();
        handleError("toast", error.formattedMessage);
      }
      return false;
    }
  };

  const handleVerifyOTP = async (code?: string) => {
    clearAllErrors();
    const codeToVerify = code ?? form.resetCode;

    if (!codeToVerify) {
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
      if (error.rateLimited) {
        handleError("rate_limit", error.formattedMessage);
      } else {
        handleError(
          "resetCode",
          error.formattedMessage.split("Reset Code: ")[1] ||
            error.formattedMessage,
        );
      }
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
      router.refresh();
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
      router.refresh();
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.status === 404)
        handleError("api", MESSAGES.ERROR_RESET_CODE_INVALID);
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
    form,
    updateForm,
    invalidForm,
    errors,
    handleError,
    captchaKey,
    captchaInitError,
    setCaptchaToken,
    setCaptchaInitError,
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
