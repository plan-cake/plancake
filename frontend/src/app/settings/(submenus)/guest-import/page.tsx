import { CornerDownRightIcon, TriangleAlertIcon } from "lucide-react";

import LinkButton from "@/features/button/components/link";
import { Banner } from "@/features/system-feedback";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { serverGet } from "@/lib/utils/api/server-fetch";
import { GuestData } from "@/lib/utils/api/types";
import { cn } from "@/lib/utils/classname";

export default async function Page() {
  let guestData: GuestData | null = null;
  try {
    guestData = await serverGet(ROUTES.guestImport.getData);
  } catch {
    // Do nothing, keep guestData as null to indicate an error occurred
  }

  const guestDataFound =
    guestData !== null &&
    (guestData?.created_events.length > 0 ||
      guestData?.participated_events.length > 0);
  const createdEvents = guestData?.created_events ?? [];
  const participatedEvents = guestData?.participated_events ?? [];
  const conflictCount =
    guestData?.participated_events.filter(
      (event) => event.account_display_name !== null,
    ).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-panel flex flex-col gap-4 rounded-3xl border-none p-6 md:p-8">
        <div>
          <h2 className="text-lg font-bold">Guest Import</h2>
          <p className="mt-1 text-sm leading-tight opacity-75">
            If you created events or submitted availability while not signed in,
            you can transfer that data to your account here.
          </p>
        </div>

        {guestDataFound ? (
          <>
            <div>
              <div className="font-semibold">
                Guest data found on this browser:
              </div>
              <div
                className={cn(
                  "text-sm",
                  createdEvents.length === 0 && "opacity-50",
                )}
              >
                • {createdEvents.length} event
                {createdEvents.length !== 1 ? "s" : ""} that you created
              </div>
              <div
                className={cn(
                  "text-sm",
                  participatedEvents.length === 0 && "opacity-50",
                )}
              >
                • {participatedEvents.length} event
                {participatedEvents.length !== 1 ? "s" : ""} that you added your
                availability to
              </div>
              {conflictCount > 0 && (
                <div className="text-error ml-3 flex items-center gap-2 text-sm">
                  <CornerDownRightIcon className="h-4 w-4 flex-none" />
                  {conflictCount} conflict{conflictCount !== 1 ? "s" : ""}
                </div>
              )}
            </div>
            {conflictCount > 0 && (
              <Banner
                type="info"
                title={`${conflictCount} Conflict${conflictCount !== 1 ? "s" : ""} Found`}
              >
                Conflicts occur when you{"'"}ve added availability to the same
                event both as a guest and from your account. You can{" "}
                <span className="font-bold">
                  choose which submission to keep
                </span>{" "}
                in the next step when resolving each conflict, and the other
                will be deleted.
              </Banner>
            )}
            <LinkButton
              buttonStyle="primary"
              label="Review and Import"
              href="/settings/guest-import/review"
              className="w-fit"
            />
          </>
        ) : guestData === null ? (
          <div className="flex items-center gap-2 opacity-75">
            <TriangleAlertIcon className="h-5 w-5 flex-none" />
            Something went wrong trying to fetch guest data. Please try again
            later.
          </div>
        ) : (
          <div className="opacity-75">No guest data found.</div>
        )}
      </div>
    </div>
  );
}
