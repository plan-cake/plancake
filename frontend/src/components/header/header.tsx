"use client";

import { useEffect, useRef, useState } from "react";

import AccountButton from "@/components/header/account-button";
import DashboardButton from "@/components/header/dashboard-button";
import LogoArea from "@/components/header/logo-area";
import NewEventButton from "@/components/header/new-event-button";
import ThemeToggle from "@/components/header/theme-toggle";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { cn } from "@/lib/utils/classname";

const SCROLL_THRESHOLD = 50;

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const isMobile = useCheckMobile();
  const [isShrunk, setIsShrunk] = useState(false);
  const lastScrollPoint = useRef(0);
  const scrollCheckpoint = useRef(0);

  useEffect(() => {
    setMounted(true);

    if (!isMobile) {
      setIsShrunk(false);
      return;
    }

    const handleScroll = () => {
      const currentScrollPoint = Math.min(
        Math.max(window.scrollY, 0),
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const scrollingDown = currentScrollPoint > lastScrollPoint.current;
      lastScrollPoint.current = currentScrollPoint;

      if (isShrunk) {
        if (scrollingDown) {
          scrollCheckpoint.current = currentScrollPoint;
        } else if (
          currentScrollPoint <
          scrollCheckpoint.current - SCROLL_THRESHOLD
        ) {
          setIsShrunk(false);
        }
      } else {
        if (!scrollingDown) {
          scrollCheckpoint.current = currentScrollPoint;
        } else if (
          currentScrollPoint >
          scrollCheckpoint.current + SCROLL_THRESHOLD
        ) {
          setIsShrunk(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile, isShrunk]);

  if (!mounted) {
    return null;
  }

  return (
    <header className="h-25 fixed top-0 z-40 w-full pt-4">
      <nav
        className={cn(
          "flex w-full max-w-[1440px] justify-between px-4",
          isShrunk ? "cursor-pointer" : "",
        )}
        onClickCapture={(e) => {
          if (!isShrunk) return;
          e.preventDefault();
          e.stopPropagation();
          setIsShrunk(false);
        }}
      >
        <LogoArea isShrunk={isShrunk} />

        <div className="frosted-glass flex h-fit items-center gap-2 rounded-full p-2">
          <NewEventButton />
          <ThemeToggle />
          <DashboardButton />
          <AccountButton />
        </div>
      </nav>
    </header>
  );
}
