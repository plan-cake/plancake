import { useState, useEffect, useRef } from "react";

import { BaseDrawer } from "@/components/layout/base-drawer"; // Adjust this import path!
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
      onOpenChange={setOpen}
      title={dialogTitle}
      description={dialogDescription || "Select an option from the list below"}
      contentClassName="h-1/2"
      trigger={
        <button
          id={id}
          aria-label={`Select ${dialogTitle}`}
          className={cn(
            "relative flex items-center rounded-2xl text-start hover:cursor-pointer focus:outline-none",
            "bg-accent/15 hover:bg-accent/25 active:bg-accent/40 text-accent px-3 py-1",
            open && "ring-accent ring-1",
          )}
        >
          <span className="text-wrap">{selectLabel}</span>
        </button>
      }
    >
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
    </BaseDrawer>
  );
}
