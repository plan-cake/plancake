import { useState, useEffect, useRef, useCallback, useMemo } from "react";

import { generateDragSlots } from "@/core/availability/utils";
import { TimeSlot } from "@/features/event/date-time-grid/timeblocks/props";

type DragState = {
  startSlot: string | null;
  endSlot: string | null;
  togglingOn: boolean | null;
  lastToggledSlot: string | null;
  lastTogglingState: boolean | null;
};

/**
 * hook to manage the drag-to-select logic for the date/time grid.
 * it includes state, event handlers, and global listeners for both mouse and touch events.
 */
export default function useDateTimeDrag(
  onToggle: (slotIso: string, togglingOn: boolean) => void,
  mode: "paint" | "view" | "preview",
  timeslots: TimeSlot[],
) {
  const [draggedSlots, setDraggedSlots] = useState<Set<string>>(new Set());
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [isShifting, setIsShifting] = useState(false);
  const dragState = useRef<DragState>({
    startSlot: null,
    endSlot: null,
    togglingOn: null,
    lastTogglingState: null,
    lastToggledSlot: null,
  });
  const isDragging = useRef(false);
  const timeslotIsoSet = useMemo(
    () => new Set(timeslots.map((slot) => slot.iso)),
    [timeslots],
  );

  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isDragging.current) {
        if (e.cancelable) e.preventDefault();
      }
    };

    // { passive: false } tells the browser "I might cancel this event, wait for me."
    window.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      window.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  useEffect(() => {
    isDragging.current =
      dragState.current.startSlot !== null ||
      dragState.current.endSlot !== null;
  }, [dragState.current.startSlot, dragState.current.endSlot]);

  // // track shift key state
  // useEffect(() => {
  //   if (mode !== "paint") return;
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === "Shift" && !isDragging.current) {
  //       setIsShifting(true);
  //     }
  //   };
  //   const handleKeyUp = (e: KeyboardEvent) => {
  //     if (e.key === "Shift" && !isDragging.current) {
  //       setIsShifting(false);
  //       setDraggedSlots(new Set());
  //     }
  //   };
  //   window.addEventListener("keydown", handleKeyDown);
  //   window.addEventListener("keyup", handleKeyUp);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //     window.removeEventListener("keyup", handleKeyUp);
  //   };
  // }, [mode]);

  useEffect(() => {
    if (dragState.current.lastToggledSlot === null) {
      setIsShifting(false);
      return;
    }
    if (isShifting && hoveredSlot) {
      setDraggedSlots(
        generateDragSlots(dragState.current.lastToggledSlot!, hoveredSlot),
      );
    }
  }, [hoveredSlot, isShifting]);

  function setDragSlot(slotIso: string) {
    if (!dragState.current.startSlot) {
      dragState.current.startSlot = slotIso;
    }
    dragState.current.endSlot = slotIso;
    // update draggedSlots
    setDraggedSlots(
      generateDragSlots(dragState.current.startSlot, dragState.current.endSlot),
    );
  }

  function resetDragSlots() {
    dragState.current = {
      startSlot: null,
      endSlot: null,
      togglingOn: null,
      lastTogglingState: dragState.current.lastTogglingState,
      lastToggledSlot: dragState.current.lastToggledSlot,
    };
    setDraggedSlots(new Set());
    setHoveredSlot(null);
  }

  // keeps onToggle ref up to date
  const onToggleRef = useRef(onToggle);
  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  // handle stopping drag on mouseup/touchend anywhere
  useEffect(() => {
    const stopDragging = () => {
      for (const slotIso of draggedSlots) {
        if (timeslotIsoSet.has(slotIso)) {
          onToggleRef.current(slotIso, dragState.current.togglingOn!);
        }
      }
      // save last toggled slot for shift-dragging
      if (dragState.current.endSlot) {
        dragState.current.lastTogglingState = dragState.current.togglingOn;
        dragState.current.lastToggledSlot = dragState.current.endSlot;
      }
      resetDragSlots();
    };

    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchend", stopDragging);

    return () => {
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchend", stopDragging);
    };
  }, [draggedSlots, timeslotIsoSet]);

  /* EVENT HANDLERS */

  const handlePointerDown = useCallback(
    (slotIso: string, isDisabled: boolean, toggleState: boolean) => {
      if (mode !== "paint" || isDisabled) return;
      if (isShifting) {
        // take over the shift drag
        dragState.current.startSlot = dragState.current.lastToggledSlot;
        dragState.current.endSlot = slotIso;
        dragState.current.togglingOn = dragState.current.lastTogglingState;
        setDragSlot(slotIso);
      } else {
        setDragSlot(slotIso);
        dragState.current.togglingOn = !toggleState;
      }
    },
    [mode, isShifting],
  );

  const handlePointerEnter = useCallback(
    (slotIso: string, isDisabled: boolean) => {
      if (mode !== "paint" || isDisabled) return;
      setHoveredSlot(slotIso);
      if (!isDragging.current) return;
      setDragSlot(slotIso);
    },
    [mode],
  );

  const handlePointerLeave = useCallback(() => {
    setHoveredSlot(null);
  }, []);

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (mode !== "paint" || !isDragging.current) return;

      // get touchpoint
      const touch = event.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);

      if (target instanceof HTMLElement && target.dataset.slotIso) {
        const currentSlotIso = target.dataset.slotIso;
        setDragSlot(currentSlotIso);
      }
    },
    [mode],
  );

  return {
    onPointerDown: handlePointerDown,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    onTouchMove: handleTouchMove,
    draggedSlots: draggedSlots,
    togglingOn: isShifting
      ? dragState.current.lastTogglingState
      : dragState.current.togglingOn,
    hoveredSlot: hoveredSlot,
  };
}
