"use client";

import { useEffect, useState } from "react";

import ChangeStep from "@/features/account/setting-dialogs/change-password/steps/change";
import OtpStep from "@/features/account/setting-dialogs/change-password/steps/otp";
import ResetStep from "@/features/account/setting-dialogs/change-password/steps/reset";
import { useChangePasswordFlow } from "@/features/account/setting-dialogs/change-password/use-change-password";
import EmptyButton from "@/features/button/components/empty";
import { ConfirmationDialog } from "@/features/system-feedback";
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
  let dialogDescription = null;
  let onConfirmHandler = async () => false;

  // Use `displayStep` instead of `flow.step` for the if/else blocks
  if (displayStep === "CHANGE") {
    dialogTitle = "Change your password";
    onConfirmHandler = flow.handleChangePassword;
    dialogDescription = <ChangeStep flow={flow} />;
  } else if (displayStep === "OTP") {
    dialogTitle = "Enter Reset Code";
    onConfirmHandler = flow.handleVerifyOTP;
    dialogDescription = <OtpStep flow={flow} />;
  } else if (displayStep === "RESET") {
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
