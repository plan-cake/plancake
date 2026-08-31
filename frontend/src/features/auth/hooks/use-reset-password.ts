import { useEffect, useMemo, useState } from "react";

import PasswordValidation from "@/features/auth/components/password-validation";
import { useToast } from "@/features/system-feedback";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export type PasswordResetStep = "EMAIL" | "OTP" | "RESET" | "SUCCESS";

export function useResetPasswordFlow() {
  const { addToast } = useToast();
  const { errors, handleError, clearAllErrors } = useFormErrors();

  const [step, setStep] = useState<PasswordResetStep>("EMAIL");

  const [form, setForm] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  const invalidForm = useMemo(() => {
    switch (step) {
      case "EMAIL":
        return !form.email || !form.email.trim()
          ? "Please enter an email address."
          : Object.keys(errors).length
            ? MESSAGES.FORM_HAS_ERRORS
            : undefined;
      case "OTP":
        return !form.resetCode || !form.resetCode.trim()
          ? "Please enter the reset code."
          : Object.keys(errors).length
            ? MESSAGES.FORM_HAS_ERRORS
            : undefined;
      case "RESET":
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
      default:
        return undefined;
    }
  }, [step, form, passwordIsStrong, errors]);

  // API FUNCTIONS
  const handleEmailSubmit = async (resend: boolean) => {
    clearAllErrors();

    if (!form.email || !form.email.trim()) {
      handleError("email", MESSAGES.ERROR_EMAIL_MISSING);
      return false;
    }

    try {
      await clientPost(ROUTES.auth.startPasswordReset, { email: form.email });
      setStep("OTP");
      if (resend) {
        addToast("success", "Email resent.");
      }
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.rateLimited) {
        handleError("rate_limit", error.formattedMessage);
      } else {
        handleError("toast", error.formattedMessage);
      }
      return false;
    }
  };

  const handleVerifyOTP = async (code?: string) => {
    clearAllErrors();
    const codeToVerify = code || form.resetCode;

    if (!codeToVerify) {
      handleError("resetCode", "Please enter the code.");
      return false;
    }
    try {
      await clientPost(ROUTES.auth.checkPasswordResetCode, {
        email: form.email,
        reset_code: codeToVerify,
      });
      setStep("RESET");
      return true;
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

  const handleResetPassword = async () => {
    clearAllErrors();

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
      await clientPost(ROUTES.auth.resetPassword, {
        email: form.email,
        reset_code: form.resetCode,
        new_password: form.newPassword,
        prune_sessions: true,
      });
      setStep("SUCCESS");
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.data?.error?.["new_password"]) {
        handleError("newPassword", MESSAGES.ERROR_PASSWORD_REUSE);
      } else if (error.rateLimited) {
        handleError("rate_limit", error.formattedMessage);
      } else {
        handleError("toast", error.formattedMessage);
      }
      return false;
    }
  };

  return {
    step,
    form,
    updateForm,
    invalidForm,
    errors,
    criteria,
    showCriteria,
    setShowCriteria,
    passwordIsStrong,
    handleEmailSubmit,
    handleVerifyOTP,
    handleResetPassword,
  };
}
