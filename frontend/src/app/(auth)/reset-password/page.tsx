"use client";

import React, { useEffect, useState } from "react";

import { useRouter, useSearchParams, notFound } from "next/navigation";

import AuthPageLayout from "@/components/layout/auth-page";
import TextInputField from "@/components/text-input-field";
import PasswordValidation from "@/features/auth/components/password-validation";
import ActionButton from "@/features/button/components/action";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { formatApiError } from "@/lib/utils/api/handle-api-error";

export default function Page() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({});
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const pwdResetToken = searchParams.get("token");
  if (!pwdResetToken) {
    notFound(); // If no token is provided, show 404 page
  }

  function passwordIsStrong() {
    return Object.values(passwordCriteria).every((value) => value === true);
  }

  // TOASTS AND ERROR STATES
  const { errors, handleError, clearAllErrors, handleGenericError } =
    useFormErrors();

  const handleConfirmPasswordChange = (value: string) => {
    handleError("confirmPassword", "");
    handleError("api", "");
    setConfirmPassword(value);
  };

  useEffect(() => {
    const { criteria } = PasswordValidation(newPassword);
    setPasswordCriteria(criteria);
  }, [newPassword]);

  const handleSubmit = async () => {
    clearAllErrors();

    if (!newPassword) {
      handleError("password", MESSAGES.ERROR_PASSWORD_MISSING);
      return false;
    }
    if (!passwordIsStrong()) {
      handleError("password", MESSAGES.ERROR_PASSWORD_WEAK);
      return false;
    }
    if (newPassword !== confirmPassword) {
      handleError("confirmPassword", MESSAGES.ERROR_PASSWORD_MISMATCH);
      return false;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            reset_token: pwdResetToken,
            new_password: newPassword,
          }),
        },
      );
      if (res.ok) {
        router.push("/reset-password/success");
        return true;
      } else {
        const body = await res.json();
        const errorMessage = formatApiError(body);

        if (res.status === 404) {
          handleError("api", MESSAGES.ERROR_RESET_TOKEN_INVALID);
        } else if (body.error?.["new_password"]) {
          handleError("password", MESSAGES.ERROR_PASSWORD_REUSE);
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
      title="reset password"
      fields={[
        // New Password
        <TextInputField
          key="password"
          id="password"
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
      rateLimitError={errors.rate_limit}
    >
      <div className="flex w-full justify-end">
        <ActionButton
          buttonStyle="primary"
          label="Change Password"
          onClick={handleSubmit}
          loadOnSuccess
        />
      </div>
    </AuthPageLayout>
  );
}
