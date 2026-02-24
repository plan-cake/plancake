import { forwardRef } from "react";

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";

import { SelectorProps } from "@/features/selector/types";
import { cn } from "@/lib/utils/classname";

export default function Dropdown<TValue extends string | number>({
  id,
  onChange,
  value,
  options,
  disabled,
  className,
}: SelectorProps<TValue>) {
  return (
    <Select.Root
      value={value?.toString()}
      onValueChange={(v) => {
        // parse value back to number when possible, then cast to TValue
        const parsed = isNaN(Number(v)) ? v : Number(v);
        onChange(parsed as unknown as TValue);
      }}
    >
      <Select.Trigger
        id={id}
        className={cn(
          "text-accent-text inline-flex items-center rounded-2xl text-start hover:cursor-pointer focus:outline-none",
          "bg-accent/15 hover:bg-accent/25 active:bg-accent/40 px-3 py-1",
          disabled &&
            "bg-foreground/20 text-foreground hover:bg-foreground/20 active:bg-foreground/20 cursor-not-allowed opacity-50 hover:cursor-not-allowed",
          className,
        )}
        aria-label="Custom select"
        disabled={disabled}
      >
        <span className="flex-1 truncate text-wrap pr-2">
          <Select.Value placeholder="placeholder" />
        </span>

        <Select.Icon className="flex-shrink-0">
          <ChevronDownIcon className="h-4 w-4" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="bg-background z-50 max-h-60 overflow-auto rounded-2xl border border-gray-400 shadow-lg dark:shadow-violet-700">
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <DropdownItem key={option.value.toString()} value={option.value}>
                {option.label}
              </DropdownItem>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

type DropdownItemProps = {
  value: string | number;
  children: React.ReactNode;
};

const DropdownItem = forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ children, value }, ref) => {
    return (
      <Select.Item
        ref={ref}
        value={value.toString()}
        className="data-[highlighted]:bg-accent relative flex h-[30px] select-none items-center rounded-xl px-6 leading-none hover:outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[highlighted]:text-white"
      >
        <Select.ItemText>{children}</Select.ItemText>
        <Select.ItemIndicator className="absolute left-2 inline-flex w-4 items-center justify-center">
          <CheckIcon />
        </Select.ItemIndicator>
      </Select.Item>
    );
  },
);
DropdownItem.displayName = "DropdownItem";
