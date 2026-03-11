import { useTimezoneSelect, allTimezones } from "react-timezone-select";

import Selector from "@/features/selector/components/selector";
import { BaseSelectorWrapperProps } from "@/features/selector/types";

const labelStyle = "original";
const timezones = allTimezones;

export default function TimeZoneSelector(
  props: BaseSelectorWrapperProps<string>,
) {
  const { options, parseTimezone } = useTimezoneSelect({
    labelStyle,
    timezones,
  });

  const parsedValue = parseTimezone(props.value)?.value || "";

  return (
    <Selector
      {...props}
      value={parsedValue}
      options={options}
      dialogTitle="Select Timezone"
      dialogDescription="Select a timezone from the list"
      textStart
    />
  );
}
