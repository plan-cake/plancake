import ClientPage from "@/app/settings/(submenus)/security/page-client";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { serverGet } from "@/lib/utils/api/server-fetch";

export default async function Page() {
  const activeSessions = await serverGet(ROUTES.account.getActiveSessions);

  return <ClientPage sessions={activeSessions.sessions} />;
}
