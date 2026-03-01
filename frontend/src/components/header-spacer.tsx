import { cn } from "@/lib/utils/classname";

export default function HeaderSpacer({
  scrollable = false,
}: {
  scrollable?: boolean;
}) {
  return (
    <div
      className={cn(
        "md:h-25 bg-background z-20 h-20 w-full",
        scrollable ? "" : "sticky top-0",
      )}
    />
  );
}
