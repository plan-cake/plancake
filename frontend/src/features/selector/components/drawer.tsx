import { useState, useEffect, useRef } from "react";

import { BaseDrawer } from "@/components/layout/base-drawer";
import { DrawerProps } from "@/features/selector/types";
import { cn } from "@/lib/utils/classname";

export default function SelectorDrawer<TValue extends string | number>({
  id,
  value,
  options,
  onChange,
  dialogTitle,
  dialogDescription,
  textStart = false,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
}: DrawerProps<TValue>) {
  const [internalOpen, setInternalOpen] = useState(false);

  // use controlled state if provided, otherwise local state
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (disabled) return;
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  /* SELECTED ITEM SCROLLING LOGIC */
  const selectedItemRef = useRef<HTMLButtonElement>(null);
  const selectLabel = options.find((opt) => opt.value === value)?.label || "";

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        selectedItemRef.current?.scrollIntoView({
          block: "center",
          behavior: "auto",
        });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <BaseDrawer
      open={open}
      onOpenChange={handleOpenChange}
      title={dialogTitle}
      description={dialogDescription || "Select an option from the list below"}
      contentClassName="h-1/2"
      trigger={
        <button
          id={id}
          disabled={disabled}
          aria-label={`Select ${dialogTitle}`}
          aria-disabled={disabled}
          className={cn(
            "relative flex items-center rounded-2xl text-start focus:outline-none",
            "bg-accent/15 text-accent px-3 py-1",
            open && !disabled && "ring-accent ring-1",
            // Interactive states only when enabled
            !disabled &&
              "hover:bg-accent/25 active:bg-accent/40 hover:cursor-pointer",
            // Visual styles for disabled state
            disabled &&
              "bg-foreground/20 text-foreground hover:bg-foreground/20 active:bg-foreground/20 cursor-not-allowed opacity-50 hover:cursor-not-allowed",
          )}
        >
          <span className="text-wrap">{selectLabel}</span>
        </button>
      }
    >
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              ref={isSelected ? selectedItemRef : null}
              key={String(option.value)}
              onClick={() => {
                onChange(option.value);
                handleOpenChange(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(option.value);
                  handleOpenChange(false);
                }
              }}
              className={cn(
                "shrink-0 cursor-pointer rounded-2xl px-3 py-1 text-center",
                "bg-background active:bg-accent/20",
                isSelected && "bg-accent text-white",
                textStart && "text-start",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </BaseDrawer>
  );
}
