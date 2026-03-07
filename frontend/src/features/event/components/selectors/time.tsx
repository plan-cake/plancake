import Selector from "@/features/selector/components/selector";
import { BaseSelectorWrapperProps } from "@/features/selector/types";
import { convert12To24 } from "@/lib/utils/date-time-format";

export default function TimeSelector(props: BaseSelectorWrapperProps<string>) {
  const options = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const period = i < 12 ? "am" : "pm";

    const label = `${hour}:00 ${period}`;
    const value = convert12To24(label);

    return { label, value };
  });

  options.push({ label: "12:00 am", value: "24:00" });

  return (
    <Selector
      {...props}
      options={options}
      dialogTitle="Select Time"
      dialogDescription="Select a time from the list"
    />
  );
}
