import { useEffect } from "react";

import { createEmptyUserAvailability } from "@/core/availability/utils";
import useCalendarGridInfo from "@/features/event/grid/calendar/lib/use-grid";
import InteractiveMonthBlock from "@/features/event/grid/calendar/month-blocks/interactive";
import PreviewMonthBlock from "@/features/event/grid/calendar/month-blocks/preview";
import ResultsMonthBlock from "@/features/event/grid/calendar/month-blocks/results";
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
  setGridDisplayed = () => {},
  availabilities = {},
  numParticipants = 0,
  hoveredSlot,
  setHoveredSlot = () => {},
  userAvailability = createEmptyUserAvailability(),
  onToggleSlot = () => {},
}: GridProps) {
  const isMobile = useCheckMobile();

  const { monthBlocks, error } = useCalendarGridInfo(timeslots);

  const isGridDisplayed = !unselectedRange && !error;
  useEffect(() => {
    setGridDisplayed(isGridDisplayed);
  }, [isGridDisplayed, setGridDisplayed]);

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
        "flex h-full w-full select-none flex-col gap-1",
        !isMobile && "overflow-y-auto",
        mode !== "preview" && "pb-4",
        `bg-${backgroundColor}`,
      )}
      style={{ viewTransitionName: "grid" }}
      id={GRID_ID}
    >
      <div
        className={cn(
          "flex flex-col gap-2 px-2 pb-2",
          mode === "preview" && "cursor-not-allowed",
        )}
        onMouseLeave={() => {
          if (mode === "view") {
            setHoveredSlot(null);
          }
        }}
      >
        {monthBlocks.map((monthBlock, index) => {
          const commonProps = {
            month: monthBlock,
            backgroundColor,
          };

          if (mode === "preview") {
            return <PreviewMonthBlock key={index} {...commonProps} />;
          } else if (mode === "paint") {
            return (
              <InteractiveMonthBlock
                key={index}
                {...commonProps}
                timeslots={timeslots}
                availability={userAvailability}
                onToggle={onToggleSlot}
              />
            );
          } else if (mode === "view") {
            return (
              <ResultsMonthBlock
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
