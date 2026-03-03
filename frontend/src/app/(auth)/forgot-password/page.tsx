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
import { formatApiError } from "@/lib/utils/api/handle-api-error";

export default function Page() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // TOASTS AND ERROR STATES
  const { errors, handleError, clearAllErrors, handleGenericError } =
    useFormErrors();

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/start-password-reset/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        },
      );

      if (res.ok) {
        setEmailSent(true);
        return true;
      } else {
        const body = await res.json();
        const errorMessage = formatApiError(body);

        if (res.status === 429) {
          handleError("rate_limit", errorMessage);
        } else if (errorMessage.includes("Email:")) {
          handleError("email", errorMessage.split("Email:")[1].trim());
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
          <div className="flex justify-end">
            {/* Email Button */}
            <ActionButton
              buttonStyle="primary"
              label="Send Link"
              onClick={handleSubmit}
              loadOnSuccess
            />
          </div>
          <div className="border-foreground/50 mt-4 flex justify-between border-t pt-2 text-xs">
            {/* Forgot Password */}
            <Link href="/login" className="mb-8 text-xs">
              <LinkText>Remembered password?</LinkText>
            </Link>
            <div>
              No account?{" "}
              <Link href="/register">
                <LinkText>Register!</LinkText>
              </Link>
            </div>
          </div>
        </AuthPageLayout>
      )}
    </div>
  );
}
