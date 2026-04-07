import { Metadata } from "next";

import ClientPage from "@/app/dashboard/page-client";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import handleErrorResponse from "@/lib/utils/api/handle-api-error";
import { processDashboardData } from "@/lib/utils/api/processors/process-dashboard-data";
import { serverGet } from "@/lib/utils/api/server-fetch";
import { constructMetadata } from "@/lib/utils/construct-metadata";

// Explicitly set this page to be dynamic so Next.js doesn't try to statically build it
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return constructMetadata("Dashboard", "View all your events on Plancake!");
}

export default async function Page() {
  try {
    const eventData = await serverGet(ROUTES.dashboard.get, undefined, {
      cache: "no-store",
    });
    const processedData = processDashboardData(eventData);
    return <ClientPage {...processedData} />;
  } catch (e) {
    const error = e as ApiErrorResponse;
    handleErrorResponse(error.status, error.data);
  }
}
