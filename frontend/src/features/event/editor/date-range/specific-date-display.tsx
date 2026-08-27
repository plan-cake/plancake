import { useMemo } from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/classname";
import { formatDateSet } from "@/lib/utils/date-time-format";

type SpecificDateRangeDisplayProps = {
  dates: Set<string>;
  open?: boolean;
};

export default function SpecificDateRangeDisplay({
  dates,
  open = false,
}: SpecificDateRangeDisplayProps) {
  const display = useMemo(() => {
    return formatDateSet(dates);
  }, [dates]);

  return (
    <form className="flex w-full flex-col gap-y-2 md:flex-row md:gap-4">
      <div className="flex w-fit items-center space-x-4">
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
      </div>
    </form>
  );
}
