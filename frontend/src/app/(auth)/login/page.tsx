"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Checkbox from "@/components/checkbox";
import AuthPageLayout from "@/components/layout/auth-page";
import LinkText from "@/components/link-text";
import TextInputField from "@/components/text-input-field";
import ActionButton from "@/features/button/components/action";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { getSafeRedirectUrl } from "@/lib/utils/url";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const callbackUrl = getSafeRedirectUrl(searchParams.get("callbackUrl"));

  // TOASTS AND ERROR STATES
  const { errors, handleError, clearAllErrors } = useFormErrors();

  const handleEmailChange = (value: string) => {
    handleError("email", "");
    handleError("api", "");
    setEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    handleError("password", "");
    handleError("api", "");
    setPassword(value);
  };

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

    try {
      await clientPost(ROUTES.auth.login, {
        email,
        password,
        remember_me: rememberMe,
      });
      router.push(callbackUrl);
      router.refresh();
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
      title="login"
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
          onChange={handlePasswordChange}
          outlined
          error={errors.password || errors.api}
        />,
      ]}
    >
      <div className="flex w-full items-center justify-between">
        <div className="m-0 flex flex-col gap-2">
          <Checkbox
            label="Remember me"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
        </div>

        <ActionButton
          buttonStyle="primary"
          label="Login"
          onClick={handleSubmit}
          loadOnSuccess
        />
      </div>

      <div className="border-foreground/50 mt-4 flex justify-between border-t pt-2 text-xs">
        <Link href="/forgot-password">
          <LinkText>Forgot password?</LinkText>
        </Link>
        <div>
          No account?{" "}
          <Link href="/register">
            <LinkText>Register!</LinkText>
          </Link>
        </div>
      </div>
    </AuthPageLayout>
  );
}
