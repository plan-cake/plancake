import { useEffect, useMemo, useState } from "react";

import PasswordValidation from "@/features/auth/components/password-validation";
import { useToast } from "@/features/system-feedback/toast/context";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export type RegisterStep = "REGISTRATION" | "OTP" | "SUCCESS";

export function useRegisterFlow() {
  const { addToast } = useToast();
  const { errors, handleError, clearAllErrors } = useFormErrors();

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
        return captchaInitError
          ? MESSAGES.ERROR_CAPTCHA_BLOCKED
          : !captchaToken
            ? MESSAGES.ERROR_CAPTCHA_FAILED
            : !form.email || !form.email.trim() || !form.password
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
  }, [step, form, passwordIsStrong, errors, captchaInitError, captchaToken]);

  // API FUNCTIONS
  const handleRegister = async () => {
    clearAllErrors();

    if (captchaInitError) {
      handleError("captcha", MESSAGES.ERROR_CAPTCHA_BLOCKED);
      return false;
    }
    if (!captchaToken) {
      handleError("captcha", MESSAGES.ERROR_CAPTCHA_FAILED);
      return false;
    }

    if (!form.email || !form.email.trim()) {
      handleError("email", MESSAGES.ERROR_EMAIL_MISSING);
      return false;
    }
    if (!form.password) {
      handleError("password", MESSAGES.ERROR_PASSWORD_MISSING);
      return false;
    }
    if (!passwordIsStrong) {
      handleError("password", MESSAGES.ERROR_PASSWORD_WEAK);
      return false;
    }
    if (form.password !== form.confirmPassword) {
      handleError("confirmPassword", MESSAGES.ERROR_PASSWORD_MISMATCH);
      return false;
    }

    try {
      await clientPost(ROUTES.auth.register, {
        email: form.email,
        password: form.password,
        captcha_token: captchaToken,
      });
      refreshCaptcha();
      setStep("OTP");
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.rateLimited) {
        refreshCaptcha();
        handleError("rate_limit", error.formattedMessage);
      } else if (error.captchaFailed) {
        handleError("captcha", MESSAGES.ERROR_CAPTCHA_FAILED);
      } else {
        refreshCaptcha();
        handleError("toast", error.formattedMessage);
      }
      return false;
    }
  };

  const handleResendEmail = async () => {
    try {
      await clientPost(ROUTES.auth.resendRegisterEmail, {
        email: form.email,
      });
      addToast("success", "Email resent.");
      return true;
    } catch (e) {
      handleError("toast", (e as ApiErrorResponse).formattedMessage);
      return false;
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
      if (error.rateLimited) {
        handleError("rate_limit", error.formattedMessage);
      } else {
        handleError(
          "verificationCode",
          error.data?.error.verification_code?.[0] || error.formattedMessage,
        );
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
    handleError,
    captchaKey,
    captchaInitError,
    setCaptchaToken,
    setCaptchaInitError,
    criteria,
    showCriteria,
    setShowCriteria,
    passwordIsStrong,
    handleRegister,
    handleResendEmail,
    handleVerifyOTP,
  };
}
