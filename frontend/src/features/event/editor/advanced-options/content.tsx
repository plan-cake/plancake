import { GlobeIcon, LinkIcon, TriangleAlertIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import InfoPoint from "@/components/info-point";
import { useEventContext } from "@/core/event/context";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import { AdvancedOptionsProps } from "@/features/event/editor/advanced-options/props";
import {
  MAX_EVENT_CODE_LENGTH,
  VALID_EVENT_CODE_REGEX,
} from "@/features/event/editor/constants";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { cn } from "@/lib/utils/classname";

export default function AdvancedOptionsContent({
  isEditing,
  errors,
}: AdvancedOptionsProps) {
  const {
    state: { customCode, eventRange },
    setTimezone,
    setCustomCode,
    handleError,
  } = useEventContext();

  const checkCodeValidity = (code: string): boolean => {
    if (code.length > MAX_EVENT_CODE_LENGTH) {
      handleError("customCode", MESSAGES.ERROR_EVENT_CODE_LENGTH);
      return false;
    } else if (!VALID_EVENT_CODE_REGEX.test(code)) {
      handleError("customCode", MESSAGES.ERROR_EVENT_CODE_FORMAT);
      return false;
    }
    return true;
  };
  const checkCodeAvailability = useDebouncedCallback(async (code: string) => {
    if (isEditing || !code || errors.customCode) return;

    try {
      await clientPost(ROUTES.event.checkCode, { custom_code: code });
    } catch (e) {
      const error = e as ApiErrorResponse;
      if (error.status === 400) {
        handleError("customCode", MESSAGES.ERROR_EVENT_CODE_TAKEN);
      } else {
        handleError("api", MESSAGES.ERROR_GENERIC);
      }
    }
  }, 500);

  const handleCustomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomCode(newValue);
    if (newValue && checkCodeValidity(newValue)) {
      checkCodeAvailability(newValue);
    }
  };

  const customCodeInfo = (
    <div className="flex flex-col gap-2">
      {isEditing ? (
        <div>The event code cannot be changed after the event is created.</div>
      ) : (
        <>
          <div>You have the option to customize your event link.</div>
          <div>
            For example, the link for custom code{" "}
            <span className="font-bold">breakfast</span> would be:{" "}
            {typeof window === "undefined" ? "" : window.location.host}/
            <span className="font-bold">breakfast</span>
          </div>
          <div>Custom codes are subject to availability.</div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-2 md:w-80">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="timezone-select"
          className="flex items-center gap-2 font-bold"
        >
          <GlobeIcon className="h-4 w-4" strokeWidth={2} />
          Timezone
        </label>
        <div>
          <TimeZoneSelector
            id="timezone-select"
            value={eventRange.timezone}
            onChange={setTimezone}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <label
            htmlFor="custom-code-input"
            className="flex items-center gap-2 font-bold"
          >
            <LinkIcon className="h-4 w-4" strokeWidth={2} />
            {!isEditing && "Custom"} Event Code
          </label>
          <InfoPoint
            title="Custom Event Codes"
            description="More information about custom event codes"
            tooltipContent={
              <div className="max-w-xs p-1">{customCodeInfo}</div>
            }
            drawerContent={customCodeInfo}
            drawerNesting={1}
            className="h-5 w-5 opacity-75"
          />
        </div>
        <input
          id="custom-code-input"
          type="text"
          value={customCode}
          onChange={handleCustomCodeChange}
          placeholder="optional"
          disabled={isEditing}
          className={cn(
            "border-b-1 border-foreground/60 w-full focus:outline-none",
            isEditing && "cursor-not-allowed opacity-50",
            errors.customCode ? "border-error placeholder:text-error" : "",
          )}
        />
        {errors.customCode && (
          <div className="text-error flex items-center gap-1 text-sm">
            <TriangleAlertIcon
              className="inline h-4 w-4 shrink-0"
              strokeWidth={2}
            />
            {errors.customCode}
          </div>
        )}
      </div>
    </div>
  );
}
