"use client";

import { useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";

import DashboardButton from "@/features/header/components/buttons/dashboard";
import NewEventButton from "@/features/header/components/buttons/new-event";
import LogoArea from "@/features/header/components/logo-area";
import ThemePicker from "@/features/header/components/theme-picker";
import { useHeaderSize } from "@/features/header/context";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { cn } from "@/lib/utils/classname";

const SCROLL_THRESHOLD = 50;

export default function ShrinkingHeader({
  children: accountButton,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  const isMobile = useCheckMobile();
  const lastScrollPoint = useRef(0);
  const scrollCheckpoint = useRef(0);

  const { isShrunk, heightClass, shrink, expand, activeMenu } = useHeaderSize();

  useEffect(() => {
    setMounted(true);

    if (!isMobile) {
      expand();
      return;
    }

    const handleScroll = () => {
      const currentScrollPoint = Math.min(
        Math.max(window.scrollY, 0),
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const scrollingDown = currentScrollPoint > lastScrollPoint.current;
      lastScrollPoint.current = currentScrollPoint;

      if (currentScrollPoint <= 0) {
        expand();
        return;
      }

      if (isShrunk) {
        if (scrollingDown) {
          scrollCheckpoint.current = currentScrollPoint;
        } else if (
          currentScrollPoint <
          scrollCheckpoint.current - SCROLL_THRESHOLD
        ) {
          expand();
        }
      } else {
        if (!scrollingDown) {
          scrollCheckpoint.current = currentScrollPoint;
        } else if (
          currentScrollPoint >
          scrollCheckpoint.current + SCROLL_THRESHOLD
        ) {
          shrink();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile, isShrunk, shrink, expand]);

  if (!mounted) return null;

  return (
    <header
      className={cn(
        heightClass,
        "pointer-events-none fixed top-0 z-40 w-full pt-4",
      )}
    >
      <nav
        className="flex w-full max-w-[1440px] justify-between px-4"
        onClickCapture={(e) => {
          if (!isShrunk) return;
          e.preventDefault();
          e.stopPropagation();
          expand();
        }}
      >
        <div
          className={cn("pointer-events-auto", isShrunk && "cursor-pointer")}
        >
          <LogoArea isShrunk={isShrunk} />
        </div>

        <motion.div
          animate={{ scale: activeMenu ? 0.95 : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "pointer-events-auto relative isolate flex h-fit items-center rounded-full",
            "header-transition-[gap,padding]",
            isShrunk ? "cursor-pointer gap-1 p-1" : "gap-2 p-2",
          )}
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
