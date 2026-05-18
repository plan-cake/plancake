"use client";

import { useEffect, useState } from "react";

import ChangeStep from "@/features/account/setting-dialogs/change-password/steps/change";
import OtpStep from "@/features/account/setting-dialogs/change-password/steps/otp";
import ResetStep from "@/features/account/setting-dialogs/change-password/steps/reset";
import { useChangePasswordFlow } from "@/features/account/setting-dialogs/change-password/use-change-password";
import EmptyButton from "@/features/button/components/empty";
import { FormDialog } from "@/features/system-feedback";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

export default function ChangePasswordDialog() {
  const isMobile = useCheckMobile();
  const flow = useChangePasswordFlow();

  const [renderedStep, setRenderedStep] = useState(flow.step);

  useEffect(() => {
    // Only update the rendered step while the drawer is open.
    // If it closes, keep the last known step so it doesn't flicker during the exit animation.
    if (flow.open) {
      setRenderedStep(flow.step);
    }
  }, [flow.open, flow.step]);

  const displayStep = flow.open ? flow.step : renderedStep;

  let dialogTitle = "";
  let dialogDescriptionText = "";
  let submitLabel = "Save";
  let onConfirmHandler = async () => false;
  let dialogContent = null;

  // Configure dynamic content based on the current step
  if (displayStep === "CHANGE") {
    dialogTitle = "Change Your Password";
    dialogDescriptionText = "Secure your account with a new password.";
    submitLabel = "Change Password";
    onConfirmHandler = flow.handleChangePassword;
    dialogContent = <ChangeStep flow={flow} />;
  } else if (displayStep === "OTP") {
    dialogTitle = "Enter Reset Code";
    dialogDescriptionText = "Please enter the code sent to your email.";
    submitLabel = "Verify Code";
    onConfirmHandler = () => flow.handleVerifyOTP();
    dialogContent = <OtpStep flow={flow} />;
  } else if (displayStep === "RESET") {
    dialogTitle = "Reset Password";
    dialogDescriptionText = "Create a new secure password.";
    submitLabel = "Reset Password";
    onConfirmHandler = flow.handleAuthedReset;
    dialogContent = <ResetStep flow={flow} />;
  }

  return (
    <FormDialog
      type="info"
      asNestedDrawer={isMobile}
      title={dialogTitle}
      description={dialogDescriptionText}
      submitLabel={submitLabel}
      trigger={<EmptyButton buttonStyle="primary" label="Change Password" />}
      open={flow.open}
      onOpenChange={flow.handleOpenChange}
      onSubmit={onConfirmHandler}
    >
      {dialogContent}
    </FormDialog>
  );
}
