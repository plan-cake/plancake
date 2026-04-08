import { useId } from "react";

import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils/classname";

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  textSize?: "sm" | "md";
};

export default function Checkbox(props: CheckboxProps) {
  const { label, checked, onChange, textSize = "md" } = props;
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex">
        <input
          type="checkbox"
          id={"checkbox-" + id}
          className={cn(
            "h-4 w-4 appearance-none rounded-sm border border-gray-300",
            "checked:border-accent checked:bg-accent",
            "cursor-pointer",
          )}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {checked && (
          <CheckIcon
            className="centered-absolute pointer-events-none h-3 w-3 text-white"
            aria-hidden
            focusable={false}
          />
        )}
      </div>
      <label
        htmlFor={"checkbox-" + id}
        className={cn(
          "cursor-pointer select-none",
          textSize === "sm" ? "text-sm" : "text-md",
          checked && "text-accent",
        )}
      >
        {label}
      </label>
    </div>
  );
}
