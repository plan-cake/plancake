"use client";

import Link from "next/link";

import AuthPageLayout from "@/components/layout/auth-page";
import MessagePage from "@/components/layout/message-page";
import LinkText from "@/components/link-text";
import TextInputField from "@/components/text-input-field";
import { useResetPasswordFlow } from "@/features/auth/hooks/use-reset-password";
import ActionButton from "@/features/button/components/action";
import LinkButton from "@/features/button/components/link";
import OTPModule from "@/features/otp/otp-module";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

export default function Page() {
  const isMobile = useCheckMobile();
  const flow = useResetPasswordFlow();

  switch (flow.step) {
    case "EMAIL":
      return (
        <AuthPageLayout
          title="forgot password"
          fields={[
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
          ]}
          rateLimitError={flow.errors.rate_limit}
        >
          <div className="flex justify-end">
            <ActionButton
              buttonStyle="primary"
              label="Submit"
              tooltip={flow.invalidForm}
              disabled={!isMobile && !!flow.invalidForm}
              onClick={() => flow.handleEmailSubmit(false)}
            />
          </div>
          <div className="border-foreground/50 mt-4 flex justify-between border-t pt-2 text-xs">
            <Link href="/login">
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
      );
    case "OTP":
      return (
        <div className="flex h-screen items-center justify-center">
          <MessagePage
            title="Verify It's You"
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
              value={flow.form.resetCode}
              onValueChange={(val) => flow.updateForm("resetCode", val)}
              email={flow.form.email}
              relevantError={
                flow.errors.resetCode ||
                flow.errors.api ||
                flow.errors.rate_limit
              }
              onVerify={flow.handleVerifyOTP}
              onResend={() => flow.handleEmailSubmit(true)}
            />
          </MessagePage>
        </div>
      );
    case "RESET":
      return (
        <AuthPageLayout
          title="reset password"
          fields={[
            // New Password
            <TextInputField
              key="newPassword"
              id="newPassword"
              type="password"
              label="New Password*"
              value={flow.form.newPassword}
              onChange={(value) => {
                flow.updateForm("newPassword", value);
              }}
              onFocus={() => flow.setShowCriteria(true)}
              onBlur={() => {
                if (!flow.form.newPassword || flow.passwordIsStrong) {
                  flow.setShowCriteria(false);
                }
              }}
              style="outlined"
              error={flow.errors.newPassword || flow.errors.api}
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
              onChange={(value) => {
                flow.updateForm("confirmPassword", value);
              }}
              style="outlined"
              error={flow.errors.confirmPassword || flow.errors.api}
            />,
          ]}
          rateLimitError={flow.errors.rate_limit}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm opacity-75">
              This will sign out your account on all devices.
            </div>
            <div className="flex w-full justify-end">
              <ActionButton
                buttonStyle="primary"
                label="Change Password"
                tooltip={flow.invalidForm}
                onClick={flow.handleResetPassword}
                disabled={!isMobile && !!flow.invalidForm}
              />
            </div>
          </div>
        </AuthPageLayout>
      );
    case "SUCCESS":
      return (
        <div className="flex h-screen items-center justify-center">
          <MessagePage
            title="Password Reset Successful"
            buttons={[
              <LinkButton
                key="0"
                buttonStyle="primary"
                label="Back to Login"
                href="/login"
              />,
            ]}
          />
        </div>
      );
    default:
      return null;
  }
}
