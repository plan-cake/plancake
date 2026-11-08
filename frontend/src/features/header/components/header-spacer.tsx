"use client";

import { cn } from "@/lib/utils/classname";

export default function HeaderSpacer({
  scrollable = false,
}: {
  scrollable?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-(--header-height) bg-background z-20 w-full",
        scrollable ? "" : "md:sticky md:top-0",
      )}
    />
  );
}
