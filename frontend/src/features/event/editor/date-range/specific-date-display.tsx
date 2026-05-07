import { format } from "date-fns";

import { cn } from "@/lib/utils/classname";

type SpecificDateRangeDisplayProps = {
  startDate: Date;
  endDate: Date;
  open?: boolean;
};

export default function SpecificDateRangeDisplay({
  startDate,
  endDate,
  open = false,
}: SpecificDateRangeDisplayProps) {
  return (
    <form className="flex w-full flex-col gap-y-2 md:flex-row md:gap-4">
      <SpecificDateDisplay
        mobileLabel="FROM"
        date={startDate}
        ariaLabel="Start date"
        open={open}
      />

      <span className="hidden w-fit py-1 text-gray-400 md:block">TO</span>

      <SpecificDateDisplay
        mobileLabel="UNTIL"
        date={endDate}
        ariaLabel="End date"
        open={open}
      />
    </form>
  );
}

function SpecificDateDisplay({
  mobileLabel,
  date,
  ariaLabel,
  open = false,
}: {
  mobileLabel: string;
  date: Date;
  ariaLabel: string;
  open?: boolean;
}) {
  const displayDate = format(date, "EEE MMMM d, yyyy");

  const displayStyle =
    "text-accent-text bg-accent/15 hover:bg-accent/25 active:bg-accent/40 rounded-2xl px-3 py-1 focus:outline-none";

  return (
    <div className="flex w-fit items-center space-x-4">
      <p className="text-gray-400 md:hidden">{mobileLabel}</p>
      <span
        className={cn(displayStyle, open && "ring-accent ring-1")}
        aria-label={ariaLabel}
      >
        {displayDate}
      </span>
    </div>
  );
}
