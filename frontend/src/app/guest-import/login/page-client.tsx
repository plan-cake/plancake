import MessagePage from "@/components/layout/message-page";
import LinkButton from "@/features/button/components/link";
import GuestSummary from "@/features/guest-import/components/guest-summary";
import { GuestDataSummary } from "@/lib/utils/api/types";

export default function ClientPage({
  guestSummary,
}: {
  guestSummary: GuestDataSummary;
}) {
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
          <GuestSummary
            events={guestSummary.created_events}
            availabilities={guestSummary.participated_events}
          />
        </div>
      </MessagePage>
    </div>
  );
}
