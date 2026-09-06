import BaseWeekBlock from "@/features/event/grid/calendar/weekblocks/base";
import { PreviewWeekBlockProps } from "@/features/event/grid/calendar/weekblocks/props";

export default function PreviewWeekBlock({
  weeks,
  backgroundColor,
}: PreviewWeekBlockProps) {
  return (
    <BaseWeekBlock
      weeks={weeks}
      backgroundColor={backgroundColor}
      getDayProps={() => ({ disableSelect: true })}
    />
  );
}
