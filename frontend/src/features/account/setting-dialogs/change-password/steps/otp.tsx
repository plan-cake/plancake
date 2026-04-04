import LinkText from "@/components/link-text";
import OTPField from "@/components/otp-field";
import { ChangePasswordStepProps } from "@/features/account/setting-dialogs/change-password/use-change-password";
import { cn } from "@/lib/utils/classname";

export default function OtpStep({ flow }: ChangePasswordStepProps) {
  return (
    <div>
      <p>We sent a password reset code to your email. Enter the code below!</p>
      <div className="mb-6 flex flex-col items-center justify-center gap-2">
        <p
          className={cn(
            "text-error flex h-fit min-h-5 items-end justify-center text-center text-sm",
            !flow.errors.resetCode && "invisible",
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
      <div className="mt-2 flex justify-between text-sm">
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
