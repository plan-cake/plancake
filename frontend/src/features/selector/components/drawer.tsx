import { useState, useEffect, useRef } from "react";

import { Drawer } from "vaul";

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
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger
        id={id}
        aria-label={`Select ${dialogTitle}`}
        className={cn(
          "relative flex items-center rounded-2xl text-start hover:cursor-pointer focus:outline-none",
          "bg-accent/15 hover:bg-accent/25 active:bg-accent/40 text-accent px-3 py-1",
          open && "ring-accent ring-1",
        )}
      >
        <span className="text-wrap">{selectLabel}</span>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="bg-panel rounded-t-4xl fixed bottom-0 left-0 right-0 z-50 flex h-1/2 flex-col">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden">
            <div className="shrink-0 px-8 pb-2 pt-4">
              <Drawer.Handle className="!bg-foreground/50 !w-20" />
              <Drawer.Title className="mb-0 mt-4 flex flex-row items-center justify-between text-lg font-semibold">
                {dialogTitle}
              </Drawer.Title>
              <Drawer.Description className="sr-only">
                {dialogDescription || "Select an option from the list below"}
              </Drawer.Description>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8" data-vaul-no-drag>
              <div className="flex flex-col">
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
                        "active:bg-accent/20 mb-2 shrink-0 cursor-pointer rounded-full p-4 text-center",
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
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
