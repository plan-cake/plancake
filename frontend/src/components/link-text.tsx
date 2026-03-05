import { ReactNode } from "react";

import { cn } from "@/lib/utils/classname";

export default function LinkText({
  unbolded = false,
  children,
}: {
  unbolded?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "hover:text-accent cursor-pointer hover:underline",
        unbolded ? "font-normal" : "font-extrabold",
      )}
    >
      {children}
    </span>
  );
}
