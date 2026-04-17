import { useState, useCallback } from "react";

import * as Dialog from "@radix-ui/react-dialog";

import { FloatingDrawer } from "@/features/drawer";
import { BaseDialogProps } from "@/features/system-feedback/dialog/props";
import { cn } from "@/lib/utils/classname";

export default function BaseDialog({
  title,
  description,
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  asNestedDrawer = false,
  triggerDisabled = false,
  icon,
  overlayClassName,
}: BaseDialogProps) {
  /* OPEN STATE MANAGEMENT */
  const [internalOpen, setInternalOpen] = useState(false);
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

  if (asNestedDrawer) {
    return (
      <FloatingDrawer
        nested
        open={open}
        onOpenChange={handleOpenChange}
        title={title}
        trigger={trigger}
        description={description}
        contentClassName="h-fit"
        showHandle={false}
        headerContent={<div className="h-2" />}
      >
        <div className="flex flex-col items-center gap-2 overflow-hidden">
          {icon}
          <p className="text-lg font-bold">{title}</p>
          {children}
        </div>
      </FloatingDrawer>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {trigger && (
        <Dialog.Trigger
          asChild
          disabled={triggerDisabled}
          onClick={(e) => {
            if (triggerDisabled) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          aria-disabled={triggerDisabled}
        >
          {trigger}
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "dialog-overlay fixed inset-0 z-40 bg-gray-700/40 transition-opacity",
            overlayClassName,
          )}
        />
        <Dialog.Content asChild>
          <div
            className={cn(
              "dialog-content fixed inset-0 z-40 m-auto flex flex-col gap-2 overflow-hidden",
              "bg-panel rounded-3xl p-6 shadow-md focus:outline-none",
              "min-w-sm h-fit w-fit max-w-lg",
            )}
          >
            <Dialog.Title asChild>
              <div className="flex flex-col items-center gap-4">
                {icon}
                <p className="text-lg font-bold">{title}</p>
              </div>
            </Dialog.Title>

            <Dialog.Description className="sr-only">
              {description}
            </Dialog.Description>

            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
