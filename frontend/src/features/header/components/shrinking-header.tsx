"use client";

import { useEffect, useState } from "react";

import { motion, useTransform } from "framer-motion";

import DashboardButton from "@/features/header/components/buttons/dashboard";
import NewEventButton from "@/features/header/components/buttons/new-event";
import LogoArea from "@/features/header/components/logo-area";
import ThemePicker from "@/features/header/components/theme-picker";
import { useHeaderSize } from "@/features/header/context";
import { cn } from "@/lib/utils/classname";

export default function ShrinkingHeader({
  children: accountButton,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  const { isFullSize, shrinkAmount, expand, activeMenu } = useHeaderSize();

  const headerButtonSpacing = useTransform(shrinkAmount, [0, 1], {
    padding: [8, 4],
    gap: ["8px", "4px"],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className={cn("fixed top-0 z-40 w-full pt-4")}>
      <nav
        className={cn(
          "flex w-full max-w-[1440px] justify-between px-4",
          !isFullSize ? "cursor-pointer" : "",
        )}
        onClickCapture={(e) => {
          if (isFullSize) return;
          e.preventDefault();
          e.stopPropagation();
          expand();
        }}
      >
        <LogoArea />

        <motion.div
          animate={{ scale: activeMenu ? 0.95 : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "relative isolate flex h-fit items-center rounded-full",
          )}
          style={headerButtonSpacing}
        >
          <div
            className="frosted-glass pointer-events-none absolute inset-0 -z-10 rounded-full"
            aria-hidden="true"
          />

          <NewEventButton />
          <ThemePicker />
          <DashboardButton />

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
      </nav>
    </header>
  );
}
