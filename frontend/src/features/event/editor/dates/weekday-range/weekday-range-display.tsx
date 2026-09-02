import { useMemo } from "react";

import { ChevronDown } from "lucide-react";

import { Weekday } from "@/core/event/types";
import { cn } from "@/lib/utils/classname";
import { formatWeekdaySet } from "@/lib/utils/date-time-format";

export default function WeekdayRangeDisplay({
  weekdays,
  open,
}: {
  weekdays: Set<Weekday>;
  open: boolean;
}) {
  const display = useMemo(() => {
    return formatWeekdaySet(weekdays);
  }, [weekdays]);

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
          aria-label="Possible days"
        >
          <span className={!display ? "text-foreground/60" : undefined}>
            {display ? display : "Select Days"}
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </div>
      </div>
    </form>
  );
}
