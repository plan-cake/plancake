import { useEventContext } from "@/core/event/context";
import { EventType } from "@/core/event/types";
import Selector from "@/features/selector/components/selector";

type EventTypeSelectProps = {
  id: string;
  disabled?: boolean;
};

export default function EventTypeSelect({
  id,
  disabled = false,
}: EventTypeSelectProps) {
  const { state, setEventType } = useEventContext();
  const rangeType = state.eventRange?.type || "specific";

  return (
    <Selector
      id={id}
      options={[
        { label: "Specific Dates", value: "specific" },
        { label: "Days of the Week", value: "weekday" },
      ]}
      dialogTitle="Select Event Type"
      dialogDescription="Select a type from the list"
      value={rangeType}
      disabled={disabled}
      onChange={(value: EventType) => setEventType(value)}
      className="w-fit min-w-[100px] border-none"
    />
  );
}
