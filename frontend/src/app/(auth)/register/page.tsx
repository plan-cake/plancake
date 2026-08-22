"use client";

import Link from "next/link";

import AuthPageLayout from "@/components/layout/auth-page";
import MessagePage from "@/components/layout/message-page";
import LinkText from "@/components/link-text";
import TextInputField from "@/components/text-input-field";
import { useRegisterFlow } from "@/features/auth/hooks/use-register";
import ActionButton from "@/features/button/components/action";
import LinkButton from "@/features/button/components/link";
import OTPModule from "@/features/otp/otp-module";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

export default function Page() {
  const isMobile = useCheckMobile();
  const flow = useRegisterFlow();

  switch (flow.step) {
    case "REGISTRATION":
      return (
        <AuthPageLayout
          title="register"
          rateLimitError={flow.errors.rate_limit}
          fields={[
            // Email
            <TextInputField
              key="email"
              id="email"
              type="email"
              label="Email*"
              value={flow.form.email}
              onChange={(value) => flow.updateForm("email", value)}
              style="outlined"
              error={flow.errors.email || flow.errors.api}
            />,

            // Password
            <TextInputField
              key="password"
              id="password"
              type="password"
              label="Password*"
              value={flow.form.password}
              onChange={(value) => {
                flow.updateForm("password", value);
              }}
              onFocus={() => flow.setShowCriteria(true)}
              onBlur={() => {
                if (!flow.form.password || flow.passwordIsStrong) {
                  flow.setShowCriteria(false);
                }
              }}
              style="outlined"
              error={flow.errors.password || flow.errors.api}
              showPasswordCriteria={flow.showCriteria}
              passwordCriteria={flow.criteria}
            />,

            // Retype Password
            <TextInputField
              key="confirmPassword"
              id="confirmPassword"
              type="password"
              label="Retype Password*"
              value={flow.form.confirmPassword}
              onChange={(value) => flow.updateForm("confirmPassword", value)}
              style="outlined"
              error={flow.errors.confirmPassword || flow.errors.api}
            />,
          ]}
        >
          <div className="flex w-full justify-end">
            <ActionButton
              buttonStyle="primary"
              label="Register"
              tooltip={flow.invalidForm}
              onClick={flow.handleRegister}
              disabled={!isMobile && !!flow.invalidForm}
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
    case "OTP":
      return (
        <div className="flex h-screen items-center justify-center">
          <MessagePage
            title="Email Verification"
            buttons={[
              <LinkButton
                key="0"
                buttonStyle="transparent"
                label="Back to Login"
                href="/login"
              />,
              <ActionButton
                key="1"
                buttonStyle="primary"
                label="Verify Code"
                onClick={() => flow.handleVerifyOTP()}
              />,
            ]}
          >
            <OTPModule
              value={flow.form.verificationCode}
              onValueChange={(val) => flow.updateForm("verificationCode", val)}
              email={flow.form.email}
              relevantError={
                flow.errors.verificationCode ||
                flow.errors.api ||
                flow.errors.rate_limit
              }
              onVerify={flow.handleVerifyOTP}
              onResend={flow.handleResendEmail}
            />
          </MessagePage>
        </div>
      );
    case "SUCCESS":
      return (
        <div className="flex h-screen items-center justify-center">
          <MessagePage
            title="Email Verified"
            description="Welcome to Plancake!"
            buttons={[
              <LinkButton
                key="0"
                buttonStyle="primary"
                label="Go to Login"
                href="/login"
              />,
            ]}
          />
        </div>
      );
  }
}
