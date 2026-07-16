import Selector from "@/features/selector/components/selector";

export default function GridPageDaysSelector({
  value,
  options,
  onChange,
}: {
  value: number;
  options: number[];
  onChange: (value: number) => void;
}) {
  return (
    <Selector
      id="grid-page-days-selector"
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
}
