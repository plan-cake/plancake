import React, { useState, useEffect } from "react";

import * as Dialog from "@radix-ui/react-dialog";

import TextInputField from "@/components/text-input-field";
import PasswordValidation from "@/features/auth/components/password-validation";
import ActionButton from "@/features/button/components/action";
import EmptyButton from "@/features/button/components/empty";
import { useToast } from "@/features/system-feedback/toast/context";
import { useFormErrors } from "@/lib/hooks/use-form-errors";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { cn } from "@/lib/utils/classname";

export default function ChangePasswordDialog() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({});
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordCriteria(false);
      clearAllErrors();
    }
  };

  function passwordIsStrong() {
    return Object.values(passwordCriteria).every((value) => value === true);
  }

  // TOASTS AND ERROR STATES
  const { addToast } = useToast();
  const { errors, handleError, clearAllErrors } = useFormErrors();

  const handleConfirmPasswordChange = (value: string) => {
    handleError("confirmPassword", "");
    handleError("api", "");
    setConfirmPassword(value);
  };

  useEffect(() => {
    const { criteria } = PasswordValidation(newPassword);
    setPasswordCriteria(criteria);
  }, [newPassword]);

  const handleSubmit = async () => {
    clearAllErrors();

    if (!currentPassword) {
      handleError("currentPassword", MESSAGES.ERROR_PASSWORD_MISSING);
      return false;
    }

    if (!newPassword) {
      handleError("newPassword", MESSAGES.ERROR_PASSWORD_MISSING);
      return false;
    }
    if (!passwordIsStrong()) {
      handleError("newPassword", MESSAGES.ERROR_PASSWORD_WEAK);
      return false;
    }
    if (newPassword !== confirmPassword) {
      handleError("confirmPassword", MESSAGES.ERROR_PASSWORD_MISMATCH);
      return false;
    }

    try {
      await clientPost(ROUTES.auth.changePassword, {
        password: currentPassword,
        new_password: newPassword,
      });
      handleOpenChange(false);
      addToast("success", MESSAGES.SUCESSS_PASSWORD_CHANGED);
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.status === 404) {
        handleError("api", MESSAGES.ERROR_RESET_TOKEN_INVALID);
      } else if (error.data.error?.["password"]) {
        handleError("currentPassword", MESSAGES.ERROR_PASSWORD_WRONG);
      } else if (error.data.error?.["new_password"]) {
        handleError("newPassword", MESSAGES.ERROR_PASSWORD_REUSE);
      } else {
        handleError("api", error.formattedMessage);
      }
      return false;
    }
  };

  // if (asNestedDrawer) {
  //   return (
  //     <FloatingDrawer
  //       nested
  //       open={open}
  //       onOpenChange={handleOpenChange}
  //       title={title}
  //       trigger={triggerElement}
  //       description={
  //         typeof description === "string" ? description : "Confirm action"
  //       }
  //       contentClassName="h-fit"
  //       showHandle={false}
  //       headerContent={<div className="h-2" />}
  //     >
  //       <div className="flex flex-col items-center">
  //         {showIcon && renderIcon()}
  //         <p className="text-lg font-bold">{title}</p>
  //         <div className="text-foreground mt-2 text-center">{description}</div>
  //         <div className="mt-8 flex w-full justify-center gap-4">
  //           <ActionButton
  //             buttonStyle="transparent"
  //             label="Cancel"
  //             onClick={handleClose}
  //           />
  //           <ActionButton
  //             buttonStyle={config.btnStyle}
  //             label="Confirm"
  //             onClick={handleConfirm}
  //             loadOnSuccess={!autoClose}
  //           />
  //         </div>
  //       </div>
  //     </FloatingDrawer>
  //   );
  // }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <EmptyButton buttonStyle="primary" label="Change Password" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-40 bg-gray-700/40 transition-opacity" />
        <Dialog.Content
          onEscapeKeyDown={(event) => event.stopPropagation()}
          className={cn(
            "dialog-content fixed inset-0 z-40 m-auto",
            "bg-panel rounded-3xl p-6 shadow-md focus:outline-none",
            "h-fit w-3/4 md:w-fit md:max-w-3xl",
          )}
        >
          <Dialog.Title className="flex flex-col items-center gap-4">
            <p className="text-lg font-bold">Change your password</p>
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-tight opacity-75">
            Enter your current password and the new one you would like to
            replace it with.
          </Dialog.Description>

          <div className="mt-[25px] flex flex-col justify-center gap-4">
            <TextInputField
              key="password"
              id="password"
              type="password"
              label="Current Password*"
              value={currentPassword}
              onChange={(value) => {
                setCurrentPassword(value);
              }}
              outlined
              error={errors.currentPassword || errors.api}
            />

            <TextInputField
              key="newPassword"
              id="newPassword"
              type="password"
              label="New Password*"
              value={newPassword}
              onChange={(value) => {
                setNewPassword(value);
              }}
              onFocus={() => setShowPasswordCriteria(true)}
              onBlur={() => {
                if (!newPassword || passwordIsStrong()) {
                  setShowPasswordCriteria(false);
                }
              }}
              outlined
              error={errors.newPassword || errors.api}
              showPasswordCriteria={showPasswordCriteria}
              passwordCriteria={passwordCriteria}
            />

            <TextInputField
              key="confirmPassword"
              id="confirmPassword"
              type="password"
              label="Retype Password*"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              outlined
              error={errors.confirmPassword || errors.api}
            />
          </div>
          <div className="mt-4 flex w-full justify-center gap-4">
            <Dialog.Close asChild>
              <EmptyButton buttonStyle="transparent" label="Cancel" />
            </Dialog.Close>

            <ActionButton
              buttonStyle={"primary"}
              label="Confirm"
              onClick={handleSubmit}
              loadOnSuccess={true}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
