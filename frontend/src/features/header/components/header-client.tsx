"use client";

import { useEffect, useState } from "react";

import { LayoutGroup, motion } from "framer-motion";
import { LayoutDashboardIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import LinkButton from "@/features/button/components/link";
import NewEventButton from "@/features/header/components/buttons/new-event";
import ThemeButton from "@/features/header/components/buttons/theme";
import LogoArea from "@/features/header/components/logo-area";
import { useHeader } from "@/features/header/context";
import { cn } from "@/lib/utils/classname";

export default function ClientHeader({
  children: accountButton,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  const { activeMenu } = useHeader();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="h-(--header-height) absolute top-0 z-40 w-full pt-4 md:fixed">
      <nav className="flex w-full max-w-[1440px] justify-between px-4">
        <LogoArea />

        {/* Adding this key prevents Framer from trying to animate on page switch */}
        <LayoutGroup key={pathname} id="header-layout-group">
          <motion.div
            animate={{ scale: activeMenu ? 0.95 : 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative isolate flex h-fit items-center gap-2 rounded-full p-2"
          >
            <div
              className="frosted-glass pointer-events-none absolute inset-0 -z-10 rounded-full"
              aria-hidden="true"
            />
            <NewEventButton />
            <ThemeButton />
            <LinkButton
              buttonStyle="frosted glass inset"
              icon={<LayoutDashboardIcon className="h-5 w-5" />}
              href="/dashboard"
              tooltip="Dashboard"
            />
            {accountButton}
            <div
              className={cn(
                "bg-violet/20 pointer-events-none absolute inset-0 rounded-full",
                "transition-opacity duration-300 ease-in-out",
                activeMenu ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />
          </motion.div>
        </LayoutGroup>
      </nav>
    </header>
  );
}
