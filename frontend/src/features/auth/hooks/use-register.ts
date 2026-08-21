import { useEffect, useMemo, useState } from "react";

import PasswordValidation from "@/features/auth/components/password-validation";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export type RegisterStep = "REGISTRATION" | "OTP" | "SUCCESS";

export function useRegisterFlow() {
  const { errors, handleError, clearAllErrors } = useFormErrors();

  const [step, setStep] = useState<RegisterStep>("REGISTRATION");

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
  });

  const updateForm = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    handleError(field, "");
    handleError("api", "");
  };

  const [showCriteria, setShowCriteria] = useState(false);
  const [criteria, setCriteria] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCriteria(PasswordValidation(form.password).criteria);
  }, [form.password]);

  const passwordIsStrong = Object.values(criteria).every(Boolean);

  const invalidForm = useMemo(() => {
    switch (step) {
      case "REGISTRATION":
        return !form.email || !form.email.trim() || !form.password
          ? MESSAGES.FORM_NOT_FILLED
          : !passwordIsStrong
            ? MESSAGES.ERROR_PASSWORD_WEAK
            : !form.confirmPassword
              ? MESSAGES.FORM_NOT_FILLED
              : form.password !== form.confirmPassword
                ? MESSAGES.ERROR_PASSWORD_MISMATCH
                : Object.keys(errors).length
                  ? MESSAGES.FORM_HAS_ERRORS
                  : undefined;
      case "OTP":
        return !form.verificationCode || !form.verificationCode.trim()
          ? "Please enter the verification code."
          : Object.keys(errors).length
            ? MESSAGES.FORM_HAS_ERRORS
            : undefined;
      default:
        return undefined;
    }
  }, [step, form, passwordIsStrong, errors]);

  // API FUNCTIONS
  const handleRegister = async () => {
    clearAllErrors();

    try {
      await clientPost(ROUTES.auth.register, {
        email: form.email,
        password: form.password,
      });
      setStep("OTP");
      return true;
    } catch (e) {
      handleError("toast", (e as ApiErrorResponse).formattedMessage);
      return false;
    }
  };

  const handleResendEmail = async () => {
    try {
      await clientPost(ROUTES.auth.resendRegisterEmail, {
        email: form.email,
      });
    } catch (e) {
      handleError("toast", (e as ApiErrorResponse).formattedMessage);
    }
  };

  const handleVerifyOTP = async (code?: string) => {
    clearAllErrors();
    const codeToVerify = code || form.verificationCode;

    if (!codeToVerify) {
      handleError("verificationCode", "Please enter the code.");
      return false;
    }
    try {
      await clientPost(ROUTES.auth.verifyEmail, {
        email: form.email,
        verification_code: codeToVerify,
      });
      setStep("SUCCESS");
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      handleError(
        "verificationCode",
        error.formattedMessage.split("Verification Code: ")[1] ||
          error.formattedMessage,
      );
      return false;
    }
  };

  return {
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
    handleRegister,
    handleResendEmail,
    handleVerifyOTP,
  };
}
