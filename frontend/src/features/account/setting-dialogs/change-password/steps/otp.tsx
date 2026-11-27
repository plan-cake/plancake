import { ChangePasswordStepProps } from "@/features/account/setting-dialogs/change-password/use-change-password";
import { useSettingsAccount } from "@/features/account/settings/context";
import OTPModule from "@/features/otp/otp-module";

export default function OtpStep({ flow }: ChangePasswordStepProps) {
  const { email } = useSettingsAccount();

  return (
    <OTPModule
      email={email}
      value={flow.form.verificationCode}
      relevantError={
        flow.errors.verificationCode ||
        flow.errors.api ||
        flow.errors.rate_limit
      }
      onValueChange={(val) => flow.updateForm("verificationCode", val)}
      onVerify={(code) => flow.handleVerifyOTP(code)}
      onResend={() => flow.handleForgotPassword(true)}
    />
  );
}
