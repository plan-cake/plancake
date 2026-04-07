import { cn } from "@/lib/utils/classname";

type WeekdayRowProps = {
  startWeekday: number;
  endWeekday: number;
};

export default function WeekdayRow({
  startWeekday,
  endWeekday,
}: WeekdayRowProps) {
  return (
    <div className="bg-panel flex w-fit rounded-full">
      {["S", "M", "T", "W", "T", "F", "S"].map((initial, index) => (
        <WeekdayRowIcon
          key={index}
          label={initial}
          index={index}
          start={startWeekday}
          end={endWeekday}
        />
      ))}
    </div>
  );
}

function WeekdayRowIcon({
  label,
  index,
  start,
  end,
}: {
  label: string;
  index: number;
  start: number;
  end: number;
}) {
  const isActive = index >= start && index <= end;
  const isStart = index === start;
  const isEnd = index === end;
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
