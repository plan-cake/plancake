import Selector from "@/features/selector/components/selector";
import ShortcutTrigger from "@/features/system-feedback/hotkeys/components/shortcut-trigger";

export default function GridPageDaysSelector({
  id,
  value,
  options,
  onChange,
  useShortcut,
}: {
  id: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
  useShortcut: boolean;
}) {
  const selector = (
    <Selector
      id={id}
      value={value}
      options={options.map((option) => ({
        value: option,
        label: `${option} days`,
      }))}
      onChange={onChange}
      dialogTitle="Select Days per Page"
      dialogDescription="Select the number of days to display per page"
    />
  );

  return useShortcut ? (
    <ShortcutTrigger
      hotkey="d"
      className="w-fit"
      tooltipSide="right"
      selector={`#${id}`}
    >
      {selector}
    </ShortcutTrigger>
  ) : (
    selector
  );
}
