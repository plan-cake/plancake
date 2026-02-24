"use client";

import { useCallback, useEffect, useState } from "react";

import { EnterFullScreenIcon, Cross2Icon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

import { EventRange } from "@/core/event/types";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import ScheduleGrid from "@/features/event/grid/grid";
import { cn } from "@/lib/utils/classname";
import { findTimezoneLabel } from "@/lib/utils/date-time-format";

interface GridPreviewDialogProps {
  eventRange: EventRange;
  timeslots: Date[];
}

export default function GridPreviewDialog({
  eventRange,
  timeslots,
}: GridPreviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timezone, setTimezone] = useState(eventRange.timezone);

  useEffect(() => {
    setTimezone(eventRange.timezone);
  }, [eventRange.timezone]);

  const handleTZChange = (newTZ: string | number) => {
    setTimezone(newTZ.toString());
  };

  // Close dialog on Escape key
  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setTimezone(eventRange.timezone);
  }, [eventRange.timezone]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeDialog();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, eventRange.timezone, closeDialog]);

  return (
    <div className="relative h-screen grow md:h-full md:w-full">
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-700/40"
          onClick={() => {
            setIsOpen(false);
            setTimezone(eventRange.timezone);
          }}
        />
      )}
      <motion.div
        layout
        className={cn(
          "bg-panel flex flex-col space-y-4 overflow-hidden rounded-3xl border border-transparent",
          isOpen
            ? "fixed inset-0 z-50 m-auto h-[85vh] w-[85vw] p-8"
            : "absolute inset-0 h-full w-full pb-4 pl-2 pr-4 pt-4",
        )}
      >
        <motion.div
          layout
          className="mr-4 flex items-center justify-end space-x-2"
        >
          <p className="text-sm font-medium">Grid Preview</p>
          {isOpen ? (
            <Cross2Icon
              className="hover:text-accent hover:bg-accent/25 active:bg-accent/40 h-6 w-6 cursor-pointer rounded-full p-1"
              onClick={() => closeDialog()}
            />
          ) : (
            <EnterFullScreenIcon
              className="hover:text-accent hover:bg-accent/25 active:bg-accent/40 h-6 w-6 cursor-pointer rounded-full p-1"
              onClick={() => setIsOpen(!isOpen)}
            />
          )}
        </motion.div>
        {isOpen ? (
          <motion.div className="flex h-[85%] grow flex-col space-y-4">
            <ScheduleGrid
              mode="preview"
              isWeekdayEvent={eventRange.type === "weekday"}
              disableSelect
              timezone={timezone}
              timeslots={timeslots}
            />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <label
                htmlFor="timezone-select"
                className="flex items-center text-sm md:ml-[50px]"
              >
                See event in{" "}
                <span className="text-accent-text ml-1 font-bold">
                  <TimeZoneSelector
                    id="timezone-select"
                    value={timezone}
                    onChange={handleTZChange}
                  />
                </span>
              </label>
              <label className="text-sm md:mr-[20px]">
                Original Event in{" "}
                <span className="text-accent font-bold">
                  {findTimezoneLabel(eventRange.timezone)}
                </span>
              </label>
            </div>
          </motion.div>
        ) : (
          <motion.div className="h-full grow space-y-4">
            <ScheduleGrid
              mode="preview"
              disableSelect={true}
              isWeekdayEvent={eventRange.type === "weekday"}
              timezone={eventRange.timezone}
              timeslots={timeslots}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
