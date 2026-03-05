"use client";

import React, { useState } from "react";

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
import { formatApiError } from "@/lib/utils/api/handle-api-error";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAccount();
  const router = useRouter();

  // TOASTS AND ERROR STATES
  const { errors, handleError, clearAllErrors, handleGenericError } =
    useFormErrors();

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, remember_me: rememberMe }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        login({
          email: data.email,
          defaultName: data.default_display_name,
        });
        router.push("/dashboard");
        return true;
      } else {
        const body = await res.json();

        const errorMessage = formatApiError(body);

        if (res.status === 429) {
          handleError("rate_limit", errorMessage);
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
