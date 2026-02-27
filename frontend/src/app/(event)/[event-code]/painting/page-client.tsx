"use client";

import { useEffect, useRef, useState } from "react";

import { parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

import Checkbox from "@/components/checkbox";
import HeaderSpacer from "@/components/header-spacer";
import MobileFooterTray from "@/components/mobile-footer-tray";
import { useAvailability } from "@/core/availability/use-availability";
import { EventRange } from "@/core/event/types";
import { useAccount } from "@/features/account/context";
import ActionButton from "@/features/button/components/action";
import LinkButton from "@/features/button/components/link";
import { validateAvailabilityData } from "@/features/event/availability/validate-data";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import { ScheduleGrid } from "@/features/event/grid";
import EventInfoDrawer, { EventInfo } from "@/features/event/info-drawer";
import { RateLimitBanner, useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { SelfAvailability } from "@/lib/utils/api/types";
import { timeslotToISOString } from "@/lib/utils/date-time-format";

export default function ClientPage({
  eventCode,
  eventName,
  eventRange,
  timeslots,
  initialData,
}: {
  eventCode: string;
  eventName: string;
  eventRange: EventRange;
  timeslots: Date[];
  initialData: SelfAvailability | null;
}) {
  const router = useRouter();

  // AVAILABILITY STATE
  const { state, setDisplayName, setTimeZone, toggleSlot } = useAvailability(
    initialData,
    eventRange.type,
  );
  const { displayName, timeZone, userAvailability } = state;

  // TOASTS AND ERROR STATES
  const { addToast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // useEffect(() => {
  //   /**
  //    * Uses a custom media query instead of the useCheckMobile hook because
  //    * this effect should run immediately on mount before rendering anything.
  //    * If we used a hook, there would be a render cycle where the tip
  //    * shows up on mobile before disappearing quickly.
  //    */
  //   const isMobileView = window.matchMedia("(max-width: 768px)").matches;
  //   if (isMobileView) return;

  //   const toastId = addToast(
  //     "info",
  //     "Click once and hold shift to select multiple slots without dragging. Works well if you're on a trackpad!",
  //     {
  //       title: "SHIFT TIP",
  //       isPersistent: true,
  //       localStorageKey: "shift-tip-dismissed",
  //     },
  //   );

  //   return () => removeToast(toastId);
  // }, [addToast, removeToast]);

  const handleNameChange = useDebouncedCallback(async (displayName) => {
    if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: "" }));

    if (displayName === "") {
      setErrors((prev) => ({
        ...prev,
        displayName: MESSAGES.ERROR_NAME_MISSING,
      }));
      return;
    }

    try {
      await clientPost(ROUTES.availability.checkDisplayName, {
        event_code: eventCode,
        display_name: displayName,
      });
      setErrors((prev) => ({ ...prev, displayName: "" }));
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.badRequest) {
        setErrors((prev) => ({
          ...prev,
          displayName: MESSAGES.ERROR_NAME_TAKEN,
        }));
      } else {
        addToast("error", error.formattedMessage);
      }
    }
  }, 300);

  // DEFAULT NAME SETTING
  const [saveDefaultName, setSaveDefaultName] = useState(false);

  // DEFAULT NAME APPLICATION
  // This also accounts for the situation where a user directly opens the painting page
  // instead of coming from the results page.
  const { loginState, accountDetails, login } = useAccount();
  // If editing, don't try to autofill the name
  const nameInitialized = useRef(!!initialData);
  useEffect(() => {
    if (nameInitialized.current) return;
    if (loginState !== "logged_in") return;
    if (!accountDetails || !accountDetails.defaultName) return;

    const newName = accountDetails.defaultName;
    setDisplayName(newName);
    handleNameChange(newName);
    addToast("success", MESSAGES.INFO_NAME_AUTOFILLED, {
      title: "NAME AUTOFILLED",
    });
    nameInitialized.current = true;
  }, [loginState, accountDetails, setDisplayName, addToast, handleNameChange]);

  // SUBMIT AVAILABILITY
  const handleSubmitAvailability = async () => {
    setErrors({}); // reset errors

    const validationErrors = await validateAvailabilityData(state);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach((error) =>
        addToast("error", error),
      );
      return false;
    }

    // Save the default name if checkbox checked
    if (saveDefaultName) {
      if (accountDetails) {
        try {
          await clientPost(ROUTES.account.setDefaultName, {
            display_name: displayName,
          });
          login({
            ...accountDetails,
            defaultName: displayName,
          });
          addToast("success", MESSAGES.SUCCESS_DEFAULT_NAME_SAVED);
        } catch (e) {
          const error = e as ApiErrorResponse;
          addToast("error", error.formattedMessage);
          return false;
        }
      } else {
        addToast("error", MESSAGES.ERROR_GENERIC);
        return false;
      }
    }

    const payload_availability = Array.from(userAvailability).map((iso) => {
      const date = parseISO(iso);
      return timeslotToISOString(date, timeZone, eventRange.type);
    });

    const payload = {
      event_code: eventCode,
      display_name: displayName,
      availability: payload_availability,
      time_zone: timeZone,
    };

    try {
      await clientPost(ROUTES.availability.add, payload);
      router.push(`/${eventCode}`);
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.rateLimited) {
        setErrors((prev) => ({
          ...prev,
          rate_limit: error.formattedMessage || MESSAGES.ERROR_RATE_LIMIT,
        }));
      } else {
        addToast("error", error.formattedMessage);
      }
      return false;
    }
  };

  // BUTTONS
  const cancelButton = (
    <LinkButton
      buttonStyle="transparent"
      label={initialData?.display_name ? "Cancel Edits" : "Cancel"}
      href={`/${eventCode}`}
    />
  );
  const submitButton = (
    <ActionButton
      buttonStyle="primary"
      label={
        initialData?.display_name
          ? "Update Availability"
          : "Submit Availability"
      }
      onClick={handleSubmitAvailability}
      loadOnSuccess
    />
  );

  return (
    <div className="flex flex-col space-y-4 pl-6 pr-6">
      <HeaderSpacer />

      {/* Rate Limit Error */}
      {errors.rate_limit && (
        <RateLimitBanner>{errors.rate_limit}</RateLimitBanner>
      )}

      {/* Header and Button Row */}
      <div className="flex w-full flex-wrap justify-between md:flex-row">
        <div className="flex flex-1 justify-between">
          <h1 className="text-2xl">{eventName}</h1>
          <EventInfoDrawer eventRange={eventRange} timezone={timeZone} />
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {cancelButton}
          {submitButton}
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-12 flex h-fit flex-col gap-4 md:mb-0 md:flex-row">
        {/* Left Panel */}
        <div className="md:top-25 h-fit w-full shrink-0 space-y-4 overflow-y-auto md:sticky md:w-80">
          <div className="space-y-2">
            <div className="w-fit">
              <p
                className={`text-error text-right text-xs ${errors.displayName ? "visible" : "invisible"}`}
              >
                {errors.displayName ? errors.displayName : "Error Placeholder"}
              </p>
              Hi,{" "}
              <input
                required
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  handleNameChange(e.target.value);
                }}
                placeholder="add your name"
                className={`inline-block w-auto border-b bg-transparent px-1 focus:outline-none ${
                  errors.displayName
                    ? "border-error placeholder:text-error"
                    : "border-gray-400"
                }`}
              />
              <br />
              add your availabilities here
            </div>
            {loginState === "logged_in" && !accountDetails!.defaultName && (
              <div className="text-foreground/75">
                <Checkbox
                  label="Save as nickname for autofill"
                  checked={saveDefaultName}
                  onChange={(checked) => setSaveDefaultName(checked)}
                ></Checkbox>
              </div>
            )}
          </div>

          {/* Desktop-only Event Info */}
          <div className="bg-panel hidden rounded-3xl p-6 md:block">
            <EventInfo eventRange={eventRange} timezone={timeZone} />
          </div>

          <div className="bg-panel rounded-3xl p-6 text-sm">
            Displaying event in
            <span className="text-accent ml-1 font-bold">
              <TimeZoneSelector
                id="timezone-select"
                value={timeZone}
                onChange={setTimeZone}
              />
            </span>
          </div>
        </div>

        {/* Right Panel */}
        <ScheduleGrid
          mode="paint"
          isWeekdayEvent={eventRange.type === "weekday"}
          timezone={timeZone}
          onToggleSlot={toggleSlot}
          userAvailability={userAvailability}
          timeslots={timeslots}
        />
      </div>

      {/* This z-index is necessary to avoid the time column overlapping */}
      <div className="z-10">
        <MobileFooterTray buttons={[cancelButton, submitButton]} />
      </div>
    </div>
  );
}
