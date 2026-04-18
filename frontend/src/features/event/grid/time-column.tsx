import { useMemo } from "react";

import { TIME_LABEL_WIDTH } from "@/features/event/grid/lib/constants";
import { cn } from "@/lib/utils/classname";

export default function TimeColumn({
  numQuarterHours,
  startHour,
  isPreview = false,
}: {
  numQuarterHours: number;
  startHour: number;
  isPreview?: boolean;
}) {
  // generate hour labels for the time column
  const hoursLabel = useMemo(() => {
    return Array.from({ length: numQuarterHours + 1 }, (_, i) => {
      const hour24 = startHour + Math.floor(i / 4);
      const hour12 = hour24 % 12 || 12;
      const period = hour24 < 12 ? "AM" : "PM";
      return `${hour12} ${period}`;
    });
  }, [startHour, numQuarterHours]);

  return (
    <div
      className="pointer-events-none"
      style={{
        width: `${TIME_LABEL_WIDTH}px`,
        display: "grid",
        gridTemplateRows: `repeat(${numQuarterHours}, minmax(20px, 1fr))`,
      }}
    >
      {Array.from({ length: numQuarterHours + 1 }).map((_, i) =>
        i % 4 === 0 ? (
          <div
            key={`label-${i}`}
            className="relative flex items-start justify-end pr-1 text-right text-xs"
          >
            <span
              className={cn(
                "bg-background absolute -top-2 rounded-full px-1 text-xs",
                isPreview && "bg-panel",
              )}
            >
              {hoursLabel[i]}
            </span>
          </div>
        ) : (
          <div key={`empty-${i}`} />
        ),
      )}
    </div>
  );
}
