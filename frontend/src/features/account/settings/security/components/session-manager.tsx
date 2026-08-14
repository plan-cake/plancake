"use client";

import { startTransition, useOptimistic, useRef, useState } from "react";

import * as Collapsible from "@radix-ui/react-collapsible";
import { toZonedTime } from "date-fns-tz";
import {
  ChevronDownIcon,
  CircleQuestionMark,
  Laptop2Icon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react";

import { removeSession } from "@/features/account/settings/security/remove-session";
import ActionButton from "@/features/button/components/action";
import { ConfirmationDialog, useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import { ActiveSessionList, type ActiveSession } from "@/lib/utils/api/types";
import { cn } from "@/lib/utils/classname";
import { formatTimeAgo } from "@/lib/utils/date-time-format";

export default function SessionManager({
  sessions,
}: {
  sessions: ActiveSessionList;
}) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [optimisticSessions, removeOptimisticSession] = useOptimistic(
    sessions,
    (state, sessionToRemove: string) => {
      return {
        current_session: state.current_session,
        other_sessions: state.other_sessions.filter(
          (s) => s.public_id !== sessionToRemove,
        ),
      };
    },
  );

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const sessionToRemove = useRef<string | null>(null);
  const { addToast } = useToast();

  const handleRemoveSession = async (publicId: string) => {
    // Immediate UI update
    startTransition(() => {
      removeOptimisticSession(publicId);
    });

    // Server Action
    const result = await removeSession(publicId);

    if (!result.success) {
      addToast("error", result.error || MESSAGES.ERROR_GENERIC);
    } else {
      addToast("success", MESSAGES.SUCCESS_SESSION_REMOVE);
    }
  };

  const onRemoveSession = (publicId: string) => {
    sessionToRemove.current = publicId;
    setConfirmationOpen(true);
  };

  return (
    <div className="bg-panel flex flex-col gap-4 rounded-3xl border-none p-6 md:p-8">
      <div>
        <h2 className="text-lg font-bold">Active Sessions</h2>
        <p className="mt-1 text-sm leading-tight opacity-75">
          These devices have access to your account. If there are any you don
          {"'"}t recognize, remove them and change your password.
        </p>
      </div>

      <Session
        session={optimisticSessions.current_session}
        userTz={userTimeZone}
      />
      <div className="bg-foreground/10 h-px w-full" />
      <div className="flex flex-col gap-2">
        {optimisticSessions.other_sessions.map((session) => (
          <Session
            key={session.public_id}
            session={session}
            userTz={userTimeZone}
            onRemove={() => {
              onRemoveSession(session.public_id);
            }}
          />
        ))}
      </div>

      <ConfirmationDialog
        type="delete"
        autoClose={true}
        title="Remove Session"
        description="Are you sure you want to log out of this device?"
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        onConfirm={() => {
          if (!sessionToRemove.current) return false;
          handleRemoveSession(sessionToRemove.current);
          return true;
        }}
      />
    </div>
  );
}

function Session({
  session,
  userTz,
  onRemove,
}: {
  session: ActiveSession;
  userTz: string;
  onRemove?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const lastUsedLocal = toZonedTime(new Date(session.last_used + "Z"), userTz);
  const lastUsedSecondsAgo = (Date.now() - lastUsedLocal.getTime()) / 1000;

  const createdAtLocal = toZonedTime(
    new Date(session.created_at + "Z"),
    userTz,
  );

  return (
    <div className="bg-background w-full rounded-3xl p-2">
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        <Collapsible.Trigger
          className={
            "group flex w-full cursor-pointer justify-between gap-2 text-left"
          }
        >
          <div className="flex gap-2">
            <div
              className={cn(
                "bg-panel h-fit rounded-full p-2",
                session.is_current && "bg-accent/50 text-accent-text",
              )}
            >
              {session.device_type === "desktop" ? (
                <Laptop2Icon className="h-5 w-5" />
              ) : session.device_type === "smartphone" ? (
                <SmartphoneIcon className="h-5 w-5" />
              ) : session.device_type === "tablet" ? (
                <TabletIcon className="h-5 w-5" />
              ) : (
                <CircleQuestionMark className="h-5 w-5" />
              )}
            </div>

            <div className="flex flex-col items-start justify-between">
              <div className="text-sm font-semibold">
                {!session.os_name && !session.client_name
                  ? "Unknown"
                  : (session.os_name || "Unknown Device") +
                    " • " +
                    (session.client_name || "Unknown Browser")}
              </div>
              <div className="text-xs opacity-75">
                {session.is_current
                  ? "This Session"
                  : `Last used ${formatTimeAgo(lastUsedSecondsAgo)}`}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "group-hover:bg-accent/25 group-active:bg-accent/40",
              "m-1 h-fit rounded-full p-1",
            )}
          >
            <div
              className={cn(
                "transition-transform duration-200",
                isOpen && "rotate-x-180",
              )}
            >
              <ChevronDownIcon className="h-5 w-5" />
            </div>
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content className="collapsible-content">
          <div className="mt-2 flex flex-col gap-2 pl-2 md:flex-row md:items-end md:justify-between">
            <div className="text-sm">
              {session.os_name && session.os_version && (
                <p>
                  {session.os_name} {session.os_version}
                </p>
              )}
              {session.client_name && session.client_version && (
                <p>
                  {session.client_name} {session.client_version}
                </p>
              )}
              <p className="opacity-75">
                Logged in on{" "}
                {createdAtLocal.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
            </div>
            {onRemove && (
              <ActionButton
                buttonStyle="danger"
                label="Remove"
                className="mx-auto w-fit md:mx-0"
                onClick={onRemove}
              />
            )}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}
