import React, { useState } from "react";

import * as Collapsible from "@radix-ui/react-collapsible";
import {
  ChevronRightIcon,
  GlobeIcon,
  LinkIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import InfoPoint from "@/components/info-point";
import { useEventContext } from "@/core/event/context";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import ShortcutTrigger from "@/features/system-feedback/hotkeys/components/shortcut-trigger";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { cn } from "@/lib/utils/classname";

type AdvancedOptionsProps = {
  isEditing?: boolean;
  errors: Record<string, string>;
};

export default function AdvancedOptions(props: AdvancedOptionsProps) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <ShortcutTrigger
          hotkey="a"
          onAction={() => setOpen(!open)}
          tooltipSide="right"
          className="w-fit"
        >
          <div
            className={cn(
              "group flex w-fit cursor-pointer items-center gap-2 rounded-full",
              "bg-panel p-2 pr-4",
            )}
          >
            <div
              className={cn(
                "transition-transform duration-200",
                "group-hover:bg-accent/25 group-active:bg-accent/40 rounded-full p-1",
                open && "rotate-90",
              )}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </div>
            <span>Advanced Options</span>
          </div>
        </ShortcutTrigger>
      </Collapsible.Trigger>

      <Collapsible.Content className="collapsible-content mt-2 flex flex-col gap-2">
        <Options {...props} />
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function Options({ isEditing = false, errors }: AdvancedOptionsProps) {
  const {
    state: { customCode, eventRange },
    setTimezone,
    setCustomCode,
    handleError,
  } = useEventContext();
  const checkCodeAvailability = useDebouncedCallback(async (code: string) => {
    if (isEditing || !code) return;

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
    checkCodeAvailability(newValue);
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
            <span className="underline">
              {typeof window === "undefined" ? "" : window.location.host}/
              <span className="font-bold">breakfast</span>
            </span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="timezone-select"
          className="flex items-center gap-2 font-bold"
        >
          <GlobeIcon className="h-4 w-4" strokeWidth={2} />
          Timezone
        </label>
        <ShortcutTrigger
          hotkey="z"
          selector="#timezone-select"
          tooltipSide="right"
        >
          <TimeZoneSelector
            id="timezone-select"
            value={eventRange.timezone}
            onChange={setTimezone}
            useShortcut={true}
          />
        </ShortcutTrigger>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
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
                <div className="max-w-3xs p-1">{customCodeInfo}</div>
              }
              drawerContent={customCodeInfo}
              className="h-5 w-5 opacity-75"
            />
          </div>
          {errors.customCode && (
            <TriangleAlertIcon className="text-error h-4 w-4" strokeWidth={2} />
          )}
        </div>
        <ShortcutTrigger hotkey="c" tooltipSide="right" disabled={isEditing}>
          <input
            id="custom-code-input"
            type="text"
            value={customCode}
            onChange={handleCustomCodeChange}
            placeholder="optional"
            disabled={isEditing}
            className={cn(
              "border-b-1 border-foreground/60 w-full focus:outline-none",
              !isEditing && "text-accent-text",
              isEditing && "cursor-not-allowed opacity-50",
              errors.customCode ? "border-error placeholder:text-error" : "",
            )}
          />
        </ShortcutTrigger>
      </div>
    </>
  );
}
