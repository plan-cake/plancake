import { useMemo } from "react";

import { format, parseISO } from "date-fns";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/classname";

type SpecificDateRangeDisplayProps = {
  dates: Set<string>;
  open?: boolean;
};

export default function SpecificDateRangeDisplay({
  dates,
  open = false,
}: SpecificDateRangeDisplayProps) {
  const firstDate = useMemo(() => {
    return dates.size > 0
      ? Array.from(dates).reduce((min, cur) => (cur < min ? cur : min))
      : null;
  }, [dates]);

  const lastDate = useMemo(() => {
    return dates.size > 0
      ? Array.from(dates).reduce((max, cur) => (cur > max ? cur : max))
      : null;
  }, [dates]);

  return (
    <form className="flex w-full flex-col gap-y-2 md:flex-row md:gap-4">
      <SpecificDateDisplay
        mobileLabel="FROM"
        date={firstDate ? parseISO(firstDate) : null}
        placeholder="Start Date"
        ariaLabel="Start date"
        open={open}
      />

      <span className="text-foreground/60 hidden w-fit py-1 md:block">TO</span>

      <SpecificDateDisplay
        mobileLabel="UNTIL"
        date={lastDate ? parseISO(lastDate) : null}
        placeholder="End Date"
        ariaLabel="End date"
        open={open}
      />
    </form>
  );
}

function SpecificDateDisplay({
  mobileLabel,
  date,
  placeholder,
  ariaLabel,
  open = false,
}: {
  mobileLabel: string;
  date: Date | null;
  placeholder: string;
  ariaLabel: string;
  open?: boolean;
}) {
  const displayDate = date ? format(date, "EEE MMMM d, yyyy") : placeholder;

  return (
    <div className="flex w-fit items-center space-x-4">
      <p className="text-foreground/60 md:hidden">{mobileLabel}</p>
      <div
        className={cn(
          "text-accent-text bg-accent/15 hover:bg-accent/25 active:bg-accent/40",
          "rounded-2xl px-3 py-1 focus:outline-none",
          "flex items-center gap-2",
          open && "ring-accent ring-1",
        )}
        aria-label={ariaLabel}
      >
        <span className={!date ? "text-foreground/60" : undefined}>
          {displayDate}
        </span>
        <ChevronDown className="h-4 w-4 flex-shrink-0" />
      </div>
    </div>
  );
}
