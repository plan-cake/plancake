"use client";

import { useEffect, useRef } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Loading from "@/app/loading";
import { useAccount } from "@/features/account/context";
import HeaderSpacer from "@/features/header/components/header-spacer";
import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import { cn } from "@/lib/utils/classname";

const SETTINGS_TABS = [
  { href: "/settings", label: "General" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/remove", label: "Account Removal" },
] as const;

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { loginState } = useAccount();
  const { addToast } = useToast();
  const previousLoginState = useRef(loginState);

  useEffect(() => {
    if (loginState === "logged_out") {
      router.replace("/login");

      // Only show the toast if they didn't JUST log out
      if (previousLoginState.current !== "logged_in") {
        addToast("info", MESSAGES.INFO_NOT_LOGGED_IN);
      }
    }
    previousLoginState.current = loginState;
  }, [addToast, loginState, router]);

  if (loginState === "logged_out") {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-6">
      <HeaderSpacer />

      <div className="top-25 bg-background z-15 sticky flex w-full flex-col gap-1 pb-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-foreground/60 text-sm">
          Manage your account settings and preferences!
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:gap-12">
        <aside className="w-full shrink-0 md:w-64">
          <nav className="flex flex-row gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
            {SETTINGS_TABS.map((tab) => {
              const isActive = pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "focus-visible:ring-primary/50 text-md relative flex items-center whitespace-nowrap rounded-full px-4 py-2.5 font-medium outline-none focus-visible:ring-2",
                    isActive
                      ? "bg-foreground/10 text-foreground"
                      : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex max-w-2xl flex-1 flex-col gap-6">{children}</main>
      </div>
    </div>
  );
}
