"use client";

import { useHeaderSize } from "@/features/header/context";
import { cn } from "@/lib/utils/classname";

export default function HeaderSpacer({
  scrollable = false,
}: {
  scrollable?: boolean;
}) {
  const { heightClass } = useHeaderSize();

  return (
    <div
      className={cn(
        heightClass,
        "bg-background z-20 w-full",
        scrollable ? "" : "sticky top-0",
      )}
    />
  );
}
