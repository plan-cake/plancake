import BaseWeekBlock from "@/features/event/grid/calendar/weekblocks/base";
import { PreviewWeekBlockProps } from "@/features/event/grid/calendar/weekblocks/props";

export default function PreviewWeekBlock({ weeks }: PreviewWeekBlockProps) {
  return (
    <BaseWeekBlock
      weeks={weeks}
      getDayProps={() => ({ disableSelect: true })}
    />
  );
}
