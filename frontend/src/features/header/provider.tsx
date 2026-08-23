"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { usePathname } from "next/navigation";

import { HeaderContext } from "@/features/header/context";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

const SCROLL_THRESHOLD = 100;
const HEADER_HEIGHT = 88;
const SHRUNK_HEADER_HEIGHT = 52;

export default function HeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useCheckMobile();
  const shrinkDisabled =
    !isMobile ||
    document.body.scrollHeight <= window.innerHeight + SCROLL_THRESHOLD;

  const lastPathnameRef = useRef<string | null>(null);
  const pathname = usePathname();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [isFullSize, setIsFullSize] = useState(true);
  const { scrollY } = useScroll();
  const scrollAnchor = useMotionValue(0);
  const shrinkAmount = useSpring(0, {
    damping: 150,
    stiffness: 3000,
    mass: 0.1,
  });
  const scrollTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  const headerHeight = useTransform(
    shrinkAmount,
    [0, 1],
    [HEADER_HEIGHT, SHRUNK_HEADER_HEIGHT],
  );
  const updateCssHeaderHeight = useCallback(() => {
    document.documentElement.style.setProperty(
      "--header-height",
      `${shrinkDisabled ? HEADER_HEIGHT : headerHeight.get()}px`,
    );
  }, [headerHeight, shrinkDisabled]);
  useEffect(() => {
    updateCssHeaderHeight();
  }, [updateCssHeaderHeight, shrinkDisabled]);

  const updateShrinkAmount = useCallback(() => {
    const scrollOffset = scrollY.get() - scrollAnchor.get();
    shrinkAmount.set(Math.min(Math.max(scrollOffset / SCROLL_THRESHOLD, 0), 1));
  }, [scrollY, scrollAnchor, shrinkAmount]);

  const handleScrollChange = useCallback(
    (value: number) => {
      // Clamp value to page height
      value = Math.max(
        0,
        Math.min(value, document.body.scrollHeight - window.innerHeight),
      );

      const scrollOffset = value - scrollAnchor.get();
      if (scrollOffset > SCROLL_THRESHOLD) {
        scrollAnchor.set(value - SCROLL_THRESHOLD);
      } else if (scrollOffset < 0) {
        scrollAnchor.set(value);
      }

      updateShrinkAmount();

      // Set a timeout to "round" the shink amount after the user stops scrolling
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        if (shrinkAmount.get() === 0 || shrinkAmount.get() === 1) return;
        if (scrollY.get() - scrollAnchor.get() >= SCROLL_THRESHOLD / 2) {
          scrollAnchor.set(scrollY.get() - SCROLL_THRESHOLD);
        } else {
          scrollAnchor.set(scrollY.get());
        }
      }, 500);
    },
    [scrollAnchor, updateShrinkAmount, scrollY, shrinkAmount],
  );

  useMotionValueEvent(scrollY, "change", handleScrollChange);
  useMotionValueEvent(scrollAnchor, "change", updateShrinkAmount);
  useMotionValueEvent(shrinkAmount, "change", (value) => {
    if (value > 0) {
      setActiveMenu(null);
    }
    updateCssHeaderHeight();
    setIsFullSize(shrinkAmount.get() === 0);
  });

  const expand = useCallback(() => {
    scrollAnchor.set(scrollY.get());
  }, [scrollY, scrollAnchor]);

  // Reset when the page changes
  useEffect(() => {
    if (lastPathnameRef.current === pathname) return;
    lastPathnameRef.current = pathname;

    scrollAnchor.set(0);
    shrinkAmount.set(0);
  }, [pathname, shrinkAmount, scrollAnchor]);

  return (
    <HeaderContext.Provider
      value={{
        isFullSize: shrinkDisabled || isFullSize,
        shrinkAmount: shrinkDisabled ? new MotionValue(0) : shrinkAmount,
        expand,
        activeMenu,
        setActiveMenu,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}
