"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function useDateRangeDrag({
  selectedDates,
  setDates,
}: {
  selectedDates: Set<string>;
  setDates: (dates: Set<string>) => void;
}) {
  const isDragging = useRef(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    isEnabling: boolean;
    startDate: Date | null;
    endDate: Date | null;
  }>({ isEnabling: true, startDate: null, endDate: null });

  const getDateString = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const dragRange = useMemo(() => {
    if (!dragState.startDate || !dragState.endDate) return new Set<string>();
    const start =
      dragState.startDate < dragState.endDate
        ? dragState.startDate
        : dragState.endDate;
    const end =
      dragState.startDate > dragState.endDate
        ? dragState.startDate
        : dragState.endDate;

    const range = new Set<string>();
    const currentDate = new Date(start);
    while (currentDate <= end) {
      range.add(getDateString(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return range;
  }, [dragState]);

  const handlePointerDown = (date: Date) => {
    let isEnabling = true;
    if (selectedDates.has(getDateString(date))) {
      isEnabling = false;
    }
    setDragState({ isEnabling, startDate: date, endDate: date });
    isDragging.current = true;
  };

  const handlePointerEnter = (date: Date) => {
    setHoveredDate(getDateString(date));

    if (!isDragging.current) return;

    setDragState((prev) => ({ ...prev, endDate: date }));
  };

  const handlePointerLeave = () => {
    setHoveredDate(null);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;

    // get touchpoint
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (target instanceof HTMLElement && target.dataset.day) {
      const currentDay = target.dataset.day;
      setDragState((prev) => ({ ...prev, endDate: new Date(currentDay) }));
    }
  };

  useEffect(() => {
    const endDrag = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setHoveredDate(null);

      const newDates = new Set(selectedDates);
      for (const dateString of dragRange) {
        if (dragState.isEnabling) {
          newDates.add(dateString);
        } else {
          newDates.delete(dateString);
        }
      }
      setDates(newDates);
    };

    window.addEventListener("pointerup", endDrag);

    return () => {
      window.removeEventListener("pointerup", endDrag);
    };
  }, [dragRange, dragState.isEnabling, selectedDates, setDates]);

  return {
    hoveredDate,
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
