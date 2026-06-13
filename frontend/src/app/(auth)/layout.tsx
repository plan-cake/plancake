import { redirect } from "next/navigation";

import { getSession } from "@/lib/utils/get-session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session.isLoggedIn) {
    redirect("/dashboard?alreadyLoggedIn=true");
  }

  return <>{children}</>;
}
