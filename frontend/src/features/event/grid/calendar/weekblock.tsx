import { parse } from "date-fns";

import { cn } from "@/lib/utils/classname";

export default function WeekBlock({ weeks }: { weeks: (string | null)[][] }) {
  return (
    <div
      className={cn(
        "border-foreground/75 border",
        "divide-foreground/75 divide-y divide-dashed",
      )}
      style={{
        backgroundImage: `repeating-linear-gradient(
          45deg, 
          color-mix(in srgb, var(--color-foreground) 10%, transparent) 0px, 
          color-mix(in srgb, var(--color-foreground) 10%, transparent) 8px, 
          color-mix(in srgb, var(--color-background) 10%, transparent) 8px, 
          color-mix(in srgb, var(--color-background) 10%, transparent) 9.5px
        )`,
      }}
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
                className={cn(
                  "h-20 flex-1 p-2 text-right leading-none",
                  exists && "bg-panel",
                )}
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
