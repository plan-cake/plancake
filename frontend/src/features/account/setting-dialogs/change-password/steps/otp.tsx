import LinkText from "@/components/link-text";
import OTPField from "@/components/otp-field";
import { ChangePasswordStepProps } from "@/features/account/setting-dialogs/change-password/use-change-password";
import { useSettingsAccount } from "@/features/account/settings/context";
import InboxLinks from "@/features/auth/components/inbox-links";
import { cn } from "@/lib/utils/classname";

export default function OtpStep({ flow }: ChangePasswordStepProps) {
  const { email } = useSettingsAccount();

  return (
    <div className="flex w-full flex-col gap-4 text-center">
      <div className="flex flex-col gap-2">
        <p>Check your email for the password reset code!</p>
        <InboxLinks email={email} />
      </div>
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
          value={flow.form.resetCode}
          error={!!flow.errors.resetCode}
          onValueChange={(val) => {
            flow.updateForm("resetCode", val);

            // Auto submit OTP on the 6th character, giving a small delay for the UI
            // to update and how the last character entered
            if (val.length === 6) {
              setTimeout(() => {
                flow.handleVerifyOTP(val);
              }, 10);
            }
          }}
        />
      </div>
      <div className="flex justify-between text-sm">
        <button
          type="button"
          onClick={() => flow.setStep("CHANGE")}
          className="cursor-pointer border-none bg-transparent p-0"
        >
          <LinkText>Remembered Password?</LinkText>
        </button>
        <button
          type="button"
          onClick={flow.handleForgotPassword}
          className="cursor-pointer border-none bg-transparent p-0"
        >
          <LinkText>Resend Code</LinkText>
        </button>
      </div>
    </div>
  );
}
