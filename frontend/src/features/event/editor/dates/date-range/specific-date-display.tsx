import { useMemo } from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/classname";
import { formatDateSet } from "@/lib/utils/date-time-format";

export default function SpecificDateRangeDisplay({
  dates,
  open,
}: {
  dates: Set<string>;
  open: boolean;
}) {
  const display = useMemo(() => {
    return formatDateSet(dates);
  }, [dates]);

  return (
    <form className="flex w-fit items-center space-x-4">
      <div
        className={cn(
          "text-accent-text bg-accent/15 hover:bg-accent/25 active:bg-accent/40",
          "rounded-2xl px-3 py-1 focus:outline-none",
          "flex items-center gap-2",
          open && "ring-accent ring-1",
        )}
        aria-label="Possible dates"
      >
        <span className={!display ? "text-foreground/60" : undefined}>
          {display ? display : "Select Dates"}
        </span>
        <ChevronDown className="h-4 w-4 flex-shrink-0" />
      </div>
    </form>
  );
}
