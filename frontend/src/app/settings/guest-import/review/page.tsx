import { redirect } from "next/navigation";

import ClientPage from "@/app/settings/guest-import/review/page-client";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { serverGet } from "@/lib/utils/api/server-fetch";

export default async function Page() {
  const guestData = await serverGet(ROUTES.guestImport.getData);

  if (
    guestData.created_events.length === 0 &&
    guestData.participated_events.length === 0
  ) {
    redirect("/settings/guest-import");
  }

  return <ClientPage guestData={guestData} />;
}
