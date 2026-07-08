import { redirect } from "next/navigation";

import MessagePage from "@/components/layout/message-page";
import LinkButton from "@/features/button/components/link";
import GuestDataSummary from "@/features/guest-import/components/summary";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { serverGet } from "@/lib/utils/api/server-fetch";

export default async function Page() {
  const guestSummary = await serverGet(ROUTES.guestImport.getSummary);
  const events = guestSummary.created_events;
  const availabilities = guestSummary.participated_events;

  if (events === 0 && availabilities === 0) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <MessagePage
        title="Guest Import"
        description="You have guest data that can be imported to your account."
        buttons={[
          <LinkButton
            key="cancel"
            buttonStyle="transparent"
            label="No Thanks"
            href="/dashboard"
            className="w-fit"
          />,
          <LinkButton
            key="confirm"
            buttonStyle="primary"
            label="Review and Import"
            href="/guest-import/review"
            className="w-fit"
          />,
        ]}
      >
        <div className="bg-panel mx-auto w-fit rounded-3xl px-4 py-3">
          <GuestDataSummary events={events} availabilities={availabilities} />
        </div>
      </MessagePage>
    </div>
  );
}
