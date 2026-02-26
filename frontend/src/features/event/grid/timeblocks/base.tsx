import {
  TIME_LABEL_WIDTH,
  SIDE_WIDTH,
} from "@/features/event/grid/lib/constants";
import { TimeBlockProps } from "@/features/event/grid/timeblocks/props";
import { cn } from "@/lib/utils/classname";

export default function BaseTimeBlock({
  ref,
  numQuarterHours,
  visibleDaysCount,
  children,
  hasNext = false,
  hasPrev = false,
}: TimeBlockProps) {
  return (
    <div
      ref={ref}
      className="relative isolate grid"
      style={{
        gridTemplateColumns: `${TIME_LABEL_WIDTH}px 1fr ${hasNext ? SIDE_WIDTH : 10}px`,
      }}
    >
      <div
        className={cn(
          "pointer-events-none relative grid",
          hasPrev &&
            "divide-foreground/75 border-foreground/75 divide-y divide-dashed border border-l-0",
        )}
        style={{
          gridTemplateColumns: `${TIME_LABEL_WIDTH}px`,
          gridTemplateRows: `repeat(${numQuarterHours}, minmax(20px, 1fr))`,
          maskImage: "linear-gradient(to left, black, transparent)",
          WebkitMaskImage: "linear-gradient(to left, black, transparent)",
        }}
      >
        {Array.from({ length: numQuarterHours }).map((_, idx) => (
          <div
            key={`border-left-${idx}`}
            style={{ gridRow: idx + 1, gridColumn: 1 }}
          />
        ))}
      </div>

      <div
        className={cn(
          "bg-foreground border-foreground/75 grid w-full gap-x-[1px] border",
          hasPrev && "border-l-0",
          hasNext && "border-r-0",
        )}
        style={{
          gridTemplateColumns: `repeat(${visibleDaysCount}, 1fr)`,
          gridTemplateRows: `repeat(${numQuarterHours}, minmax(20px, 1fr))`,
        }}
      >
        {children}
      </div>

      <div
        className={cn(
          "pointer-events-none relative grid",
          hasNext &&
            "divide-foreground/75 border-foreground/75 divide-y divide-dashed border border-r-0",
        )}
        style={{
          gridTemplateColumns: `${SIDE_WIDTH}px`,
          gridTemplateRows: `repeat(${numQuarterHours}, minmax(20px, 1fr))`,
          maskImage: "linear-gradient(to right, black, transparent)",
          WebkitMaskImage: "linear-gradient(to right, black, transparent)",
        }}
      >
        {Array.from({ length: numQuarterHours }).map((_, idx) => (
          <div
            key={`border-right-${idx}`}
            style={{ gridRow: idx + 1, gridColumn: 1 }}
          />
        ))}
      </div>
    </div>
  );
}
