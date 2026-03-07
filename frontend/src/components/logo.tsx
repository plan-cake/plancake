import { cn } from "@/lib/utils/classname";

export default function Logo({ oneLine = false }: { oneLine?: boolean }) {
  return (
    <div className="font-display text-lion text-2xl font-normal [-webkit-text-stroke:1px_black]">
      <div>
        <span>plan</span>
        <span
          className={cn(
            "duration-250 transition-opacity ease-out",
            oneLine ? "opacity-100" : "opacity-0",
          )}
        >
          cake
        </span>
      </div>
      <div
        className={cn(
          "duration-250 transition-opacity ease-out",
          oneLine ? "opacity-0" : "opacity-100",
        )}
      >
        cake
      </div>
    </div>
  );
}
