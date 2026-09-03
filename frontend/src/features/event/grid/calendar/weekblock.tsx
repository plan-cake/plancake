import { parse } from "date-fns";

import { cn } from "@/lib/utils/classname";

export default function WeekBlock({ weeks }: { weeks: (string | null)[][] }) {
  return (
    <div
      className={cn(
        "border-foreground/75 border",
        "divide-foreground/75 divide-y divide-dashed",
      )}
    >
      {weeks.map((days, wIndex) => (
        <div
          key={wIndex}
          className={cn("flex", "divide-foreground/75 divide-x divide-dashed")}
        >
          {days.map((day, dIndex) => {
            const exists = day !== null;

            return (
              <div
                key={dIndex}
                className="h-20 flex-1 p-2 text-right leading-none"
              >
                {exists && parse(day, "yyyy-MM-dd", new Date()).getDate()}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
