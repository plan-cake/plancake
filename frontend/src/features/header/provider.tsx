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
  const shrinkAmount = useMotionValue(0);
  const smoothShrinkAmount = useSpring(shrinkAmount, {
    damping: 15,
    stiffness: 300,
    mass: 0.1,
  });

  const headerHeight = useTransform(
    smoothShrinkAmount,
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

      shrinkAmount.set(
        Math.min(Math.max(scrollOffset / SCROLL_THRESHOLD, 0), 1),
      );
    },
    [scrollAnchor, shrinkAmount],
  );

  useMotionValueEvent(scrollY, "change", handleScrollChange);

  useMotionValueEvent(scrollAnchor, "change", handleScrollChange);

  useMotionValueEvent(smoothShrinkAmount, "change", () => {
    updateCssHeaderHeight();
    setIsFullSize(smoothShrinkAmount.get() === 0);
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
  }, [pathname, scrollAnchor, shrinkAmount, smoothShrinkAmount]);

  return (
    <HeaderContext.Provider
      value={{
        isFullSize: shrinkDisabled || isFullSize,
        shrinkAmount: shrinkDisabled ? new MotionValue(0) : smoothShrinkAmount,
        expand,
        activeMenu,
        setActiveMenu,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}
