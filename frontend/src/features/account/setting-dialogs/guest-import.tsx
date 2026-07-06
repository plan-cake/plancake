"use client";

import { ExternalLinkIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";

import EmptyButton from "@/features/button/components/empty";
import Selector from "@/features/selector/components/selector";
import { FormDialog } from "@/features/system-feedback";
import Tooltip from "@/features/system-feedback/tooltip/base";
import { GuestData } from "@/lib/utils/api/types";
import { cn } from "@/lib/utils/classname";

export default function GuestImportDialog({
  guestData,
}: {
  guestData: GuestData;
}) {
  const unresolvedConflicts = guestData.participated_events.some(
    (event) => event.account_display_name !== null,
  );

  return (
    <FormDialog
      type="info"
      title="Guest Import"
      description={"Guest Data Import Review"}
      trigger={<EmptyButton buttonStyle="primary" label="Import" />}
      onSubmit={() => false}
      submitLabel="Confirm"
      submitDisabled={unresolvedConflicts}
    >
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
            const conflict = event.account_display_name !== null;

            return (
              <EventDisplay
                key={event.url_code}
                title={event.title}
                url_code={event.url_code}
                conflict={conflict}
              >
                {conflict ? (
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-1 text-sm">
                      <div className="mx-auto flex-1 text-center text-sm">
                        <p className="opacity-50">Guest</p>
                        <p>{event.guest_display_name}</p>
                      </div>
                      <div className="mx-auto flex-1 text-center text-sm">
                        <p className="opacity-50">Account</p>
                        <p>{event.account_display_name}</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Selector
                        dialogDescription="Resolve the submission conflict"
                        dialogTitle="Resolve Conflict"
                        id={`resolve-conflict-${event.url_code}`}
                        drawerNesting={2}
                        onChange={() => {}}
                        options={[
                          { label: "Keep Guest", value: "guest" },
                          {
                            label: "Keep Account",
                            value: "account",
                          },
                        ]}
                        value={null}
                        placeholder="Resolve Conflict"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">Name: {event.guest_display_name}</p>
                )}
              </EventDisplay>
            );
          })}
        </DataSection>
      </div>
      <div className="text-error flex items-center justify-center gap-1">
        <TriangleAlertIcon className="h-4 w-4 flex-none" />
        Please resolve conflicts.
      </div>
    </FormDialog>
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
