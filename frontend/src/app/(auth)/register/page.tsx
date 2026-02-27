"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthPageLayout from "@/components/layout/auth-page";
import LinkText from "@/components/link-text";
import TextInputField from "@/components/text-input-field";
import PasswordValidation from "@/features/auth/components/password-validation";
import ActionButton from "@/features/button/components/action";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({});
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
  const router = useRouter();

  // TOASTS AND ERROR STATES
  const { errors, handleError, clearAllErrors } = useFormErrors();

  function passwordIsStrong() {
    return Object.values(passwordCriteria).every((value) => value === true);
  }

  const handleEmailChange = (value: string) => {
    handleError("email", "");
    handleError("api", "");
    setEmail(value);
  };

  const handleConfirmPasswordChange = (value: string) => {
    handleError("confirmPassword", "");
    handleError("api", "");
    setConfirmPassword(value);
  };

  useEffect(() => {
    const { criteria } = PasswordValidation(password);
    setPasswordCriteria(criteria);
  }, [password]);

  const handleSubmit = async () => {
    clearAllErrors();

    if (!email) {
      handleError("email", MESSAGES.ERROR_EMAIL_MISSING);
      return false;
    }
    if (!password) {
      handleError("password", MESSAGES.ERROR_PASSWORD_MISSING);
      return false;
    }
    if (!passwordIsStrong()) {
      handleError("password", MESSAGES.ERROR_PASSWORD_WEAK);
      return false;
    }
    if (confirmPassword !== password) {
      handleError("confirmPassword", MESSAGES.ERROR_PASSWORD_MISMATCH);
      return false;
    }

    try {
      await clientPost(ROUTES.auth.register, { email, password });
      sessionStorage.setItem("register_email", email);
      router.push("/register/email-sent");
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.rateLimited) {
        handleError("rate_limit", error.formattedMessage);
      } else if (error.formattedMessage.includes("Email:")) {
        handleError("email", error.formattedMessage.split("Email:")[1].trim());
      } else if (error.formattedMessage.includes("Password:")) {
        handleError(
          "password",
          error.formattedMessage.split("Password:")[1].trim(),
        );
      } else {
        handleError("api", error.formattedMessage);
      }
      return false;
    }
  };

  return (
    <AuthPageLayout
      title="register"
      rateLimitError={errors.rate_limit}
      fields={[
        // Email
        <TextInputField
          key="email"
          id="email"
          type="email"
          label="Email*"
          value={email}
          onChange={handleEmailChange}
          outlined
          error={errors.email || errors.api}
        />,

        // Password
        <TextInputField
          key="password"
          id="password"
          type="password"
          label="Password*"
          value={password}
          onChange={(value) => {
            setPassword(value);
          }}
          onFocus={() => setShowPasswordCriteria(true)}
          onBlur={() => {
            if (!password || passwordIsStrong()) {
              setShowPasswordCriteria(false);
            }
          }}
          outlined
          error={errors.password || errors.api}
          showPasswordCriteria={showPasswordCriteria}
          passwordCriteria={passwordCriteria}
        />,

        // Retype Password
        <TextInputField
          key="confirmPassword"
          id="confirmPassword"
          type="password"
          label="Retype Password*"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          outlined
          error={errors.confirmPassword || errors.api}
        />,
      ]}
    >
      {/* Register Button */}
      <div className="flex w-full justify-end">
        <ActionButton
          buttonStyle="primary"
          label="Register"
          onClick={handleSubmit}
          loadOnSuccess
        />
      </div>

      {/* Login Link */}
      <div className="mt-2 w-full text-right text-xs">
        Already have an account?{" "}
        <Link href="/login">
          <LinkText>Login!</LinkText>
        </Link>
      </div>
    </AuthPageLayout>
  );
}
