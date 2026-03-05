import { useMemo, useState } from "react";

import { formatInTimeZone, toZonedTime } from "date-fns-tz";

import { MESSAGES } from "@/lib/messages";

/**
 * This hook manages the state and logic for displaying the grid view. It
 * processes the provided timeslots into structured timeblocks, handles
 * pagination, and prepares the data needed for rendering the grid.
 *
 * For more details about each part of the data processing and returned data,
 * please refer to the helper function below.
 *
 * @param timeslots - Pregenerated array of Date objects representing timeslots
 * @param timezone - The timezone string to convert timeslots into
 * @param daysPerPage - Number of days to display per page in the grid
 *
 * @returns:
 * - direction: Direction of pagination (-1 for back, 1 for forward)
 * - paginate: Function to change pages
 * - error: Error message if applicable
 * - FOR THE GRID VIEW FORMAT:
 *    - timeBlocks: Array of processed timeblocks for the visible days
 *    - visibleDays: Array of days to be displayed on the current page
 *    - totalPages: Total number of pages based on daysPerPage
 *    - currentPage: Current active page index
 */
export default function useGridInfo(
  timeslots: Date[],
  timezone: string,
  daysPerPage: number,
  onPaginate: (index: number, pages: number) => void,
) {
  const [[currentPage, direction], setCurrentPage] = useState([0, 0]);

  const data = useMemo(
    () => processTimeslots(timeslots, timezone),
    [timeslots, timezone],
  );

  const view = useMemo(
    () => organizeGridView(data, currentPage, daysPerPage),
    [data, currentPage, daysPerPage],
  );

  const paginate = (newDirection: number) => {
    if (
      (newDirection === -1 && currentPage > 0) ||
      (newDirection === 1 && currentPage < view.totalPages - 1)
    ) {
      setCurrentPage([currentPage + newDirection, newDirection]);
      onPaginate(currentPage + newDirection, view.totalPages);
    }
  };

  return { ...view, currentPage, direction, paginate };
}

/* HELPER FUNCTIONS */

/**
 * Processes the given timeslots into structured timeblocks and converts
 * them to the display timezone, grouped by day for easier reference from
 * grid components.
 *
 * @returns:
 * - timeblocks: Array of timeblocks with start and end hours
 * - days: Array of unique days the timeslots span
 * - slotsByDay: Map of day string to array of timeslots on that day
 */
function processTimeslots(timeslots: Date[], timezone: string) {
  if (!timeslots || timeslots.length === 0) return null;

  const slotsByDay = new Map<
    string,
    { iso: string; hour: number; minute: number }[]
  >();
  const days: { dayKey: string; dayDisplay: string }[] = [];
  const seen = new Set<string>();

  /* GROUP SLOTS BY DAY */
  for (const slot of timeslots) {
    const dayKey = formatInTimeZone(slot, timezone, "yyyy-MM-dd");
    const dayDisplay = formatInTimeZone(slot, timezone, "EEE MMM dd");
    const [hour, minute] = formatInTimeZone(slot, timezone, "HH:mm").split(":");

    if (!seen.has(dayKey)) {
      seen.add(dayKey);
      days.push({ dayKey, dayDisplay });
      slotsByDay.set(dayKey, []);
    }

    slotsByDay.get(dayKey)?.push({
      iso: slot.toISOString(),
      hour: parseInt(hour, 10),
      minute: parseInt(minute, 10),
    });
  }

  /* RAW TIMEBLOCKS */
  const start = toZonedTime(timeslots[0], timezone);
  const end = toZonedTime(timeslots[timeslots.length - 1], timezone);
  const startHour = start.getHours();
  const endHour = end.getHours();

  const timeblocks = [];
  if (endHour < startHour) {
    timeblocks.push({ startHour: 0, endHour: endHour });
    timeblocks.push({ startHour: startHour, endHour: 23 });
  } else {
    timeblocks.push({ startHour: startHour, endHour: endHour });
  }

  return { timeblocks, days, slotsByDay };
}

/**
 * Organizes the processed timeslot data into a view suitable for the grid,
 * applying pagination and preparing timeblocks for the visible days.
 *
 * @returns:
 * - timeBlocks: Array of processed timeblocks for the visible days
 * - visibleDays: Array of days to be displayed on the current page
 * - totalPages: Total number of pages based on daysPerPage
 * - error: Error message if applicable
 */
function organizeGridView(
  data: ReturnType<typeof processTimeslots>,
  currentPage: number,
  daysPerPage: number,
) {
  if (!data) {
    return {
      timeBlocks: [],
      visibleDays: [],
      totalPages: 1,
      error: MESSAGES.ERROR_EVENT_RANGE_INVALID,
    };
  }

  const { days, slotsByDay, timeblocks } = data;

  /* PAGINATION LOGIC */
  const totalPages = Math.max(1, Math.ceil(days.length / daysPerPage));
  const safePage = Math.min(Math.max(0, currentPage), totalPages - 1);
  const startIndex = safePage * daysPerPage;
  const visibleDays = days.slice(startIndex, startIndex + daysPerPage);

  /* PROCESS TIMEBLOCKS */
  const timeBlocks = timeblocks.map((block) =>
    processTimeblock(block, visibleDays, slotsByDay),
  );

  return {
    timeBlocks,
    visibleDays,
    totalPages,
    error: null,
  };
}

/**
 * Generates the metadata for each timeslot and filters a list of timeslots
 * that fall within the given timeblock for the specified visible days. Each
 * timeslot is formatted to include its ISO string, grid coordinates, and base
 * CSS classes for easier reference in the grid.
 *
 * @returns:
 * - startHour: Block start hour
 * - endHour: Block end hour
 * - numQuarterHours: Total number of 15-minute intervals in the block
 * - timeslots: Array of formatted timeslots within the block
 */
function processTimeblock(
  block: { startHour: number; endHour: number },
  visibleDays: { dayKey: string; dayDisplay: string }[],
  slotsByDay: Map<string, { iso: string; hour: number; minute: number }[]>,
) {
  const numQuarterHours = (block.endHour - block.startHour + 1) * 4;
  const blockSlots = visibleDays.flatMap((day, dayIndex) => {
    const dayKey = day.dayKey;
    const daySlots = slotsByDay.get(dayKey) || [];

    return daySlots
      .filter((slot) => {
        const h = slot.hour;
        return h >= block.startHour && h <= block.endHour;
      })
      .map((slot) => {
        const h = slot.hour;
        const m = slot.minute;
        const row = (h - block.startHour) * 4 + Math.floor(m / 15) + 1;

        return {
          iso: slot.iso,
          coords: { row, column: dayIndex + 1 },
          cellClasses: getBaseCellClasses(row, numQuarterHours),
        };
      });
  });

  return {
    ...block,
    numQuarterHours,
    timeslots: blockSlots,
  };
}

/**
 * Determines the base CSS classes for a timeslot cell based on its grid
 * row and total number of quarter hours.
 */
function getBaseCellClasses(
  gridRow: number,
  numQuarterHours: number,
): string[] {
  const cellClasses: string[] = [];
  if (gridRow < numQuarterHours) {
    cellClasses.push("border-b");

    if (gridRow % 4 === 0) {
      cellClasses.push("border-solid border-foreground/75");
    } else {
      cellClasses.push("border-dashed border-foreground/75");
    }
  }
  return cellClasses;
}
