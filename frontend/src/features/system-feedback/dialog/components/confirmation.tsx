import { useCallback, useState } from "react";

import ActionButton from "@/features/button/components/action";
import BaseModal from "@/features/system-feedback/dialog/components/base";
import { DIALOG_CONFIG } from "@/features/system-feedback/dialog/config";
import { ConfirmationDialogProps } from "@/features/system-feedback/dialog/props";
import { cn } from "@/lib/utils/classname";

export default function ConfirmationDialog({
  type,
  title,
  description,
  onConfirm,
  children,
  trigger,
  triggerDisabled = false,
  autoClose = false,
  asNestedDrawer = false,
  open: controlledOpen,
  onOpenChange,
}: ConfirmationDialogProps) {
  const config = DIALOG_CONFIG[type] || DIALOG_CONFIG.info;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange],
  );

  const handleConfirm = useCallback(async () => {
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        const target = e.target as HTMLElement;

        const isTextInput =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;

        const isActionable =
          target.tagName === "BUTTON" || target.tagName === "A";

        if (isTextInput || isActionable) {
          return;
        }

        e.preventDefault();
        handleConfirm();
      }
    },
    [handleConfirm],
  );

  return (
    <BaseModal
      title={title}
      description={description}
      trigger={trigger}
      open={open}
      onOpenChange={handleOpenChange}
      asNestedDrawer={asNestedDrawer}
      triggerDisabled={triggerDisabled}
      overlayClassName={cn(
        type === "error" &&
          "bg-[color-mix(in_oklab,var(--color-error)_15%,black_20%)]",
      )}
    >
      <div onKeyDown={handleKeyDown}>
        {description && !children && (
          <p className="text-muted-foreground mb-4 text-center text-sm">
            {description}
          </p>
        )}

        {children}

        <div className="mt-4 flex w-full justify-center gap-4">
          <ActionButton
            buttonStyle="transparent"
            label="Cancel"
            onClick={() => handleOpenChange(false)}
          />
          <ActionButton
            buttonStyle={config.buttonStyle}
            label="Confirm"
            onClick={handleConfirm}
            loadOnSuccess={!autoClose}
          />
        </div>
      </div>
    </BaseModal>
  );
}
