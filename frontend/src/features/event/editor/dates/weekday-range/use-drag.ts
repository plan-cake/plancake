"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ALL_WEEKDAYS, Weekday } from "@/core/event/types";

export default function useWeekdayRangeDrag({
  selectedDays,
  setDays,
}: {
  selectedDays: Set<Weekday>;
  setDays: (days: Set<Weekday>) => void;
}) {
  const isDragging = useRef(false);
  const [hoveredDay, setHoveredDay] = useState<Weekday | null>(null);
  const [dragState, setDragState] = useState<{
    isEnabling: boolean;
    startDay: Weekday | null;
    endDay: Weekday | null;
  }>({ isEnabling: true, startDay: null, endDay: null });

  const dragRange = useMemo(() => {
    if (!dragState.startDay || !dragState.endDay) return new Set<Weekday>();
    const startIndex = ALL_WEEKDAYS.indexOf(dragState.startDay);
    const endIndex = ALL_WEEKDAYS.indexOf(dragState.endDay);
    const range = new Set<Weekday>();
    const step = startIndex < endIndex ? 1 : -1;
    for (let i = startIndex; i !== endIndex + step; i += step) {
      const day = ALL_WEEKDAYS[i];
      if (
        (dragState.isEnabling && !selectedDays.has(day)) ||
        (!dragState.isEnabling && selectedDays.has(day))
      ) {
        range.add(day);
      }
    }
    return range;
  }, [selectedDays, dragState]);

  const handlePointerDown = (day: Weekday) => {
    let isEnabling = true;
    if (selectedDays.has(day)) {
      isEnabling = false;
    }
    setDragState({ isEnabling, startDay: day, endDay: day });
    isDragging.current = true;
  };

  const handlePointerEnter = (day: Weekday) => {
    setHoveredDay(day);

    if (!isDragging.current) return;

    setDragState((prev) => ({ ...prev, endDay: day }));
  };

  const handlePointerLeave = () => {
    setHoveredDay(null);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;

    // get touchpoint
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (target instanceof HTMLElement && target.dataset.day) {
      const currentDay = target.dataset.day as Weekday;
      setDragState((prev) => ({ ...prev, endDay: currentDay }));
    }
  };

  useEffect(() => {
    const endDrag = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setDragState({ isEnabling: true, startDay: null, endDay: null });
      setHoveredDay(null);

      const newDays = new Set(selectedDays);
      for (const day of dragRange) {
        if (dragState.isEnabling) {
          newDays.add(day);
        } else {
          newDays.delete(day);
        }
      }
      setDays(newDays);
    };

    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [dragRange, dragState.isEnabling, selectedDays, setDays]);

  return {
    hoveredDay,
    dragState: {
      isDragging: isDragging.current,
      isEnabling: dragState.isEnabling,
      dragRange,
    },
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
    handleTouchMove,
  };
}
