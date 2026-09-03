import { TimeBlockProps } from "@/features/event/grid/date-time/timeblocks/props";
import { cn } from "@/lib/utils/classname";

export default function BaseTimeBlock({
  numQuarterHours,
  visibleDaysCount,
  children,
  onMouseLeave,
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
      onMouseLeave={onMouseLeave}
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
  );
}
