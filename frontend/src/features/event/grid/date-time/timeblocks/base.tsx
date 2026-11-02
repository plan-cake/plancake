import { NONEXISTENT_SLOT_PATTERN } from "@/features/event/grid/constants";
import { TimeBlockProps } from "@/features/event/grid/date-time/timeblocks/props";
import { cn } from "@/lib/utils/classname";

export default function BaseTimeBlock({
  numQuarterHours,
  visibleDaysCount,
  children,
}: TimeBlockProps) {
  return (
    <div
      className={cn(
        "bg-foreground border-foreground/75 grid w-full gap-x-[1px] border",
      )}
      style={{
        gridTemplateColumns: `repeat(${visibleDaysCount}, 1fr)`,
        gridTemplateRows: `repeat(${numQuarterHours}, minmax(20px, 1fr))`,
      }}
    >
      {Array.from({ length: visibleDaysCount }).map((_, idx) => (
        <div
          key={`col-backdrop-${idx}`}
          className="bg-background hover:cursor-not-allowed"
          style={{
            gridRow: "1 / -1",
            gridColumn: idx + 1,
            backgroundImage: NONEXISTENT_SLOT_PATTERN,
          }}
        />
      ))}

      {children}
    </div>
  );
}
