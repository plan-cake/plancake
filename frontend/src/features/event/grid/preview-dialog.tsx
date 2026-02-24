"use client";

import { useCallback, useEffect, useState } from "react";

import { EnterFullScreenIcon, Cross2Icon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

import { EventRange } from "@/core/event/types";
import ActionButton from "@/features/button/components/action";
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
          "bg-panel flex flex-col overflow-hidden rounded-3xl border border-transparent",
          isOpen
            ? "fixed inset-0 z-50 m-auto h-[85vh] w-[85vw] p-8"
            : "absolute inset-0 h-full w-full pb-4 pl-2 pr-4 pt-4",
        )}
      >
        <motion.div
          layout
          className="flex shrink-0 items-center justify-end space-x-2 px-4"
        >
          <p className="">Grid Preview</p>
          {isOpen ? (
            <div>
              <ActionButton
                buttonStyle="semi-transparent"
                icon={<Cross2Icon />}
                onClick={() => {
                  closeDialog();
                  return true;
                }}
                className="bg-transparent p-1.5"
                aria-label="Close Preview"
              />
            </div>
          ) : (
            <div>
              <ActionButton
                buttonStyle="semi-transparent"
                icon={<EnterFullScreenIcon />}
                onClick={() => {
                  setIsOpen(!isOpen);
                  return true;
                }}
                className="bg-transparent p-1.5"
                aria-label="Open Preview"
              />
            </div>
          )}
        </motion.div>
        {isOpen ? (
          <motion.div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="min-h-0 w-full flex-1">
              <ScheduleGrid
                mode="preview"
                disableSelect
                isWeekdayEvent={eventRange.type === "weekday"}
                timezone={timezone}
                timeslots={timeslots}
              />
            </div>
            <div className="flex shrink-0 flex-col pt-2 md:flex-row md:items-center md:justify-between">
              <label
                htmlFor="timezone-select"
                className="flex items-center text-sm md:ml-[50px]"
              >
                See event in{" "}
                <span className="text-accent ml-1 font-bold">
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
          <motion.div className="min-h-0 flex-1 grow space-y-4">
            <ScheduleGrid
              mode="preview"
              disableSelect
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
