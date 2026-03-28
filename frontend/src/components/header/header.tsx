"use client";

import { useEffect, useState } from "react";

import AccountButton from "@/components/header/account-button";
import DashboardButton from "@/components/header/dashboard-button";
import LogoArea from "@/components/header/logo-area";
import NewEventButton from "@/components/header/new-event-button";
import ThemeToggle from "@/components/header/theme-toggle";
import { cn } from "@/lib/utils/classname";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleMenuChange = (menuName: string, isOpen: boolean) => {
    if (isOpen) {
      setActiveMenu(menuName);
    } else if (activeMenu === menuName) {
      setActiveMenu(null);
    }
  };

  const isAnyMenuOpen = activeMenu !== null;

  return (
    <header className="h-25 fixed top-0 z-40 w-full pt-4">
      <nav className="flex w-full max-w-[1440px] justify-between px-4">
        <LogoArea />

        <div
          className={cn(
            "frosted-glass relative flex h-fit items-center gap-2 rounded-full p-2",
            "transition-transform duration-300 ease-in-out",
            isAnyMenuOpen ? "scale-95" : "scale-100",
          )}
        >
          <NewEventButton />
          <ThemeToggle />
          <DashboardButton />

          <AccountButton
            onMenuOpenChange={(isOpen) => handleMenuChange("account", isOpen)}
          />

          <div
            className={cn(
              "bg-violet/20 pointer-events-none absolute inset-0 rounded-full",
              "transition-opacity duration-300 ease-in-out",
              isAnyMenuOpen ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />
        </div>
      </nav>
    </header>
  );
}
