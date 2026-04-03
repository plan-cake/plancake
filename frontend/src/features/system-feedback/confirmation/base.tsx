import React, { useState, useCallback, useEffect } from "react";

import * as Dialog from "@radix-ui/react-dialog";

import ActionButton from "@/features/button/components/action";
import { FloatingDrawer } from "@/features/drawer";
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

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange],
  );

  const handleClose = useCallback(() => {
    handleOpenChange(false);
    return true;
  }, [handleOpenChange]);

  const handleConfirm = useCallback(async () => {
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
  }, [autoClose, onConfirm, handleOpenChange]);

  useEffect(() => {
    // If the dialog is not open, then don't add the keydown listener
    if (!open) return;

    // Add keydown listener for Enter and Escape keys to trigger confirm or cancel
    // actions.
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events coming from text inputs or editable elements
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isMultilineText =
        tagName === "TEXTAREA" || target?.isContentEditable;
      if (isMultilineText) {
        return;
      }

      if (e.key === "Escape") handleClose();
      else if (e.key === "Enter") handleConfirm();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, handleConfirm, open]);

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
        nested
        open={open}
        onOpenChange={handleOpenChange}
        title={title}
        trigger={triggerElement}
        description={
          typeof description === "string" ? description : "Confirm action"
        }
        contentClassName="h-fit"
        showHandle={false}
        headerContent={<div className="h-2" />}
      >
        <div className="flex flex-col items-center overflow-hidden">
          <div className="flex flex-col items-center">
            {showIcon && renderIcon()}
            <p className="text-lg font-bold">{title}</p>
          </div>
          <div className="text-foreground mt-2 w-full text-center">
            {description}
          </div>
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
        <Dialog.Overlay
          className={cn(
            "dialog-overlay fixed inset-0 z-40 bg-gray-700/40 transition-opacity",
            type == "error" &&
              "bg-[color-mix(in_oklab,var(--color-error)_15%,black_20%)]",
          )}
        />
        <Dialog.Content asChild>
          <div
            className={cn(
              "dialog-content fixed inset-0 z-40 m-auto flex flex-col overflow-hidden",
              "bg-panel rounded-3xl p-6 shadow-md focus:outline-none",
              "h-fit w-3/4 md:w-fit md:max-w-3xl",
            )}
          >
            <Dialog.Title asChild>
              <div className="flex flex-col items-center gap-4">
                {showIcon && renderIcon()}
                <p className="text-lg font-bold">{title}</p>
              </div>
            </Dialog.Title>

            <Dialog.Description asChild>
              <div className="mt-2 w-full text-center">{description}</div>
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
