import SelectorDrawer from "@/features/selector/components/drawer";
import Dropdown from "@/features/selector/components/dropdown";
import { SelectorProps } from "@/features/selector/types";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { cn } from "@/lib/utils/classname";

export default function Selector<TValue extends string | number | null>(
  props: SelectorProps<TValue>,
) {
  const isMobile = useCheckMobile();

  // converts the value to the format needed by CustomSelect (string or number)
  const handleValueChange = (selectedValue: string | number | null) => {
    props.onChange(selectedValue as TValue);
  };

  // desktop uses dropdown selector
  if (!isMobile) {
    return (
      <div className={props.className}>
        <Dropdown
          id={props.id}
          value={props.value}
          options={props.options}
          onChange={handleValueChange}
          placeholder={props.placeholder}
          disabled={props.disabled}
          className={cn("w-full", !props.className && "h-fit w-fit")}
        />
      </div>
    );
  }

  // mobile uses drawer selector
  return <SelectorDrawer {...props} onChange={handleValueChange} />;
}
