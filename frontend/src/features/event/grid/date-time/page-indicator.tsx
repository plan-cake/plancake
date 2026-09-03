import { cn } from "@/lib/utils/classname";

export default function GridPageIndicator({
  side,
  width,
  gapPresent,
  numQuarterHours,
  numTimeBlocks,
}: {
  side: "left" | "right";
  width: number;
  gapPresent: boolean;
  numQuarterHours: number[];
  numTimeBlocks: number;
}) {
  const maskImage =
    side === "left"
      ? "linear-gradient(to left, black, transparent)"
      : "linear-gradient(to right, black, transparent)";

  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: numTimeBlocks }).map((_, tIndex) => (
        <div
          key={`border-${side}-${tIndex}`}
          className={cn(
            "pointer-events-none relative grid",
            "divide-foreground/75 border-foreground/75 divide-y divide-dashed border",
            side === "left" ? "border-l-0" : "border-r-0",
            !gapPresent && (side === "left" ? "border-r-0" : "border-l-0"),
          )}
          style={{
            gridTemplateColumns: `${width}px`,
            gridTemplateRows: `repeat(${numQuarterHours[tIndex]}, minmax(20px, 1fr))`,
            maskImage: maskImage,
            WebkitMaskImage: maskImage,
          }}
        >
          {Array.from({ length: numQuarterHours[tIndex] }).map((_, qIndex) => (
            <div
              key={`border-${side}-${tIndex}-${qIndex}`}
              style={{ gridRow: qIndex + 1, gridColumn: 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
