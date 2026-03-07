import Selector from "@/features/selector/components/selector";
import { BaseSelectorWrapperProps } from "@/features/selector/types";

const durationOptions = [
  { label: "None", value: 0 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
];

export default function DurationSelector(
  props: BaseSelectorWrapperProps<number>,
) {
  return (
    <Selector
      {...props}
      options={durationOptions}
      dialogTitle="Select Duration"
      dialogDescription="Select a duration from the list"
    />
  );
}
