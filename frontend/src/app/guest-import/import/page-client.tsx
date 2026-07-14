"use client";

import { useMemo, useState } from "react";

import { ExternalLinkIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import MobileFooterIsland from "@/components/mobile-footer-island";
import ActionButton from "@/features/button/components/action";
import LinkButton from "@/features/button/components/link";
import HeaderSpacer from "@/features/header/components/header-spacer";
import Selector from "@/features/selector/components/selector";
import { Banner, useToast } from "@/features/system-feedback";
import Tooltip from "@/features/system-feedback/tooltip/base";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { GuestData } from "@/lib/utils/api/types";
import { cn } from "@/lib/utils/classname";

type AvailabilityImportChoice = "guest" | "account";
type ImportPayload = {
  [public_id: string]: AvailabilityImportChoice;
};

export default function ClientPage({ guestData }: { guestData: GuestData }) {
  const { addToast } = useToast();
  const router = useRouter();

  const [importPayload, setImportPayload] = useState<{
    [public_id: string]: AvailabilityImportChoice;
  }>(
    guestData.participated_events.reduce((acc, event) => {
      if (event.account_display_name === null) {
        acc[event.public_id] = "guest";
      }
      return acc;
    }, {} as ImportPayload),
  );

  const unresolvedConflicts =
    guestData.participated_events.length - Object.keys(importPayload).length;
  const conflictedEvents = useMemo(() => {
    return new Set(
      guestData.participated_events
        .filter((event) => event.account_display_name !== null)
        .map((event) => event.public_id),
    );
  }, [guestData.participated_events]);

  const resolveConflict = (
    public_id: string,
    choice: AvailabilityImportChoice,
  ) => {
    setImportPayload((prev) => ({
      ...prev,
      [public_id]: choice,
    }));
  };

  const submitImport = async () => {
    try {
      await clientPost(ROUTES.guestImport.importData, {
        availability_choices: importPayload,
      });
      addToast("success", "Guest data imported successfully.");
      router.push("/dashboard");
    } catch {
      addToast(
        "error",
        "Something went wrong with your request. Please refresh the page and try again.",
      );
    }
  };

  const cancelButton = (
    <LinkButton
      buttonStyle="transparent"
      label="Cancel"
      href="/settings/guest-import"
    />
  );

  const importButton = (
    <ActionButton
      buttonStyle="primary"
      label="Import Data"
      onClick={submitImport}
      disabled={unresolvedConflicts > 0}
      tooltip={
        unresolvedConflicts > 0
          ? "Please resolve conflicts before importing."
          : undefined
      }
    />
  );

  const actionText = (
    <p className="text-center font-semibold">
      Are you sure you want to import this guest data? This action cannot be
      undone.
    </p>
  );

  const noneText = (
    <div className="p-2 text-center italic opacity-50">None</div>
  );

  return (
    <div className="flex flex-col gap-4 px-6 pb-4">
      <HeaderSpacer />
      <div className="flex justify-between gap-2">
        <h1 className="text-2xl font-bold">Guest Import</h1>
        <div className="hidden gap-2 md:flex">
          {cancelButton}
          {importButton}
        </div>
      </div>
      <h2 className="hidden text-lg md:block">{actionText}</h2>
      <div className="flex flex-col gap-4 md:flex-row">
        <DataSection title="Events">
          {guestData.created_events.length === 0 && noneText}
          {guestData.created_events.map((event) => (
            <EventDisplay
              key={event.public_id}
              title={event.title}
              url_code={event.url_code}
            />
          ))}
        </DataSection>
        <DataSection title="Availabilities">
          {unresolvedConflicts > 0 && (
            <Banner
              type="error"
              title={`${unresolvedConflicts} Conflict${unresolvedConflicts !== 1 ? "s" : ""} Found`}
            >
              Conflicts occur when you{"'"}ve added availability to the same
              event both as a guest and from your account. You must{" "}
              <span className="font-bold">choose which submission to keep</span>{" "}
              when resolving each conflict.
            </Banner>
          )}

          {guestData.participated_events.length === 0 && noneText}

          {guestData.participated_events.map((event) => {
            const choice = importPayload[event.public_id] ?? null;
            const hasConflict = conflictedEvents.has(event.public_id);

            return (
              <EventDisplay
                key={event.public_id}
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
                        id={`resolve-conflict-${event.public_id}`}
                        onChange={(choice) =>
                          resolveConflict(event.public_id, choice)
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
                        The {choice === "guest" ? "account" : "guest"}{" "}
                        submission will be deleted.
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
      <MobileFooterIsland
        leftButtons={[cancelButton]}
        rightButtons={[importButton]}
      >
        {unresolvedConflicts > 0 ? (
          <div className="text-error flex items-center justify-center gap-1 font-bold">
            <TriangleAlertIcon className="h-4 w-4 flex-none" strokeWidth={2} />
            Please resolve conflicts.
          </div>
        ) : (
          actionText
        )}
      </MobileFooterIsland>
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
    <div className="bg-panel flex h-fit w-full flex-col gap-2 rounded-3xl p-2">
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
  url_code: string | null;
  conflict?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-background flex flex-col rounded-2xl px-3 py-2">
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
  url_code: string | null;
  conflict?: boolean;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className={cn("flex items-center gap-1", conflict && "text-error")}>
        {conflict && (
          <TriangleAlertIcon className="h-4 w-4 flex-none" strokeWidth={2} />
        )}
        <p className="font-bold">{title}</p>
      </div>
      {url_code && (
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
      )}
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
