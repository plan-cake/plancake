"use client";

import { useMemo, useState } from "react";

import { ExternalLinkIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";

import HeaderSpacer from "@/features/header/components/header-spacer";
import Selector from "@/features/selector/components/selector";
import Tooltip from "@/features/system-feedback/tooltip/base";
import { GuestData } from "@/lib/utils/api/types";
import { cn } from "@/lib/utils/classname";

type AvailabilityImportChoice = "guest" | "account";
type ImportPayload = {
  [url_code: string]: AvailabilityImportChoice;
};

export default function ClientPage({ guestData }: { guestData: GuestData }) {
  const [importPayload, setImportPayload] = useState<{
    [url_code: string]: AvailabilityImportChoice;
  }>(
    guestData.participated_events.reduce((acc, event) => {
      if (event.account_display_name === null) {
        acc[event.url_code] = "guest";
      }
      return acc;
    }, {} as ImportPayload),
  );

  const hasUnresolvedConflicts =
    guestData.participated_events.length !== Object.keys(importPayload).length;
  const conflictedEvents = useMemo(() => {
    return new Set(
      guestData.participated_events
        .filter((event) => event.account_display_name !== null)
        .map((event) => event.url_code),
    );
  }, [guestData.participated_events]);

  const resolveConflict = (
    url_code: string,
    choice: AvailabilityImportChoice | null,
  ) => {
    if (choice === null) return;
    setImportPayload((prev) => ({
      ...prev,
      [url_code]: choice,
    }));
  };

  return (
    <div>
      <HeaderSpacer />
      <div className="text-center">
        <p>Are you sure you want to import this guest data?</p>
        <p>This action cannot be undone.</p>
      </div>

      <div className="flex w-full flex-col gap-6">
        <DataSection title="Events">
          {guestData.created_events.map((event) => (
            <EventDisplay
              key={event.url_code}
              title={event.title}
              url_code={event.url_code}
            />
          ))}
        </DataSection>
        <DataSection title="Availabilities">
          {guestData.participated_events.map((event) => {
            const choice = importPayload[event.url_code] ?? null;
            const hasConflict = conflictedEvents.has(event.url_code);

            return (
              <EventDisplay
                key={event.url_code}
                title={event.title}
                url_code={event.url_code}
                conflict={hasConflict && choice === null}
              >
                {hasConflict ? (
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-1 text-sm">
                      <ConflictOption
                        label="Guest"
                        name={event.guest_display_name}
                        selected={choice !== null ? choice === "guest" : null}
                      />
                      <ConflictOption
                        label="Account"
                        name={event.account_display_name!}
                        selected={choice !== null ? choice === "account" : null}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Selector
                        dialogDescription="Resolve the submission conflict"
                        dialogTitle="Resolve Conflict"
                        id={`resolve-conflict-${event.url_code}`}
                        drawerNesting={2}
                        onChange={(choice) =>
                          resolveConflict(event.url_code, choice)
                        }
                        options={[
                          { label: "Keep Guest", value: "guest" },
                          {
                            label: "Keep Account",
                            value: "account",
                          },
                        ]}
                        value={choice}
                        placeholder="Resolve Conflict"
                      />
                    </div>
                    {choice !== null && (
                      <div className="mt-1 text-center text-xs opacity-50">
                        The other submission will be deleted.
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">Name: {event.guest_display_name}</p>
                )}
              </EventDisplay>
            );
          })}
        </DataSection>
      </div>
      {hasUnresolvedConflicts && (
        <div className="text-error flex items-center justify-center gap-1">
          <TriangleAlertIcon className="h-4 w-4 flex-none" />
          Please resolve conflicts.
        </div>
      )}
    </div>
  );
}

function DataSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex w-full flex-col gap-2 rounded-3xl p-2">
      <div className="text-center text-lg font-bold">{title}</div>
      {children}
    </div>
  );
}

function EventDisplay({
  title,
  url_code,
  conflict,
  children,
}: {
  title: string;
  url_code: string;
  conflict?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-panel flex flex-col rounded-2xl px-3 py-2">
      <EventHeader title={title} url_code={url_code} conflict={conflict} />
      {children}
    </div>
  );
}

function EventHeader({
  title,
  url_code,
  conflict,
}: {
  title: string;
  url_code: string;
  conflict?: boolean;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className={cn("flex items-center gap-1", conflict && "text-error")}>
        {conflict && <TriangleAlertIcon className="h-4 w-4 flex-none" />}
        <p className="font-bold">{title}</p>
      </div>
      <Tooltip content="Opens in a new tab">
        <Link
          href={`/${url_code}`}
          className={cn(
            "flex items-center gap-1",
            "opacity-50 hover:opacity-75 active:opacity-100",
          )}
          target="_blank"
        >
          View
          <ExternalLinkIcon className="h-4 w-4 flex-none" />
        </Link>
      </Tooltip>
    </div>
  );
}

function ConflictOption({
  label,
  name,
  selected,
}: {
  label: string;
  name: string;
  selected: boolean | null;
}) {
  return (
    <div
      className={cn(
        "flex-1 text-center text-sm",
        selected === true ? "font-bold" : "",
        selected === false ? "line-through opacity-50" : "",
      )}
    >
      <p className="opacity-50">{label}</p>
      <p>{name}</p>
    </div>
  );
}
