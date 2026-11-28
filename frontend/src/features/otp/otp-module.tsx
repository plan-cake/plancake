"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

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
      onResend,
      className,
      ...otpProps
    },
    ref,
  ) => {
    const [resendCooldown, setResendCooldown] = useState(
      EMAIL_RESEND_COOLDOWN_SEC,
    );

    const isResending = useRef(false);
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
            onValueChange={onValueChange}
            autoSubmit
            className="mt-2"
          />
        </div>
        <div className="justify-center text-center text-sm">
          <span className="opacity-75">Didn{"'"}t get anything? </span>
          <button
            type="button"
            onClick={async () => {
              if (resendCooldown > 0 || isResending.current) return;

              isResending.current = true;
              try {
                if (await onResend()) {
                  setResendCooldown(EMAIL_RESEND_COOLDOWN_SEC);
                }
              } finally {
                isResending.current = false;
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
