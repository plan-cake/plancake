"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthPageLayout from "@/components/layout/auth-page";
import LinkText from "@/components/link-text";
import TextInputField from "@/components/text-input-field";
import PasswordValidation from "@/features/auth/components/password-validation";
import ActionButton from "@/features/button/components/action";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { formatApiError } from "@/lib/utils/api/handle-api-error";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({});
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
  const router = useRouter();

  // TOASTS AND ERROR STATES
  const { errors, handleError, clearAllErrors, handleGenericError } =
    useFormErrors();

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        },
      );

      if (res.ok) {
        sessionStorage.setItem("register_email", email);
        router.push("/register/email-sent");
        return true;
      } else {
        const body = await res.json();
        const errorMessage = formatApiError(body);

        if (res.status === 429) {
          handleError("rate_limit", errorMessage || MESSAGES.ERROR_RATE_LIMIT);
        } else if (errorMessage.includes("Email:")) {
          handleError("email", errorMessage.split("Email:")[1].trim());
        } else if (errorMessage.includes("Password:")) {
          handleError("password", errorMessage.split("Password:")[1].trim());
        } else {
          handleError("api", errorMessage);
        }
        return false;
      }
    } catch (err) {
      console.error("Fetch error:", err);
      handleGenericError();
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
      <div className="flex w-full justify-end">
        <ActionButton
          buttonStyle="primary"
          label="Register"
          onClick={handleSubmit}
          loadOnSuccess
        />
      </div>
      <div className="border-foreground/50 mt-4 flex justify-between border-t pt-2 text-xs">
        <Link href="/forgot-password">
          <LinkText>Forgot password?</LinkText>
        </Link>
        <div>
          Already have an account?{" "}
          <Link href="/login">
            <LinkText>Login!</LinkText>
          </Link>
        </div>
      </div>
    </AuthPageLayout>
  );
}
