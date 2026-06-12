"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/classname";

const SETTINGS_TABS = [
  { href: "/settings", label: "General" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/remove", label: "Account Removal" },
] as const;

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
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
  );
}
