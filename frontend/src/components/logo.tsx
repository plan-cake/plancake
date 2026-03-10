import { cn } from "@/lib/utils/classname";

export default function Logo({ oneLine = false }: { oneLine?: boolean }) {
  return (
    <div className="font-display text-lion select-none text-2xl font-normal [-webkit-text-stroke:1px_black]">
      <div>
        <span>plan</span>
        <span
          className={cn(
            "header-transition-[opacity]",
            oneLine ? "opacity-100" : "absolute opacity-0",
          )}
        >
          cake
        </span>
      </div>
      <div
        className={cn(
          "header-transition-[opacity]",
          oneLine ? "opacity-0" : "opacity-100",
        )}
      >
        cake
      </div>
    </div>
  );
}
