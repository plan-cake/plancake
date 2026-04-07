"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils/classname";

type SegmentedControlProps<T extends string> = {
  options: { label: React.ReactNode; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex((opt) => opt.value === value);
  const count = options.length;

  // Calculate dynamic style for the sliding pill
  const pillStyle = useMemo(() => {
    const pillWidth = `(100% - 16px) / ${count}`;
    const leftOffset = `calc(8px + (${pillWidth}) * ${activeIndex})`;

    return {
      width: `calc(${pillWidth})`,
      left: activeIndex === -1 ? "8px" : leftOffset,
    };
  }, [activeIndex, count]);

  return (
    <div
      className={cn(
        "bg-panel relative isolate grid w-full rounded-full p-2",
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
      }}
    >
      <div
        className="bg-accent absolute bottom-2 top-2 rounded-full transition-[left,width] duration-300 ease-out"
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
              "z-10 flex w-full items-center justify-center rounded-full py-2 text-sm font-medium transition-colors duration-300 focus:outline-none",
              isSelected
                ? "text-white"
                : "text-foreground hover:bg-accent/25 cursor-pointer",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
