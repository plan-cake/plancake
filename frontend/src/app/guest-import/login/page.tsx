import { redirect } from "next/navigation";

import ClientPage from "@/app/guest-import/login/page-client";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { serverGet } from "@/lib/utils/api/server-fetch";

export default async function Page() {
  const guestSummary = await serverGet(ROUTES.guestImport.getSummary);
  const events = guestSummary.created_events;
  const availabilities = guestSummary.participated_events;

  if (events === 0 && availabilities === 0) {
    redirect("/dashboard");
  }

  return <ClientPage guestSummary={guestSummary} />;
}
