import { cn } from "@/lib/utils/classname";

type WeekdayRowProps = {
  weekdays: Set<number>;
};

export default function WeekdayRow({ weekdays }: WeekdayRowProps) {
  return (
    <div className="bg-panel flex w-fit rounded-full">
      {["S", "M", "T", "W", "T", "F", "S"].map((initial, index) => {
        const isActive = weekdays.has(index);
        const isStart = isActive && !weekdays.has(index - 1);
        const isEnd = isActive && !weekdays.has(index + 1);
        return (
          <WeekdayRowIcon
            key={index}
            label={initial}
            isActive={isActive}
            isStart={isStart}
            isEnd={isEnd}
          />
        );
      })}
    </div>
  );
}

function WeekdayRowIcon({
  label,
  isActive,
  isStart,
  isEnd,
}: {
  label: string;
  isActive: boolean;
  isStart: boolean;
  isEnd: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-6 w-6 items-center justify-center text-xs font-bold",
        isActive && "bg-accent/50 text-accent-text",
        isStart && "rounded-l-full",
        isEnd && "rounded-r-full",
      )}
    >
      {label}
    </div>
  );
}
