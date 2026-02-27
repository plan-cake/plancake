import React, { useState } from "react";

import * as Collapsible from "@radix-ui/react-collapsible";
import {
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { useDebouncedCallback } from "use-debounce";

import { useEventContext } from "@/core/event/context";
import DurationSelector from "@/features/event/components/selectors/duration";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import FormSelectorField from "@/features/selector/components/selector-field";
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
        <div
          className={cn(
            "group flex w-fit min-w-[200px] cursor-pointer items-center gap-2 rounded-full",
          )}
        >
          <ChevronRightIcon
            className={cn(
              "h-6 w-6 transition-transform duration-200",
              "group-hover:bg-accent/25 group-active:bg-accent/40 rounded-full p-1",
              open && "rotate-90",
            )}
          />
          <span className="text-[15px] font-semibold leading-[25px]">
            Advanced Options
          </span>
        </div>
      </Collapsible.Trigger>

      <Collapsible.Content className="collapsible-content mt-2 flex flex-col gap-1">
        <Options {...props} />
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function Options({ isEditing = false, errors }: AdvancedOptionsProps) {
  const {
    state: { customCode, eventRange },
    setTimezone,
    setDuration,
    setCustomCode,
    handleError,
  } = useEventContext();

  const [localCode, setLocalCode] = useState(customCode);

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

    setCustomCode(code);
  }, 500);

  const handleCustomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalCode(newValue);
    checkCodeAvailability(newValue);
  };

  return (
    <>
      <FormSelectorField label="Timezone" htmlFor="timezone-select" isVertical>
        <TimeZoneSelector
          id="timezone-select"
          value={eventRange.timezone}
          onChange={setTimezone}
        />
      </FormSelectorField>

      <FormSelectorField
        label="Intended Duration"
        htmlFor="duration-select"
        isVertical
      >
        <DurationSelector
          id="duration-select"
          value={eventRange.duration}
          onChange={(v) => setDuration((v as number) || 0)}
        />
      </FormSelectorField>

      <label
        htmlFor="custom-code-input"
        className="flex justify-between text-gray-400"
      >
        {!isEditing && "Custom"} Event Code
        {errors.customCode && (
          <ExclamationTriangleIcon className="text-error h-4 w-4" />
        )}
      </label>
      <input
        id="custom-code-input"
        type="text"
        value={localCode}
        onChange={handleCustomCodeChange}
        placeholder="optional"
        disabled={isEditing}
        className={cn(
          "border-b-1 w-full border-gray-400 focus:outline-none",
          !isEditing && "text-accent",
          isEditing && "cursor-not-allowed opacity-50",
          errors.customCode ? "border-error placeholder:text-error" : "",
        )}
      />
    </>
  );
}
