import { useId } from "react";

import { CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils/classname";

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function Checkbox(props: CheckboxProps) {
  const { label, checked, onChange } = props;
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex">
        <input
          type="checkbox"
          id={id}
          className="checked:border-accent checked:bg-accent h-4 w-4 appearance-none rounded-sm border border-gray-300"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {checked && (
          <CheckIcon
            className="centered-absolute pointer-events-none h-4 w-4 text-white"
            aria-hidden
            focusable={false}
          />
        )}
      </div>
      <label
        htmlFor={id}
        className={cn("select-none text-sm", checked && "text-accent")}
      >
        {label}
      </label>
    </div>
  );
}
