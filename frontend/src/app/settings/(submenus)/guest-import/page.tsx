import LinkButton from "@/features/button/components/link";
import GuestSummary from "@/features/guest-import/components/guest-summary";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { serverGet } from "@/lib/utils/api/server-fetch";

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
            <GuestSummary events={events} availabilities={availabilities} />
            <LinkButton
              buttonStyle="primary"
              label="Review and Import"
              href="/guest-import/review"
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
