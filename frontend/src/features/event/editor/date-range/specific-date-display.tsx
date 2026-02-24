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
  const displayFrom = startDate ? format(startDate, "EEE MMMM d, yyyy") : "";
  const displayTo = endDate ? format(endDate, "EEE MMMM d, yyyy") : "";

  const displayStyle =
    "text-accent-text bg-accent/15 hover:bg-accent/25 active:bg-accent/40 rounded-2xl px-3 py-1 focus:outline-none";

  return (
    <form className="flex w-full flex-col gap-y-2 md:flex-row md:gap-4">
      {/* Start Date */}
      <div className="flex w-fit items-center space-x-4">
        <p className="text-gray-400 md:hidden">FROM</p>
        <span
          className={cn(displayStyle, open && "ring-accent ring-1")}
          aria-label="Start date"
        >
          {displayFrom}
        </span>
      </div>

      <span className="hidden w-fit py-1 text-gray-400 md:block">TO</span>

      {/* End Date */}
      <div className="flex w-fit items-center space-x-4">
        <p className="text-gray-400 md:hidden">UNTIL</p>
        <span
          className={cn(displayStyle, open && "ring-accent ring-1")}
          aria-label="End date"
        >
          {displayTo}
        </span>
      </div>
    </form>
  );
}
