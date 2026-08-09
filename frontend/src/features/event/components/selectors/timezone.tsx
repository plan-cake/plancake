import { useTimezoneSelect, allTimezones } from "react-timezone-select";

import Selector from "@/features/selector/components/selector";
import { BaseSelectorWrapperProps } from "@/features/selector/types";
import ShortcutTrigger from "@/features/system-feedback/hotkeys/components/shortcut-trigger";

const labelStyle = "original";
const timezones = allTimezones;

export default function TimeZoneSelector({
  useShortcut,
  ...props
}: BaseSelectorWrapperProps<string> & { useShortcut: boolean }) {
  const { options, parseTimezone } = useTimezoneSelect({
    labelStyle,
    timezones,
  });

  const parsedValue = parseTimezone(props.value)?.value || "";

  const selector = (
    <Selector
      {...props}
      value={parsedValue}
      options={options}
      dialogTitle="Select Timezone"
      dialogDescription="Select a timezone from the list"
      textStart
    />
  );

  console.log(useShortcut, "useShortcut");

  return useShortcut ? (
    <ShortcutTrigger
      hotkey="z"
      className="w-fit"
      tooltipSide="right"
      selector={`#${props.id}`}
    >
      {selector}
    </ShortcutTrigger>
  ) : (
    selector
  );
}
