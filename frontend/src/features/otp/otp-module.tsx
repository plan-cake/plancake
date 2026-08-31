"use client";

import { forwardRef, useEffect, useState } from "react";

import LinkText from "@/components/link-text";
import InboxLinks from "@/features/auth/components/inbox-links";
import OTPField, { OTPFieldProps } from "@/features/otp/otp-field";
import { cn } from "@/lib/utils/classname";

export type OTPModuleProps = Omit<OTPFieldProps, "onValueChange"> & {
  length?: number;
  value: string;
  onValueChange: (val: string) => void;
  email: string;
  relevantError: string | undefined;
  onVerify: (code: string) => void;
  onResend: () => boolean | Promise<boolean>;
  className?: string;
};

const EMAIL_RESEND_COOLDOWN_SEC = 30;

const OTPModule = forwardRef<HTMLDivElement, OTPModuleProps>(
  (
    {
      length = 6,
      value,
      onValueChange,
      email,
      relevantError,
      onVerify,
      onResend,
      className,
      ...otpProps
    },
    ref,
  ) => {
    const [resendCooldown, setResendCooldown] = useState(
      EMAIL_RESEND_COOLDOWN_SEC,
    );

    useEffect(() => {
      if (resendCooldown <= 0) return;
      const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    }, [resendCooldown]);

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="text-center">
          <p>Check your email!</p>
          We sent a code to <span className="font-bold">{email}</span>.
        </div>
        <InboxLinks email={email} />
        <div className="flex flex-col items-center justify-center">
          <p className={cn("text-error text-sm", !relevantError && "hidden")}>
            {relevantError}
          </p>

          <OTPField
            ref={ref}
            {...otpProps}
            length={length}
            value={value}
            error={!!relevantError}
            onValueChange={(val) => {
              onValueChange(val);

              // Auto submit OTP on the last character, giving a small delay for the UI
              // to update and show the last character entered
              if (val.length === length) {
                setTimeout(() => {
                  onVerify(val);
                }, 10);
              }
            }}
            className="mt-2"
          />
        </div>
        <div className="justify-center text-center text-sm">
          <span className="opacity-75">Didn{"'"}t get anything? </span>
          <button
            type="button"
            onClick={async () => {
              if (resendCooldown > 0) return;

              if (await onResend()) {
                setResendCooldown(EMAIL_RESEND_COOLDOWN_SEC);
              }
            }}
            disabled={resendCooldown > 0}
            className={resendCooldown > 0 ? "opacity-50" : undefined}
          >
            {resendCooldown > 0 ? (
              `Resend in ${resendCooldown}s`
            ) : (
              <LinkText>Resend Code</LinkText>
            )}
          </button>
        </div>
      </div>
    );
  },
);

OTPModule.displayName = "OTPModule";
export default OTPModule;
