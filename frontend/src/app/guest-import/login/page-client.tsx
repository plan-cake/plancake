"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Checkbox from "@/components/checkbox";
import MessagePage from "@/components/layout/message-page";
import ActionButton from "@/features/button/components/action";
import GuestSummary from "@/features/guest-import/components/guest-summary";
import { DONT_SHOW_AGAIN_KEY } from "@/features/guest-import/constants";
import { GuestDataSummary } from "@/lib/utils/api/types";

export default function ClientPage({
  guestSummary,
}: {
  guestSummary: GuestDataSummary;
}) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const router = useRouter();

  const navigate = (route: string) => {
    if (dontShowAgain) {
      localStorage.setItem(DONT_SHOW_AGAIN_KEY, "true");
    }
    router.push(route);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <MessagePage
        title="Guest Import"
        description="You have guest data that can be imported to your account."
        buttons={[
          <ActionButton
            key="cancel"
            buttonStyle="transparent"
            label="No Thanks"
            onClick={() => {
              navigate("/dashboard");
            }}
          />,
          <ActionButton
            key="confirm"
            buttonStyle="primary"
            label="Review and Import"
            onClick={() => {
              navigate("/guest-import/review");
            }}
          />,
        ]}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="bg-panel w-fit rounded-3xl px-4 py-3">
            <GuestSummary
              events={guestSummary.created_events}
              availabilities={guestSummary.participated_events}
            />
          </div>
          <div className="flex w-full flex-col items-center gap-2">
            <Checkbox
              label="Don't show this page again on this browser"
              checked={dontShowAgain}
              onChange={setDontShowAgain}
            />
            {dontShowAgain && (
              <div className="text-sm opacity-75">
                You can import guest data at any time in account settings.
              </div>
            )}
          </div>
        </div>
      </MessagePage>
    </div>
  );
}
