"use client";

import { memo, useState } from "react";

import { TriangleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import MobileFooterIsland from "@/components/mobile-footer-island";
import SegmentedControl from "@/components/segmented-control";
import TextInputField from "@/components/text-input-field";
import { EventProvider, useEventContext } from "@/core/event/context";
import checkUnselectedRange from "@/core/event/lib/unselected-range";
import { EventInformation } from "@/core/event/types";
import ActionButton from "@/features/button/components/action";
import LinkButton from "@/features/button/components/link";
import GridPageDaysSelector from "@/features/event/components/selectors/grid-page-days";
import TimeSelector from "@/features/event/components/selectors/time";
import AdvancedOptions from "@/features/event/editor/advanced-options";
import { MAX_TITLE_LENGTH } from "@/features/event/editor/constants";
import DateRangeSelection from "@/features/event/editor/date-range/selector";
import { EventEditorType } from "@/features/event/editor/types";
import { validateEventData } from "@/features/event/editor/validate-data";
import { ScheduleGrid } from "@/features/event/grid";
import useGridPageDays from "@/features/event/grid/lib/use-page-days";
import HeaderSpacer from "@/features/header/components/header-spacer";
import FormSelectorField from "@/features/selector/components/selector-field";
import { RateLimitBanner } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import submitEvent from "@/lib/utils/api/submit-event";
import { cn } from "@/lib/utils/classname";

type EventEditorProps = {
  type: EventEditorType;
  initialData?: EventInformation;
};

type SegmentedControlOption = "details" | "preview";

const MemoizedScheduleGrid = memo(ScheduleGrid);

export default function EventEditor({ type, initialData }: EventEditorProps) {
  return (
    <EventProvider initialData={initialData}>
      <EventEditorContent type={type} initialData={initialData} />
    </EventProvider>
  );
}

function EventEditorContent({ type, initialData }: EventEditorProps) {
  const {
    state,
    setTitle,
    errors,
    handleError,
    clearAllErrors,
    handleGenericError,
    batchHandleErrors,
    setStartTime,
    setEndTime,
  } = useEventContext();
  const { title, customCode, eventRange, timeslots } = state;
  const {
    gridPageDays,
    gridPageDaysOptions,
    usingMaxGridPageDays,
    setGridPageDays,
  } = useGridPageDays();
  const [gridDisplayed, setGridDisplayed] = useState(false);
  const router = useRouter();

  const [mobileTab, setMobileTab] = useState<SegmentedControlOption>("details");

  // SUBMIT EVENT INFO
  const submitEventInfo = async () => {
    clearAllErrors();

    try {
      const validationErrors = await validateEventData(type, state);
      if (Object.keys(validationErrors).length > 0) {
        batchHandleErrors(validationErrors);
        return false;
      }

      const success = await submitEvent(
        { title, code: customCode, eventRange, timeslots },
        type,
        eventRange.type,
        (code: string) => router.push(`/${code}`),
        handleError,
      );

      return success;
    } catch (error) {
      console.error("Submission failed:", error);
      handleGenericError();
      return false;
    }
  };

  // REUSED COMPONENTS
  const cancelButton = (
    <LinkButton
      buttonStyle="transparent"
      label="Cancel Edits"
      href={`/${initialData?.customCode}`}
    />
  );
  const submitButton = (
    <ActionButton
      buttonStyle="primary"
      label={type === "edit" ? "Update Event" : "Create Event"}
      onClick={submitEventInfo}
      loadOnSuccess
    />
  );
  const grid = (
    <MemoizedScheduleGrid
      mode="preview"
      isWeekdayEvent={eventRange.type === "weekday"}
      unselectedRange={checkUnselectedRange(eventRange)}
      timezone={eventRange.timezone}
      timeslots={timeslots}
      pageDays={gridPageDays}
      useCompactHeader={usingMaxGridPageDays}
      setGridDisplayed={setGridDisplayed}
    />
  );

  return (
    <div className="flex min-h-dvh flex-col space-y-4 pl-6 pr-6">
      <HeaderSpacer />

      {/* Rate Limit Error */}
      {errors.rate_limit && (
        <RateLimitBanner>{errors.rate_limit}</RateLimitBanner>
      )}

      <div className="-mb-1 flex w-full items-center justify-between">
        <div className="mb-4 w-full md:w-1/2">
          <TextInputField
            id={"event-name"}
            type="text"
            label="Event Name"
            value={title}
            onChange={setTitle}
            error={errors.title || errors.api}
            className="text-2xl font-semibold"
            maxLength={{
              length: MAX_TITLE_LENGTH,
              error: MESSAGES.ERROR_EVENT_NAME_LENGTH,
            }}
          />
        </div>
        <div className="hidden gap-2 md:flex">
          {type === "edit" && cancelButton}
          {submitButton}
        </div>
      </div>

      <div
        className={cn(
          "w-full grid-cols-1 gap-y-2",
          mobileTab === "preview" ? "hidden md:grid" : "grid",
          "md:grow md:grid-cols-[auto_1fr] md:grid-rows-[auto_repeat(8,minmax(0,25px))_1fr_25px] md:gap-x-4 md:gap-y-2",
        )}
      >
        <DateRangeSelection editing={type === "edit"} />

        <div className="flex flex-col gap-1">
          <p
            className={`flex items-center gap-2 font-bold md:col-start-1 md:row-start-2 ${errors.timeRange ? "text-error" : ""}`}
          >
            Possible Times
            {errors.timeRange && <TriangleAlertIcon className="h-4 w-4" />}
          </p>
          <div className="flex flex-col gap-2 md:col-start-1 md:row-span-8 md:row-start-3">
            <FormSelectorField label="FROM" htmlFor="from-time-dropdown">
              <TimeSelector
                id="from-time-dropdown"
                value={eventRange.timeRange.from}
                onChange={setStartTime}
                placeholder="Start Time"
              />
            </FormSelectorField>

            <FormSelectorField label="UNTIL" htmlFor="to-time-dropdown">
              <TimeSelector
                id="to-time-dropdown"
                value={eventRange.timeRange.to}
                onChange={setEndTime}
                placeholder="End Time"
              />
            </FormSelectorField>
          </div>
        </div>

        <div className="md:content md:col-start-1 md:row-start-10 md:flex md:max-w-[250px] md:items-end">
          <AdvancedOptions isEditing={type === "edit"} errors={errors} />
        </div>
        <div className="h-16 md:hidden" />
        <div className="hidden flex-1 md:col-start-2 md:row-span-9 md:row-start-2 md:block">
          <div className="relative h-full w-full grow">
            <div className="bg-panel absolute inset-0 flex flex-col justify-between gap-2 rounded-3xl px-2 py-4">
              <div className="min-h-0 flex-1 pr-2">{grid}</div>
              {gridDisplayed && (
                <div className="flex items-center justify-between pl-4 pr-2 text-sm">
                  <p className="opacity-75">
                    This is a preview! You{"'"}ll add your availability later.
                  </p>
                  <div className="flex flex-none items-center gap-2">
                    <p className="opacity-75">Days per page:</p>
                    <GridPageDaysSelector
                      value={gridPageDays}
                      options={gridPageDaysOptions}
                      onChange={setGridPageDays}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex-col gap-4 md:hidden",
          mobileTab === "details" ? "hidden" : "flex",
        )}
      >
        {grid}
        {gridDisplayed && (
          <div className="bg-panel rounded-3xl p-6 text-sm">
            <p>Days per page</p>
            <GridPageDaysSelector
              value={gridPageDays}
              options={gridPageDaysOptions}
              onChange={setGridPageDays}
            />
          </div>
        )}
      </div>

      {/* This z-index is necessary to avoid the time column overlapping */}
      <div className="z-10">
        <MobileFooterIsland
          leftButtons={type === "edit" ? [cancelButton] : undefined}
          rightButtons={[submitButton]}
        >
          <SegmentedControl
            value={mobileTab}
            onChange={setMobileTab}
            options={[
              { label: "Event Details", value: "details" },
              { label: "Grid Preview", value: "preview" },
            ]}
            hidePadding
          />
        </MobileFooterIsland>
      </div>
    </div>
  );
}
