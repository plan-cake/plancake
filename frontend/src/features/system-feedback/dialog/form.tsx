import { useCallback } from "react";

import ActionButton from "@/features/button/components/action";
import EmptyButton from "@/features/button/components/empty";
import BaseModal from "@/features/system-feedback/dialog/base";
import { FormDialogProps } from "@/features/system-feedback/dialog/props";

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
  open,
  onOpenChange,
  icon,
}: FormDialogProps) {
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      console.log("Form submitted");
      e.preventDefault();
      const success = await onSubmit();
      if (success) {
        onOpenChange?.(false);
      }
    },
    [onSubmit, onOpenChange],
  );

  return (
    <BaseModal
      type={type}
      title={title}
      description={description}
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      asNestedDrawer={asNestedDrawer}
      icon={icon}
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
            onClick={() => onOpenChange?.(false)}
          />
          <EmptyButton
            type="submit"
            buttonStyle="primary"
            label={submitLabel}
          />
        </div>
      </form>
    </BaseModal>
  );
}
