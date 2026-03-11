import { useId } from "react";

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
      <input
        type="checkbox"
        id={"checkbox-" + id}
        className={cn(
          "h-4 w-4 appearance-none rounded-sm border border-gray-300",
          "checked:border-accent checked:bg-accent peer",
          "hover:cursor-pointer",
        )}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label
        htmlFor={"checkbox-" + id}
        className={`peer-checked:text-accent ${textSize === "sm" ? "text-sm" : "text-md"}`}
      >
        {label}
      </label>
    </div>
  );
}
