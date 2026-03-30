import * as React from "react";

import * as OneTimePasswordField from "@radix-ui/react-one-time-password-field";

import { cn } from "@/lib/utils/classname";

export type OTPFieldProps = React.ComponentPropsWithoutRef<
  typeof OneTimePasswordField.Root
> & {
  length?: number;
  error?: boolean;
};

const OTPField = React.forwardRef<HTMLDivElement, OTPFieldProps>(
  ({ className, length = 6, error, ...props }, ref) => {
    return (
      <OneTimePasswordField.Root
        ref={ref}
        className={cn(
          "flex w-full items-center justify-center gap-2",
          className,
        )}
        {...props}
      >
        {Array.from({ length }).map((_, index) => (
          <OneTimePasswordField.Input
            key={index}
            className={cn(
              "h-12 w-12 rounded-xl border bg-transparent text-center text-lg font-semibold transition-colors",
              "focus:outline-none focus:ring-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-error focus:border-error focus:ring-error/20"
                : "focus:border-accent focus:ring-accent/20 border-gray-300",
            )}
          />
        ))}
        <OneTimePasswordField.HiddenInput />
      </OneTimePasswordField.Root>
    );
  },
);
OTPField.displayName = "OTPField";

export default OTPField;
