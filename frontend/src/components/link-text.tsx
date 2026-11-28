import { ReactNode } from "react";

import { cn } from "@/lib/utils/classname";

export default function LinkText({
  unbolded = false,
  disabled = false,
  children,
}: {
  unbolded?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        !disabled && "hover:text-accent cursor-pointer hover:underline",
        unbolded ? "font-normal" : "font-extrabold",
      )}
    >
      {children}
    </span>
  );
}
