import { redirect } from "next/navigation";

import ClientPage from "@/app/settings/guest-import/review/page-client";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { serverGet } from "@/lib/utils/api/server-fetch";
import { GuestData } from "@/lib/utils/api/types";

export default async function Page() {
  let guestData: GuestData | null = null;
  try {
    guestData = await serverGet(ROUTES.guestImport.getData);
  } catch {
    // Do nothing, keep guestData as null
  }

  const guestDataFound =
    guestData !== null &&
    (guestData?.created_events.length > 0 ||
      guestData?.participated_events.length > 0);
  if (!guestDataFound) {
    redirect("/settings/guest-import");
  }

  return <ClientPage guestData={guestData!} />;
}
