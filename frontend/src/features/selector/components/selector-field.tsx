import { cn } from "@/lib/utils/classname";

type FormSelectorFieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  isVertical?: boolean;
  classname?: string;
};

export default function FormSelectorField({
  label,
  htmlFor,
  children,
  isVertical = false,
  classname,
}: FormSelectorFieldProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4",
        isVertical && "flex-col items-start gap-1",
        classname,
      )}
    >
      <label htmlFor={htmlFor} className="text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}
