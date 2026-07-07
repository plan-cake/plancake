import LinkButton from "@/features/button/components/link";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { serverGet } from "@/lib/utils/api/server-fetch";
import { cn } from "@/lib/utils/classname";

export default async function Page() {
  const guestSummary = await serverGet(ROUTES.guestImport.getSummary);
  const events = guestSummary.created_events;
  const availabilities = guestSummary.participated_events;

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

        {events > 0 || availabilities > 0 ? (
          <>
            <div>
              <div className="font-semibold">
                Guest data found on this browser:
              </div>
              <div className={cn("text-sm", events === 0 && "opacity-50")}>
                • {events} event
                {events !== 1 ? "s" : ""} that you created
              </div>
              <div
                className={cn("text-sm", availabilities === 0 && "opacity-50")}
              >
                • {availabilities} event
                {availabilities !== 1 ? "s" : ""} that you added your
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
        ) : (
          <div className="opacity-75">No guest data found.</div>
        )}
      </div>
    </div>
  );
}
