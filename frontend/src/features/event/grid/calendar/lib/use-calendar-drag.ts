import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { parseISO } from "date-fns";
import { format } from "date-fns-tz";

import { dateToISOString } from "@/lib/utils/date-time-format";

type DragState = {
  isDragging: boolean;
  startDay: string | null;
  endDay: string | null;
  draggedDays: Set<string>;
  togglingOn: boolean | null;
};

export default function useCalendarDrag(
  onToggle: (dayString: string, togglingOn: boolean) => void,
  timeslots: Date[],
) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const dragState = useRef<DragState>({
    isDragging: false,
    startDay: null,
    endDay: null,
    draggedDays: new Set<string>(),
    togglingOn: null,
  });
  const dayStringSet = useMemo(
    () => new Set(timeslots.map((d) => format(d, "yyyy-MM-dd"))),
    [timeslots],
  );

  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (dragState.current.isDragging) {
        if (e.cancelable) e.preventDefault();
      }
    };

    // { passive: false } tells the browser "I might cancel this event, wait for me."
    window.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      window.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  const setDragDay = useCallback(
    (day: string) => {
      if (!dragState.current.startDay) {
        dragState.current.startDay = day;
      }
      dragState.current.endDay = day;

      // Get set of days between start and end
      const start =
        dragState.current.startDay < dragState.current.endDay
          ? parseISO(dragState.current.startDay)
          : parseISO(dragState.current.endDay);
      const end =
        dragState.current.startDay < dragState.current.endDay
          ? parseISO(dragState.current.endDay)
          : parseISO(dragState.current.startDay);
      const newDraggedDays = new Set<string>();

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayString = format(d, "yyyy-MM-dd");
        if (dayStringSet.has(dayString)) {
          newDraggedDays.add(dayString);
        }
      }
      dragState.current.draggedDays = newDraggedDays;
    },
    [dayStringSet],
  );

  function resetDrag() {
    dragState.current = {
      isDragging: false,
      startDay: null,
      endDay: null,
      draggedDays: new Set<string>(),
      togglingOn: null,
    };
    setHoveredDay(null);
  }

  useEffect(() => {
    const stopDragging = () => {
      for (const day of dragState.current.draggedDays) {
        if (dayStringSet.has(day)) {
          onToggle(dateToISOString(day), dragState.current.togglingOn!);
        }
      }
      resetDrag();
    };

    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [dragState.current.draggedDays, onToggle, dayStringSet]);

  /* EVENT HANDLERS */

  const handlePointerDown = useCallback(
    (day: string, toggleState: boolean) => {
      dragState.current.isDragging = true;
      setDragDay(day);
      dragState.current.togglingOn = !toggleState;
    },
    [setDragDay],
  );

  const handlePointerEnter = useCallback(
    (day: string) => {
      setHoveredDay(day);
      if (!dragState.current.isDragging) return;
      setDragDay(day);
    },
    [setDragDay],
  );

  const handlePointerLeave = useCallback(() => {
    setHoveredDay(null);
  }, []);

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!dragState.current.isDragging) return;

      const touch = event.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);

      if (target instanceof HTMLElement && target.dataset.dayString) {
        const currentDay = target.dataset.dayString;
        setDragDay(currentDay);
      }
    },
    [setDragDay],
  );

  return {
    draggedDays: dragState.current.draggedDays,
    hoveredDay,
    togglingOn: dragState.current.togglingOn,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
    handleTouchMove,
  };
}
