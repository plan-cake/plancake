import { ChangePasswordStepProps } from "@/features/account/setting-dialogs/change-password/use-change-password";
import { useSettingsAccount } from "@/features/account/settings/context";
import OTPModule from "@/features/otp/otp-module";

export default function OtpStep({ flow }: ChangePasswordStepProps) {
  const { email } = useSettingsAccount();

  return (
    <OTPModule
      email={email}
      value={flow.form.resetCode}
      relevantError={flow.errors.resetCode || flow.errors.api}
      onValueChange={(val) => flow.updateForm("resetCode", val)}
      onVerify={(code) => flow.handleVerifyOTP(code)}
      onResend={flow.handleForgotPassword}
    />
  );
}
