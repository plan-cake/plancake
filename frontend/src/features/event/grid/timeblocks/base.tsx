import {
  TIME_LABEL_WIDTH,
  SIDE_WIDTH,
} from "@/features/event/grid/lib/constants";
import { TimeBlockProps } from "@/features/event/grid/timeblocks/props";
import { cn } from "@/lib/utils/classname";

export default function BaseTimeBlock({
  numQuarterHours,
  visibleDaysCount,
  maxColumns,
  children,
  hasNext = false,
  hasPrev = false,
  onMouseLeave,
}: TimeBlockProps) {
  const emptyColumnsCount = maxColumns - visibleDaysCount;

  return (
    <div
      className="relative isolate grid w-full"
      onMouseLeave={onMouseLeave}
      style={{
        gridTemplateColumns: `${TIME_LABEL_WIDTH}px repeat(${visibleDaysCount}, 1fr) ${
          emptyColumnsCount > 0 ? `repeat(${emptyColumnsCount}, 1fr)` : ""
        } ${SIDE_WIDTH}px`,
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
          "bg-foreground border-foreground/75 grid border",
          hasPrev && "border-l-0",
          hasNext && "border-r-0",
        )}
        style={{
          gridColumn: `2 / span ${visibleDaysCount}`,
          gridTemplateColumns: `repeat(${visibleDaysCount}, 1fr)`,
          gridTemplateRows: `repeat(${numQuarterHours}, minmax(20px, 1fr))`,
          gap: "1px",
        }}
      >
        {Array.from({ length: visibleDaysCount }).map((_, idx) => (
          <div
            key={`col-backdrop-${idx}`}
            className="bg-background hover:cursor-not-allowed"
            onMouseEnter={onMouseLeave}
            style={{
              gridRow: "1 / -1",
              gridColumn: idx + 1,
              backgroundImage: `repeating-linear-gradient(
                45deg, 
                color-mix(in srgb, var(--color-foreground) 10%, transparent) 0px, 
                color-mix(in srgb, var(--color-foreground) 10%, transparent) 8px, 
                color-mix(in srgb, var(--color-background) 10%, transparent) 8px, 
                color-mix(in srgb, var(--color-background) 10%, transparent) 9.5px
              )`,
            }}
          />
        ))}

        {children}
      </div>

      <div
        className={cn(
          "pointer-events-none relative grid",
          hasNext &&
            "divide-foreground/75 border-foreground/75 divide-y divide-dashed border border-r-0",
        )}
        style={{
          gridColumn: maxColumns + 2,
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
