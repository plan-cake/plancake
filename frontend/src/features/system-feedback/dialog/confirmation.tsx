import { useCallback, useEffect } from "react";

import ActionButton from "@/features/button/components/action";
import { DIALOG_CONFIG } from "@/features/system-feedback/confirmation/config";
import BaseModal from "@/features/system-feedback/dialog/base";
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
  showIcon = false,
  autoClose = false,
  asNestedDrawer = false,
  open,
  onOpenChange,
}: ConfirmationDialogProps) {
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

  /* ICON RENDERING */
  const config = DIALOG_CONFIG[type] || DIALOG_CONFIG.info;
  const Icon = config.icon;

  const renderIcon = () => {
    if (!showIcon) return null;
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

  return (
    <BaseModal
      type={type}
      title={title}
      description={description}
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      asNestedDrawer={asNestedDrawer}
      triggerDisabled={triggerDisabled}
      icon={renderIcon()}
    >
      {children}
      <div className="mt-4 flex w-full justify-center gap-4">
        <ActionButton
          buttonStyle="transparent"
          label="Cancel"
          onClick={() => onOpenChange?.(false)}
        />
        <ActionButton
          buttonStyle={config.btnStyle}
          label="Confirm"
          onClick={handleConfirm}
          loadOnSuccess={!autoClose}
        />
      </div>
    </BaseModal>
  );
}
