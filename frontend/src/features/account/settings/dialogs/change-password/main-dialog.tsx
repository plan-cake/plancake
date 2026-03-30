"use client";

import ChangeStep from "@/features/account/settings/dialogs/change-password/steps/change";
import OtpStep from "@/features/account/settings/dialogs/change-password/steps/otp";
import ResetStep from "@/features/account/settings/dialogs/change-password/steps/reset";
import { useChangePasswordFlow } from "@/features/account/settings/dialogs/change-password/use-change-password";
import EmptyButton from "@/features/button/components/empty";
import { ConfirmationDialog } from "@/features/system-feedback";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

export default function ChangePasswordDialog() {
  const isMobile = useCheckMobile();
  const flow = useChangePasswordFlow();

  let dialogTitle = "";
  let dialogDescription = null;
  let onConfirmHandler = async () => false;

  if (flow.step === "CHANGE") {
    dialogTitle = "Change your password";
    onConfirmHandler = flow.handleChangePassword;
    dialogDescription = <ChangeStep flow={flow} />;
  } else if (flow.step === "OTP") {
    dialogTitle = "Enter Reset Code";
    onConfirmHandler = flow.handleVerifyOTP;
    dialogDescription = <OtpStep flow={flow} />;
  } else if (flow.step === "RESET") {
    dialogTitle = "Reset Password";
    onConfirmHandler = flow.handleAuthedReset;
    dialogDescription = <ResetStep flow={flow} />;
  }

  return (
    <ConfirmationDialog
      type="info"
      asNestedDrawer={isMobile}
      title={dialogTitle}
      description={dialogDescription}
      open={flow.open}
      onOpenChange={flow.handleOpenChange}
      onConfirm={onConfirmHandler}
    >
      <EmptyButton buttonStyle="primary" label="Change Password" />
    </ConfirmationDialog>
  );
}
