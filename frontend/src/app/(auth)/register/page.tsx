"use client";

import Link from "next/link";

import AuthPageLayout from "@/components/layout/auth-page";
import MessagePage from "@/components/layout/message-page";
import LinkText from "@/components/link-text";
import OTPField from "@/components/otp-field";
import TextInputField from "@/components/text-input-field";
import InboxLinks from "@/features/auth/components/inbox-links";
import { useRegisterFlow } from "@/features/auth/hooks/use-register";
import ActionButton from "@/features/button/components/action";
import LinkButton from "@/features/button/components/link";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { cn } from "@/lib/utils/classname";

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
            title="Check Your Email"
            description="We sent a verification code to your email."
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
            <InboxLinks email={flow.form.email} />
            <div className="flex flex-col items-center justify-center gap-2">
              <p
                className={cn(
                  "text-error -mt-2 text-sm",
                  !flow.errors.resetCode && "hidden",
                )}
              >
                {flow.errors.resetCode}
              </p>

              <OTPField
                length={6}
                value={flow.form.verificationCode}
                error={!!flow.errors.verificationCode}
                onValueChange={(val) => {
                  flow.updateForm("verificationCode", val);

                  // Auto submit OTP on the 6th character, giving a small delay for the UI
                  // to update and show the last character entered
                  if (val.length === 6) {
                    setTimeout(() => {
                      flow.handleVerifyOTP(val);
                    }, 10);
                  }
                }}
              />
            </div>
            <div className="flex justify-center text-sm">
              <button
                type="button"
                onClick={flow.handleResendEmail}
                className="cursor-pointer border-none bg-transparent p-0"
              >
                <LinkText>Resend Code</LinkText>
              </button>
            </div>
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
