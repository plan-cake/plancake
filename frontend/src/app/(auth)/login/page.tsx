"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import Checkbox from "@/components/checkbox";
import AuthPageLayout from "@/components/layout/auth-page";
import LinkText from "@/components/link-text";
import TextInputField from "@/components/text-input-field";
import { useAccount } from "@/features/account/context";
import ActionButton from "@/features/button/components/action";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAccount();
  const router = useRouter();

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
      const data = await clientPost(ROUTES.auth.login, {
        email,
        password,
        remember_me: rememberMe,
      });
      login({
        email: data.email,
        defaultName: data.default_display_name,
      });
      router.push("/dashboard");
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
      <div className="flex w-full items-start justify-between">
        <div className="m-0 flex flex-col gap-2">
          {/* Remember Me Checkbox */}
          <Checkbox
            label="Remember me"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          {/* Forgot Password */}
          <Link href="/forgot-password" className="text-xs">
            <LinkText>Forgot password?</LinkText>
          </Link>
        </div>

        {/* Login Button */}
        <ActionButton
          buttonStyle="primary"
          label="Login"
          onClick={handleSubmit}
          loadOnSuccess
        />
      </div>

      {/* Register Link */}
      <div className="mt-2 w-full text-right text-xs">
        No account?{" "}
        <Link href="/register">
          <LinkText>Register!</LinkText>
        </Link>
      </div>
    </AuthPageLayout>
  );
}
