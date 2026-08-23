"use client";

import { cloneElement } from "react";

import {
  SettingsIcon,
  ShieldCheckIcon,
  SquareArrowRightEnterIcon,
  UserXIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Selector from "@/features/selector/components/selector";
import { cn } from "@/lib/utils/classname";

const SETTINGS_TABS = [
  { href: "/settings", label: "General", icon: <SettingsIcon /> },
  {
    href: "/settings/guest-import",
    label: "Guest Import",
    icon: <SquareArrowRightEnterIcon />,
  },
  { href: "/settings/security", label: "Security", icon: <ShieldCheckIcon /> },
  {
    href: "/settings/remove",
    label: "Account Removal",
    icon: <UserXIcon />,
  },
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
          textStart
          onChange={(value) => {
            router.push(value);
          }}
          value={pathname}
          options={SETTINGS_TABS.map((tab) => ({
            label: tab.label,
            value: tab.href,
            icon: tab.icon,
          }))}
          className={cn(
            "bg-foreground/10 hover:bg-foreground/15 active:bg-foreground/5",
            "text-foreground ring-foreground",
            "w-full justify-between",
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
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "focus-visible:ring-primary/50 relative flex items-center whitespace-nowrap rounded-full px-3 py-1 font-medium outline-none focus-visible:ring-2",
                "flex items-center gap-2",
                isActive
                  ? "bg-foreground/10 text-foreground"
                  : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              {cloneElement(
                tab.icon as React.ReactElement<{ className: string }>,
                {
                  className: cn("h-4.5 w-4.5"),
                },
              )}
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
