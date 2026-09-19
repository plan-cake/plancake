import BaseMonthBlock from "@/features/event/grid/calendar/month-blocks/base";
import { PreviewMonthBlockProps } from "@/features/event/grid/calendar/month-blocks/props";

export default function PreviewMonthBlock({
  month,
  backgroundColor,
}: PreviewMonthBlockProps) {
  return (
    <BaseMonthBlock
      month={month}
      backgroundColor={backgroundColor}
      getDayProps={() => ({ disableSelect: true })}
    />
  );
}
