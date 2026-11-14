"use client";

import { cn } from "@/lib/utils/classname";

type SegmentedControlProps<T extends string> = {
  options: { label: React.ReactNode; value: T; ariaLabel?: string }[];
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
  const baseOffset = hidePadding ? 0 : 8;

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
          "bg-accent/25 absolute rounded-full transition-transform duration-300 ease-out will-change-transform",
          hidePadding ? "bottom-0 top-0" : "bottom-2 top-2",
        )}
        style={{
          left: baseOffset,
          width: `calc((100% - ${baseOffset * 2}px) / ${count})`,
          transform: `translateX(${activeIndex === -1 ? 0 : activeIndex * 100}%)`,
        }}
      />

      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-label={option.ariaLabel}
            className={cn(
              "z-10 flex w-full items-center justify-center rounded-full py-2 focus:outline-none",
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
