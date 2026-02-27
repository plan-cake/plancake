import { useState } from "react";

import * as Collapsible from "@radix-ui/react-collapsible";

import { useEventContext } from "@/core/event/context";
import TimePicker from "@/features/event/editor/time-range/time-picker";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { cn } from "@/lib/utils/classname";
import { convert24To12 } from "@/lib/utils/date-time-format";

export default function TimeRangeSelection({}) {
  const { state, setStartTime, setEndTime } = useEventContext();
  const { from: startTime, to: endTime } = state.eventRange.timeRange;

  const [open, setOpen] = useState("");

  return (
    <div className="contents">
      <TimeCollapsible
        id="start-time"
        label="FROM"
        time={startTime}
        onChange={setStartTime}
        open={open === "start-time"}
        setOpen={(isOpen) => setOpen(isOpen ? "start-time" : "")}
      />
      <TimeCollapsible
        id="end-time"
        label="UNTIL"
        time={endTime}
        onChange={setEndTime}
        open={open === "end-time"}
        setOpen={(isOpen) => setOpen(isOpen ? "end-time" : "")}
      />
    </div>
  );
}

function TimeCollapsible({
  id,
  label,
  time,
  onChange,
  open,
  setOpen,
}: {
  id: string;
  label: string;
  time: string;
  onChange: (newTime: string) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}) {
  const isMobile = useCheckMobile();
  const time12 = convert24To12(time);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <div className="flex w-fit items-center space-x-4">
          <p className="text-gray-400" aria-label={id}>
            {label}
          </p>
          <div
            className={cn(
              "inline-flex items-center rounded-full text-start",
              "bg-accent/15 hover:bg-accent/25 active:bg-accent/40 text-accent-text px-3 py-1",
              "hover:cursor-pointer focus:outline-none",
              open && "ring-accent ring-1",
            )}
          >
            {time12}
          </div>
        </div>
      </Collapsible.Trigger>

      <Collapsible.Content className="collapsible-content mt-2">
        <TimePicker
          time={time}
          onTimeChange={onChange}
          visibleCount={isMobile ? 5 : 3}
          fontSize={isMobile ? 20 : 16}
        />
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
