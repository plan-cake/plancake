import { createEmptyUserAvailability } from "@/core/availability/utils";
import { ALL_WEEKDAYS } from "@/core/event/types";
import useCalendarGridInfo from "@/features/event/grid/calendar/lib/use-grid";
import InteractiveWeekBlock from "@/features/event/grid/calendar/weekblocks/interactive";
import PreviewWeekBlock from "@/features/event/grid/calendar/weekblocks/preview";
import ResultsWeekBlock from "@/features/event/grid/calendar/weekblocks/results";
import { GRID_ID } from "@/features/event/grid/constants";
import GridMessage from "@/features/event/grid/grid-message";
import { GridProps } from "@/features/event/grid/grid-props";
import { getHighestMatchCount } from "@/features/event/results/lib/utils";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { MESSAGES } from "@/lib/messages";
import { cn } from "@/lib/utils/classname";

export default function CalendarGrid({
  mode,
  timeslots,
  backgroundColor,
  unselectedRange = false,
  availabilities = {},
  numParticipants = 0,
  hoveredSlot,
  setHoveredSlot = () => {},
  userAvailability = createEmptyUserAvailability(),
  onToggleSlot = () => {},
}: GridProps) {
  const isMobile = useCheckMobile();

  const { weekBlocks, error } = useCalendarGridInfo(timeslots);

  if (unselectedRange) {
    return (
      <GridMessage
        error={false}
        message={MESSAGES.INFO_UNSELECTED_CALENDAR_RANGE}
      />
    );
  }

  if (error) {
    return <GridMessage error={true} message={error} />;
  }

  return (
    <div
      className={cn(
        "flex w-full select-none flex-col gap-1",
        !isMobile && "overflow-y-auto",
        mode === "preview" && "pb-6",
        `bg-${backgroundColor}`,
      )}
      style={{ viewTransitionName: "grid" }}
      id={GRID_ID}
    >
      <div
        className={cn(
          "top-(--header-height) sticky px-2 md:top-0",
          "h-6.25 z-10 flex w-full",
          `bg-${backgroundColor}`,
        )}
      >
        {ALL_WEEKDAYS.map((day, index) => {
          return (
            <div
              key={index}
              className="flex h-full w-full items-center justify-center text-sm"
            >
              {day}
            </div>
          );
        })}
      </div>
      <div
        className={cn(
          "flex flex-col gap-4 p-2",
          mode === "preview" && "cursor-not-allowed",
        )}
        onMouseLeave={() => {
          if (mode === "view") {
            setHoveredSlot(null);
          }
        }}
      >
        {weekBlocks.map((weekBlock, index) => {
          const commonProps = {
            weeks: weekBlock,
            hasNext: index < weekBlocks.length - 1,
            hasPrev: index > 0,
            backgroundColor,
          };

          if (mode === "preview") {
            return <PreviewWeekBlock key={index} {...commonProps} />;
          } else if (mode === "paint") {
            return (
              <InteractiveWeekBlock
                key={index}
                {...commonProps}
                timeslots={timeslots}
                availability={userAvailability}
                onToggle={onToggleSlot}
              />
            );
          } else if (mode === "view") {
            return (
              <ResultsWeekBlock
                key={index}
                {...commonProps}
                hoveredDay={hoveredSlot}
                availabilities={availabilities}
                numParticipants={numParticipants}
                highestMatchCount={getHighestMatchCount(availabilities)}
                onHoverDay={setHoveredSlot}
              />
            );
          }
        })}
      </div>
    </div>
  );
}
