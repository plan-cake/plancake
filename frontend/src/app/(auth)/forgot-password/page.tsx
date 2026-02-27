"use client";

import { useState } from "react";

import Link from "next/link";

import AuthPageLayout from "@/components/layout/auth-page";
import MessagePage from "@/components/layout/message-page";
import LinkText from "@/components/link-text";
import TextInputField from "@/components/text-input-field";
import ActionButton from "@/features/button/components/action";
import LinkButton from "@/features/button/components/link";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export default function Page() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // TOASTS AND ERROR STATES
  const { errors, handleError, clearAllErrors } = useFormErrors();

  const handleEmailChange = (value: string) => {
    handleError("email", "");
    handleError("api", "");
    setEmail(value);
  };

  const handleSubmit = async () => {
    clearAllErrors();

    if (!email) {
      handleError("email", MESSAGES.ERROR_EMAIL_MISSING);
      return false;
    }

    try {
      await clientPost(ROUTES.auth.startPasswordReset, { email });
      setEmailSent(true);
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.rateLimited) {
        handleError("rate_limit", error.formattedMessage);
      } else if (error.formattedMessage.includes("Email:")) {
        handleError("email", error.formattedMessage.split("Email:")[1].trim());
      } else {
        handleError("api", error.formattedMessage);
      }
      return false;
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      {emailSent ? (
        <MessagePage
          title="Check your email"
          description={`A password reset link was sent to ${email}.`}
          buttons={[
            <LinkButton
              key="0"
              buttonStyle="primary"
              label="Back to Login"
              href="/login"
            />,
          ]}
        />
      ) : (
        <AuthPageLayout
          title="forgot password"
          fields={[
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
          ]}
          rateLimitError={errors.rate_limit}
        >
          <div className="flex w-full items-center justify-between">
            {/* Forgot Password */}
            <Link href="/login" className="mb-8 text-xs">
              <LinkText>Remembered password?</LinkText>
            </Link>

            {/* Email Button */}
            <ActionButton
              buttonStyle="primary"
              label="Send Link"
              onClick={handleSubmit}
              loadOnSuccess
            />
          </div>
        </AuthPageLayout>
      )}
    </div>
  );
}
