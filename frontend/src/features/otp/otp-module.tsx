import { forwardRef } from "react";

import LinkText from "@/components/link-text";
import InboxLinks from "@/features/auth/components/inbox-links";
import OTPField, { OTPFieldProps } from "@/features/otp/otp-field";
import { cn } from "@/lib/utils/classname";

export type OTPModuleProps = Omit<OTPFieldProps, "onValueChange"> & {
  value: string;
  onValueChange: (val: string) => void;
  email: string;
  relevantError: string | undefined;
  onVerify: (code: string) => void;
  onResend: () => void;
  className?: string;
};

const OTPModule = forwardRef<HTMLDivElement, OTPModuleProps>(
  (
    {
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
            length={6}
            value={value}
            error={!!relevantError}
            onValueChange={(val) => {
              onValueChange(val);

              // Auto submit OTP on the 6th character, giving a small delay for the UI
              // to update and show the last character entered
              if (val.length === 6) {
                setTimeout(() => {
                  onVerify(val);
                }, 10);
              }
            }}
            className="mt-2"
          />
        </div>
        <div className="flex justify-center text-sm">
          <button
            type="button"
            onClick={onResend}
            className="cursor-pointer border-none bg-transparent p-0"
          >
            <LinkText>Resend Code</LinkText>
          </button>
        </div>
      </div>
    );
  },
);

OTPModule.displayName = "OTPModule";
export default OTPModule;
