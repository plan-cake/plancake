import { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsProvider } from "@/features/account/settings/context";
import SettingsNav from "@/features/account/settings/sidebar-nav";
import HeaderSpacer from "@/features/header/components/header-spacer";
import { constructMetadata } from "@/lib/utils/construct-metadata";
import { getSession } from "@/lib/utils/get-session";

export function generateMetadata(): Metadata {
  return constructMetadata(
    "Account Settings",
    "Manage your account settings and preferences on Plancake.",
  );
}

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const accountDetails = await getSession();

  if (!accountDetails) {
    redirect("/login?redirect=/settings");
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-6">
      <HeaderSpacer />

      <div className="bg-background flex w-full flex-col gap-1 pb-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-foreground/60 text-sm">
          Manage your account settings and preferences!
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:gap-12">
        <aside className="w-full shrink-0 md:w-64">
          <SettingsNav />
        </aside>

        <main className="flex max-w-2xl flex-1 flex-col gap-6">
          <SettingsProvider accountDetails={accountDetails}>
            {children}
          </SettingsProvider>
        </main>
      </div>
    </div>
  );
}
