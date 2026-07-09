"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Selector from "@/features/selector/components/selector";
import { cn } from "@/lib/utils/classname";

const SETTINGS_TABS = [
  { href: "/settings", label: "General" },
  { href: "/settings/guest-import", label: "Guest Import" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/remove", label: "Account Removal" },
] as const;

export default function SettingsNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <nav className="w-full md:hidden">
        <Selector
          dialogDescription="Select a settings page to view"
          dialogTitle="Settings"
          id="settings-nav"
          onChange={(value) => {
            router.push(value);
          }}
          value={pathname}
          options={SETTINGS_TABS.map((tab) => ({
            label: tab.label,
            value: tab.href,
          }))}
          className={cn(
            "bg-foreground/10 hover:bg-foreground/15 active:bg-foreground/5",
            "text-foreground ring-foreground",
            "w-full justify-between rounded-full px-4 py-2.5",
          )}
        />
      </nav>
      <nav className="hidden flex-col gap-1 md:flex">
        {SETTINGS_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "text-md focus-visible:ring-primary/50 relative flex items-center whitespace-nowrap rounded-full px-4 py-2.5 font-medium outline-none focus-visible:ring-2",
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
    </>
  );
}
