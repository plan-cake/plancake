import { useCallback, useEffect } from "react";

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
  open,
  onOpenChange,
}: ConfirmationDialogProps) {
  const config = DIALOG_CONFIG[type] || DIALOG_CONFIG.info;

  const handleConfirm = useCallback(async () => {
    if (autoClose) {
      onOpenChange?.(false);
      onConfirm();
      return true;
    }
    const success = await onConfirm();
    if (success) {
      onOpenChange?.(false);
    }
    return success;
  }, [autoClose, onConfirm, onOpenChange]);

  /* KEY LISTENERS */
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleConfirm();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleConfirm, open]);

  return (
    <BaseModal
      title={title}
      description={description}
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      asNestedDrawer={asNestedDrawer}
      triggerDisabled={triggerDisabled}
      overlayClassName={cn(
        type === "error" &&
          "bg-[color-mix(in_oklab,var(--color-error)_15%,black_20%)]",
      )}
    >
      {children}
      <div className="mt-4 flex w-full justify-center gap-4">
        <ActionButton
          buttonStyle="transparent"
          label="Cancel"
          onClick={() => onOpenChange?.(false)}
        />
        <ActionButton
          buttonStyle={config.buttonStyle}
          label="Confirm"
          onClick={handleConfirm}
          loadOnSuccess={!autoClose}
        />
      </div>
    </BaseModal>
  );
}
