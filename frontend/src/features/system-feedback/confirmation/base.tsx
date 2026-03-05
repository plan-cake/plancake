import React, { useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";

import ActionButton from "@/features/button/components/action";
import { FloatingDrawer } from "@/features/drawer/components/floating";
import { DIALOG_CONFIG } from "@/features/system-feedback/confirmation/config";
import { ConfirmationDialogType } from "@/features/system-feedback/type";
import { cn } from "@/lib/utils/classname";

type ConfirmationDialogProps = {
  type: ConfirmationDialogType;
  title: string;
  description: React.ReactNode;
  onConfirm: () => boolean | Promise<boolean>;
  children?: React.ReactNode;
  disabled?: boolean;
  showIcon?: boolean;
  autoClose?: boolean;
  asNestedDrawer?: boolean;

  // controlled props
  // (for when the dialog needs to be controlled by the parent component)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function ConfirmationDialog({
  type,
  title,
  description,
  onConfirm,
  children: triggerElement,
  disabled = false,
  showIcon = false,
  autoClose = false,
  asNestedDrawer = false,
  open: controlledOpen,
  onOpenChange,
}: ConfirmationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // use controlled state if provided, otherwise local state
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handleClose = () => {
    handleOpenChange(false);
    return true;
  };

  const handleConfirm = async () => {
    // If autoClose is enabled, we optimistically close
    // the dialog before calling onConfirm
    if (autoClose) {
      handleOpenChange(false);
      onConfirm();
      return true;
    }

    const success = await onConfirm();
    if (success) {
      handleOpenChange(false);
    }
    return success;
  };

  const config = DIALOG_CONFIG[type] || DIALOG_CONFIG.info;
  const Icon = config.icon;

  const renderIcon = () => {
    if (config.isTextIcon) {
      return (
        <div
          className={cn(
            "aspect-square rounded-full text-center",
            config.bgClass,
          )}
        >
          <div className="text-[48px]">!</div>
        </div>
      );
    }
    return (
      <div className={cn("rounded-full p-4", config.bgClass)}>
        {Icon && <Icon className="h-10 w-10" />}
      </div>
    );
  };

  if (asNestedDrawer) {
    return (
      <FloatingDrawer
        open={open}
        onOpenChange={handleOpenChange}
        title={title}
        trigger={triggerElement}
        description={
          typeof description === "string" ? description : "Confirm action"
        }
        contentClassName="h-fit"
        showHandle={false}
      >
        <div className="flex flex-col items-center">
          {showIcon && renderIcon()}
          <p className="text-lg font-bold">{title}</p>
          <div className="text-foreground mt-2 text-center">{description}</div>
          <div className="mt-8 flex w-full justify-center gap-4">
            <ActionButton
              buttonStyle="transparent"
              label="Cancel"
              onClick={handleClose}
            />
            <ActionButton
              buttonStyle={config.btnStyle}
              label="Confirm"
              onClick={handleConfirm}
              loadOnSuccess={!autoClose}
            />
          </div>
        </div>
      </FloatingDrawer>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {triggerElement && (
        <Dialog.Trigger
          asChild
          disabled={disabled}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          aria-disabled={disabled}
        >
          {triggerElement}
        </Dialog.Trigger>
      )}

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
            {showIcon && renderIcon()}
            <p className="text-lg font-bold">{title}</p>
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-center">
            {description}
          </Dialog.Description>

          <div className="mt-[25px] flex justify-center gap-4">
            <ActionButton
              buttonStyle="transparent"
              label="Cancel"
              onClick={handleClose}
            />
            <ActionButton
              buttonStyle={config.btnStyle}
              label="Confirm"
              onClick={handleConfirm}
              loadOnSuccess={!autoClose}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
