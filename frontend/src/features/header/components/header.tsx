"use client";

import { useEffect, useRef, useState } from "react";

import AccountButton from "@/features/header/components/account-button";
import DashboardButton from "@/features/header/components/dashboard-button";
import LogoArea from "@/features/header/components/logo-area";
import NewEventButton from "@/features/header/components/new-event-button";
import ThemeToggle from "@/features/header/components/theme-toggle";
import { useHeaderSize } from "@/features/header/context";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { cn } from "@/lib/utils/classname";

const SCROLL_THRESHOLD = 50;

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const isMobile = useCheckMobile();
  const lastScrollPoint = useRef(0);
  const scrollCheckpoint = useRef(0);

  const { isShrunk, heightClass, shrink, expand } = useHeaderSize();

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

  if (!mounted) {
    return null;
  }

  return (
    <header className={cn(heightClass, "fixed top-0 z-40 w-full pt-4")}>
      <nav
        className={cn(
          "flex w-full max-w-[1440px] justify-between px-4",
          isShrunk ? "cursor-pointer" : "",
        )}
        onClickCapture={(e) => {
          if (!isShrunk) return;
          e.preventDefault();
          e.stopPropagation();
          expand();
        }}
      >
        <LogoArea isShrunk={isShrunk} />

        <div
          className={cn(
            "frosted-glass flex h-fit items-center rounded-full",
            "header-transition-[gap,padding]",
            isShrunk ? "gap-1 p-1" : "gap-2 p-2",
          )}
        >
          <NewEventButton />
          <ThemeToggle />
          <DashboardButton />
          <AccountButton />
        </div>
      </nav>
    </header>
  );
}
