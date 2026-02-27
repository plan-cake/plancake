import { useState, useEffect, useRef } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";

import ActionButton from "@/features/button/components/action";
import { SelectorProps } from "@/features/selector/types";
import { cn } from "@/lib/utils/classname";

export default function SelectorDrawer<TValue extends string | number>({
  id,
  value,
  options,
  onChange,
  dialogTitle,
  dialogDescription,
  textStart = false,
}: SelectorProps<TValue>) {
  const [open, setOpen] = useState(false);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  const selectLabel = options.find((opt) => opt.value === value)?.label || "";

  const handleClose = () => {
    setOpen(false);
    return true;
  };

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        // Scroll the selected item into view when the drawer opens
        selectedItemRef.current?.scrollIntoView({
          block: "center",
          behavior: "auto",
        });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        id={id}
        className={cn(
          "inline-flex items-center rounded-2xl text-start hover:cursor-pointer focus:outline-none",
          "bg-accent/15 hover:bg-accent/25 active:bg-accent/40 text-accent-text px-3 py-1",
          open && "ring-accent ring-1",
        )}
        aria-label={`Select ${dialogTitle}`}
      >
        <span className="text-wrap">{selectLabel}</span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-gray-700/40" />
        <Dialog.Content
          className="animate-slideUp data-[state=closed]:animate-slideDown fixed bottom-0 left-0 right-0 z-50 flex h-[500px] w-full flex-col focus:outline-none"
          aria-label={dialogTitle}
        >
          <div className="rounded-t-4xl bg-background flex flex-1 flex-col overflow-y-auto shadow-lg">
            <div
              onPointerDown={handleClose}
              className="bg-background sticky top-0 z-10 flex items-center gap-4 p-8 pb-4"
            >
              <ActionButton
                buttonStyle="frosted glass"
                icon={<Cross1Icon />}
                label="Close Drawer"
                shrinkOnMobile
                onClick={handleClose}
              />

              <Dialog.Title className="mb-0 flex flex-row items-center justify-between text-lg font-semibold">
                {dialogTitle}
              </Dialog.Title>

              <Dialog.Description className="sr-only">
                {dialogDescription || "Select an option from the list below"}
              </Dialog.Description>
            </div>

            <div className="flex flex-col px-8 pb-8">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    ref={isSelected ? selectedItemRef : null}
                    key={String(option.value)}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChange(option.value);
                        setOpen(false);
                      }
                    }}
                    className={cn(
                      "active:bg-accent/20 mb-2 cursor-pointer rounded-full p-4 text-center",
                      isSelected && "bg-accent text-white",
                      textStart && "text-start",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
