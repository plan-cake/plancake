"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils/classname";

type SegmentedControlProps<T extends string> = {
  options: { label: React.ReactNode; value: T }[];
  value: T;
  onChange: (value: T) => void;
  hidePadding?: boolean;
  className?: string;
};

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  hidePadding = false,
  className,
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex((opt) => opt.value === value);
  const count = options.length;

  // Calculate dynamic style for the sliding pill
  const pillStyle = useMemo(() => {
    const pillWidth = `(100% - ${hidePadding ? "0px" : "16px"}) / ${count}`;
    const leftOffset = `calc(${hidePadding ? "0px" : "8px"} + (${pillWidth}) * ${activeIndex})`;

    return {
      width: `calc(${pillWidth})`,
      left: activeIndex === -1 ? "8px" : leftOffset,
    };
  }, [hidePadding, activeIndex, count]);

  return (
    <div
      className={cn(
        "bg-panel relative isolate grid w-full rounded-full",
        !hidePadding && "p-2",
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
      }}
    >
      <div
        className={cn(
          "bg-accent/25 absolute rounded-full transition-[left,width] duration-300 ease-out",
          hidePadding ? "bottom-0 top-0" : "bottom-2 top-2",
        )}
        style={pillStyle}
      />

      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "z-10 flex w-full items-center justify-center rounded-full py-2 text-sm font-medium focus:outline-none",
              isSelected
                ? "text-accent-text font-bold"
                : "text-foreground hover:bg-accent/15 cursor-pointer",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
