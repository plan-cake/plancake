import { TriangleAlertIcon } from "lucide-react";

import LinkButton from "@/features/button/components/link";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { serverGet } from "@/lib/utils/api/server-fetch";
import { GuestDataSummary } from "@/lib/utils/api/types";
import { cn } from "@/lib/utils/classname";

export default async function Page() {
  let guestSummary: GuestDataSummary | null = null;
  try {
    guestSummary = await serverGet(ROUTES.guestImport.getSummary);
  } catch {
    // Do nothing, keep guestSummary as null to indicate an error occurred
  }

  const guestSummaryFound =
    guestSummary !== null &&
    (guestSummary?.created_events > 0 || guestSummary?.participated_events > 0);
  const createdEvents = guestSummary?.created_events ?? 0;
  const participatedEvents = guestSummary?.participated_events ?? 0;

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

        {guestSummaryFound ? (
          <>
            <div>
              <div className="font-semibold">
                Guest data found on this browser:
              </div>
              <div
                className={cn("text-sm", createdEvents === 0 && "opacity-50")}
              >
                • {createdEvents} event
                {createdEvents !== 1 ? "s" : ""} that you created
              </div>
              <div
                className={cn(
                  "text-sm",
                  participatedEvents === 0 && "opacity-50",
                )}
              >
                • {participatedEvents} event
                {participatedEvents !== 1 ? "s" : ""} that you added your
                availability to
              </div>
            </div>
            <LinkButton
              buttonStyle="primary"
              label="Review and Import"
              href="/settings/guest-import/review"
              className="w-fit"
            />
          </>
        ) : guestSummary === null ? (
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
