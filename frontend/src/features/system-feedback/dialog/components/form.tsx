import { useCallback, useState } from "react";

import ActionButton from "@/features/button/components/action";
import EmptyButton from "@/features/button/components/empty";
import BaseModal from "@/features/system-feedback/dialog/components/base";
import { DIALOG_CONFIG } from "@/features/system-feedback/dialog/config";
import { FormDialogProps } from "@/features/system-feedback/dialog/props";
import { cn } from "@/lib/utils/classname";

export default function FormDialog({
  type,
  title,
  description,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  children,
  trigger,
  asNestedDrawer = false,
  open: controlledOpen,
  onOpenChange,
}: FormDialogProps) {
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await onSubmit();
      if (success) {
        handleOpenChange(false);
      }
    },
    [onSubmit, handleOpenChange],
  );

  return (
    <BaseModal
      title={title}
      description={description}
      trigger={trigger}
      open={open}
      onOpenChange={handleOpenChange}
      asNestedDrawer={asNestedDrawer}
      overlayClassName={cn(
        type === "error" &&
          "bg-[color-mix(in_oklab,var(--color-error)_15%,black_20%)]",
      )}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6"
      >
        {children}

        <div className="flex w-full justify-center gap-4">
          <ActionButton
            type="button"
            buttonStyle="transparent"
            label={cancelLabel}
            onClick={() => handleOpenChange(false)}
          />
          <EmptyButton
            type="submit"
            buttonStyle={config.buttonStyle}
            label={submitLabel}
          />
        </div>
      </form>
    </BaseModal>
  );
}
